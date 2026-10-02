export type SupportedHomepageLanguage = 'cs' | 'en';

export const fallbackHomepageLanguage: SupportedHomepageLanguage = 'en';

export function getPreferredHomepageLanguage(acceptLanguage: string | null): SupportedHomepageLanguage {
    if (!acceptLanguage) {
        return fallbackHomepageLanguage;
    }

    const acceptedLanguages = acceptLanguage
        .split(',')
        .map((entry, index) => {
            const [languageRange, ...parameters] = entry.trim().split(';');
            const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
            const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;

            return {
                language: languageRange.toLowerCase(),
                quality: Number.isFinite(quality) ? quality : 1,
                index,
            };
        })
        .filter(({ quality }) => quality > 0)
        .sort((a, b) => b.quality - a.quality || a.index - b.index);

    for (const { language } of acceptedLanguages) {
        if (language === 'cs' || language.startsWith('cs-')) {
            return 'cs';
        }

        if (language === 'en' || language.startsWith('en-')) {
            return 'en';
        }
    }

    return fallbackHomepageLanguage;
}
