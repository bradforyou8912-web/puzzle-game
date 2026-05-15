import { ACTION, CONFIG, PHASE, createId, findHintPair, shuffle } from "./utils.js";

export function createInitialState() {
  return {
    phase: PHASE.READY,
    cards: [],
    openedIds: [],
    hintIds: [],
    bingoRows: [],
    tries: 0,
    matches: 0,
    startedAt: null,
    elapsedSeconds: 0,
    timeLimitActive: false,
    timeRemainingSeconds: null
  };
}

export function reducer(currentState, action) {
  switch (action.type) {
    case ACTION.START:
      return {
        ...createInitialState(),
        phase: PHASE.PLAYING,
        cards: shuffle(createDeck()),
        startedAt: Date.now()
      };

    case ACTION.OPEN_CARD:
      return openCard(currentState, action.cardId);

    case ACTION.RESOLVE_MATCH:
      return resolveMatch(currentState);

    case ACTION.RESOLVE_MISMATCH:
      return resolveMismatch(currentState);

    case ACTION.SHOW_HINT:
      return showHint(currentState);

    case ACTION.HIDE_HINT:
      return {
        ...currentState,
        phase: PHASE.PLAYING,
        hintIds: []
      };

    case ACTION.ACKNOWLEDGE_BINGO:
      return acknowledgeBingo(currentState, action.rows);

    case ACTION.START_TIME_LIMIT:
      return startTimeLimit(currentState);

    case ACTION.STOP_TIME_LIMIT:
      return stopTimeLimit(currentState);

    case ACTION.UPDATE_TIME_LIMIT:
      return updateTimeLimit(currentState, action.remainingSeconds);

    case ACTION.END_GAME:
      return {
        ...currentState,
        phase: PHASE.ENDED,
        timeLimitActive: false,
        timeRemainingSeconds: null
      };

    default:
      return currentState;
  }
}

export function getOpenedCards(currentState) {
  return currentState.openedIds.map((id) => currentState.cards.find((card) => card.id === id));
}

export function isPair(cards) {
  return cards.length === 2 && cards[0]?.fruit === cards[1]?.fruit;
}

export function findNewBingoRows(currentState) {
  const nextRows = [];

  for (let rowIndex = 0; rowIndex < CONFIG.boardSize; rowIndex += 1) {
    if (currentState.bingoRows.includes(rowIndex)) {
      continue;
    }

    const startIndex = rowIndex * CONFIG.boardSize;
    const rowCards = currentState.cards.slice(startIndex, startIndex + CONFIG.boardSize);

    if (rowCards.length === CONFIG.boardSize && rowCards.every((card) => card.matched)) {
      nextRows.push(rowIndex);
    }
  }

  return nextRows;
}

function createDeck() {
  return CONFIG.fruits.flatMap((fruit, pairIndex) => [
    createCard(fruit, pairIndex, 1),
    createCard(fruit, pairIndex, 2)
  ]);
}

function createCard(fruit, pairIndex, copyIndex) {
  return {
    id: createId(fruit, pairIndex, copyIndex),
    fruit,
    opened: false,
    matched: false
  };
}

function openCard(currentState, cardId) {
  if (currentState.phase !== PHASE.PLAYING || currentState.openedIds.length >= 2) {
    return currentState;
  }

  const targetCard = currentState.cards.find((card) => card.id === cardId);

  if (!targetCard || targetCard.opened || targetCard.matched) {
    return currentState;
  }

  const openedIds = [...currentState.openedIds, cardId];
  const cards = currentState.cards.map((card) =>
    card.id === cardId ? { ...card, opened: true } : card
  );
  const nextState = {
    ...currentState,
    cards,
    openedIds
  };

  if (openedIds.length < 2) {
    return nextState;
  }

  return {
    ...nextState,
    tries: nextState.tries + 1,
    phase: PHASE.RESOLVING
  };
}

function resolveMatch(currentState) {
  const openedCards = getOpenedCards(currentState);

  if (!isPair(openedCards)) {
    return currentState;
  }

  const matchedIds = new Set(openedCards.map((card) => card.id));
  const cards = currentState.cards.map((card) =>
    matchedIds.has(card.id) ? { ...card, matched: true, opened: false } : card
  );
  const matches = currentState.matches + 1;
  const phase = matches === CONFIG.fruits.length ? PHASE.CLEARED : PHASE.PLAYING;

  return {
    ...currentState,
    phase,
    cards,
    matches,
    openedIds: []
  };
}

function acknowledgeBingo(currentState, rows) {
  const nextRows = Array.isArray(rows) ? rows : [];

  return {
    ...currentState,
    bingoRows: Array.from(new Set([...currentState.bingoRows, ...nextRows]))
  };
}

function startTimeLimit(currentState) {
  if (currentState.phase !== PHASE.PLAYING) {
    return currentState;
  }

  return {
    ...currentState,
    timeLimitActive: true,
    timeRemainingSeconds: CONFIG.timeLimitSeconds
  };
}

function stopTimeLimit(currentState) {
  return {
    ...currentState,
    timeLimitActive: false,
    timeRemainingSeconds: null
  };
}

function updateTimeLimit(currentState, remainingSeconds) {
  if (!currentState.timeLimitActive) {
    return currentState;
  }

  return {
    ...currentState,
    timeRemainingSeconds: Math.max(0, remainingSeconds)
  };
}

function resolveMismatch(currentState) {
  const openedIds = new Set(currentState.openedIds);

  return {
    ...currentState,
    phase: PHASE.PLAYING,
    openedIds: [],
    cards: currentState.cards.map((card) =>
      openedIds.has(card.id) ? { ...card, opened: false } : card
    )
  };
}

function showHint(currentState) {
  if (currentState.phase !== PHASE.PLAYING || currentState.openedIds.length > 0) {
    return currentState;
  }

  const hintIds = findHintPair(currentState.cards);

  if (hintIds.length !== 2) {
    return currentState;
  }

  return {
    ...currentState,
    phase: PHASE.HINTING,
    hintIds
  };
}
