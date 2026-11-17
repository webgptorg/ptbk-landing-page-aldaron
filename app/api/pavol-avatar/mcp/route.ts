import { handleAvatarMcpRequest } from '@/lib/pavol-avatar/integrations/mcp';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export const POST = handleAvatarMcpRequest;
export const GET = handleAvatarMcpRequest;
export const DELETE = handleAvatarMcpRequest;
