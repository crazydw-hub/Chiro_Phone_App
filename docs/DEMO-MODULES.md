# Demo modules (v0.2)

Four modules, each with its own on/off switch in `src/practice/<practice>.ts` under `features`.
All run on in-memory mock data in `src/data/api.ts`. Nothing is sent anywhere.

| Module | Where | What is real | What is mock |
|---|---|---|---|
| Check-in ("I'm here") | Visits tab | Time window rule (opens 60 min before, closes 30 min after start) | Front desk is told only inside the app |
| Intake forms | Visits tab > New patient forms | Step-by-step form, saved per step, validation, typed signature | Stored in memory; fields must follow the office's real paperwork |
| Messaging | Messages tab | Thread, quick replies (per practice), labelled automatic reply | No staff inbox; no push notifications |
| Pay a bill | Visits tab > Balance | Balance, charge list, receipt screen | Demo checkout only. No card is collected |

## Try it
Settings > Demo tools: add a visit starting in 20 minutes (check-in), add a $25 demo charge (pay),
simulate an office reply (messages), open the front-desk preview (what staff would see).
The demo tools only exist while `mockApi` is in use.

## Cautions before going real
- Payments: use a processor's hosted checkout so card numbers never touch our app or servers.
  The office already uses ChartTalk for payments; confirm whether to integrate or defer to it.
- Messaging and intake carry health information: need a HIPAA-compliant backend and a signed BAA.
  Push notification text must stay generic ("You have a new message").
- Messaging screen says it is not for emergencies; keep that wording.
- Intake questions must come from the office's own forms.
