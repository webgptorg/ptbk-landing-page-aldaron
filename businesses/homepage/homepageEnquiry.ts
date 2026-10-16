import type { QualificationEnquiryPresentation } from '@/components/qualification-enquiry';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { HOMEPAGE_SCENARIOS } from './homepageScenarios';

export function getHomepageEnquiry(language: SupportedHomepageLanguage): QualificationEnquiryPresentation {
    const content = HOMEPAGE_ENQUIRY_CONTENT[language];
    return {
        ...content,
        enquiryKind: 'autonomous-agenda',
        agendaOptions: [...HOMEPAGE_SCENARIOS[language].map((scenario) => scenario.name), content.otherAgenda],
        successUrl: `/dekujeme?source=autonomous-agendas&lang=${language}`,
        fields: [
            { id: 'name', label: content.name, type: 'text', autoComplete: 'name', isRequired: true },
            { id: 'company', label: content.company, type: 'text', autoComplete: 'organization', isRequired: true },
            { id: 'email', label: content.email, type: 'email', autoComplete: 'email', isRequired: true },
            { id: 'phone', label: content.phone, type: 'tel', autoComplete: 'tel', isRequired: false },
        ],
    };
}

const HOMEPAGE_ENQUIRY_CONTENT = {
    cs: {
        title: 'Proberme vaši agendu.',
        description: 'Začneme rozhovorem o vaší práci a možnostech nasazení.',
        agendaLabel: 'Kterou oblast chcete řešit? *',
        agendaPlaceholder: 'Vyberte oblast',
        otherAgenda: 'Jiná firemní agenda',
        messageLabel: 'Jaká práce se vám pravidelně vrací? *',
        messagePlaceholder: 'Co dnes musíte zadávat, hlídat nebo urgovat?',
        name: 'Jméno *',
        company: 'Firma *',
        email: 'E-mail *',
        phone: 'Telefon (nepovinný)',
        requiredError: 'Vyplňte prosím toto pole.',
        emailError: 'Zadejte prosím platný e-mail.',
        sendingError: 'Zprávu se nepodařilo odeslat. Vaše údaje zůstaly vyplněné; zkuste to znovu.',
        submit: 'Odeslat a probrat nasazení',
        submitting: 'Odesílání…',
        close: 'Zavřít',
        consentPurpose: 'Ozveme se vám k této poptávce.',
        successTitle: 'Děkujeme. Vaši agendu probereme spolu.',
        successDescription: 'Poptávku jsme přijali. Ozveme se vám, abychom probrali cíl, rozsah a možnosti nasazení.',
        back: 'Zpět na hlavní stránku',
    },
    en: {
        title: 'Let’s discuss your responsibility.',
        description: 'We will start with a conversation about your work and deployment options.',
        agendaLabel: 'Which area would you like to discuss? *',
        agendaPlaceholder: 'Choose an area',
        otherAgenda: 'Another business responsibility',
        messageLabel: 'What work keeps coming back to you? *',
        messagePlaceholder: 'What do you currently need to assign, monitor or chase?',
        name: 'Name *',
        company: 'Company *',
        email: 'Email *',
        phone: 'Phone (optional)',
        requiredError: 'Please complete this field.',
        emailError: 'Please enter a valid email address.',
        sendingError: 'Your message could not be sent. Your details are still here; please try again.',
        submit: 'Send enquiry and discuss deployment',
        submitting: 'Sending…',
        close: 'Close',
        consentPurpose: 'We will contact you about this enquiry.',
        successTitle: 'Thank you. Let’s take it from here.',
        successDescription:
            'We have received your enquiry. We will be in touch to discuss the goal, scope and deployment options.',
        back: 'Back to the homepage',
    },
};

export function getHomepageEnquiryThanks(language: SupportedHomepageLanguage) {
    return HOMEPAGE_ENQUIRY_CONTENT[language];
}
