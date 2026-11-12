# Duly review log

## Round 1 (2026-11-06, before the product-first re-derivation): findings held, applied 2026-11-06 after direction R was picked
| Finding | Fix | Proof |
|---|---|---|
| Runway week totals not aligned with their dates; crowding at 1100 px | Each week's total sits directly under its start date, left-aligned on the same tick line; the end date is right-aligned with no total. Markers shrink with the track (128-164 px); the compact grouped view starts below 880 px of runway width; markers sit above every stem | `review/r1-fix/long-1100-runway.png` |
| Paid stamp too small and timid | Word 40 px (was 26), date 14 px, 3.5 px double border, letter-spaced; amount keeps clear of it | `review/r1-fix/stamp.png` |
| Undo unreliable after several quick actions | Undo is now a stack (last 20), computed outside React's state updater; each Undo reverts one action, newest first | new flow test "Several quick actions undo one at a time" |
| Pre-selected tone contradicted the suggested tone | The picker follows Duly's suggestion whenever it changes (after a reminder is logged) | flow test "Log as sent" now checks Final is selected and marked suggested |
| Long names and amounts broke layouts | Runway lane height grows with the longest name (never cut); slip shows the contact only when it differs from the company, email on its own line; a decorative wash that pushed the page 5 px sideways at 1100 px was removed | `tools/long_content.py`: 0 px sideways overflow at 1440, 1100, 390 |
| Phone sheet details | Sheet title is "Invoice INV-0412" (the slip already names the client), so long names no longer fill the header | `review/r1-fix/long-390-sheet.png` |

Tests after the fixes: `python -I tests/flows.py` 21/21; type check clean.

## Round 2 (fresh reviewer, 2026-11-06): 81/116 = 70%, fail. Findings in `review/r2/findings.md`. Fixes applied 2026-11-06
| Finding | Fix |
|---|---|
| 1 Phone paid slip broke the amount | Amounts never wrap; the stamp drops under the amount when the slip is narrow (container query); emails break only after @ or before a dot |
| 2 Stamp date 4.19:1 | Solid ink (light oklch 0.45 0.12 155, dark 0.8 0.13 155); the ink grain is a mask on the ring and the word only, never the date |
| 3 Signature missing at rest; Mark paid below the fold | Paid rows carry a small stamp mark instead of a pill; ink grain on the stamp; slip and runway tightened so Mark paid is at y ≈ 853-893 at 1440x900 |
| 4 Two chase orders | One order everywhere (amount x days late), labelled in the bay and the list; the headline gives amount, lateness and the unanswered reminder |
| 5 Contract drift | 15/18 px sizes removed from tokens and mapped to the scale; icon tiles removed; pills only for late and due soon (not-due is plain text). Three weights kept: the contract states 400/500/600 |
| 6 Bill book too faint | Client initials pressed as ink-outlined squares; stronger page rules; paid rows stamped. (Carbon second impression on amounts not done: text effects are banned) |
| 7 Form errors | Errors in late colour with an icon, clear as soon as the field is edited, strict numeric amount, an error summary on submit, rows top-aligned, optional contact name; drafts greet "Hi there," when no person is named |
| 8 Phone targets | 44 px under 768 px for theme buttons, small buttons and icon buttons; headline link has a 44 px tap band |
| P3 items | Headline 20 px; Firm in history uses ink, not amber; legend shows due-soon and new-client markers; due ring always drawn when it differs; "New invoice" spacing; Final draft counts reminders honestly; empty Late bay turns neutral; paid slip drops its pill; toast moves to the bottom right on wide screens |
| Enhancements taken | Habit line shows its evidence ("from 3 paid invoices"); new clients get a hollow "no habit yet" marker; "Likely in by" counts only money a habit says will land (₹4,74,500 → ₹2,62,000) |
| Not taken yet | Keyboard path (J/K, C, L, P): queued for the component-craft pass |

Tests after: flows 21/21 (verdict test now checks the one chase order and that the bay and list agree), type check clean, long-content 0 px overflow at 1440/1100/390.

## Round 3 (fresh reviewer, 2026-11-06): 89/128 = 69.5%, fail. Findings in `review/r3/findings.md`. Fixes applied 2026-11-06
Two of its P1s were caused by round-2 fixes (the caption pulled up over the bay; the toast moved over the slip). Lesson: re-check what a fix touches at every size before handing over.
| Finding | Fix |
|---|---|
| 1 Late bay under the caption | Caption and legend moved into their own row below the bay and the track; the empty bay no longer stretches |
| 2 Toast covers content | The page gains 88 px at the bottom while a toast shows; on wide screens the toast sits at the left of the container, never over the slip |
| 3 Softer tone after Final | The suggestion never drops below the last tone sent; new flow test "After a Final reminder the suggestion stays Final" |
| 4 Phone touch floor | Under 768 px every button, segment and Undo is ≥44 px; inputs 44 px with 16 px text |
| 5a Likely-in counted new clients | "₹2,20,000" counts habit money only, with "plus ₹42,000 from new clients due by then" beneath |
| 5b Saved vs not saved | Footer says "Preview: nothing you change here is saved" in preview mode |
| 6 List edges | Headings and section totals share the rows' 12 px inner edge |
| 7 Signature not in first view | Enhancement 1 taken: a small ink "Paid" stamp beside the paid total, pressed again whenever the total changes |
| 8 Ranges and amber | The due-to-land range shows for the selected invoice and for invoices due within 7 days only; amber marks the due point (a ring, or the dot when they coincide) |
| P3 | Client inks moved out of status hues (contract updated); emails break only after @; calendar glyph removed from not-due rows; Final draft no longer claims an unanswered reminder; toast says what was undone; buttons and segments use the 8 px corner, not pills; hairline-plus-shadow removed (cards hairline only, slip and runway shadow only); stamp word tracked −0.02em; selected chip tint matches the selected row; a filled email or amount is checked when you leave the field; ₹ full size kept as a recorded decision (contract) |
| Deferred to the component-craft pass | Tone picker as one Tab stop with arrow keys; keyboard shortcuts (J/K, C, L, P); carbon copies of sent reminders; habit strip on the slip |

Tests after: flows 22/22, type check clean, long-content 0 px overflow at 1440/1100/390, Mark paid at y 851-891 at 1440x900.
