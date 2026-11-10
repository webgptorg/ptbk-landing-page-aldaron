import { TERMINAL_TOUR_PAGE_DEFINITION } from '@/businesses/terminal-tour/terminalTour';
import { createPageSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

export function GET() {
    return createPageSocialPreviewImageRoute(
        TERMINAL_TOUR_PAGE_DEFINITION,
        { eyebrow: 'Záznam z terminálu' },
    ).renderSocialPreviewImage();
}
