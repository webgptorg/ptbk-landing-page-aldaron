import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { assertAvatarRequest, getAvatarAvailability, AvatarError } from '@/lib/pavol-avatar/config';
import { AvatarServiceError, ensureAvatarConversation, avatarAttachmentSource } from '@/lib/pavol-avatar/service';
import { uploadPublicChatAttachment } from '@/lib/messages/messageAttachmentUpload';
import { CHAT_ATTACHMENT_MAX_BYTES } from '@/lib/messages/messageAttachments';
import { z } from 'zod';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
export async function POST(request:Request) {
 try{
  assertAvatarRequest(request,{mutation:true});
  if(!getAvatarAvailability().enabled)return Response.json({error:'Nenalezeno.'},{status:404,headers});
  const principal=await getAvatarPrincipal(request);if(!principal)return Response.json({error:'Ověř svůj e-mail.'},{status:401,headers});
  const reader=request.body?.getReader();if(!reader)return Response.json({error:'Vyber soubor.'},{status:400,headers});
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>CHAT_ATTACHMENT_MAX_BYTES+65536){await reader.cancel();return Response.json({error:'Soubor může mít nejvýše 4 MB.'},{status:413,headers});}chunks.push(value);}
  const bytes=Buffer.concat(chunks),copy=new Request(request.url,{method:'POST',headers:request.headers,body:bytes});
  const form=await copy.formData(),id=z.string().uuid().safeParse(form.get('conversationId'));
  if(!id.success)return Response.json({error:'Neplatný chat.'},{status:400,headers});
  const language=new URL(request.url).hostname.endsWith('.com')?'en':'cs';
  await ensureAvatarConversation(principal,id.data,language);
  return uploadPublicChatAttachment(new Request(request.url,{method:'POST',headers:request.headers,body:bytes}),avatarAttachmentSource(language));
 }catch(error){return Response.json({error:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.message:'Soubor se nepodařilo nahrát.'},{status:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.status:503,headers});}
}
