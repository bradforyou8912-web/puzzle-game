export const CONFIG = Object.freeze({
  boardSize: 6,
  fruits: Object.freeze(["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍒", "🥝", "🍑", "🍍", "🥭", "🍈", "🍐", "🍏", "🍋", "🥥", "🍅", "🥕"]),
  mismatchDelayMs: 650,
  hintDelayMs: 3000,
  timeLimitSeconds: 60,
  bestRecordKey: "test-game-03-best-record"
});

export const PHASE = Object.freeze({
  READY: "READY",
  PLAYING: "PLAYING",
  RESOLVING: "RESOLVING",
  HINTING: "HINTING",
  CLEARED: "CLEARED",
  ENDED: "ENDED"
});

export const ACTION = Object.freeze({
  START: "START",
  OPEN_CARD: "OPEN_CARD",
  RESOLVE_MATCH: "RESOLVE_MATCH",
  RESOLVE_MISMATCH: "RESOLVE_MISMATCH",
  SHOW_HINT: "SHOW_HINT",
  HIDE_HINT: "HIDE_HINT",
  ACKNOWLEDGE_BINGO: "ACKNOWLEDGE_BINGO",
  START_TIME_LIMIT: "START_TIME_LIMIT",
  STOP_TIME_LIMIT: "STOP_TIME_LIMIT",
  UPDATE_TIME_LIMIT: "UPDATE_TIME_LIMIT",
  END_GAME: "END_GAME"
});

export function createId(fruit, pairIndex, copyIndex) {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${fruit}-${pairIndex}-${copyIndex}-${Date.now()}-${Math.random()}`;
}

export function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

export function formatSeconds(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function findHintPair(cards) {
  const unmatchedCards = cards.filter((card) => !card.matched && !card.opened);
  const pairs = [];

  for (const card of unmatchedCards) {
    const pair = unmatchedCards.find((candidate) => candidate.id !== card.id && candidate.fruit === card.fruit);

    if (pair) {
      pairs.push([card.id, pair.id]);
    }
  }

  return pairs[Math.floor(Math.random() * pairs.length)] ?? [];
}

export function getPhaseLabel(phase) {
  const labels = {
    [PHASE.READY]: "준비",
    [PHASE.PLAYING]: "진행중",
    [PHASE.RESOLVING]: "확인중",
    [PHASE.HINTING]: "힌트",
    [PHASE.CLEARED]: "클리어",
    [PHASE.ENDED]: "게임 종료"
  };

  return labels[phase];
}
