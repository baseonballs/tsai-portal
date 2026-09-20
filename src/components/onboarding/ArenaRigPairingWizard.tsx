import React, { useState } from 'react';
import {
  DiscoveredPodDevice,
  INITIAL_DISCOVERED_PODS,
  PairingStep,
} from '../../types/arena-pairing-types';

export const ArenaRigPairingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PairingStep>('DISCOVERY');
  const [pods, setPods] = useState<DiscoveredPodDevice[]>(INITIAL_DISCOVERED_PODS);
  const [selectedSheet, setSelectedSheet] = useState<string>('Rink 1 (Main Arena)');
  const [selectedPodIds, setSelectedPodIds] = useState<string[]>([
    'POD-A-CENTER',
    'POD-B-ENDZONE',
  ]);
  const [isCommissioning, setIsCommissioning] = useState<boolean>(false);

  const togglePodSelection = (podId: string) => {
    setSelectedPodIds((prev) =>
      prev.includes(podId) ? prev.filter((id) => id !== podId) : [...prev, podId]
    );
  };

  const steps: { key: PairingStep; label: string }[] = [
    { key: 'DISCOVERY', label: '1. Discovery' },
    { key: 'SHEET_ASSIGNMENT', label: '2. Sheet' },
    { key: 'CALIBRATION_CHECK', label: '3. Calibration' },
    { key: 'STORAGE_VERIFICATION', label: '4. Storage' },
    { key: 'CONFIRMATION', label: '5. Complete' },
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Arena Hardware Rig Pairing Wizard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Turnkey Optical Capture Pod & Edge Appliance Onboarding (Track 16 / P229)
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1.5 rounded-lg">
          VENUE: GRANDVIEW ARENA
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-5">
        {steps.map((s) => {
          const isActive = s.key === currentStep;
          return (
            <button
              key={s.key}
              onClick={() => setCurrentStep(s.key)}
              className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="mt-4">
        {currentStep === 'DISCOVERY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200">
                Discovered Optical Capture Pods ({pods.length})
              </h3>
              <span className="text-xs text-slate-400">BLE & mDNS Broadcast Scan Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pods.map((pod) => {
                const isSelected = selectedPodIds.includes(pod.podId);
                return (
                  <div
                    key={pod.podId}
                    onClick={() => togglePodSelection(pod.podId)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pod.podId}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{pod.rssiDbM} dBm</span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-2">{pod.label}</p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                      <span>IP: {pod.ipAddress}</span>
                      <span className="text-emerald-400">{pod.lensTemperatureCelsius.toFixed(1)}°C</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'SHEET_ASSIGNMENT' && (
          <div className="space-y-4 max-w-lg">
            <h3 className="text-sm font-bold text-slate-200">Assign Hardware Rig to Ice Sheet</h3>
            <div className="space-y-2">
              {['Rink 1 (Main Arena)', 'Rink 2 (Olympic)', 'Rink 3 (Training)'].map((sheet) => (
                <div
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`p-3 rounded-lg border cursor-pointer text-xs font-semibold ${
                    selectedSheet === sheet
                      ? 'bg-cyan-950/40 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {sheet}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'CALIBRATION_CHECK' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Stereo Reprojection Error Verification</h3>
            <div className="space-y-3">
              {pods
                .filter((p) => selectedPodIds.includes(p.podId))
                .map((pod) => (
                  <div
                    key={pod.podId}
                    className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{pod.label}</p>
                      <p className="text-slate-400 mt-0.5">
                        Reprojection Error:{' '}
                        <span className="font-mono font-bold text-cyan-400">
                          {pod.calibrationReprojectionErrorPx.toFixed(2)} px
                        </span>{' '}
                        (Threshold: &lt; 0.50 px)
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        pod.isCalibrated
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {pod.isCalibrated ? 'CALIBRATED' : 'RE-CALIBRATION REQUIRED'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {currentStep === 'STORAGE_VERIFICATION' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200">NVMe High-Speed Ring Buffer Partitions</h3>
            <div className="space-y-3">
              {pods
                .filter((p) => selectedPodIds.includes(p.podId))
                .map((pod) => {
                  const freeGb = (pod.nvmeFreeBytes / (1000 * 1000 * 1000)).toFixed(0);
                  const totalGb = (pod.nvmeTotalBytes / (1000 * 1000 * 1000)).toFixed(0);
                  return (
                    <div
                      key={pod.podId}
                      className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{pod.podId}</p>
                        <p className="text-slate-400 mt-0.5">Direct-I/O Fast Ring Buffer</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400">{freeGb} GB Free</p>
                        <p className="text-[10px] text-slate-500">of {totalGb} GB Capacity</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {currentStep === 'CONFIRMATION' && (
          <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <span className="h-4 w-4 mx-auto rounded-full bg-emerald-400 inline-block" />
            <h4 className="text-base font-bold text-emerald-300">Ready to Commission Turnkey Rig</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Assigned {selectedPodIds.length} optical pods to <strong>{selectedSheet}</strong>.
              Launchd/systemd daemons configured with autonomous ring buffer streaming.
            </p>
            <button
              onClick={() => setIsCommissioning(true)}
              disabled={isCommissioning}
              className="mt-3 px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              {isCommissioning ? 'COMMISSIONING RIG...' : 'ACTIVATE ARENA RIG'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
