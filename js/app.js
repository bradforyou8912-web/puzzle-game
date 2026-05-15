import { ACTION, CONFIG, PHASE } from "./utils.js";
import { createInitialState, findNewBingoRows, getOpenedCards, isPair, reducer } from "./game.js";
import { createElements, render, renderScoreboard } from "./board.js";
import { saveBestRecord } from "./storage.js";

const elements = createElements();

let state = createInitialState();
let timerId = null;
let timeLimitStartedAt = null;

function dispatch(action) {
  const previousPhase = state.phase;
  state = reducer(state, action);
  render(elements, state);
  runEffects(previousPhase, state);
}

function runEffects(previousPhase, currentState) {
  if (currentState.phase === PHASE.RESOLVING && previousPhase !== PHASE.RESOLVING) {
    schedulePairResolution(currentState);
  }

  if (currentState.phase === PHASE.HINTING && previousPhase !== PHASE.HINTING) {
    scheduleHintClose();
  }

  if (currentState.phase === PHASE.CLEARED && previousPhase !== PHASE.CLEARED) {
    finishGame(true);
    return;
  }

  if (currentState.phase === PHASE.ENDED && previousPhase !== PHASE.ENDED) {
    finishGame(false);
    return;
  }

  if (currentState.phase === PHASE.PLAYING && previousPhase === PHASE.RESOLVING) {
    handleBingo(currentState);
  }
}

function schedulePairResolution(currentState) {
  const openedCards = getOpenedCards(currentState);

  if (isPair(openedCards)) {
    dispatch({ type: ACTION.RESOLVE_MATCH });
    return;
  }

  window.setTimeout(() => {
    dispatch({ type: ACTION.RESOLVE_MISMATCH });
  }, CONFIG.mismatchDelayMs);
}

function scheduleHintClose() {
  window.setTimeout(() => {
    dispatch({ type: ACTION.HIDE_HINT });
  }, CONFIG.hintDelayMs);
}

function handleBingo(currentState) {
  const newBingoRows = findNewBingoRows(currentState);

  if (newBingoRows.length === 0) {
    return;
  }

  dispatch({
    type: ACTION.ACKNOWLEDGE_BINGO,
    rows: newBingoRows
  });

  const bingoLabel = newBingoRows.map((rowIndex) => `${rowIndex + 1}행`).join(", ");
  const shouldEnd = window.confirm(`빙고! ${bingoLabel}의 카드 6개가 모두 열렸습니다.\n게임을 종료할까요?`);

  if (shouldEnd) {
    dispatch({ type: ACTION.END_GAME });
  }
}

function finishGame(shouldSaveRecord) {
  state = {
    ...state,
    elapsedSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
    timeLimitActive: false,
    timeRemainingSeconds: null
  };
  timeLimitStartedAt = null;
  stopTimer();

  if (shouldSaveRecord) {
    saveBestRecord(state);
  }

  render(elements, state);
}

function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    if (state.phase !== PHASE.PLAYING && state.phase !== PHASE.RESOLVING && state.phase !== PHASE.HINTING) {
      return;
    }

    state = {
      ...state,
      elapsedSeconds: Math.floor((Date.now() - state.startedAt) / 1000)
    };

    updateTimeLimit();
    renderScoreboard(elements, state);
  }, 250);
}

function stopTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function handleBoardClick(event) {
  const cardButton = event.target.closest("[data-card-id]");

  if (!cardButton) {
    return;
  }

  dispatch({
    type: ACTION.OPEN_CARD,
    cardId: cardButton.dataset.cardId
  });
}

function toggleTimeLimit() {
  if (state.timeLimitActive) {
    timeLimitStartedAt = null;
    dispatch({ type: ACTION.STOP_TIME_LIMIT });
    return;
  }

  timeLimitStartedAt = Date.now();
  dispatch({ type: ACTION.START_TIME_LIMIT });
}

function updateTimeLimit() {
  if (!state.timeLimitActive || timeLimitStartedAt === null) {
    return;
  }

  const elapsedLimitSeconds = Math.floor((Date.now() - timeLimitStartedAt) / 1000);
  const remainingSeconds = CONFIG.timeLimitSeconds - elapsedLimitSeconds;

  if (remainingSeconds !== state.timeRemainingSeconds) {
    state = reducer(state, {
      type: ACTION.UPDATE_TIME_LIMIT,
      remainingSeconds
    });
  }

  if (remainingSeconds <= 0) {
    timeLimitStartedAt = null;
    dispatch({ type: ACTION.END_GAME });
  }
}

function startGame() {
  timeLimitStartedAt = null;
  dispatch({ type: ACTION.START });
  startTimer();
}

elements.board.addEventListener("click", handleBoardClick);
elements.hintButton.addEventListener("click", () => {
  dispatch({ type: ACTION.SHOW_HINT });
});
elements.timeLimitButton.addEventListener("click", () => {
  toggleTimeLimit();
});
elements.restartButton.addEventListener("click", () => {
  startGame();
});

render(elements, state);
startGame();
