# Round 2 findings (fresh reviewer, 2026-11-06)

Saved by the lead from the reviewer's reply (the reviewer could not write files). Screenshots and scripts `s0`-`s5` are in this folder.

**Score: 81/116 = 70%, fail.** Gates under 2: E1, E2, V2, S1, S2. Must-pass F1 fails (stamp date contrast). C7 not checked (provisional).

| Section | Checks | Points |
|---|---|---|
| A Hierarchy and layout | H1 1 · H3 0 · H4 1 · H5 0 · H6 2 · H7 2 | 6/12 |
| B Type and numbers | T1 2 · T2 2 · T3 0 · T4 1 · T5 2 · T6 1 | 8/12 |
| C Colour | C1 1 · C2 1 · C3 2 · C4 2 | 6/8 |
| D Charts (runway) | D1 2 · D2 1 · D3 1 · D4 2 · D5 2 · D6 2 | 10/12 |
| E Finish | E1 0 · E2 0 · E3 2 · E4 2 · E5 1 · E6 1 · E7 2 | 8/14 |
| F Page | P1 1 · P2 2 · P3 2 · P4 2 · P5 1 · P7 1 | 9/12 |
| G Feel and flow | G1-G6 2 · G7 1 · G8 0 · G9 1 · G11 2 · G13 2 · G14 2 · G15 2 | 22/26 |
| V Visual richness | V1 2 · V2 1 · V3 1 · V4 2 · V5 1 · V6 2 · V7 1 | 10/14 |
| S Specificity | S1 1 · S2 0 · S3 1 | 2/6 |

Not checked: H2, T7, C5, C6, C7, P6, G10, G16 (G12 n/a); undo tested one step at a time. T3 0: full-size ₹ on the two big figures (needs a written waiver under principle 2 or a fix).

## Findings
1. **P1 Phone paid slip breaks the amount.** At 390 after Mark paid: "₹1,20,00 / 0", stamp over the project line, email "…example.co / m". Caused by the round-1 stamp. Evidence 33-phone-*-paid.png, 44-crop-phone-paid-break.png. Fix: amounts never wrap; stamp on its own row or over the header on narrow slips; emails break only at @ or .
2. **P1 Stamp date contrast 4.19:1** (14 px green at 90% opacity). Evidence 43-crop-stamp.png, s4_contrast.py. Fix: solid darker ink; texture for the ink feel, not transparency.
3. **P1 Signature missing at rest.** No stamp on first screen (paid rows show a pill); Mark paid below the fold at 1440x900 (y ≈ 1010); stamp is a clean ruled box with no ink. Fix: small stamp mark on paid rows and the paid total; ink texture; Mark paid above the fold at 1440.
4. **P2 Two different "chase first" orders.** Headline picks Copperleaf (₹64,000, 8 late, never reminded) over Halden (₹1,20,000, 20 late, ignored a reminder); runway bay sorts by days late, list by Duly's pick; neither labelled. Fix: one labelled order everywhere, weighing amount and silence, reason in the headline.
5. **P2 Contract drift.** 15 and 18 px sizes outside the scale; tinted icon tiles beside headings; filled pills on neutral rows. Fix: map to scale; remove tiles; pills only for late and due soon. (Three weights 400/500/600 are what the contract states; kept.)
6. **P2 Duplicate-book look too faint.** Soft cards, pastel circles, pills; Bonsai's name would fit the list and slip. Fix: stub on each open row with its number; faint carbon second impression on slip amounts; stronger rules; initials as stamped ink letters.
7. **P2 New-invoice form errors.** Error text grey like hints; errors don't clear; "12abc" accepted; no summary; "Sent on" 52 px next to 40 px Amount; no contact-name field ("Hi Tidewater,"). Fix: late-colour errors with icon, clear on fix, numeric amount, summary on submit, level rows, optional contact name (fallback "Hi there,").
8. **P2 Phone targets under 44 px** (theme buttons 30, headline link 24, Log as sent and Restore 32). Fix: 44 px under 768 px; fold theme into one button or footer.

P3: late headline 18 px beside 32 px title; work text wraps unevenly at 1100; "Firm" history uses due-soon amber; legend lacks amber dot; Orchard Row due ring missing; "New  invoice" double space; Final draft says "earlier reminders" after one; empty pink Late band after all paid; paid slip says paid three times; toast covers amounts at 1440.

## Round-1 fixes
Week totals hold; stamp holds on desktop, broke phone (1) and contrast (2); undo holds per step; tone holds; long content holds; phone title holds.

## Three things only Duly has
Runway by client habit; the habit line on the slip; tone escalation after logging (copyable). Stamp would be fourth if visible at rest.

## Enhancements
1. Show the evidence behind each habit ("from 1 paid invoice").
2. Stamp lives in the book: ink texture, marks on paid rows and the paid total.
3. Honest forecast: place late invoices at their habit day; hollow "no habit yet" marker for new clients.
4. Keyboard path: J/K through chase order, C copy, L log, P paid.

Keep: runway placement and week totals, habit line, tone escalation, undo instead of confirm, Plex lakh figures, perforated stub, dark palette.
