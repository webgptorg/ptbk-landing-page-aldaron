'use client';
import { Benefit } from '../../components/benefits-section';

export const citiesCsBenefits: Array<Benefit> = [
    {
        iconName: 'Zap',
        title: 'Rychlý start',
        description: (
            <>
                <b>Virtuální AI odborník</b> vznikne v krátké, jednoduché konverzaci.
            </>
        ),
    },
    {
        iconName: 'UserRound',
        title: 'AI pro vaše město',
        description: (
            <>
                Dostanete AI, která se orientuje ve specifikách vašeho města.
            </>
        ),
    },
    {
        iconName: 'FileStack',
        title: 'Práce s dokumenty',
        description: <>Nahrajete vyhlášky, pravidla, interní znalosti i další dokumenty.</>,
    },
    {
        iconName: 'Shield',
        title: 'Bezpečnost',
        description: <>Vaše data a informace zůstávají v bezpečí pod vaší kontrolou.</>,
    },

    {
        iconName: 'Mail',
        title: 'E-mail',
        description: <>Připojíte ho k webu, e-mailu, WhatsAppu i dalším kanálům.</>,
    },
    {
        iconName: 'Code',
        title: 'Napojení na další systémy',
        description: <>Napojíme ho na další systémy a platformy. S konkrétní integrací vám pomůžeme.</>,
    },
];
