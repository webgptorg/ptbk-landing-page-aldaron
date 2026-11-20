BEGIN;

-- Add independent section grants without changing any existing account's permissions.
ALTER TABLE public.admin_users DROP CONSTRAINT admin_users_permissions_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_permissions_check CHECK (
    array_position(permissions, NULL) IS NULL AND permissions <@ ARRAY[
        'workshops','community','articles','studio','contacts','shortener','discount-codes','messages','agents',
        'shortener:view','shortener:create','shortener:update','shortener:delete','shortener:clicks',
        'promptbook-licensing','promptbook-subscriptions','api-keys'
    ]::text[]
);

COMMIT;
