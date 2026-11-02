/** Compatibility exports; podcast archives share one accent-insensitive search implementation. */
export {
    normalizeSearchText as normalizeAiTaKrajtaSearchText,
    createSearchWords as createAiTaKrajtaSearchWords,
    isTextMatchingSearchWords as isAiTaKrajtaTextMatchingSearchWords,
} from '@/lib/search/textSearch';
