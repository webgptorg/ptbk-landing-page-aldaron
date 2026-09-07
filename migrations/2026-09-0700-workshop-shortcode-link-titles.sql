-- A source record keeps the title which was shown for its automatically
-- shortened address. It is intentionally beside the mapping rather than in
-- the editable source Markdown: the editor retains the original URL while a
-- room can render a stable, contextual public short link without refetching a
-- remote page for every participant.

BEGIN;

ALTER TABLE public.workshop_content_shortcode_links
    ADD COLUMN IF NOT EXISTS destination_title text
        CHECK (destination_title IS NULL OR btrim(destination_title) <> '');

ALTER TABLE public.workshop_comment_shortcode_links
    ADD COLUMN IF NOT EXISTS destination_title text
        CHECK (destination_title IS NULL OR btrim(destination_title) <> '');

COMMIT;
