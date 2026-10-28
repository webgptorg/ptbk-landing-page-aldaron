-- Add action grants without changing the immutable account migration or widening existing users' access.
-- The legacy shortener grant continues to mean full access; the account editor expands it before editing.
ALTER TABLE public.admin_users DROP CONSTRAINT admin_users_permissions_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_permissions_check CHECK (
    array_position(permissions, NULL) IS NULL
    AND permissions <@ ARRAY[
        'workshops','community','studio','contacts','shortener','discount-codes',
        'shortener:view','shortener:create','shortener:update','shortener:delete','shortener:clicks'
    ]::text[]
);
