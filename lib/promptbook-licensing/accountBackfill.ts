/** Offline operator only. Neither statement is run by the lookup, build or ordinary schema migrations. */
const missingAccounts = `
    SELECT DISTINCT lower(btrim(orders.email)) AS email, orders.is_test
    FROM public.promptbook_orders AS orders
    WHERE (orders.confirmed_at IS NOT NULL OR orders.first_paid_at IS NOT NULL OR orders.paid_through IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1 FROM public.promptbook_license_accounts AS account
        WHERE account.email = lower(btrim(orders.email)) AND account.is_test = orders.is_test
      )`;

/** Summary contains counts by environment only, never customer emails or commercial records. */
export const LICENSE_ACCOUNT_BACKFILL_PREVIEW_SQL = `
    SELECT is_test, count(*)::integer AS missing_accounts
    FROM (${missingAccounts}) AS missing GROUP BY is_test ORDER BY is_test`;

export const LICENSE_ACCOUNT_BACKFILL_APPLY_SQL = `
    WITH inserted AS (
        INSERT INTO public.promptbook_license_accounts(email, is_test)
        ${missingAccounts}
        ON CONFLICT (email, is_test) DO NOTHING
        RETURNING is_test
    )
    SELECT is_test, count(*)::integer AS inserted_accounts
    FROM inserted GROUP BY is_test ORDER BY is_test`;
