import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { assertAvatarRequest, getAvatarAvailability, AvatarError } from '@/lib/pavol-avatar/config';
import { askAvatar, AvatarServiceError } from '@/lib/pavol-avatar/service';
import { z } from 'zod';
import { messageAttachmentSchema } from '@/lib/messages/messageAttachments';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=120;
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
const turnSchema=z.object({role:z.enum(['user','assistant']),content:z.string().max(48000),attachments:messageAttachmentSchema.array().max(4).optional()});
const schema=z.object({messages:z.array(turnSchema).min(1).max(16),conversationId:z.string().uuid(),requestId:z.string().uuid(),language:z.enum(['cs','en']).optional()});
export async function POST(request:Request) {
    try {
        assertAvatarRequest(request,{mutation:true});
        if(!getAvatarAvailability().enabled) return Response.json({error:'Služba není dostupná.'},{status:404,headers});
        const principal=await getAvatarPrincipal(request);
        if(!principal) return Response.json({error:'Pro pokračování ověř svůj e-mail.'},{status:401,headers});
        const reader=request.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
        if(!reader) return Response.json({error:'Chybí otázka.'},{status:400,headers});
        while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>70000){await reader.cancel();return Response.json({error:'Otázka je příliš dlouhá.'},{status:413,headers});}chunks.push(value);}
        const input=schema.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        if(!input.success) return Response.json({error:'Zkontroluj otázku.'},{status:400,headers});
        const question=input.data.messages.at(-1);
        if(!question || question.role!=='user') return Response.json({error:'Chybí otázka.'},{status:400,headers});
        const result=await askAvatar(principal,{prompt:question.content,conversationId:input.data.conversationId,requestId:input.data.requestId,
            channel:'web',language:input.data.language??(new URL(request.url).hostname.endsWith('.com')?'en':'cs'),attachments:question.attachments,signal:request.signal});
        return Response.json(result,{headers});
    } catch(error) {
        return Response.json({error:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.message:'Chat teď není dostupný.'},{status:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.status:503,headers});
    }
}
