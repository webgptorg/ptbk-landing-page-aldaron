import {
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    type AiTaKrajtaMarkFrame,
    type AiTaKrajtaMarkGradient,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';

/**
 * Creates the same user-space gradient which the SVG mark paints one of its parts with
 */
function createAiTaKrajtaMarkCanvasGradient(
    context: CanvasRenderingContext2D,
    gradient: AiTaKrajtaMarkGradient,
): CanvasGradient {
    const canvasGradient = context.createLinearGradient(gradient.x1, gradient.y1, gradient.x2, gradient.y2);

    for (const stop of gradient.stops) {
        canvasGradient.addColorStop(stop.offset, stop.color);
    }

    return canvasGradient;
}

/**
 * Draws the canonical vector mark into a canvas at its original proportions
 *
 * Note: This is a renderer for the same artwork data used by the React SVG and the favicon SVG. Keeping the data
 *       shared lets the canvas hold the exact logo while the game takes it over.
 */
export function drawAiTaKrajtaMarkOnCanvas(
    context: CanvasRenderingContext2D,
    frame: AiTaKrajtaMarkFrame,
    opacity: number,
): void {
    if (opacity <= 0) {
        return;
    }

    context.save();
    context.globalAlpha = opacity;
    context.translate(frame.left, frame.top);
    context.scale(frame.width / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE, frame.height / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE);

    for (const shape of AI_TA_KRAJTA_MARK_SHAPES) {
        context.fillStyle = createAiTaKrajtaMarkCanvasGradient(context, shape.gradient);
        context.fill(new Path2D(shape.pathData));
    }

    context.restore();
}
