import { describe, expect, it } from 'vitest';
import { HOMEPAGE_CONTENT } from './homepageContent';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';
import { INITIAL_HOMEPAGE_STORY_STATE, reduceHomepageStory } from './homepageStoryModel';
import { HOMEPAGE_METADATA, HOMEPAGE_PAGE_DEFINITIONS, HOMEPAGE_SOCIAL_PREVIEW_OPTIONS } from './homepageMetadata';
import { PRO_FIRMY_METADATA } from '../pro-firmy/proFirmyMetadata';
import {
    createGeneratedSocialPreviewImagePath,
    resolveSocialPreviewImagePath,
} from '@/lib/metadata/social-preview-image-path';
import { INDEXED_PAGE_METADATA_DEFINITIONS } from '@/lib/metadata/page-registry';

describe('localized homepage stories', () => {
    it('keeps the same responsibilities, story states, results and human boundaries in both languages', () => {
        expect(HOMEPAGE_SCENARIOS.cs.map(({ id }) => id)).toEqual(['software', 'communication', 'documents']);
        for (const [index, scenario] of Array.from(HOMEPAGE_SCENARIOS.cs.entries())) {
            const translation = HOMEPAGE_SCENARIOS.en[index];
            expect(translation.id).toBe(scenario.id);
            expect(translation.steps.map(({ status }) => status)).toEqual(scenario.steps.map(({ status }) => status));
        }
        for (const language of ['cs', 'en'] as const) {
            for (const scenario of HOMEPAGE_SCENARIOS[language]) {
                for (const field of ['name', 'burden', 'responsibility', 'benefit', 'human'] as const)
                    expect(scenario[field].length).toBeGreaterThan(10);
                expect(scenario.steps.some(({ status }) => status === 'attention')).toBe(true);
                expect(scenario.steps.at(-1)?.status).toBe('waiting');
                expect(scenario.steps[1].status).toBe('prepared');
                for (const step of scenario.steps) {
                    expect(step.result).not.toBe('');
                    expect(step.artifact.rows).toHaveLength(2);
                    expect(HOMEPAGE_CONTENT[language].stories.statuses[step.status]).not.toBe('');
                }
            }
        }
    });

    it('distinguishes a checked proposal, approval, deployment, later work and waiting', () => {
        const software = HOMEPAGE_SCENARIOS.en[0];
        expect(software.steps[1].artifact.note).toContain('not deployed');
        expect(software.steps[2].status).toBe('attention');
        expect(software.steps[3].status).toBe('approved');
        expect(software.steps[4].title).toContain('No new prompt');
        expect(software.steps[5].status).toBe('waiting');
        expect(HOMEPAGE_SCENARIOS.en[1].steps[1].artifact.rows[1].value).toBe('Not sent');
        expect(HOMEPAGE_SCENARIOS.en[2].steps[3].artifact.note).toBe('No tax filing or payment');
    });

    it('resets selection atomically, clamps navigation, and never accumulates duplicate events', () => {
        const scenarios = HOMEPAGE_SCENARIOS.en;
        let state = INITIAL_HOMEPAGE_STORY_STATE;
        for (let index = 0; index < 50; index++) state = reduceHomepageStory(scenarios, state, { type: 'next' });
        expect(state).toEqual({ scenarioIndex: 0, stepIndex: 5 });
        for (const index of [1, 2, 0, 2, 1]) {
            state = reduceHomepageStory(scenarios, state, { type: 'scenario', index });
            expect(state).toEqual({ scenarioIndex: index, stepIndex: 1 });
        }
        state = reduceHomepageStory(scenarios, state, { type: 'replay' });
        expect(reduceHomepageStory(scenarios, state, { type: 'previous' })).toEqual({ scenarioIndex: 1, stepIndex: 0 });
        expect(reduceHomepageStory(scenarios, state, { type: 'scenario', index: 99 })).toBe(state);
        expect(reduceHomepageStory(scenarios, state, { type: 'step', index: 3 })).toEqual({
            scenarioIndex: 1,
            stepIndex: 3,
        });
    });
});

describe('homepage metadata isolation', () => {
    it('uses localized business copy, matching cards and canonical language alternates', () => {
        for (const language of ['cs', 'en'] as const) {
            const definition = HOMEPAGE_PAGE_DEFINITIONS[language];
            const metadata = HOMEPAGE_METADATA[language];
            expect(metadata.alternates?.canonical).toBe(`https://ptbk.io/${language}`);
            expect(metadata.alternates?.languages).toMatchObject({
                cs: 'https://ptbk.io/cs',
                en: 'https://ptbk.io/en',
            });
            expect(metadata.openGraph?.images).toEqual(metadata.twitter?.images);
            expect(metadata.openGraph?.title).toBe(HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language].title);
            expect(HOMEPAGE_SOCIAL_PREVIEW_OPTIONS[language].artwork).toBe('responsibility');
            expect(resolveSocialPreviewImagePath(definition)).toBe(`/${language}/opengraph-image?v=2-agendas-1`);
            expect(JSON.stringify(definition)).not.toMatch(
                /100%|GDPR|halucinac|hallucination|virtual employee|virtuální zaměstnanec/,
            );
            expect(INDEXED_PAGE_METADATA_DEFINITIONS).toContain(definition);
        }
    });

    it('refreshes only the new homepage artwork and keeps authored and company images intact', () => {
        expect(createGeneratedSocialPreviewImagePath('/cs/pro-firmy')).toBe('/cs/pro-firmy/opengraph-image?v=2');
        expect(PRO_FIRMY_METADATA.openGraph?.title).toContain('Promptbook pro firmy');
        expect(PRO_FIRMY_METADATA.alternates?.canonical).toBe('https://ptbk.io/cs/pro-firmy');
        expect(
            resolveSocialPreviewImagePath({
                ...HOMEPAGE_PAGE_DEFINITIONS.en,
                socialPreviewImagePath: 'https://example.com/authored.png?keep=yes',
            }),
        ).toBe('https://example.com/authored.png?keep=yes');
    });
});
