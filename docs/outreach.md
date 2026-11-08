# ML Grind outreach kit

## Positioning

**Implement ML algorithms in real Python, in your browser. No setup or signup.**

Primary audience: Python users preparing for ML interviews or learning how ML algorithms work. Topic-specific pages can also serve engineers studying attention, LLM decoding, and diffusion. Avoid implying that the runtime includes native PyTorch, that completing a track guarantees interview success, or that browser-local progress transfers between devices without sign-in.

## Four-week launch experiment

These are drafts to publish manually, not messages that have been sent. Start only after deploying the verified static routes.

| Week | Challenge | Landing URL | Demo |
| --- | --- | --- | --- |
| 1 | NumPy warm-up | https://mlgrind.github.io/challenge?utm_source=linkedin&utm_medium=social&utm_campaign=weekly_challenge&utm_content=week1 | 20-second clip: open exercise, implement array sum, run tests |
| 2 | Softmax from scratch | https://mlgrind.github.io/problem/deep-learning/backpropagation?utm_source=linkedin&utm_medium=social&utm_campaign=weekly_challenge&utm_content=week2 | Stable softmax with max subtraction; show a numerical edge case |
| 3 | Build attention | https://mlgrind.github.io/learn/build-a-transformer?utm_source=linkedin&utm_medium=social&utm_campaign=weekly_challenge&utm_content=week3 | Matrix shapes and scaled dot-product attention |
| 4 | ML interview fundamentals | https://mlgrind.github.io/learn/ml-interview-prep?utm_source=linkedin&utm_medium=social&utm_campaign=weekly_challenge&utm_content=week4 | One implementation and an explanation of its assumptions |

Reuse each demonstration on X and in a relevant community only where its current rules permit self-promotion. Change `utm_source` per channel. Explain the technique in the post itself; do not post a bare link repeatedly. Keep a simple log of publication date, URL, topic, audience, exercise opens, first runs, first passes, and subsequent return visits. Attribution and results require the owner’s analytics access.

## Launch post draft

> I built ML Grind to practice machine learning by implementing it.
>
> It runs real Python and NumPy in your browser: no installation or signup. There are 141 exercises across 21 sections, from array operations to attention, LLM decoding, and reinforcement learning.
>
> Start with a five-minute problem, or follow the seven-day challenge: https://mlgrind.github.io/challenge
>
> I’d especially like feedback on unclear explanations and test cases that reject valid solutions.

## Short challenge draft

> Can you implement numerically stable softmax in NumPy?
>
> Hint: subtract the largest logit before exponentiating. This preserves the probabilities and avoids overflow.
>
> Try it in your browser, with examples and instant feedback: https://mlgrind.github.io/problem/deep-learning/backpropagation

## Instructor/study-group introduction draft

> I maintain ML Grind, a free browser-based ML practice tool with Python and NumPy. Students can open a link and implement an algorithm without configuring an environment.
>
> The NumPy path and seven-day challenge work as optional practice. Accounts are optional, progress is local by default, and solutions are available for self-study. Would a short walkthrough and exercise list be useful for your group?
>
> Guide: https://github.com/mlgrind/mlgrind.github.io/blob/main/docs/instructors.md

## Measurement

The existing GA4 integration now receives these bounded events:

| Event | Meaning |
| --- | --- |
| `exercise_opened` | A valid exercise is opened |
| `code_run` | Run Tests is requested |
| `exercise_passed` | A nonempty run passes all tests |
| `first_run` / `first_pass` | First milestone in this browser, unless local storage is unavailable |
| `path_opened` | A curated path or the seven-day challenge is opened |
| `return_visit` | A visit occurs on a later UTC calendar date in this browser |
| `challenge_shared` | User copies a challenge link |

Exercise events contain `problem_id` and `section_id`; path events contain `path_id`. Code and test data are excluded. First milestones and return events are browser-based, not a count of unique people. Do Not Track and the privacy-page analytics opt-out suppress analytics; blockers and storage deletion affect coverage. Do not interpret return events alone as a cohort retention rate.

Owner setup after deployment:

1. In GA4, register `problem_id`, `section_id`, and `path_id` as event-scoped custom dimensions. Disable enhanced-measurement history-based page views because the app sends its own navigation events. Validate the funnel in DebugView/Realtime.
2. Build a funnel: exercise opened → code run → exercise passed. Segment acquisition by campaign/source. Use first-run and first-pass for activation, and GA4 cohort exploration for retention.
3. In Google Search Console, verify the property for https://mlgrind.github.io/ and submit https://mlgrind.github.io/sitemap.xml. Inspect one section and three exercises. Check HTTP 200, rendered text, canonical selection, and indexing.
4. Check social previews for homepage, paths, and exercises. Confirm the PNG returns HTTP 200. Refresh cached cards after launch if needed.
5. After four weeks, compare first passes and return behavior across topics. Continue the subjects that bring learners who actually practice. Set numerical targets after collecting a baseline; do not invent traffic or retention claims.

No paid promotion, external posts, instructor messages, analytics administration, or Search Console registration is performed by this repository change.

## Deploy without migrating user progress

Keep the production origin `https://mlgrind.github.io`, Firebase project `ml-coding-lab`, the existing Firebase web-app configuration, `users/{uid}.progress`, exercise/section IDs, and browser key `ml-interview-progress`. The new reader preserves the existing schema and keeps a local raw backup at `ml-interview-progress-backup-v1`. Cloud writes wait for a successful initial read and merge; a failed read pauses writes rather than replacing cloud data with a local snapshot.

`npm run deploy` now runs `npm run check:deployment` before building. The guard refuses missing Firebase configuration or an unexpected project/auth domain. This workspace has the public configuration recovered from the live app in ignored `.env.production.local`; another checkout or deployment runner must supply the same `VITE_FIREBASE_*` variables. Do not treat the optional Firebase setup for local development as optional for production.

Browser-local progress belongs to its origin. Historical data on `https://itzsid.github.io` cannot automatically become local storage on `https://mlgrind.github.io`; users need cloud sync or an explicit transfer for a domain change. This release does not change the current ML Grind origin. Redeploying static files does not require deleting Firebase users or documents.

The registered-account directory is Firebase Authentication → Users in project `ml-coding-lab`. Firestore `users` adds saved progress/profile information, and `sign_ins` records sign-in events. Anonymous visitors have no central identity directory; GA4 provides aggregate traffic, subject to analytics opt-out and blockers. These three sources measure different populations and should not be presented as the same user count.
