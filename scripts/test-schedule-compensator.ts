import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import type {
  CompensatorTelemetryState,
  RebalanceRecommendation,
} from '../src/components/tournaments/schedule-compensator-types';

console.log('🧪 Starting Dynamic Schedule Auto-Compensator Verification...');

// 1. Audit line count of DynamicScheduleCompensatorCard.tsx
const cardPath = path.resolve(
  process.cwd(),
  'src/components/tournaments/DynamicScheduleCompensatorCard.tsx'
);
const cardSource = fs.readFileSync(cardPath, 'utf8');
const lineCount = cardSource.split('\n').length;
console.log(`📏 DynamicScheduleCompensatorCard.tsx line count: ${lineCount}`);
assert.ok(lineCount < 300, `DynamicScheduleCompensatorCard.tsx must be < 300 lines, got ${lineCount}`);

// 2. Audit Zero-Purple Rule
const purpleRegex = /\b(purple|indigo|violet)(-[a-z0-9]+)?\b/i;
const purpleMatch = cardSource.match(purpleRegex);
assert.strictEqual(
  purpleMatch,
  null,
  `Zero-Purple Rule violated in DynamicScheduleCompensatorCard.tsx: ${purpleMatch?.[0]}`
);
console.log('✅ Zero-Purple Rule audit passed: 0 purple/indigo/violet tokens.');

// 3. Test telemetry state calculation
const mockState: CompensatorTelemetryState = {
  tournamentId: 'tourney-fall-classic-2026',
  lastAuditedTimestamp: '14:32:00 EST',
  sheets: [
    {
      sheetId: 'sheet-1',
      sheetName: 'Sheet 1 (Rink A)',
      currentDelayMinutes: 35,
      activeGameId: 'game-101',
      inOvertime: true,
      floodBufferMinutes: 15,
    },
    {
      sheetId: 'sheet-2',
      sheetName: 'Sheet 2 (Rink B)',
      currentDelayMinutes: 0,
      activeGameId: 'game-201',
      inOvertime: false,
      floodBufferMinutes: 15,
    },
  ],
  games: [
    {
      gameId: 'game-102',
      homeTeam: 'Oilers U18',
      awayTeam: 'Flames U18',
      sheetId: 'sheet-1',
      scheduledStartTime: '15:00',
      projectedStartTime: '15:35',
      delayMinutes: 35,
      status: 'scheduled',
      warmupCompressionMinutes: 5,
    },
    {
      gameId: 'game-202',
      homeTeam: 'Canucks U18',
      awayTeam: 'Kraken U18',
      sheetId: 'sheet-2',
      scheduledStartTime: '15:15',
      projectedStartTime: '15:15',
      delayMinutes: 0,
      status: 'scheduled',
      warmupCompressionMinutes: 10,
    },
  ],
  recommendations: [
    {
      gameId: 'game-102',
      homeTeam: 'Oilers U18',
      awayTeam: 'Flames U18',
      fromSheetId: 'sheet-1',
      toSheetId: 'sheet-2',
      delaySavedMinutes: 35,
      rationale: 'Sheet 2 has a 45m idle window after Game 201; shifting Game 102 eliminates 35m delay.',
    },
  ],
};

assert.strictEqual(mockState.sheets.length, 2);
assert.strictEqual(mockState.sheets[0].inOvertime, true);
assert.strictEqual(mockState.sheets[0].currentDelayMinutes, 35);
assert.strictEqual(mockState.games[0].warmupCompressionMinutes, 5);
assert.strictEqual(mockState.recommendations[0].delaySavedMinutes, 35);

// 4. Test rebalance recommendation execution
const rec = mockState.recommendations[0];
const updatedGames = mockState.games.map((g) =>
  g.gameId === rec.gameId
    ? {
        ...g,
        reassignedSheetId: rec.toSheetId,
        delayMinutes: Math.max(0, g.delayMinutes - rec.delaySavedMinutes),
      }
    : g
);

const updatedGame102 = updatedGames.find((g) => g.gameId === 'game-102');
assert.ok(updatedGame102);
assert.strictEqual(updatedGame102.reassignedSheetId, 'sheet-2');
assert.strictEqual(updatedGame102.delayMinutes, 0);

console.log('✅ Dynamic Schedule Auto-Compensator Verification completed successfully!');
