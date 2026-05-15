import { CONFIG, PHASE, formatSeconds, getPhaseLabel } from "./utils.js";
import { formatBestRecord, loadBestRecord } from "./storage.js";

export function createElements() {
  return {
    board: document.querySelector("#gameBoard"),
    restartButton: document.querySelector("#restartButton"),
    hintButton: document.querySelector("#hintButton"),
    tryCount: document.querySelector("#tryCount"),
    matchCount: document.querySelector("#matchCount"),
    gameStatus: document.querySelector("#gameStatus"),
    elapsedTime: document.querySelector("#elapsedTime"),
    bestRecord: document.querySelector("#bestRecord"),
    clearPanel: document.querySelector("#clearPanel"),
    finalTryCount: document.querySelector("#finalTryCount"),
    finalTime: document.querySelector("#finalTime")
  };
}

export function render(elements, currentState) {
  renderBoard(elements, currentState);
  renderScoreboard(elements, currentState);
  renderClearPanel(elements, currentState);
}

export function renderScoreboard(elements, currentState) {
  elements.tryCount.textContent = String(currentState.tries);
  elements.matchCount.textContent = String(currentState.matches);
  elements.gameStatus.textContent = getPhaseLabel(currentState.phase);
  elements.elapsedTime.textContent = formatSeconds(currentState.elapsedSeconds);
  elements.bestRecord.textContent = formatBestRecord(loadBestRecord());
  elements.hintButton.disabled = currentState.phase !== PHASE.PLAYING || currentState.openedIds.length > 0;
}

function renderBoard(elements, currentState) {
  elements.board.replaceChildren(
    ...currentState.cards.map((card, index) => createCardButton(card, index, currentState))
  );
}

function createCardButton(card, index, currentState) {
  const button = document.createElement("button");
  const isHinted = currentState.hintIds.includes(card.id);
  const isVisible = card.opened || card.matched || isHinted;
  const row = Math.floor(index / CONFIG.boardSize) + 1;
  const column = (index % CONFIG.boardSize) + 1;

  button.type = "button";
  button.className = "card";
  button.dataset.cardId = card.id;
  button.setAttribute("role", "gridcell");
  button.setAttribute("aria-rowindex", String(row));
  button.setAttribute("aria-colindex", String(column));
  button.disabled = card.matched || currentState.phase !== PHASE.PLAYING;

  if (isVisible) {
    button.classList.add(getVisibleCardClass(card, isHinted));
    button.innerHTML = `<span class="card-symbol" aria-hidden="true">${card.fruit}</span>`;
    button.setAttribute("aria-label", `${row}행 ${column}열 ${card.fruit} 카드 ${getCardStateLabel(card, isHinted)}`);
  } else {
    button.innerHTML = `<span class="card-back" aria-hidden="true">?</span>`;
    button.setAttribute("aria-label", `${row}행 ${column}열 닫힌 과일 카드`);
  }

  return button;
}

function getVisibleCardClass(card, isHinted) {
  if (card.matched) {
    return "is-matched";
  }

  if (isHinted) {
    return "is-hinted";
  }

  return "is-open";
}

function getCardStateLabel(card, isHinted) {
  if (card.matched) {
    return "매칭 완료";
  }

  if (isHinted) {
    return "힌트로 표시됨";
  }

  return "열림";
}

function renderClearPanel(elements, currentState) {
  const isCleared = currentState.phase === PHASE.CLEARED;

  elements.clearPanel.hidden = !isCleared;
  elements.finalTryCount.textContent = String(currentState.tries);
  elements.finalTime.textContent = formatSeconds(currentState.elapsedSeconds);
}
