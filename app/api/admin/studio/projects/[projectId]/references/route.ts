import {
    getStudioAssetContext,
    readStudioControlJson,
    studioControlResponse,
} from '@/lib/recording-studio/studioAssetServer';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export async function PUT(request: NextRequest, route: { readonly params: Promise<{ projectId: string }> }) {
    const context = await getStudioAssetContext(request);
    if ('response' in context) return context.response;
    try {
        const projectId = z
            .string()
            .uuid()
            .parse((await route.params).projectId);
        const body = z
            .object({ assetIds: z.array(z.string().uuid()).max(1000), isRetainOnly: z.boolean().default(false) })
            .strict()
            .parse(await readStudioControlJson(request));
        if (body.isRetainOnly) {
            for (const assetId of body.assetIds) {
                const retained = await context.database.rpc('retain_studio_media_project_reference', {
                    target_project_id: projectId,
                    target_asset_id: assetId,
                });
                if (retained.error) throw new Error(retained.error.message);
            }
        } else {
            const result = await context.database.rpc('set_studio_media_project_references', {
                target_project_id: projectId,
                target_asset_ids: body.assetIds,
            });
            if (result.error) throw new Error(result.error.message);
        }
        return studioControlResponse({ isSaved: true });
    } catch (error) {
        return studioControlResponse(
            { error: error instanceof Error ? error.message : 'References could not be saved.' },
            400,
        );
    }
}
