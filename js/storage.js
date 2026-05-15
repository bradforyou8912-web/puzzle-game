import { CONFIG, formatSeconds } from "./utils.js";

export function loadBestRecord() {
  try {
    const savedRecord = localStorage.getItem(CONFIG.bestRecordKey);
    return savedRecord ? JSON.parse(savedRecord) : null;
  } catch {
    return null;
  }
}

export function saveBestRecord(currentState) {
  const currentRecord = {
    tries: currentState.tries,
    elapsedSeconds: currentState.elapsedSeconds
  };
  const bestRecord = loadBestRecord();

  if (!bestRecord || isBetterRecord(currentRecord, bestRecord)) {
    localStorage.setItem(CONFIG.bestRecordKey, JSON.stringify(currentRecord));
  }
}

export function formatBestRecord(record) {
  if (!record) {
    return "없음";
  }

  return `${record.tries}회 / ${formatSeconds(record.elapsedSeconds)}`;
}

function isBetterRecord(currentRecord, bestRecord) {
  if (currentRecord.tries !== bestRecord.tries) {
    return currentRecord.tries < bestRecord.tries;
  }

  return currentRecord.elapsedSeconds < bestRecord.elapsedSeconds;
}
