# Underwood Chiropractic - Patient App (Android first)

Version 0.1 "bones": sign in with a one-time code, view/book/reschedule/cancel visits, a care plan
(home exercises checklist), and settings. All data is **mock data in memory** for now - nothing leaves the phone and
nothing is saved between app restarts. Demo sign-in code: `123456`.

## One-time setup (Windows, in a terminal)

You already have Node, Android Studio and Expo tooling on this PC. From the folder that contains `starter\`:

```
npx create-expo-app@latest patient-app --template blank-typescript
robocopy starter patient-app /E
cd patient-app
npx expo start --android
```

`robocopy` overlays this code on the fresh project (it replaces the template's `App.tsx` and adds `src\`).
A robocopy exit code of 1 means "files copied" - that is success.

`--android` opens the app in the Android emulator (start one from Android Studio > Device Manager first) or on a
phone with USB debugging / the Expo Go app on the same Wi-Fi.

The app only uses packages that come with the blank-typescript template, so there is nothing extra to install.

## How the code is organized

| Path | What it is |
|---|---|
| `App.tsx` | Entry point. Sign-in gate, bottom tabs, and the one line that picks the backend. |
| `src/config/office.ts` | **All office-specific facts** (services, hours, fees, change window), each tagged confirmed / verify / placeholder. See `docs/OFFICE-DETAILS.md`. |
| `src/data/api.ts` | `ClinicApi` interface + the mock backend. **Swap point for the real backend.** |
| `src/screens/` | One file per screen. |
| `src/components/ui.tsx` | Shared building blocks (Screen, Card, Button). |
| `src/theme.ts` | Colors and spacing. Purple/white placeholders. |
| `src/utils/dates.ts` | Date and time formatting, bookable-day list. |

## Placeholders to replace

- Services, exercises, and open time slots in `src/data/api.ts` are made up. Real hours, services and the doctor's
  exercises come from the office.
- Colors in `src/theme.ts`; app name/icon in `app.json` after setup.
- Sundays are skipped and 12:00-1:00 is blocked for lunch in the mock - real office hours go in the backend.

## Not built yet (each is its own module)

Real backend and accounts, push reminders, intake forms, check-in, messaging, payments, family accounts,
staff schedule screen, Play Store packaging.
