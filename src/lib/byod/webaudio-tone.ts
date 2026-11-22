export interface WebAudioToneHandle {
  stop: () => void;
}

export interface WebAudioToneResult {
  ok: true;
  handle: WebAudioToneHandle;
}

export interface WebAudioToneError {
  ok: false;
  error: string;
}

export type AudioContextConstructor = new () => AudioContext;

export function resolveAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

/**
 * Play a local 3200 Hz (3.2 kHz), 0.4s sine reference pulse at gain 0.15 on user click.
 * Never fabricates acoustic SNR or latency; reports an honest error if WebAudio is unavailable.
 */
export async function playByodReferenceTone(
  options: {
    ctor?: AudioContextConstructor | null;
    onEnded?: () => void;
  } = {},
): Promise<WebAudioToneResult | WebAudioToneError> {
  const Ctor = options.ctor !== undefined ? options.ctor : resolveAudioContextConstructor();
  if (!Ctor) {
    return {
      ok: false,
      error: "Browser WebAudio AudioContext is unavailable in this environment.",
    };
  }

  let ctx: AudioContext | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    if (ctx && ctx.state !== "closed") {
      void ctx.close().catch(() => undefined);
    }
    options.onEnded?.();
  };

  try {
    ctx = new Ctor();
    if (ctx.state === "suspended" && typeof ctx.resume === "function") {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    const durationSec = 0.4;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(3200, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      cleanup();
    };

    osc.start(now);
    osc.stop(now + durationSec);

    return {
      ok: true,
      handle: {
        stop: () => {
          try {
            osc.stop();
          } catch {
            // Oscillator may already have stopped.
          }
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {
            // Ignore disconnect errors during teardown.
          }
          cleanup();
        },
      },
    };
  } catch (err) {
    cleanup();
    return {
      ok: false,
      error:
        err instanceof Error && err.message
          ? `Unable to start 3.2 kHz WebAudio tone: ${err.message}`
          : "Unable to start 3.2 kHz WebAudio tone in this browser.",
    };
  }
}
