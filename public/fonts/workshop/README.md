# Workshop PDF fonts

The PDF uses the site's Inter body font and Outfit headings. The static TrueType files
are embedded on download and served locally; exporting does not request Google Fonts.

Sources (SIL Open Font License 1.1, included alongside the fonts):

- https://github.com/google/fonts/tree/main/ofl/inter
- https://github.com/google/fonts/tree/main/ofl/outfit

Generated from the variable TTF sources using FontTools `instantiateVariableFont`:
Inter normal and italic at weights 400 and 700, with optical size at its default (14);
Outfit at weight 700. All source glyphs are preserved, including Czech diacritics.
The PDF renderer subsets the fonts to the characters used in each document.
