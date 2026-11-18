'use client';
import Image from 'next/image';
import { useCallback,useEffect,useState,type FormEvent } from 'react';
import { FloatingAgentChat } from '@/components/agents/FloatingAgentChat';
import { SITE_AGENT_EMBEDS } from '@/lib/site-agents/registry';
import { messageChatStorageKey,readMessageChatSession } from '@/lib/messages/messageChatSession';
import type { MessageChatSession } from '@/lib/messages/messageChatSession';
import { AVATAR_PUBLIC_PRICE_CZK,AVATAR_PUBLIC_PRIVACY_PATH,type AvatarAvailability,type AvatarAccountState,type AvatarHistoryItem } from '@/lib/pavol-avatar/presentation';
import { AvatarCheckout } from './AvatarCheckout';
import { LogIn, LogOut } from 'lucide-react';
import { PavolChromeSlot } from './PavolPageChrome';
import { DISCOUNT_CODE_QUERY_PARAMETER } from '@/lib/discounts/discountCodeConstants';

function discountCheckoutRequested(){return new URLSearchParams(window.location.search).has(DISCOUNT_CODE_QUERY_PARAMETER);}

async function jsonRequest<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch(path,{method,headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const data:unknown=await response.json().catch(()=>null);if(!response.ok){const message=data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'Služba teď není dostupná.';throw new Error(message);}return data as T;
}
type Connections={tokens:{id:string;label:string;createdAt:string}[];setup:{codex:string;claude:string;opencode:string};telegram:{available:boolean;botUsername?:string}};
export function PavolAvatarAccount({language,availability}:{language:'cs'|'en';availability:AvatarAvailability}) {
 const cs=language==='cs',embed=SITE_AGENT_EMBEDS['pavol-avatar'];
 const[state,setState]=useState<AvatarAccountState>({principal:null,access:null,availability}),[loading,setLoading]=useState(true);
 const[tab,setTab]=useState<'chat'|'plans'|'connections'|'history'>('chat'),[email,setEmail]=useState(''),[code,setCode]=useState(''),[sent,setSent]=useState<'otp'|'magic-link'|null>(null);
 const[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[checkout,setCheckout]=useState(false);
 const[history,setHistory]=useState<AvatarHistoryItem[]>([]),[mount,setMount]=useState(0),[connections,setConnections]=useState<Connections|null>(null);
 const[label,setLabel]=useState(''),[newToken,setNewToken]=useState(''),[telegramUrl,setTelegramUrl]=useState('');
 const source=state.principal?'avatar-account-'+state.principal.id+'-'+language:'avatar-account-guest';
 const refresh=useCallback(async()=>{
  try{const next=await jsonRequest<AvatarAccountState>('/api/pavol-avatar/access');setState(next);
   if(next.principal){const data=await jsonRequest<{conversations:AvatarHistoryItem[]}>('/api/pavol-avatar/conversations');setHistory(data.conversations);}
  }catch(failure){setError(failure instanceof Error?failure.message:'Služba teď není dostupná.');}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 useEffect(()=>{if(discountCheckoutRequested()){setCheckout(true);setTab('plans');}},[]);
 useEffect(()=>{
  const hash=new URLSearchParams(window.location.hash.slice(1)),tokenHash=hash.get('login_token'),loginEmail=hash.get('login_email')??undefined;
  if(!tokenHash)return;
  window.history.replaceState(null,'',window.location.pathname+window.location.search);
  setBusy(true);setError('');
  void jsonRequest('/api/pavol-avatar/auth','POST',{tokenHash,email:loginEmail})
   .then(async()=>{setTab(discountCheckoutRequested()?'plans':'chat');setNotice(cs?'Přihlášení je ověřené.':'You are signed in.');await refresh();})
   .catch((failure:unknown)=>setError(failure instanceof Error?failure.message:'Přihlášení se nepodařilo.')).finally(()=>setBusy(false));
 },[cs,refresh]);
 async function authenticate(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const discountCode=new URLSearchParams(window.location.search).get(DISCOUNT_CODE_QUERY_PARAMETER);
   const data=await jsonRequest<{isVerified?:boolean;method?:'otp'|'magic-link'}>('/api/pavol-avatar/auth','POST',{email,...(code?{code}:discountCode?{discountCode}:{})});
   if(data.isVerified){setSent(null);setCode('');setTab(discountCheckoutRequested()?'plans':'chat');await refresh();}else setSent(data.method??state.availability.authMethod);
  }catch(failure){setError(failure instanceof Error?failure.message:'Přihlášení se nepodařilo.');}finally{setBusy(false);}
 }
 async function logout(){setBusy(true);setError('');try{await jsonRequest('/api/pavol-avatar/auth','DELETE');setNewToken('');setConnections(null);setTelegramUrl('');setHistory([]);setCheckout(false);setTab('plans');await refresh();}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}}
 async function selectConversation(id:string){setBusy(true);setError('');
  try{const local=readMessageChatSession(window.localStorage,source);if(local?.draft.trim()&&!window.confirm(cs?'Otevřít jiný chat? Rozepsaný text v tomto okně se nahradí.':'Open another chat and replace this draft?'))return;
   const loaded=await jsonRequest<{conversationId:string;turns:MessageChatSession['turns']}>('/api/pavol-avatar/conversations?id='+encodeURIComponent(id));
   window.localStorage.setItem(messageChatStorageKey(source),JSON.stringify({version:1,conversationId:loaded.conversationId,turns:loaded.turns,draft:'',retry:null,attachments:[]}));
   setMount(value=>value+1);setTab('chat');
  }catch(failure){setError((failure as Error).message);}finally{setBusy(false);}
 }
 async function deleteConversation(id:string){if(!window.confirm(cs?'Smazat tento chat a jeho přílohy?':'Delete this chat and its attachments?'))return;setBusy(true);setError('');
  try{await jsonRequest('/api/pavol-avatar/conversations','DELETE',{id});const current=readMessageChatSession(window.localStorage,source);
   if(current?.conversationId===id){window.localStorage.removeItem(messageChatStorageKey(source));setMount(value=>value+1);}await refresh();
  }catch(failure){setError((failure as Error).message);}finally{setBusy(false);}
 }
 async function loadConnections(){setTab('connections');setError('');try{setConnections(await jsonRequest<Connections>('/api/pavol-avatar/tokens'));}catch(failure){setError((failure as Error).message);}}
 async function createToken(event:FormEvent){event.preventDefault();setBusy(true);setError('');
  try{const result=await jsonRequest<{token:string}>('/api/pavol-avatar/tokens','POST',{label});setNewToken(result.token);setLabel('');setConnections(await jsonRequest<Connections>('/api/pavol-avatar/tokens'));}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}
 }
 async function revokeToken(id:string){setBusy(true);setError('');try{await jsonRequest('/api/pavol-avatar/tokens','DELETE',{id});setConnections(await jsonRequest<Connections>('/api/pavol-avatar/tokens'));}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}}
 async function linkTelegram(){setBusy(true);setError('');try{const result=await jsonRequest<{url:string}>('/api/pavol-avatar/telegram/link','POST',{});setTelegramUrl(result.url);}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}}
 async function unlinkTelegram(){setBusy(true);setError('');try{await jsonRequest('/api/pavol-avatar/telegram/link','DELETE');setTelegramUrl('');setNotice(cs?'Telegram je odpojený.':'Telegram disconnected.');}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}}
 async function managePayment(){setBusy(true);setError('');try{const result=await jsonRequest<{url:string}>('/api/pavol-avatar/portal','POST',{id:state.access?.subscription?.id});const target=new URL(result.url);if(target.hostname!=='billing.stripe.com')throw new Error('Invalid portal');window.location.assign(target.href);}catch(failure){setError((failure as Error).message);setBusy(false);}}
 const plan=state.access?.plan??'free',limits=state.availability.limits;
 const plans=<div className="avatar-plan-grid">
  {(['free','light','full']as const).map(kind=><article className={'avatar-plan'+(kind==='full'?' avatar-plan-featured':'')} key={kind}>
   <p className="avatar-eyebrow">{kind==='free'?'Free':kind==='light'?'Light':'Full'}</p>
   <h2>{kind==='full'?AVATAR_PUBLIC_PRICE_CZK.toLocaleString(cs?'cs-CZ':'en-GB')+' Kč':kind==='light'?(cs?'V komunitě':'With membership'):(cs?'Zdarma':'Free')}</h2>
   <p>{kind==='full'?(cs?'měsíčně · bez ročního závazku':'monthly · no annual commitment'):kind==='light'?(cs?'Součást placené komunity Vývojáři':'Included in paid Developers membership'):(cs?'Vyzkoušej si způsob uvažování avatara':'Try the avatar’s approach')}</p>
   <ul><li>{limits[kind]} {cs?'otázek za kalendářní měsíc':'questions per calendar month'}</li><li>{cs?'Webový chat a přílohy':'Web chat and attachments'}</li><li>{cs?'Historie napříč zařízeními':'History across devices'}</li>{kind==='full'&&<><li>MCP · Claude Code, Codex, OpenCode</li><li>SKILL.md · {cs?'živé know-how přes MCP':'live expertise through MCP'}</li><li>{state.availability.telegramEnabled?(cs?'Telegram po propojení s botem':'Telegram after linking the bot'):(cs?'Telegram zatím není dostupný':'Telegram is not available yet')}</li></>}</ul>
   {kind==='full'?<button className="avatar-button" type="button" disabled={busy||loading||!state.availability.billingEnabled||plan==='full'} onClick={()=>{if(!state.principal){setNotice(cs?'Nejdřív ověř svůj e-mail. Pak můžeš dokončit objednávku.':'Verify your email to continue to checkout.');document.getElementById('avatar-email')?.focus();}else setCheckout(true);}}>{plan==='full'?(cs?'Tvůj tarif':'Your plan'):(cs?'Získat Full':'Get Full')}</button>
   :<p className="avatar-small">{kind==='light'?(cs?'Nárok ověříme podle stejného e-mailu jako členství.':'Use the same verified email as your membership.'):(cs?'Bez platební karty.':'No card required.')}</p>}
  </article>)}
 </div>;
 return <div className="avatar-account" data-view={state.principal?tab:'guest'}>
  <PavolChromeSlot slot="headerActions">
   {state.principal?<button className="pavol-app-auth" type="button" aria-label={cs?'Odhlásit':'Sign out'} title={cs?'Odhlásit':'Sign out'} disabled={busy} onClick={()=>void logout()}><LogOut size={18} aria-hidden="true"/><span>{cs?'Odhlásit':'Sign out'}</span></button>
    :<button className="pavol-app-auth" type="button" aria-label={cs?'Přihlásit':'Sign in'} title={cs?'Přihlásit':'Sign in'} disabled={loading||busy} onClick={()=>document.getElementById('avatar-email')?.focus()}><LogIn size={18} aria-hidden="true"/><span>{cs?'Přihlásit':'Sign in'}</span></button>}
  </PavolChromeSlot>
  {state.principal&&<PavolChromeSlot slot="menu">
   <div className="avatar-menu-account"><span>{state.principal.email}</span><span className="avatar-plan-badge">{plan==='full'?'Full':plan==='light'?'Light':'Free'}</span></div>
   <nav className="avatar-menu-nav" aria-label="Pavol Hejný AI">
    <button type="button" aria-current={tab==='chat'?'page':undefined} onClick={()=>{setTab('chat');setCheckout(false);}}>{cs?'Rozhovor':'Chat'}</button>
    <button type="button" aria-current={tab==='history'?'page':undefined} onClick={()=>{setTab('history');void refresh();}}>{cs?'Historie':'History'}</button>
    <button type="button" aria-current={tab==='plans'?'page':undefined} onClick={()=>setTab('plans')}>{cs?'Předplatné':'Subscription'}</button>
    <button type="button" aria-current={tab==='connections'?'page':undefined} onClick={()=>void loadConnections()}>{cs?'Připojení':'Connections'}</button>
   </nav>
  </PavolChromeSlot>}
  {loading&&<p className="avatar-small" role="status">{cs?'Načítám přístup…':'Loading access…'}</p>}
  {error&&<p className="avatar-error" role="alert">{error}</p>}{notice&&<p className="avatar-notice" role="status">{notice}</p>}
  {tab==='history'&&state.principal&&<section className="avatar-history" aria-label={cs?'Tvoje konverzace':'Your conversations'}>
   <div className="avatar-section-heading"><h2>{cs?'Tvoje konverzace':'Your conversations'}</h2><button onClick={()=>void refresh()}>{cs?'Obnovit':'Refresh'}</button></div>
   {history.length===0?<p>{cs?'Zatím tu žádný chat není.':'No conversations yet.'}</p>:<ul>{history.map(item=><li key={item.id}><button disabled={busy} onClick={()=>void selectConversation(item.id)}>{item.title||'Chat'}<small>{item.channel} · {new Date(item.updated_at).toLocaleDateString(cs?'cs-CZ':'en-GB')}</small></button><button disabled={busy} onClick={()=>void deleteConversation(item.id)} aria-label={(cs?'Smazat chat ':'Delete chat ')+item.title}>×</button></li>)}</ul>}
  </section>}
  {!state.principal&&!loading&&<form className="avatar-login avatar-form" onSubmit={event=>void authenticate(event)}>
   <div><h2>{cs?'Vstoupit bez hesla':'Continue without a password'}</h2><p>{cs?'Stejný e-mail propojí tvůj přístup, předplatné a komunitní benefit.':'One verified email connects your access, subscription and membership benefit.'}</p></div>
   <label htmlFor="avatar-email">E-mail<input id="avatar-email" type="email" required autoComplete="email" maxLength={254} value={email} disabled={busy||!!sent} onChange={event=>setEmail(event.target.value)}/></label>
   {sent==='otp'&&<label>{cs?'Kód z e-mailu':'Email code'}<input inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={12} value={code} disabled={busy} onChange={event=>setCode(event.target.value)}/></label>}
   {sent==='magic-link'?<p role="status">{cs?'Otevři přihlašovací odkaz, který jsme poslali e-mailem.':'Open the sign-in link sent to your email.'}</p>:<button className="avatar-button" disabled={busy||!state.availability.authEnabled} type="submit">{busy?(cs?'Chvilku…':'Please wait…'):sent?(cs?'Ověřit kód':'Verify code'):state.availability.authMethod==='magic-link'?(cs?'Poslat přihlašovací odkaz':'Send sign-in link'):(cs?'Poslat přihlašovací kód':'Send sign-in code')}</button>}
   {sent&&<button type="button" disabled={busy} onClick={()=>{setSent(null);setCode('');}}>{cs?'Použít jiný e-mail nebo poslat znovu':'Change email or send again'}</button>}
   <p className="avatar-small">{cs?'Odesláním žádáš o přístup ke službě. Nejde o přihlášení k marketingu.':'You are requesting service access, not subscribing to marketing.'} <a href={AVATAR_PUBLIC_PRIVACY_PATH}>{cs?'Soukromí':'Privacy'}</a></p>
  </form>}
  {!loading&&(!state.principal||tab==='plans')&&(checkout&&state.principal&&plan!=='full'&&state.availability.billingEnabled?<AvatarCheckout cs={cs} limit={limits.full} slovakiaEnabled={state.availability.slovakiaEnabled} onCancel={()=>setCheckout(false)}/>:<section className="avatar-offer">
   {plans}
   <p className="avatar-small">{cs?'Full je licence pro jednoho člověka. Firma může být plátcem. Spotřeba je společná pro všechna připojení; další poplatky automaticky neúčtujeme. Hlasový rozhovor připravujeme.':'Full is licensed to one person; a business may pay. All connections share one allowance. No automatic overage charges. Voice conversations are planned.'}</p>
   {!state.availability.billingEnabled&&<p className="avatar-notice">{cs?'Placené objednávky zatím nejsou otevřené.':'Paid checkout is not open yet.'}</p>}
   {state.access?.subscription&&<div className="avatar-subscription"><p>{state.access.subscription.cancelAtPeriodEnd?(cs?'Obnovování je zrušené. Přístup trvá do konce uhrazeného období.':'Renewal is cancelled. Access continues through the paid period.'):(cs?'Předplatné se měsíčně obnovuje.':'Your subscription renews monthly.')}</p><a href={'/api/pavol-avatar/confirmation?id='+encodeURIComponent(state.access.subscription.id)} className="avatar-text-link">{cs?'Stáhnout potvrzení a přijaté podmínky':'Download confirmation and accepted terms'}</a><br/><button disabled={busy} onClick={()=>void managePayment()}>{cs?'Spravovat platbu a zrušení':'Manage payment and cancellation'}</button></div>}
  </section>)}
  {state.principal&&<div className="avatar-chat-holder" hidden={tab!=='chat'}>
   <FloatingAgentChat key={source+':'+mount} variant="page" pageLayout="plain" showComposerHelp={false} showIntroduction={false} enableVoice={false} sourceKey={source} endpoint="/api/pavol-avatar/chat" attachmentEndpoint="/api/pavol-avatar/attachments"
    introduction={embed.introduction[language]} language={language} title="Pavol Hejný AI" launcherLabel={embed.launcher[language]}
    conversationTitle="Pavol Hejný AI" suggestionsLabel={cs?'S čím ti můžu pomoct?':'How can I help?'}
    renderPageTools={tools=><PavolChromeSlot slot="chatTools">{tools}</PavolChromeSlot>}
    onNewChat={()=>{setTab('chat');setCheckout(false);}}
    brandLabel="Pavol Hejný AI" icon={<Image src="/people/pavol-hejny-transparent-square.png" width={36} height={36} alt=""/>}
    suggestions={cs?['Kde má pro moji firmu smysl začít s AI agenty?','Pomoz mi připravit zadání pro AI vývojáře.','Zkontroluj můj návrh a najdi slabá místa.']:['Where should my company start with AI agents?','Help me write a specification for an AI developer.','Review my plan and find the weak spots.']}
    onResponse={()=>void refresh()}/>
  </div>}
  {state.principal&&tab==='connections'&&<section className="avatar-connections">
   <h2>{cs?'Pavolův avatar ve tvém asistentovi':'Pavol’s avatar in your assistant'}</h2>
   <p>{cs?'Připojení volají živého avatara na serveru. Aktualizace jeho podkladů se projeví při další konzultaci.':'Connections consult the live server avatar. Updated reference materials apply to the next consultation.'}</p>
   {plan!=='full'?<p className="avatar-notice">{cs?'MCP a Telegram jsou součástí Full.':'MCP and Telegram are included in Full.'}</p>:<>
    <form className="avatar-form avatar-token-form" onSubmit={event=>void createToken(event)}><label>{cs?'Název připojení':'Connection name'}<input required maxLength={80} value={label} onChange={event=>setLabel(event.target.value)} placeholder="Codex · notebook" disabled={busy}/></label><button className="avatar-button" disabled={busy}>{cs?'Vytvořit přístupový token':'Create access token'}</button></form>
    {newToken&&<div className="avatar-secret"><p>{cs?'Token se zobrazí jen teď. Ulož ho do proměnné prostředí PAVOL_AVATAR_TOKEN ve svém asistentovi.':'This token is shown only once. Save it as PAVOL_AVATAR_TOKEN in your assistant’s environment.'}</p><code>{newToken}</code><button onClick={()=>setNewToken('')}>{cs?'Skrýt token':'Hide token'}</button></div>}
    {connections?.tokens.length?<ul className="avatar-token-list">{connections.tokens.map(token=><li key={token.id}><span>{token.label}</span><button disabled={busy} onClick={()=>void revokeToken(token.id)}>{cs?'Odpojit':'Revoke'}</button></li>)}</ul>:null}
    {connections&&<div className="avatar-setup">{(['codex','claude','opencode']as const).map(client=><details key={client}><summary>{client==='claude'?'Claude Code':client==='codex'?'Codex':'OpenCode'}</summary><pre><code>{connections.setup[client]}</code></pre></details>)}</div>}
    <p><a className="avatar-text-link" href="/api/pavol-avatar/skill" download="SKILL.md">{cs?'Stáhnout SKILL.md':'Download SKILL.md'}</a> · {cs?'Soubor obsahuje návod pro asistenta; oprávnění ověřuje živá služba.':'The file guides your assistant; the live service checks access.'}</p>
    <div className="avatar-telegram"><h3>Telegram</h3>{connections?.telegram.available?<><button disabled={busy} onClick={()=>void linkTelegram()}>{cs?'Propojit můj Telegram':'Connect my Telegram'}</button><button disabled={busy} onClick={()=>void unlinkTelegram()}>{cs?'Odpojit Telegram':'Disconnect Telegram'}</button>{telegramUrl&&<a className="avatar-button" href={telegramUrl} target="_blank" rel="noopener noreferrer">{cs?'Otevřít bota a potvrdit propojení':'Open bot and confirm connection'}</a>}</>:<p>{cs?'Připojení Telegramu zatím není otevřené.':'Telegram connection is not open yet.'}</p>}</div>
   </>}
  </section>}
 </div>;
}
