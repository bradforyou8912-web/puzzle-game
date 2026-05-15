import { ACTION, CONFIG, PHASE } from "./utils.js";
import { createInitialState, getOpenedCards, isPair, reducer } from "./game.js";
import { createElements, render, renderScoreboard } from "./board.js";
import { saveBestRecord } from "./storage.js";

const elements = createElements();

let state = createInitialState();
let timerId = null;

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
    state = {
      ...state,
      elapsedSeconds: Math.floor((Date.now() - state.startedAt) / 1000)
    };
    stopTimer();
    saveBestRecord(state);
    render(elements, state);
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

function startGame() {
  dispatch({ type: ACTION.START });
  startTimer();
}

elements.board.addEventListener("click", handleBoardClick);
elements.hintButton.addEventListener("click", () => {
  dispatch({ type: ACTION.SHOW_HINT });
});
elements.restartButton.addEventListener("click", () => {
  startGame();
});

render(elements, state);
startGame();
