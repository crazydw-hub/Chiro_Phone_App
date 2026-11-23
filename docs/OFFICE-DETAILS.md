# Office details: what is confirmed and what is not

All Underwood facts live in one file: `src/practice/underwood.ts`. Each value there is tagged **[OFFICE]**, **[DEMO]** or **[CONFIRM]**.

| Item | Value in the app | Status | Source |
|---|---|---|---|
| Phone | (618) 624-2400 | Confirmed | Office forms and listings agree |
| New patient exam | $99; includes consultation, physical exam, regional exams, report of findings | Confirmed | Financial Disclosure form |
| Spinal manipulation fee | Adult $65, Child $45 | Confirmed | Financial Disclosure form |
| Re-evaluation fee | Adult $85, Child $75 | Confirmed | Financial Disclosure form |
| Fees due at time of service | Shown on booking confirm | Confirmed | Financial Disclosure form |
| Services bookable in app | Spinal adjustment, ART, Functional rehab, Massage, Normatec, Re-evaluation | Likely right, verify | Website prototype service list |
| Hours | Mon, Tue, Thu, Fri 8-12 and 2-6; Wed 8-12; Sat, Sun closed | Likely right, verify | Website prototype hours table |
| New patients | Not booked in app; "please call" card | Matches prototype note | Website prototype, patient portal message |
| Visit lengths | Adjustment 20, others 30 min | **Placeholder** | Not stated by the office |
| Slot spacing | Every 30 minutes | **Placeholder** | Not stated by the office |
| Cancel/reschedule rule | Changes in the app up to 24 hours ahead; closer = "call the office". No fee shown | **Placeholder** | The office's written policies state no cancellation rule |
| Address | Not shown | **Unresolved** | Sources disagree: 787 Sunset Blvd Ste 200 (office consent form, provider registry) vs 772 Wall St Ste B (a directory listing) |
| ARPneuro Wave Therapy | Left out of the app | Wording not supplied | Website prototype says Dr. Underwood to supply wording |
| Legal name | Not shown | Unresolved | Policy says PLLC; consent form says LLC |

## Not found anywhere (the office needs to tell us)
- A missed-appointment / late-cancel policy (and whether there is any fee)
- How long each visit type takes
- Whether patients can book each service on their own, or only some
- Which scheduling system holds the real appointment book today. A patient portal named ChartTalk is mentioned for payments; whether it also handles scheduling is unknown.

## Questions to send Dr. Underwood
1. Which of these can an existing patient book on their own: adjustment, ART, rehab, massage, Normatec, re-evaluation? Anything else?
2. How long is each visit, and how far apart can start times be?
3. Are the hours right (Wed morning only, weekends closed)? Any lunch closure, holidays, or doctor days off?
4. What is your cancellation / missed-visit policy? How many hours notice, and is there a fee?
5. Should new patients always call, or could they request a time in the app?
6. What is the correct street address and legal business name?
7. What do you use today for scheduling and reminders (and does it have an export or integration)?
8. Wording for ARPneuro Wave Therapy, if you want it in the app.

## Source notes
Taken from the project's website plan and prototype page and from the office's own policy and fee forms. Public directory listings were used only to spot the address conflict; they are third-party data and some are outdated.
