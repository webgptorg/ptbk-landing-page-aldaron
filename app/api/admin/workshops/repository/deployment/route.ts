import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { VercelApiError } from '@/lib/vercel/vercelApi';
import { deployWorkshopRepositoryToVercel, getWorkshopVercelDeployment } from '@/lib/workshops/deployWorkshopRepositoryToVercel';
import { workshopRepositoryWriteSchema } from '@/lib/workshops/workshopSchemas';
import { WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA, type WorkshopVercelDeployment } from '@/lib/workshops/workshopVercelDeployment';

const DEPLOYMENT_REQUEST_SCHEMA = z.object({
    repository: workshopRepositoryWriteSchema,
});

async function createDeploymentResponse(action: () => Promise<WorkshopVercelDeployment>) {
    try {
        return NextResponse.json({ deployment: await action() }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof VercelApiError ? error.message : 'Nasazení se nepodařilo ověřit. Zkuste akci znovu.',
        }, { status: error instanceof VercelApiError && error.status === 503 ? 503 : 502 });
    }
}

/** Deploy the form's repository. The completed URL is saved through the ordinary workshop settings form. */
export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse !== null) return unauthorizedResponse;
    const parsed = DEPLOYMENT_REQUEST_SCHEMA.safeParse(await readJsonObjectOrNull(request));
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Ověřte repozitář projektu.' }, { status: 400 });
    }
    if (parsed.data.repository.deploymentUrls.length !== 0) {
        return NextResponse.json({ error: 'Projekt již má vyplněnou URL nasazení.' }, { status: 400 });
    }
    return createDeploymentResponse(() => deployWorkshopRepositoryToVercel(parsed.data.repository));
}

export async function GET(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse !== null) return unauthorizedResponse;
    const parsed = WORKSHOP_VERCEL_DEPLOYMENT_SCHEMA.shape.id.safeParse(request.nextUrl.searchParams.get('deploymentId'));
    if (!parsed.success) return NextResponse.json({ error: 'Neplatné ID nasazení.' }, { status: 400 });
    return createDeploymentResponse(() => getWorkshopVercelDeployment(parsed.data));
}
