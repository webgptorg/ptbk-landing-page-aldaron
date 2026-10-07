import { getStudioAssetContext, studioControlResponse } from '@/lib/recording-studio/studioAssetServer';
import { signStudioAssetRead } from '@/lib/recording-studio/studioAssetS3';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export async function GET(request: NextRequest, route: { readonly params: Promise<{ assetId: string }> }) {
    const context = await getStudioAssetContext(request, (await route.params).assetId);
    if ('response' in context) return context.response;
    if (context.asset!.status !== 'verified')
        return studioControlResponse({ error: 'Only verified private objects are readable.' }, 409);
    try {
        return studioControlResponse(await signStudioAssetRead(context.asset!));
    } catch {
        return studioControlResponse({ error: 'Private playback signing is unavailable.' }, 503);
    }
}
