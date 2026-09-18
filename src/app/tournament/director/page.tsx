import React from "react";
import { MultiSheetCommandCenter, TournamentSheet } from "@/components/tournaments/MultiSheetCommandCenter";
import { LiveTournamentBracketView } from "@/components/tournaments/LiveTournamentBracketView";

const INITIAL_SHEETS: TournamentSheet[] = [
  {
    sheetId: "sheet-nhl-center",
    sheetNumber: 1,
    rinkName: "Main Center Arena (NHL Standard)",
    streamState: "LIVE",
    youtubeBroadcastId: "yt_bc_silverstick_s1",
    youtubeStreamKey: "live_tsai_center_k92a",
    rtmpsIngestUrl: "rtmps://a.rtmps.youtube.com/live2/live_tsai_center_k92a",
    playbackUrl: "https://youtube.com/watch?v=live_center_01",
    bitrateKbps: 8500,
    fps: 60,
    activeAngle: "TACTICAL_PRIMARY",
    isPublicShowcase: true,
    matchInfo: {
      matchId: "m-qf1",
      homeTeam: "Jr. Sharks AAA",
      awayTeam: "Chicago Mission",
      period: 3,
      gameClockSeconds: 124,
      scoreHome: 4,
      scoreAway: 2,
      isOvertime: false,
    },
    hardwareHealth: {
      temperatureCelsius: 41.2,
      droppedFramesCount: 0,
      ispLoadPercentage: 44.0,
      thermalThrottled: false,
    },
    acousticShieldMuted: false,
  },
  {
    sheetId: "sheet-olympic-south",
    sheetNumber: 2,
    rinkName: "Olympic South Sheet",
    streamState: "LIVE",
    youtubeBroadcastId: "yt_bc_silverstick_s2",
    youtubeStreamKey: "live_tsai_south_j81b",
    rtmpsIngestUrl: "rtmps://a.rtmps.youtube.com/live2/live_tsai_south_j81b",
    playbackUrl: "https://youtube.com/watch?v=live_south_02",
    bitrateKbps: 8500,
    fps: 60,
    activeAngle: "TACTICAL_PRIMARY",
    isPublicShowcase: false,
    matchInfo: {
      matchId: "m-qf2",
      homeTeam: "Toronto Marlboros",
      awayTeam: "Detroit HoneyBaked",
      period: 3,
      gameClockSeconds: 15,
      scoreHome: 3,
      scoreAway: 3,
      isOvertime: true,
    },
    hardwareHealth: {
      temperatureCelsius: 42.8,
      droppedFramesCount: 1,
      ispLoadPercentage: 46.5,
      thermalThrottled: false,
    },
    acousticShieldMuted: false,
  },
  {
    sheetId: "sheet-north-3",
    sheetNumber: 3,
    rinkName: "North Rink 3",
    streamState: "COMPLETED",
    youtubeBroadcastId: "yt_bc_silverstick_s3",
    youtubeStreamKey: "live_tsai_n3_x49c",
    rtmpsIngestUrl: "rtmps://a.rtmps.youtube.com/live2/live_tsai_n3_x49c",
    playbackUrl: "https://youtube.com/watch?v=live_n3_03",
    bitrateKbps: 0,
    fps: 0,
    activeAngle: "TACTICAL_PRIMARY",
    isPublicShowcase: false,
    matchInfo: {
      matchId: "m-qf3",
      homeTeam: "Shattuck St. Mary's",
      awayTeam: "Boston Jr. Eagles",
      period: 3,
      gameClockSeconds: 0,
      scoreHome: 5,
      scoreAway: 1,
      isOvertime: false,
    },
    hardwareHealth: {
      temperatureCelsius: 38.5,
      droppedFramesCount: 0,
      ispLoadPercentage: 12.0,
      thermalThrottled: false,
    },
    acousticShieldMuted: false,
  },
  {
    sheetId: "sheet-north-4",
    sheetNumber: 4,
    rinkName: "North Rink 4",
    streamState: "LIVE",
    youtubeBroadcastId: "yt_bc_silverstick_s4",
    youtubeStreamKey: "live_tsai_n4_m71d",
    rtmpsIngestUrl: "rtmps://a.rtmps.youtube.com/live2/live_tsai_n4_m71d",
    playbackUrl: "https://youtube.com/watch?v=live_n4_04",
    bitrateKbps: 8500,
    fps: 60,
    activeAngle: "HIGH_ENDZONE_HOME",
    isPublicShowcase: false,
    matchInfo: {
      matchId: "m-qf4",
      homeTeam: "Little Caesars",
      awayTeam: "MN Blades",
      period: 2,
      gameClockSeconds: 702,
      scoreHome: 2,
      scoreAway: 1,
      isOvertime: false,
    },
    hardwareHealth: {
      temperatureCelsius: 43.1,
      droppedFramesCount: 2,
      ispLoadPercentage: 47.2,
      thermalThrottled: false,
    },
    acousticShieldMuted: false,
  },
];

export default function TournamentDirectorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        <MultiSheetCommandCenter initialSheets={INITIAL_SHEETS} />
        <LiveTournamentBracketView />
      </div>
    </div>
  );
}
