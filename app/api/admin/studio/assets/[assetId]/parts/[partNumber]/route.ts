import { getStudioAssetContext, studioControlResponse } from '@/lib/recording-studio/studioAssetServer';
import { signStudioUploadPart } from '@/lib/recording-studio/studioAssetS3';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export async function POST(
    request: NextRequest,
    route: { readonly params: Promise<{ assetId: string; partNumber: string }> },
) {
    const { assetId, partNumber } = await route.params;
    const context = await getStudioAssetContext(request, assetId);
    if ('response' in context) return context.response;
    if (context.asset!.status !== 'uploading') return studioControlResponse({ error: 'This upload is locked.' }, 409);
    try {
        return studioControlResponse(await signStudioUploadPart(context.asset!, Number(partNumber)));
    } catch {
        return studioControlResponse({ error: 'Cannot sign this authorized upload part.' }, 400);
    }
}
