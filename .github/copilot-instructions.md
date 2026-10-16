# Copilot instructions

## Project shape

This repository is a single-file static quiz app. `index.html` contains the full experience: HTML structure, all CSS, quiz data, and JavaScript state/render logic. There are no framework, package-manager, build, test, or lint scripts in the repo.

## How to run

- Open `index.html` directly in a browser for local use.
- If you want a local server, use any static file server pointed at the repo root, for example:
  - `python -m http.server 8000`
  - then open `http://localhost:8000/index.html`

## Architecture

- The app is a small client-side state machine with three pieces of state: `current` question index, `score`, and `answered`.
- Quiz content lives in the `questions` array. Each item follows the same shape: `category`, `question`, `answers`, `correct`, and `fact`.
- UI rendering is split into three functions:
  - `renderQuestion()` builds the active question and answer buttons.
  - `selectAnswer()` applies correctness styling, updates score/progress, and shows feedback.
  - `showResults()` swaps from the quiz view to the results view and chooses the result copy from the final score.
- The DOM is updated imperatively with `getElementById`, dynamic button creation, and `replaceChildren()` rather than a templating layer.

## Conventions

- Keep the quiz self-contained in `index.html` unless there is a strong reason to split it up.
- Preserve the accessible interaction model:
  - question text should receive focus when a new question renders,
  - answer buttons must be disabled after selection,
  - feedback and score/progress updates should remain live-region friendly,
  - reduced-motion behavior should continue to work through the existing media query.
- Reuse the existing CSS custom properties and state classes (`.correct`, `.wrong`, `.feedback.incorrect`, etc.) instead of introducing new styling patterns.
- Keep the question data uniform so the render logic can continue to assume four answers per question and a numeric `correct` index.
- Preserve the current score bands and restart flow when changing result copy or end-of-quiz behavior.
