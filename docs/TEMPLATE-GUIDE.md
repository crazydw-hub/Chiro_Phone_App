# Using this app as a template for another chiropractor

The app is one shared codebase. Everything that differs between offices lives in **one file per practice**
in `src/practice/`. Screens, booking logic and styling never mention a specific office.

## Try the three included practices (no coding)
Open `src/practice/active.ts` and change `ACTIVE_PRACTICE`:

| Value | What it is | What it shows off |
|---|---|---|
| `'underwood'` | Underwood Chiropractic (real client) | Navy brand, call-to-book for new patients, 24-hour change rule, fees |
| `'sample'` | Riverside Family Chiropractic (fictional) | Teal brand, Saturday hours, 15-minute slots, new patients book online, no care plan tab |
| `'template'` | Blank starting point | Every setting with a TODO |

Save the file and the running app reloads with the new practice.

## Set up a new practice
1. Copy `src/practice/template.ts` to `src/practice/<name>.ts`; rename the exported constant.
2. Fill in every field (checklist below).
3. In `src/practice/active.ts`, import it, add it to `all`, and set `ACTIVE_PRACTICE`.
4. Rebrand the app shell (see "Per-practice app identity").
5. Run it and click through: sign in, book, reschedule, cancel, hours card.

### Checklist of what to collect from the practice
- Practice name, phone, address
- Logo and brand colors (primary color at minimum)
- Opening hours per weekday, including lunch closures
- Services patients may book themselves, with visit length and any published fee
- Visit start-time spacing (15 / 20 / 30 minutes)
- Cancellation / reschedule policy (hours of notice, any fee). Use `null` for no limit. Never invent a rule.
- New patients: call the office, or book online?
- Fee wording (due at time of service, copay at check-in, ...)
- Home exercises (or turn the Care plan off)

## Feature switches
In the practice file, `features: { carePlan: true | false }`. Future modules (check-in, intake forms,
messaging, payments) will each get a switch here, so every practice only sees what it uses.

## Per-practice app identity (the part config files do not cover)
For a store listing, each practice's app needs its own:
- App name, icon, splash image: `app.json` (`name`, `slug`, `icon`)
- Android package id, for example `com.yourcompany.underwoodchiro`: `app.json` (`android.package`)
- Signing key and Play Store listing

Today we change these by hand per practice. When there are two or three practices we can automate it with
build profiles that select the practice at build time.

## What a practice file does NOT cover yet
- Real appointments, accounts and patients: these come from the backend, which is still mock data.
- Different clinical workflows (for example insurance billing). Those are modules, not settings.
- More than one location or more than one doctor. The data model is single-location for now.

## Ground rules
- Mark anything unconfirmed as a placeholder in the practice file, like `underwood.ts` does.
- Do not copy one practice's facts into another's file. Start from `template.ts`.


## Feature switches
In your practice file, `features` turns modules on or off (carePlan, checkIn, intakeForms, messaging, payments). `quickReplies` sets the Messages buttons. See `docs/DEMO-MODULES.md`.
