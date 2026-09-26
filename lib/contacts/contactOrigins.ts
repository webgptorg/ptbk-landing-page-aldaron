import type { Contact } from './Contact';

/**
 * One filled origin name, or `null` when the contact did not provide it
 */
export type ContactOriginName = string | null;

/**
 * One place where a contact was gathered
 */
export type ContactOrigin = {
    readonly appName: ContactOriginName;
    readonly placeName: ContactOriginName;
};

/**
 * One app name and all of its place names, derived from the gathered contacts
 */
export type ContactOriginGroup = {
    readonly appName: ContactOriginName;
    readonly placeNames: readonly ContactOriginName[];
};

/**
 * One selected origin in the filter
 *
 * When `placeName` is absent, every place of the app name is selected. When it is present, only that exact place is
 * selected. This keeps the app-name and place-name choices in one small, unambiguous value.
 */
export type ContactAppNameSelection = {
    readonly appName: ContactOriginName;
    readonly placeName?: never;
};

/**
 * One selected place name below one app name
 */
export type ContactPlaceNameSelection = {
    readonly appName: ContactOriginName;
    readonly placeName: ContactOriginName;
};

export type ContactOriginSelection = ContactAppNameSelection | ContactPlaceNameSelection;

/**
 * Empty origin selection means that every contact origin is shown
 */
export const EMPTY_CONTACT_ORIGIN_SELECTIONS: readonly ContactOriginSelection[] = [];

type ContactWithAdminContactGroup = Contact & {
    readonly contactGroup?: { readonly contacts: readonly Contact[] } | null;
};

/**
 * Compares names in the order users expect, including numbers and diacritics
 */
const CONTACT_ORIGIN_NAME_COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Treat missing and whitespace-only origin names as the same missing value
 */
function normalizeContactOriginName(originName: ContactOriginName): ContactOriginName {
    const normalizedOriginName = originName?.trim();

    return normalizedOriginName === '' || normalizedOriginName === undefined ? null : normalizedOriginName;
}

/**
 * Read every stored contact source behind an identity merged for administration
 */
function getContactOriginSourceContacts(contact: Contact): readonly Contact[] {
    const sourceContacts = (contact as ContactWithAdminContactGroup).contactGroup?.contacts;

    return sourceContacts === undefined || sourceContacts.length === 0 ? [contact] : sourceContacts;
}

/**
 * Compare two origin names, keeping contacts without a name at the end of each list
 */
function compareContactOriginNames(firstOriginName: ContactOriginName, secondOriginName: ContactOriginName): number {
    if (firstOriginName === secondOriginName) {
        return 0;
    }

    if (firstOriginName === null) {
        return 1;
    }

    if (secondOriginName === null) {
        return -1;
    }

    return CONTACT_ORIGIN_NAME_COLLATOR.compare(firstOriginName, secondOriginName);
}

/**
 * Read and normalize the app name and place name of one contact
 */
export function getContactOrigin(contact: Contact): ContactOrigin {
    return {
        appName: normalizeContactOriginName(contact.appName),
        placeName: normalizeContactOriginName(contact.placeName),
    };
}

/**
 * Group every known place name below its app name
 */
export function getContactOriginGroups(contacts: readonly Contact[]): ContactOriginGroup[] {
    const placeNamesByAppName = new Map<ContactOriginName, Set<ContactOriginName>>();

    for (const contact of contacts) {
        for (const sourceContact of getContactOriginSourceContacts(contact)) {
            const { appName, placeName } = getContactOrigin(sourceContact);
            const placeNames = placeNamesByAppName.get(appName) ?? new Set<ContactOriginName>();

            placeNames.add(placeName);
            placeNamesByAppName.set(appName, placeNames);
        }
    }

    return Array.from(placeNamesByAppName, ([appName, placeNames]) => ({
        appName,
        placeNames: Array.from(placeNames).sort(compareContactOriginNames),
    })).sort((firstGroup, secondGroup) => compareContactOriginNames(firstGroup.appName, secondGroup.appName));
}

/**
 * Is the selection for every place below one app name, rather than one specific place?
 */
export function isContactAppNameSelection(selection: ContactOriginSelection): selection is ContactAppNameSelection {
    return selection.placeName === undefined;
}

/**
 * Make the selections deterministic, unique, and free of place selections covered by their app selection
 */
export function normalizeContactOriginSelections(
    selections: readonly ContactOriginSelection[],
): ContactOriginSelection[] {
    const selectedAppNames = new Set<ContactOriginName>();
    const selectedPlaceNamesByAppName = new Map<ContactOriginName, Set<ContactOriginName>>();

    for (const selection of selections) {
        const appName = normalizeContactOriginName(selection.appName);

        if (isContactAppNameSelection(selection)) {
            selectedAppNames.add(appName);
            continue;
        }

        const placeName = normalizeContactOriginName(selection.placeName);
        const selectedPlaceNames = selectedPlaceNamesByAppName.get(appName) ?? new Set<ContactOriginName>();

        selectedPlaceNames.add(placeName);
        selectedPlaceNamesByAppName.set(appName, selectedPlaceNames);
    }

    const selectedOriginAppNames = new Set<ContactOriginName>([
        ...Array.from(selectedAppNames),
        ...Array.from(selectedPlaceNamesByAppName.keys()),
    ]);
    const normalizedSelections: ContactOriginSelection[] = [];

    for (const appName of Array.from(selectedOriginAppNames).sort(compareContactOriginNames)) {
        if (selectedAppNames.has(appName)) {
            normalizedSelections.push({ appName });
            continue;
        }

        const selectedPlaceNames = selectedPlaceNamesByAppName.get(appName);

        if (selectedPlaceNames === undefined) {
            continue;
        }

        normalizedSelections.push(
            ...Array.from(selectedPlaceNames)
                .sort(compareContactOriginNames)
                .map((placeName) => ({ appName, placeName })),
        );
    }

    return normalizedSelections;
}

/**
 * Do two origin selection lists describe the same contacts?
 */
export function areContactOriginSelectionsEqual(
    firstSelections: readonly ContactOriginSelection[],
    secondSelections: readonly ContactOriginSelection[],
): boolean {
    const normalizedFirstSelections = normalizeContactOriginSelections(firstSelections);
    const normalizedSecondSelections = normalizeContactOriginSelections(secondSelections);

    return (
        normalizedFirstSelections.length === normalizedSecondSelections.length &&
        normalizedFirstSelections.every((firstSelection, index) => {
            const secondSelection = normalizedSecondSelections[index];

            return (
                firstSelection.appName === secondSelection.appName &&
                firstSelection.placeName === secondSelection.placeName
            );
        })
    );
}

/**
 * Is every place below this app name selected?
 */
export function isContactAppNameSelected(
    selections: readonly ContactOriginSelection[],
    appName: ContactOriginName,
): boolean {
    return selections.some(
        (selection) => selection.appName === appName && isContactAppNameSelection(selection),
    );
}

/**
 * Is one exact place below this app name selected?
 */
export function isContactPlaceNameSelected(
    selections: readonly ContactOriginSelection[],
    appName: ContactOriginName,
    placeName: ContactOriginName,
): boolean {
    return selections.some(
        (selection) =>
            selection.appName === appName &&
            !isContactAppNameSelection(selection) &&
            selection.placeName === placeName,
    );
}

/**
 * Does the app have one or more individually selected place names?
 */
export function hasSelectedContactPlaceNames(
    selections: readonly ContactOriginSelection[],
    appName: ContactOriginName,
): boolean {
    return selections.some(
        (selection) => selection.appName === appName && !isContactAppNameSelection(selection),
    );
}

/**
 * Does the origin selection narrow the contacts down at all?
 */
export function isContactOriginSelectionActive(selections: readonly ContactOriginSelection[]): boolean {
    return selections.length > 0;
}

/**
 * Add or remove a whole app name selection, including its nested place selections
 */
export function setContactAppNameSelected(
    selections: readonly ContactOriginSelection[],
    appName: ContactOriginName,
    isSelected: boolean,
): ContactOriginSelection[] {
    const normalizedAppName = normalizeContactOriginName(appName);
    const selectionsWithoutAppName = selections.filter((selection) => selection.appName !== normalizedAppName);

    return normalizeContactOriginSelections(
        isSelected ? [...selectionsWithoutAppName, { appName: normalizedAppName }] : selectionsWithoutAppName,
    );
}

/**
 * Add or remove one place name selection below its app name
 */
export function setContactPlaceNameSelected(
    selections: readonly ContactOriginSelection[],
    appName: ContactOriginName,
    placeName: ContactOriginName,
    isSelected: boolean,
): ContactOriginSelection[] {
    const normalizedAppName = normalizeContactOriginName(appName);
    const normalizedPlaceName = normalizeContactOriginName(placeName);
    const selectionsWithoutPlaceName = selections.filter(
        (selection) =>
            selection.appName !== normalizedAppName ||
            isContactAppNameSelection(selection) ||
            selection.placeName !== normalizedPlaceName,
    );
    const selectionsWithoutAppNameSelection = selectionsWithoutPlaceName.filter(
        (selection) => selection.appName !== normalizedAppName || !isContactAppNameSelection(selection),
    );

    return normalizeContactOriginSelections(
        isSelected
            ? [
                  ...selectionsWithoutAppNameSelection,
                  { appName: normalizedAppName, placeName: normalizedPlaceName },
              ]
            : selectionsWithoutPlaceName,
    );
}

/**
 * Does the contact match at least one selected origin? An empty selection intentionally means every origin.
 */
export function matchesContactOriginSelections(
    contact: Contact,
    selections: readonly ContactOriginSelection[],
): boolean {
    if (selections.length === 0) {
        return true;
    }

    return getContactOriginSourceContacts(contact).some((sourceContact) => {
        const contactOrigin = getContactOrigin(sourceContact);

        return selections.some(
            (selection) =>
                selection.appName === contactOrigin.appName &&
                (isContactAppNameSelection(selection) || selection.placeName === contactOrigin.placeName),
        );
    });
}
