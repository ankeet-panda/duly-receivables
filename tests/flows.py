"""End-to-end click-through of every Duly feature.
Usage: python -I tests/flows.py [base_url]   (default http://127.0.0.1:5240/)
Runs in Edge via Playwright. ?today=YYYY-MM-DD pins the date (nothing is saved in that mode).
"""
import sys
from playwright.sync_api import sync_playwright, expect

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5240/').rstrip('/') + '/'
PIN = '?today=2026-11-06'
results = []


def check(name, fn):
    try:
        fn()
        results.append((True, name, ''))
    except Exception as e:  # noqa: BLE001
        results.append((False, name, str(e).splitlines()[0][:220]))


with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge')
    errors = []

    def new(query=PIN, w=1440, h=1000, dark=False):
        ctx = b.new_context(viewport={'width': w, 'height': h}, color_scheme='dark' if dark else 'light')
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'], origin=BASE.rstrip('/'))
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: errors.append(f'console {m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        pg.goto(BASE + query + '#/app')
        pg.wait_for_selector('.row')
        return ctx, pg

    ctx, pg = new()
    owed = lambda: pg.locator('.runway__figure .sr-only').inner_text()  # noqa: E731
    late_group = lambda: pg.locator('.ledger__group--late')  # noqa: E731

    def t_verdict():
        expect(pg.locator('.verdict')).to_contain_text('₹2,12,500 is late across 3 invoices')
        # One chase order everywhere: most money waiting longest (Halden ₹1,20,000 x 20 days), with the reason written out
        expect(pg.locator('.verdict')).to_contain_text('Start with Halden Foods: ₹1,20,000, 20 days late, and your friendly reminder 14 days ago has had no reply.')
        assert owed() == '₹5,70,500', owed()
        expect(pg.locator('.slip__client')).to_have_text('Halden Foods')
        bay = pg.locator('.rw-bay .rw-chip__name').all_inner_texts()
        rows = pg.locator('.ledger__group--late .row__client').all_inner_texts()
        assert bay == rows, (bay, rows)
    check('Opens with the verdict, the total owed and the first invoice to chase selected', t_verdict)

    def t_habit():
        pg.locator('.row', has_text='Copperleaf Travel').first.click()
        expect(pg.locator('.slip__pattern')).to_contain_text('4 days later than usual. Usually pays 4 days late (from 3 paid invoices).')
        pg.locator('.row', has_text='Kestrel Bikes').first.click()
        expect(pg.locator('.slip__pattern')).to_contain_text('Usually pays 6 days late (from 3 paid invoices), so expect it around 17 Nov')
    check('Each invoice explains the client habit and the likely landing date', t_habit)

    def t_runway_select():
        pg.locator('.rw-chip', has_text='Halden Foods').click()
        expect(pg.locator('.slip__client')).to_have_text('Halden Foods')
        expect(pg.locator('.row[aria-pressed="true"]')).to_contain_text('Halden Foods')
        for name in ('Lumen & Lark', 'Kestrel Bikes', 'Orchard Row Studio', 'Marigold Clinics'):
            pg.locator('.rw-track .rw-chip', has_text=name).click(timeout=3000)
            expect(pg.locator('.slip__client')).to_have_text(name)
        pg.locator('.rw-chip', has_text='Halden Foods').click()
    check('Clicking any runway marker (late bay and timeline) selects the same invoice in the list', t_runway_select)

    def t_tone():
        # Halden has one friendly reminder and is 20 days late: Firm is suggested
        expect(pg.locator('.composer [data-tone="firm"]')).to_have_attribute('aria-checked', 'true')
        expect(pg.locator('.composer input')).to_have_value('Overdue: invoice INV-0412 (₹1,20,000)')
        pg.locator('.composer [data-tone="final"]').click()
        expect(pg.locator('.composer input')).to_have_value('Final reminder: invoice INV-0412, 20 days overdue')
        expect(pg.locator('.composer textarea')).to_contain_text('pause further work')
        expect(pg.locator('.composer__hint')).to_contain_text('Duly suggests firm here')
    check('Tone switch redrafts subject and message; suggested tone is marked', t_tone)

    def t_edit_kept():
        pg.locator('.composer textarea').fill('Hi Rohan, custom note.')
        expect(pg.locator('.composer textarea')).to_have_value('Hi Rohan, custom note.')
        pg.locator('.composer [data-tone="firm"]').click()
        expect(pg.locator('.composer textarea')).to_contain_text('confirm a payment date')
    check('Edits are kept until the tone changes', t_edit_kept)

    def t_copy():
        pg.locator('[data-action="copy"]').click()
        expect(pg.locator('[data-action="copy"] .swap')).to_have_attribute('data-on', 'true')
        clip = pg.evaluate('navigator.clipboard.readText()')
        assert clip.startswith('Subject: Overdue: invoice INV-0412'), clip[:80]
    check('Copy message puts subject and body on the clipboard and the button confirms', t_copy)

    def t_mailto():
        href = pg.locator('.composer a.btn').get_attribute('href')
        assert href.startswith('mailto:rohan@halden.example.com?subject=Overdue'), href[:80]
    check('Open in email links to the client address with the draft', t_mailto)

    def t_log():
        pg.locator('[data-action="log"]').click()
        expect(pg.locator('.history li').first).to_contain_text('Firm')
        expect(pg.locator('.toast')).to_contain_text('Reminder logged for INV-0412')
        expect(pg.locator('.row', has_text='Halden Foods').first).to_contain_text('Firm reminder today')
        # Two reminders now: Final becomes the suggestion, and the picker moves to it (they never disagree)
        expect(pg.locator('[role="radio"][data-tone="final"]')).to_have_attribute('aria-checked', 'true')
        expect(pg.locator('.composer__hint')).to_contain_text('Suggested for this invoice')
    check('Log as sent records the reminder, updates the row and escalates the suggestion', t_log)

    def t_undo_log():
        pg.locator('.toast__undo').click()
        expect(pg.locator('.row', has_text='Halden Foods').first).to_contain_text('Friendly reminder 14 days ago')
        expect(pg.locator('.toast')).to_have_count(0)
    check('Undo removes the logged reminder', t_undo_log)

    def t_undo_burst():
        # Three quick actions, then Undo three times: each undo reverts one action, newest first
        halden = pg.locator('.row', has_text='Halden Foods').first
        for _ in range(2):
            pg.locator('[data-action="log"]').click()
        pg.locator('[data-action="mark-paid"]').click()
        expect(pg.locator('.toast')).to_contain_text('marked paid')
        pg.locator('.toast__undo').click()
        expect(pg.locator('.toast')).to_contain_text('Reminder logged')
        pg.locator('.toast__undo').click()
        pg.locator('.toast__undo').click()
        expect(halden).to_contain_text('Friendly reminder 14 days ago')
        expect(pg.locator('.toast')).to_have_count(0)
    check('Several quick actions undo one at a time, newest first, back to the start', t_undo_burst)

    def t_paid():
        pg.locator('.row', has_text='Copperleaf Travel').first.click()
        pg.locator('[data-action="mark-paid"]').click()
        expect(pg.locator('.stamp')).to_be_visible()
        expect(pg.locator('.stamp')).to_have_attribute('aria-label', 'Paid on 6 November 2026')
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹5,06,500')
        expect(pg.locator('.verdict')).to_contain_text('₹1,48,500 is late across 2 invoices')
        expect(pg.locator('.rw-chip', has_text='Copperleaf')).to_have_count(0)
        expect(pg.locator('.ledger__group--paid')).to_contain_text('Copperleaf Travel')
        expect(pg.locator('.composer')).to_have_count(0)
    check('Mark paid stamps the slip, rolls the totals, clears the runway and moves the row', t_paid)

    def t_undo_paid():
        pg.locator('.toast__undo').click()
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹5,70,500')
        expect(pg.locator('.stamp')).to_have_count(0)
        expect(pg.locator('.ledger__group--late')).to_contain_text('Copperleaf Travel')
    check('Undo restores the unpaid invoice and the totals', t_undo_paid)

    def t_unpaid():
        pg.locator('[data-action="mark-paid"]').click()
        pg.get_by_role('button', name='Mark unpaid').click()
        expect(pg.locator('.stamp')).to_have_count(0)
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹5,70,500')
    check('Mark unpaid reverses a payment', t_unpaid)

    def t_new_invalid():
        pg.locator('[data-action="new-invoice"]').click()
        expect(pg.locator('dialog.sheet[open]')).to_be_visible()
        pg.get_by_role('button', name='Add invoice').click()
        expect(pg.locator('#ni-client-err')).to_have_text('Enter who the invoice is for.')
        expect(pg.locator('#ni-amount-err')).to_be_visible()
        assert pg.evaluate('document.activeElement.id') == 'ni-client'
    check('New invoice shows errors on the fields and focuses the first one', t_new_invalid)

    def t_new_add():
        pg.locator('#ni-client').fill('Kestrel Bikes')
        expect(pg.locator('#ni-email')).to_have_value('nikhil@kestrel.example.com')
        pg.locator('#ni-project').fill('Ride tracker icons')
        pg.locator('#ni-amount').fill('48,000')
        pg.get_by_role('radio', name='15 days').click()
        expect(pg.locator('.form__terms .field-hint')).to_contain_text('21 Nov')
        pg.get_by_role('button', name='Add invoice').click()
        expect(pg.locator('dialog.sheet[open]')).to_have_count(0)
        expect(pg.locator('.slip__client')).to_have_text('Kestrel Bikes')
        expect(pg.locator('.slip__project')).to_contain_text('INV-0429')
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹6,18,500')
        expect(pg.locator('.slip__pattern')).to_contain_text('expect it around 27 Nov')
    check('Adding an invoice for a known client fills the email, sets the due date and joins the forecast', t_new_add)

    def t_delete():
        pg.get_by_role('button', name='Delete invoice').click()
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹5,70,500')
        expect(pg.locator('.toast')).to_contain_text('INV-0429 deleted')
        pg.locator('.toast__undo').click()
        expect(pg.locator('.row', has_text='Ride tracker icons')).to_have_count(1)
    check('Delete removes the invoice; Undo brings it back', t_delete)

    def t_escape():
        pg.locator('[data-action="new-invoice"]').click()
        pg.keyboard.press('Escape')
        expect(pg.locator('dialog.sheet[open]')).to_have_count(0)
        assert pg.evaluate("document.activeElement.dataset.action") == 'new-invoice'
    check('Escape closes the sheet and returns focus to its button', t_escape)

    def t_tone_floor():
        # After a Final reminder is logged, Duly never suggests a softer tone
        pg.goto(BASE + PIN + '#/app'); pg.wait_for_selector('.row')
        pg.locator('.row', has_text='Copperleaf Travel').first.click()
        pg.locator('[role="radio"][data-tone="final"]').click()
        pg.locator('[data-action="log"]').click()
        expect(pg.locator('[role="radio"][data-tone="final"]')).to_have_attribute('aria-checked', 'true')
        expect(pg.locator('.composer__hint')).to_contain_text('Suggested for this invoice')
    check('After a Final reminder the suggestion stays Final, never softer', t_tone_floor)

    def t_theme():
        pg.get_by_role('radio', name='Dark').click()
        assert pg.evaluate('document.documentElement.dataset.theme') == 'dark'
        pg.reload(); pg.wait_for_selector('.row')
        assert pg.evaluate('document.documentElement.dataset.theme') == 'dark'
        pg.get_by_role('radio', name='Light').click()
    check('Theme switch applies and is remembered', t_theme)
    ctx.close()

    # Saving: real date mode keeps data across reloads
    ctx, pg = new(query='')

    def t_persist():
        pg.locator('.ledger__group--late .row').first.click()
        pg.locator('[data-action="mark-paid"]').click()
        after = pg.locator('.runway__figure .sr-only').inner_text()
        pg.reload(); pg.wait_for_selector('.row')
        expect(pg.locator('.runway__figure .sr-only')).to_have_text(after)
        pg.get_by_role('button', name='Restore sample data').click()
        expect(pg.locator('.runway__figure .sr-only')).to_have_text('₹5,70,500')
    check('Changes are saved in this browser and the sample can be restored', t_persist)
    ctx.close()

    # Phone: the slip opens as a sheet
    ctx, pg = new(w=390, h=844)

    def t_phone():
        pg.locator('.row', has_text='Saltpan Ceramics').first.click()
        expect(pg.locator('dialog.sheet--slip[open]')).to_be_visible()
        expect(pg.locator('dialog.sheet--slip .slip__client')).to_have_text('Saltpan Ceramics')
        pg.locator('dialog [data-action="mark-paid"]').click()
        expect(pg.locator('dialog .stamp')).to_be_visible()
        pg.get_by_role('button', name='Close').click()
        expect(pg.locator('dialog.sheet--slip[open]')).to_have_count(0)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        assert sw <= 390, f'page scrolls sideways: {sw}'
    check('Phone: invoice opens as a sheet, can be paid, closes; no sideways scroll', t_phone)
    ctx.close()

    check('No console errors or warnings', lambda: (_ for _ in ()).throw(AssertionError('; '.join(errors[:3]))) if errors else None)
    b.close()

ok = sum(1 for r in results if r[0])
for passed, name, why in results:
    print(('PASS ' if passed else 'FAIL ') + name + (f'  -> {why}' if why else ''))
print(f'\n{ok}/{len(results)} passed')
sys.exit(0 if ok == len(results) else 1)
