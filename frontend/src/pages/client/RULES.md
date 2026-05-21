# Rules — frontend/src/pages/client/

- Exam session state (current question, answers, timer, flags) lives in `src/store/` — not local state
- Auto-submit must trigger when the countdown reaches zero — handle via the timer hook, not a setTimeout in the component
- Flagged/bookmarked questions must persist if the user navigates between questions during the session
- Answer choices must be displayed in randomized order (randomization happens at session start, not on re-render)
- Results page is read-only — no answer changes after submission
- PDF export calls the backend endpoint; do NOT generate PDFs client-side
- Study mode must show the explanation immediately after the user selects an answer — before moving to the next question
- All pages must handle loading and error states (show spinner / error message, not a blank page)
