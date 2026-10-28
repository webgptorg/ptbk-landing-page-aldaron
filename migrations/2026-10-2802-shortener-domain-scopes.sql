-- NULL deliberately means every domain. Existing links and automatic workshop/community links stay universal.
ALTER TABLE public."ShortcodeLink" ADD COLUMN domains text[] DEFAULT NULL;
ALTER TABLE public."ShortcodeLink" ADD CONSTRAINT shortcode_link_domains_check CHECK (
    domains IS NULL OR (
        cardinality(domains) BETWEEN 1 AND 4
        AND array_ndims(domains) = 1
        AND array_position(domains, NULL) IS NULL
        AND domains <@ ARRAY['ptbk.io','ai-ta-krajta.cz','pavolhejny.cz','pavolhejny.com']::text[]
    )
);

-- Make the new column available to the REST readers as soon as the migration transaction commits.
NOTIFY pgrst, 'reload schema';
