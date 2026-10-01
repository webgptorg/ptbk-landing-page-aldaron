import {
    getHomepageContent,
    HOMEPAGE_QUALIFICATION_PLACE_NAME,
    type HomepageAgendaTaskState,
} from '@/businesses/homepage/homepageContent';
import { PRO_FIRMY_QUALIFICATION_PLACE_NAME } from '@/businesses/pro-firmy/proFirmyContent';
import { SUPPORTED_HOMEPAGE_LANGUAGES } from '@/lib/homepage-language';
import { describe, expect, it } from 'vitest';

describe('homepage content', () => {
    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('says the same thing in %s as in every other language', (language) => {
        const content = getHomepageContent(language);
        const czechContent = getHomepageContent('cs');

        // Note: A localization is a translation of one page, not a page of its own, so a section may not quietly
        //       lose a comparison, an example or a step on the way into another language.
        expect(content.contrast.rows).toHaveLength(czechContent.contrast.rows.length);
        expect(content.anatomy.parts).toHaveLength(czechContent.anatomy.parts.length);
        expect(content.examples.items).toHaveLength(czechContent.examples.items.length);
        expect(content.maintainedApplication.steps).toHaveLength(czechContent.maintainedApplication.steps.length);
        expect(content.leverage.blocks).toHaveLength(czechContent.leverage.blocks.length);
        expect(content.finalCta.expectations).toHaveLength(czechContent.finalCta.expectations.length);
        expect(content.qualificationPopup.questions).toHaveLength(czechContent.qualificationPopup.questions.length);
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('holds one agenda of several lifecycles at once in %s', (language) => {
        const { hero } = getHomepageContent(language);
        const taskStates = new Set<HomepageAgendaTaskState>(hero.agenda.tasks.map((task) => task.state));

        // The hero has to show the whole promise at once: work finished, work happening, work waiting, and the one
        // question which goes back to a person instead of being decided alone.
        expect(taskStates).toEqual(new Set<HomepageAgendaTaskState>(['done', 'running', 'scheduled', 'escalated']));
        expect(hero.agenda.context.length).toBeGreaterThan(1);
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('features the self-maintaining application exactly once in %s', (language) => {
        const { examples } = getHomepageContent(language);
        const featured = examples.items.filter((example) => example.isFeatured);

        expect(featured).toHaveLength(1);
        expect(examples.items.length).toBeGreaterThan(3);
    });

    it.each(SUPPORTED_HOMEPAGE_LANGUAGES)('offers no invented capacity in %s', (language) => {
        // Note: The dialog still supports the note, because the company-data page honestly counts the places it
        //       takes. The homepage has no such number, so it must leave it unsaid rather than make one up.
        expect(getHomepageContent(language).qualificationPopup.remainingSpots).toBeUndefined();
    });

    it('records its leads under a source of its own', () => {
        expect(HOMEPAGE_QUALIFICATION_PLACE_NAME).not.toBe(PRO_FIRMY_QUALIFICATION_PLACE_NAME);
    });

    it('asks for everything the lead flow needs before it can submit', () => {
        for (const language of SUPPORTED_HOMEPAGE_LANGUAGES) {
            const { questions } = getHomepageContent(language).qualificationPopup;
            const contactQuestion = questions.at(-1);

            expect(contactQuestion?.type).toBe('contact');
            expect(contactQuestion?.fields?.map((field) => field.id)).toEqual([
                'name',
                'company',
                'email',
                'phone',
            ]);

            for (const question of questions.slice(0, -1)) {
                expect(question.type).toBe('single');
                expect(question.options?.length).toBeGreaterThan(1);
            }
        }
    });
});
