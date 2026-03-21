/**
 * import-archives.js
 * Reads Spencer's and Jack's 18Birdies archive JSON files, cross-references rounds
 * by date + clubId, and merges them into the existing rounds.json.
 *
 * Usage: node import-archives.js
 */

const fs = require('fs');
const path = require('path');

// ─── Paths ────────────────────────────────────────────────────────────────────
const SPENCER_ARCHIVE = '/Users/spencerk.schneider/Downloads/18Birdies_archive.json';
const JACK_ARCHIVE    = '/Users/spencerk.schneider/Downloads/18Birdies_archive.json.txt';
const ROUNDS_JSON     = '/Users/spencerk.schneider/golf-tracker/data/rounds.json';

// ─── Player IDs ───────────────────────────────────────────────────────────────
const SPENCER_ID = 'p6';
const JACK_ID    = 'p4';

// ─── Pacific offset (UTC-7, PDT) ─────────────────────────────────────────────
// Subtract 7 hours from UTC timestamp before converting to get local date
const PDT_OFFSET_MS = 7 * 60 * 60 * 1000; // 25200000 ms

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Unix-ms timestamp to a YYYY-MM-DD string in PDT (UTC-7). */
function toLocalDate(timestampMs) {
  return new Date(timestampMs - PDT_OFFSET_MS).toISOString().split('T')[0];
}

/**
 * Build the clubId → name lookup map from a playedClubs array.
 * 18Birdies archives store clubs under `clubData.playedClubs`, each with
 * a `clubId` string and a `name` string.
 */
function buildClubMap(playedClubs) {
  const map = {};
  for (const club of playedClubs) {
    // field is named "clubId" (not "id") in playedClubs
    map[club.clubId] = club.name;
  }
  return map;
}

/**
 * Build the holesData array (always 18 elements) from holeStrokes.
 * - 18 holeStrokes → use directly
 * - 9 holeStrokes  → back9 by default (9 nulls + 9 scores)
 *                    (all San Clemente rounds are back9)
 */
function buildHolesData(holeStrokes) {
  if (holeStrokes.length === 18) {
    return [...holeStrokes];
  }
  // 9-hole round → back9
  return [null, null, null, null, null, null, null, null, null, ...holeStrokes];
}

/** Determine the `holes` field value from holeStrokes length. */
function holesField(holeStrokes) {
  return holeStrokes.length === 18 ? 'full18' : 'back9';
}

/**
 * Extract all rounds from an archive file.
 * Returns an array of normalised round objects:
 * { date, clubId, courseName, holeStrokes, grossScore }
 */
function extractRounds(archivePath, clubMap) {
  const raw  = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
  const data = raw.myData;
  const rounds = data.activityData.rounds;

  return rounds.map(r => {
    const clubId     = r.clubId?.id || r.clubId || '';
    const courseName = clubMap[clubId] || 'Unknown Course';
    const date       = toLocalDate(r.timestamp);
    return {
      date,
      clubId,
      courseName,
      holeStrokes: r.holeStrokes || [],
      grossScore:  r.strokes,
    };
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// 1. Build club name maps from each archive
const spencerRaw  = JSON.parse(fs.readFileSync(SPENCER_ARCHIVE, 'utf8'));
const jackRaw     = JSON.parse(fs.readFileSync(JACK_ARCHIVE, 'utf8'));

const spencerClubMap = buildClubMap(spencerRaw.myData.clubData.playedClubs);
const jackClubMap    = buildClubMap(jackRaw.myData.clubData.playedClubs);

// Merge both maps so cross-reference lookups always resolve
const combinedClubMap = { ...jackClubMap, ...spencerClubMap };

// 2. Extract rounds
const spencerRounds = extractRounds(SPENCER_ARCHIVE, combinedClubMap);
const jackRounds    = extractRounds(JACK_ARCHIVE,    combinedClubMap);

console.log(`Spencer rounds in archive: ${spencerRounds.length}`);
console.log(`Jack rounds in archive:    ${jackRounds.length}`);

// 3. Read existing rounds.json
const existingRounds = JSON.parse(fs.readFileSync(ROUNDS_JSON, 'utf8'));

// Build a skip-set: date + all playerIds present on that date
// A round is "already present" if we find a date match AND at least one
// of the players overlaps. We key by date for the quick check.
const existingDates = new Set(existingRounds.map(r => r.date));

// Last round id number
const lastId = existingRounds.reduce((max, r) => {
  const n = parseInt(r.id.replace('r', ''), 10);
  return n > max ? n : max;
}, 0);

let nextId = lastId + 1;

// 4. Cross-reference Spencer + Jack by date + clubId
// Index Spencer by "date|clubId"
const spencerMap = {};
for (const r of spencerRounds) {
  const key = `${r.date}|${r.clubId}`;
  // Keep the first entry per key (shouldn't be duplicates, but just in case)
  if (!spencerMap[key]) spencerMap[key] = r;
}

// Index Jack by "date|clubId"
const jackMap = {};
for (const r of jackRounds) {
  const key = `${r.date}|${r.clubId}`;
  if (!jackMap[key]) jackMap[key] = r;
}

// Collect all unique date|clubId keys across both players
const allKeys = new Set([...Object.keys(spencerMap), ...Object.keys(jackMap)]);

const newRounds = [];
let countGroup  = 0;
let countSpencer = 0;
let countJack    = 0;
const groupDates = [];

for (const key of [...allKeys].sort()) {
  const [date] = key.split('|');

  // Skip if this date is already in rounds.json
  if (existingDates.has(date)) {
    continue;
  }

  const sRound = spencerMap[key];
  const jRound = jackMap[key];

  const courseName = (sRound || jRound).courseName;
  const hs         = (sRound || jRound).holeStrokes;

  const players = [];

  if (sRound) {
    players.push({
      playerId:   SPENCER_ID,
      grossScore: sRound.grossScore,
      holesData:  buildHolesData(sRound.holeStrokes),
    });
  }

  if (jRound) {
    players.push({
      playerId:   JACK_ID,
      grossScore: jRound.grossScore,
      holesData:  buildHolesData(jRound.holeStrokes),
    });
  }

  const round = {
    id:          `r${nextId++}`,
    date,
    course:      courseName,
    holes:       holesField((sRound || jRound).holeStrokes),
    players,
    skinsAmount: 5,
  };

  newRounds.push(round);

  if (sRound && jRound) {
    countGroup++;
    groupDates.push(date);
  } else if (sRound) {
    countSpencer++;
  } else {
    countJack++;
  }
}

// 5. Merge and sort chronologically
const merged = [...existingRounds, ...newRounds].sort(
  (a, b) => new Date(a.date) - new Date(b.date)
);

// Re-number IDs chronologically after sort
merged.forEach((r, i) => { r.id = `r${i + 1}`; });

// 6. Write output
fs.writeFileSync(ROUNDS_JSON, JSON.stringify(merged, null, 2));

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\n========== IMPORT SUMMARY ==========');
console.log(`Existing rounds (skipped):  ${existingRounds.length}`);
console.log(`New rounds added:           ${newRounds.length}`);
console.log(`  Spencer solo:             ${countSpencer}`);
console.log(`  Jack solo:                ${countJack}`);
console.log(`  Group (both players):     ${countGroup}`);
console.log('\nGroup round dates:');
if (groupDates.length === 0) {
  console.log('  (none)');
} else {
  groupDates.forEach(d => console.log(`  ${d}`));
}
console.log(`\nTotal rounds in rounds.json: ${merged.length}`);
console.log('=====================================\n');

console.log('Final rounds.json:');
console.log(JSON.stringify(merged, null, 2));
