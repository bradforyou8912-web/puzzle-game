# 프로젝트: Puzzle Game

## 목표
- 브라우저에서 실행되는 과일 카드 짝 맞추기 퍼즐 게임

## 기능
- 6x6 카드 보드 제공
- 같은 과일 카드 2장을 맞추는 매칭 게임
- 무작위 힌트 제공 및 3초 후 자동 닫힘
- 한 행의 카드 6장이 모두 열리면 빙고 확인 메세지 표시
- 빙고 확인 시 게임 종료, 취소 시 게임 계속 진행
- 1분 제한시간 시작/중지 기능
- 경과 시간, 시도 횟수, 성공 쌍 수, 최고 기록 표시
- 모든 카드를 맞추면 클리어 화면 표시

## 기술
- 순수 HTML, CSS, JavaScript
- `index.html`: 게임 화면 구조
- `css/styles.css`: 화면 스타일
- `js/app.js`: 이벤트 연결, 타이머, 빙고, 제한시간 흐름
- `js/board.js`: 보드와 점수판 렌더링
- `js/game.js`: 게임 상태와 카드 매칭 로직
- `js/storage.js`: 최고 기록 저장
- `js/utils.js`: 설정값, 공통 함수, 힌트 후보 선택
- `assets/images/`: 실행화면 이미지와 아이콘 파일

## 대상
- 코딩 고급 개발자

## 폴더구조

```text
puzzle-game/
├─ index.html
├─ README.md
├─ PRD.md
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js
│  ├─ board.js
│  ├─ game.js
│  ├─ storage.js
│  └─ utils.js
└─ assets/
   └─ images/
      ├─ .gitkeep
      ├─ favicon.ico
      ├─ image.png
      ├─ image-1.png
      ├─ image-2.png
      └─ image-3.png
```
