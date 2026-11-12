# Round 3 findings (fresh reviewer, 2026-11-06)

Saved by the lead from the reviewer's reply (the reviewer could not write files). Screenshots and scripts (`flow1.py`-`flow6.py`, `colour.py`, `c7.py`, `contrast.py`, `h2.py`) are in this folder. The dev server stopped responding part-way, so some checks did not run (listed at the end).

**Disposition: fix. Score 89/128 = 69.5%, FAIL** (round 2: 81/116 = 70%). Floor F9 fails (text painted under another element, findings 1-2). Gates under 2: E1, E2, S2, V2. Zeros: H2, T3, E1, E2, S2.

| Section | Checks | Points |
|---|---|---|
| A Hierarchy | H1 1 · H2 0 · H3 1 · H4 1 · H5 1 · H6 2 · H7 2 | 8/14 |
| B Type | T1 2 · T2 2 · T3 0 · T4 2 · T5 2 · T6 1 · T7 1 | 10/14 |
| C Colour | C1 1 · C2 1 · C3 2 · C4 1 · C5 1 · C6 2 · C7 2 | 10/14 |
| D Runway | D1 2 · D2 1 · D3 1 · D4 2 · D5 2 · D6 2 | 10/12 |
| E Finish | E1 0 · E2 0 · E3 1 · E4 1 · E5 1 · E6 1 · E7 1 | 5/14 |
| F Piece | P1 1 · P2 2 · P3 2 (CSS only) · P4 1 · P5 1 · P7 2 · P6 not run | 9/12 |
| G Feel | G1-G7 2 · G8 1 · G9 1 · G10 1 · G11 1 · G13 2 · G14 2 · G15 2 · G12 n/a · G16 not run | 24/28 |
| V Richness | V1 2 · V2 1 · V3 1 · V4 1 · V5 2 · V6 2 · V7 1 | 10/14 |
| S Specificity | S1 2 · S2 0 · S3 1 | 3/6 |

## Measured this round
- H2 0: runway and slip edges hold; the list does not (client squares x=126 vs titles 131; amounts end 819 vs section totals 815).
- T7 1: stamp word +0.04em at 40 px; wants −0.02 to −0.04em.
- C5 1: status tints match; selected chip 0.888 vs selected row 0.924.
- C6 2: strong colour 2.1-3.9% of the screen.
- C7 2 with caveat: under deuteranopia late red and due-soon amber both go olive (ΔE 10); paid green vs late red ΔE 5.9 under protanopia. Never touching, always with words, but late loses its own colour (principle 1). `base-1440-light-deutan.png`, `-protan.png`.

## Findings
1. **P1 Late bay runs into the runway caption** (E1, F9) at 1440 and 1100, light and dark. Fix: bay in the runway's own row; caption and legend a row below both, 12 px gap. (`z-runway-left.png`, `base-1100-light.png`, `base-1440-dark.png`)
2. **P1 Toast covers content**: the paid sentence, "Restore sample data", phone rows. Fix: bottom padding of toast height + 24 px while shown; never over the slip column. (`f06c-paid.png`, `f16-delete-confirm.png`, `p05-after-close.png`)
3. **P1 Softer tone suggested after a Final reminder** (G11, principle 3): Firm draft asks for 9 Nov after a 13 Nov deadline was sent. Fix: never suggest below the last tone sent; after Final suggest a Final follow-up or the next step. (`f05-logged.png`)
4. **P1 Phone targets and inputs under the floor** (E2): segments 30 px, Undo 32, New / Mark paid / Copy / Open in email 40; inputs 40 px with 14 px text (iOS zoom). Fix: under 768 px every button and segment ≥44 px; inputs 44 px with 16 px text. (`p01-sheet-light.png`, `p06-new-invoice.png`)
5. **P2 Two untrue statements.** (a) "Likely in by 6 Dec" counts new clients with no habit (Lumen & Lark ₹42,000 inside ₹2,62,000). Fix: "₹2,20,000, plus ₹42,000 from new clients due by then". (b) Header says changes are not saved, footer says saved in this browser. Fix: footer says nothing is saved in preview.
6. **P2 List off its own edges** (H2): 5 px and 4-5 px. Fix: section headers share the row content inset. (`z-list-left-rail.png`)
7. **P2 Signature not in the first view** (S2). Fix: enhancement 1.
8. **P2 Runway ranges overlap; amber on the wrong point** (D3, C4): Marigold's bar runs through Orchard's ring and dot; amber on Kestrel's landing dot (17 Nov, outside 7 days) while Lumen (due in 3 days) has none. Fix: a range only for the selected chip, or its own lane; amber on the due ring.

P3: client initial colours copy status colours (green, brown-red, ochre) and the contract lists no client colours; empty bay stays 190 px tall; phone email breaks "rohan@halden.example / .com"; each tone option is its own Tab stop; form does not check a filled field on leaving and rejects "45,000"; full-size ₹ on big figures (T3: shrink or record a decision); Final draft says "I haven't had a reply" when none was sent; the toast after Undo does not say what was undone; buttons and segments are full pills though the contract sets 4/8/12/14; calendar icons on not-due rows add nothing; panels use hairline plus shadow (banned; the contract asks for it: record it as the owner's decision).

## Round 1-2 fixes
Hold: week totals, stamp and solid date, undo stack (5 in a row back to ₹5,70,500), phone paid slip, Mark paid in view, one chase order, pills only late and soon, error summary and focus, habit evidence. Partly: phone 44 px (finding 4), empty bay (full height), toast (now covers content). Does not hold: "Likely in by" (finding 5a).

## Only Duly
The habit runway with its separate late bay; the rubber Paid stamp with paid-row marks; reminders that use the client's own record (the habit sentence; the tone templates alone are copyable).

## Enhancements
1. Stamp the paid total in the runway header; on Mark paid the amount travels up to it, the figure rolls and the stamp presses again (fixes S2).
2. Carbon copies of sent reminders, each with its exact text and promised deadline; the next draft quotes that deadline.
3. A habit strip on the slip: past days late as ticks (15, 17, 19), today's 20 in red.
4. Keyboard: J/K through the chase order, C copy, L log, P paid, shown on the buttons.

Keep: habit runway and late bay, ruled paper, the stamp's ink, ring and tilt, blue Plex amounts with lakh grouping, reminders quoting the client's record, delete with undo.

## Not run
Server stopped: long-content stress, copy and log in the phone sheet, focus containment in the phone sheet, 320 px and 200% zoom, 1100 and dark interactions beyond rest. Also not run: reduced-motion render (P3 from CSS only), P6, G16.
