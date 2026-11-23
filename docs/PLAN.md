# Patient app - plan

## Goal
A downloadable Android app patients actually keep: book a visit in 2-3 taps, get reminders, do the home exercises.
If it works well, the office may pay monthly for it (and possibly replace their current scheduling/payments tool).

## Design rules (from the competitor research)
1. Booking in 2-3 taps; rebooking the next visit in one.
2. No passwords - one-time code or link, then biometrics.
3. Reminders and the care plan are the reason to keep the app installed.
4. Family accounts (one login books for kids/spouse) - early.
5. Every message is actionable (confirm / reschedule / reply). No marketing spam.
6. Push text stays generic ("You have an appointment tomorrow") - no health details in notifications.
7. Anyone without the app can still use a link-based web fallback.

## Architecture
- App: Expo (React Native) + TypeScript. Android first; iOS later from the same code.
- All backend access goes through `ClinicApi` (`src/data/api.ts`). Mock now, real service later.
- Backend candidate: Postgres service (e.g. Supabase). Patient data = HIPAA: the host must sign a BAA,
  which may need a paid tier. Verify before choosing.
- Staff side: small web dashboard to see/manage the schedule. Starts as the first piece of the chiropractor app.

## Roadmap
1. **Bones (this version):** sign-in, visits, book/reschedule/cancel, care plan, settings - mock data.
2. Real backend + real accounts + the office's real services/hours.
3. Staff schedule web screen (so bookings are visible to the office).
4. Push reminders.
5. Intake forms and check-in.
6. Messaging.
7. Payments.
8. Family accounts.
9. Play Store release.
10. iOS.

## Open questions
- What scheduling and payment software does the office use now? (Decides integrate vs replace.)
- Insurance vs cash mix? (Insurance billing is a much bigger scope.)
- Real services, durations, hours, cancellation rules.
