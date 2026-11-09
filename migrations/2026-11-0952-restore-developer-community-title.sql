BEGIN;

-- Restore the established room heading if it still has the split migration's default title.
UPDATE public.workshops
SET title = 'Komunita Promptbooku'
WHERE room_kind = 'community' AND slug = 'komunita' AND title = 'Vývojáři';

COMMIT;
