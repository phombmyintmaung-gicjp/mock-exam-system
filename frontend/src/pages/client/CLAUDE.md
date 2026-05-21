# frontend/src/pages/client/

Pages for the Employee role. Accessible via `/exam/*` and `/profile/*` routes.

## Pages

| File | Route | Purpose |
|------|-------|---------|
| `ExamSelect.tsx` | `/exam/select` | Choose category and mode (Exam / Study) |
| `ExamSession.tsx` | `/exam/session` | Active exam — questions, timer, navigation, flag |
| `StudySession.tsx` | `/study/session` | Study mode — immediate feedback per question |
| `Results.tsx` | `/exam/results/:id` | Score, pass/fail, correct/incorrect breakdown |
| `Review.tsx` | `/exam/results/:id/review` | Full answer review with explanations |
| `History.tsx` | `/profile/history` | Past exam attempts and score trends |
| `Profile.tsx` | `/profile` | Personal info, target certification, score trends |
| `WeakAreas.tsx` | `/profile/weak-areas` | Suggested practice based on past wrong answers |

## Exam vs Study Mode

| Feature | Exam Mode | Study Mode |
|---------|-----------|------------|
| Timer | Yes (countdown) | No |
| Immediate feedback | No | Yes (per question) |
| Explanation shown | After submit | After each answer |
| Score pressure | Yes | No |
| Auto-submit on expire | Yes | N/A |
