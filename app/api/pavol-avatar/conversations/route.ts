import { removeStoredObject } from '@/lib/storage/objectStorage';
import { getAvatarPrincipal } from '@/lib/pavol-avatar/auth';
import { getAvatarDatabase } from '@/lib/pavol-avatar/database';
import { assertAvatarRequest, getAvatarAvailability, AvatarError } from '@/lib/pavol-avatar/config';
import { AvatarServiceError, loadAvatarConversation } from '@/lib/pavol-avatar/service';
import { z } from 'zod';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
export async function GET(request:Request) {
 try{
  assertAvatarRequest(request,false);
  if(!getAvatarAvailability().enabled)return Response.json({error:'Nenalezeno.'},{status:404,headers});
  const principal=await getAvatarPrincipal(request);
  if(!principal)return Response.json({error:'Ověř svůj e-mail.'},{status:401,headers});
  const id=new URL(request.url).searchParams.get('id');
  if(id){if(!z.string().uuid().safeParse(id).success)return Response.json({error:'Neplatný chat.'},{status:400,headers});
    const rows=await loadAvatarConversation(principal,id);
    return Response.json({conversationId:id,turns:rows.flatMap(row=>[{role:'user',content:row.question,attachments:row.attachments,createdAt:row.created_at},
       ...(row.reply?[{role:'assistant',content:row.reply,createdAt:row.created_at}]:[])])},{headers});}
  const result=await getAvatarDatabase().from('avatar_chat_conversations').select('id,title,channel,language,updated_at').eq('principal_id',principal.id).order('updated_at',{ascending:false}).limit(50);
  if(result.error)throw new Error('Unavailable');
  return Response.json({conversations:result.data},{headers});
 }catch(error){return Response.json({error:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.message:'Historie teď není dostupná.'},{status:(error instanceof AvatarServiceError||error instanceof AvatarError)?error.status:503,headers});}
}
export async function DELETE(request:Request) {
 try{
  assertAvatarRequest(request,{mutation:true});
  const principal=await getAvatarPrincipal(request);if(!principal)return Response.json({error:'Ověř svůj e-mail.'},{status:401,headers});
  const body=await request.json().catch(()=>null);const input=z.object({id:z.string().uuid()}).safeParse(body);
  if(!input.success)return Response.json({error:'Vyber chat.'},{status:400,headers});
  const db=getAvatarDatabase();
  const owned=await db.from('avatar_chat_conversations').select('id').eq('id',input.data.id).eq('principal_id',principal.id).maybeSingle();
  if(owned.error)throw new Error('Unavailable');
  if(!owned.data)return Response.json({error:'Chat jsme nenašli.'},{status:404,headers});
  const files=await db.from('message_chat_attachments').select('id,object_key').eq('conversation_id',input.data.id).in('source_key',['avatar-account-cs','avatar-account-en']);
  if(files.error)throw new Error('Unavailable');
  for(const file of files.data??[]){await removeStoredObject(file.object_key);const deleted=await db.from('message_chat_attachments').delete().eq('id',file.id);if(deleted.error)throw new Error('Unavailable');}
  const removed=await db.from('avatar_chat_conversations').delete().eq('id',input.data.id).eq('principal_id',principal.id);
  if(removed.error)throw new Error('Unavailable');
  return Response.json({deleted:true},{headers});
 }catch{return Response.json({error:'Chat se nepodařilo smazat.'},{status:503,headers});}
}
