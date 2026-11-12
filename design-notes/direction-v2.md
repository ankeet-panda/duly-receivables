# Duly: direction v2 (product-first re-derivation, 2026-11-06)

Replaces the look in `direction.md` (kept as history). Brief, job, user and five lines' Product/Moments stay; the look is
re-derived from Duly alone. The old type choice cited "passed on Tend": a carried-over reason, now void.

## Product principles (ranked)
1. We want what is late, and who to chase first, readable in under 10 seconds, **because** Aanya opens Duly on Monday mornings to decide one chase (brief outcome).
2. We want every amount unmistakable (lakh grouping, I / l / 1 distinct, tabular figures), **because** she invoices in rupees and a misread ₹1,20,000 is a real money error.
3. We want chasing to feel composed, not confrontational, **because** the awkwardness of asking a client for money is the job's real pain (job story).
4. We want the forecast shown as each client's own habit, **because** "when it will really land" depends on the client, not the due date (29% of invoices paid late, Bonsai data).
5. We want the phone to carry the same decision between calls, **because** she checks it on her phone between client calls.

## Category audit (invoicing and receivables: FreshBooks, Zoho Invoice, Wave, Bonsai, Chaser, Xero)
| Convention | Keep or habit |
|---|---|
| Totals at the top (outstanding, overdue, paid) | Keep: recognition; compressed to one owed figure plus two facts |
| Invoice table with status chips | Keep: people know how to read it |
| Ageing buckets 0-30 / 31-60 / 61-90 | Habit: accountant language, not her question |
| Revenue bar chart | Habit: answers nothing she asked |
| Left sidebar nav for a one-screen tool | Habit |
| Brand blue or green, Inter, rounded-2xl cards | Habit |
| Reminder templates buried in settings | Habit: the tone belongs next to the invoice |

**Where Duly differs:** (1) the runway places money on the day each client usually pays, instead of ageing buckets (principle 4); (2) the reminder and its tone sit on the invoice slip itself (principle 3).

## The default answer (what a generic AI build would ship)
White ground with a grey sidebar, Inter, indigo accent, four KPI tiles in a row, a revenue bar chart, a table with green/amber/red pills, rounded-2xl cards with soft shadows; often a dark navy hero card for the total.
The round-1 build still shared two of these: the **dark navy hero panel** and a near-Inter grotesk. The recommendation differs on:
- **ground of the hero:** ruled bill-book paper instead of a navy slab (principle 1: late items carry the colour, not the panel);
- **type:** IBM Plex Sans, chosen because it passed Duly's own glyph test (principle 2);
- **shape:** slips with small radii and perforated stubs, not cushions (subject: the duplicate bill book);
- **structure:** runway by client habit, not KPI tiles plus chart (principle 4).

## Type test on Duly's content (`type-test.png`, reviewed 2026-11-06, zoomed crop)
Test string: ₹1,20,000 · ₹5,70,500 · Il1 O0 · INV-0412 · 29 Sept, plus a sentence and three amounts.
| Family | Result |
|---|---|
| IBM Plex Sans | **Pass**: I has bars, l has a tail, 1 has a flag; ₹ correct; even figures |
| Atkinson Hyperlegible Next | Pass on glyphs, but its slashed zero clutters every amount (₹5,70,5Ø0) |
| Hanken Grotesk, Public Sans, Host Grotesk, Funnel Sans, Libre Franklin | Fail: capital I and small l identical |
| Schibsted Grotesk | Fail: broken spacing around commas in tabular figures |
| Albert Sans | Fail: ₹ falls back to another font; I and l identical |

## Six candidates (skeletons; the two product-derived ones written first)
1. **Product: Duplicate book.** The carbon-copy bill book every Indian freelancer and shop knows: paper, carbon-blue ink, perforated stubs, a rubber stamp. Runway ruled like the book; amounts written in carbon ink.
2. **Product: Monday wall planner.** The runway becomes the whole first screen as week columns; ledger below the fold. (Culled: buries the late list under a forecast, breaks principle 1.)
3. **Designer, restrained (Otl Aicher's way of thinking): Two-ink ledger.** Black ink, one signal colour for late, hairlines, square corners, denser rows.
4. **Real user, sampled (a 34-year-old wedding photographer in Kochi who keeps payments in a paper diary): Diary.** Handwritten-feeling dates, one page per week. (Culled: a script face fails principle 2.)
5. **Reference, not seen with my own eyes:** a bank passbook print. Monospace columns. (Culled: mono for non-code breaks the one-family rule and reads as a costume.)
6. **Style library draw:** night desk. Deep panel under lamp light, kept from round 1 as **Desk-lamp runway**, with the legibility-first face.

## Shown to the owner (rendered on the real screen, `direction-v2/compare.png`)
- **R · Duplicate book (recommended).** Won because it is the only one that serves principles 1 to 3 at once: late items carry the only strong colour, Plex passes the money test, and the carbon-book world makes chasing feel like ordinary bookkeeping rather than confrontation.
- **A2 · Desk-lamp runway.** The round-1 navy runway with Atkinson Hyperlegible Next. Strongest focal point; costs: the navy slab is the category default, and slashed zeros clutter amounts.
- **A3 · Two-ink ledger.** Black on white, vermilion for late only, square corners, denser. Most precise; costs: coldest, so it fights principle 3.

**Owner picked R · Duplicate book (2026-11-06).** Baked into `app/src/styles/tokens.css` (light and dark); the preview switch and `directions.css` are deleted.

## Contract (R · Duplicate book)
| Block | Contents |
|---|---|
| Principles | The five above, in that order |
| Category | Kept: totals on top, invoice table with status chips. Different: runway by client habit instead of ageing buckets; reminder tone on the slip; **because** principles 3 and 4 |
| Default avoided | Navy hero slab, Inter-like grotesk, cushioned cards, KPI tiles plus chart; **because** principles 1 and 2 and the bill-book subject |
| Feeling | Composed, firm, everyday; **because** chasing money should feel like bookkeeping, not conflict (principle 3) |
| Surface | Operate (`#/app`), Persuade (`#/`); **because** the brief asks for a working product and a product page |
| Scene | Light by day at her desk on Monday mornings; dark = the same book under the desk lamp; theme follows the device; **because** she uses a laptop by day and her phone between calls |
| Type | IBM Plex Sans 400/500/600, one family; app scale 12/13/14/16/20/24/32; **because** it alone kept I, l and 1 apart and set ₹ and lakh grouping cleanly on Duly's own content (principle 2) |
| Colour | Cool paper neutrals (hue 250); carbon-blue ink (hue 266) for the primary, the owed figure and slip amounts; status only with words: late vermilion, due soon amber, not due carbon, paid green (also the stamp); **because** carbon copies are written in that blue and late money must own the only warm strong colour (principle 1) |
| Density and grid | Contained 1320 px; runway full width; ledger 1.55 : 1 slip; under 1100 px the slip becomes a sheet; **because** one decision per visit, then detail |
| Radius and depth | 4 / 8 / 12 / 14 for everything, buttons and segments included (no pills); cards take a hairline, the slip and runway take a shadow, never both; runway ruled every 28 px; **because** bill-book slips are paper, not cushions |
| Client identity | Initials pressed in ink inside an outlined square, in cool inks only (hues 190-340), never a status hue; **because** red, amber and green already mean late, due soon and paid (round 3) |
| Figures | The ₹ stays full size on the two big figures: a deliberate exception to the small-currency-sign rule, **because** principle 2 (an unmistakable rupee amount) outranks typographic polish here (decided 2026-11-06 after round 3, T3) |
| Motion | Calm: stamp presses, totals roll changed digits, runway markers move lanes; reduced motion instant; **because** motion only explains money changing state |
| Signature | The rubber Paid stamp pressed onto the slip; **because** a stamp is how a bill book records payment |
| References | None copied |

