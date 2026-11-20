'use client';
import Image from 'next/image';
import { useCallback,useEffect,useRef,useState,type FormEvent } from 'react';
import { FloatingAgentChat } from '@/components/agents/FloatingAgentChat';
import { SITE_AGENT_EMBEDS } from '@/lib/site-agents/registry';
import { messageChatStorageKey,readMessageChatSession } from '@/lib/messages/messageChatSession';
import type { MessageChatSession } from '@/lib/messages/messageChatSession';
import { AVATAR_PUBLIC_PRIVACY_PATH,type AvatarAvailability,type AvatarAccountState,type AvatarHistoryItem } from '@/lib/pavol-avatar/presentation';
import { EmailSignInDialog } from '@/components/auth/EmailSignInDialog';
import { AvatarPlans } from './AvatarPlans';
import { PAVOL_SITE_STYLE } from './layout';
import { AvatarCheckout } from './AvatarCheckout';
import { LogIn, LogOut } from 'lucide-react';
import { PavolChromeSlot } from './PavolPageChrome';
import { DISCOUNT_CODE_QUERY_PARAMETER } from '@/lib/discounts/discountCodeConstants';

type SignInIntent = 'chat' | 'full';

function requestsFull(url: URL) {
    return url.searchParams.get('plan') === 'full' || url.searchParams.has(DISCOUNT_CODE_QUERY_PARAMETER);
}

/** The callback can run in a different browser, so the email itself carries the selected destination. */
function avatarReturnUrl(intent: SignInIntent) {
    const url = new URL(window.location.href);
    if (intent === 'full') {
        if (!requestsFull(url)) url.searchParams.set('plan', 'full');
    } else {
        if (url.searchParams.get('plan') === 'full') url.searchParams.delete('plan');
        url.searchParams.delete(DISCOUNT_CODE_QUERY_PARAMETER);
    }
    return url;
}

async function jsonRequest<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch(path,{method,headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const data:unknown=await response.json().catch(()=>null);if(!response.ok){const message=data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'Služba teď není dostupná.';throw new Error(message);}return data as T;
}
type Connections={tokens:{id:string;label:string;createdAt:string}[];setup:{codex:string;claude:string;opencode:string};telegram:{available:boolean;botUsername?:string}};
export function PavolAvatarAccount({language,availability}:{language:'cs'|'en';availability:AvatarAvailability}) {
 const cs=language==='cs',embed=SITE_AGENT_EMBEDS['pavol-avatar'];
 const[state,setState]=useState<AvatarAccountState>({principal:null,access:null,availability}),[loading,setLoading]=useState(true);
 const[tab,setTab]=useState<'chat'|'plans'|'connections'|'history'>('chat');
 const [signInIntent, setSignInIntent] = useState<SignInIntent | null>(null);
 const signInTrigger = useRef<HTMLButtonElement | null>(null);
 const initialized = useRef(false);
 const[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[checkout,setCheckout]=useState(false);
 const[history,setHistory]=useState<AvatarHistoryItem[]>([]),[mount,setMount]=useState(0),[connections,setConnections]=useState<Connections|null>(null);
 const[label,setLabel]=useState(''),[newToken,setNewToken]=useState(''),[telegramUrl,setTelegramUrl]=useState('');
 const source=state.principal?'avatar-account-'+state.principal.id+'-'+language:'avatar-account-guest';
 const refresh=useCallback(async()=>{
  try{const next=await jsonRequest<AvatarAccountState>('/api/pavol-avatar/access');setState(next);
   if(next.principal){const data=await jsonRequest<{conversations:AvatarHistoryItem[]}>('/api/pavol-avatar/conversations');setHistory(data.conversations);}
  }catch(failure){setError(failure instanceof Error?failure.message:'Služba teď není dostupná.');}finally{setLoading(false);}
 },[]);
 useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const url = new URL(window.location.href);
    if (requestsFull(url)) {
        setCheckout(true);
        setTab('plans');
        setSignInIntent('full');
    }
    const hash = new URLSearchParams(url.hash.slice(1));
    const tokenHash = hash.get('login_token');
    if (!tokenHash) { void refresh(); return; }

    // Earlier avatar emails used a token on the avatar page itself.
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
    setBusy(true);
    void jsonRequest('/api/pavol-avatar/auth', 'POST', { tokenHash, email: hash.get('login_email') ?? undefined })
        .then(() => setNotice(cs ? 'Přihlášení je ověřené.' : 'You are signed in.'))
        .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : 'Přihlášení se nepodařilo.'))
        .finally(async () => { await refresh(); setBusy(false); });
 }, [cs, refresh]);

 function openDestination(intent: SignInIntent) {
    const url = avatarReturnUrl(intent);
    if (url.href !== window.location.href) {
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    setCheckout(intent === 'full');
    setTab(intent === 'full' ? 'plans' : 'chat');
 }

 function selectPlan(intent: SignInIntent, trigger: HTMLButtonElement) {
    if (state.principal) {
        openDestination(intent);
    } else {
        signInTrigger.current = trigger;
        setSignInIntent(intent);
    }
 }

 function sendSignIn(email: string) {
    const url = avatarReturnUrl(signInIntent ?? 'chat');
    const discountCode = url.searchParams.get(DISCOUNT_CODE_QUERY_PARAMETER);
    return jsonRequest('/api/pavol-avatar/auth', 'POST', {
        email, returnTo: url.pathname + url.search + url.hash, ...(discountCode ? { discountCode } : {}),
    });
 }

 function leaveCheckout() {
    setCheckout(false);
    const url = new URL(window.location.href);
    if (url.searchParams.get('plan') === 'full') {
        url.searchParams.delete('plan');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
 }
 async function logout(){setBusy(true);setError('');try{await jsonRequest('/api/pavol-avatar/auth','DELETE');setNewToken('');setConnections(null);setTelegramUrl('');setHistory([]);setSignInIntent(null);leaveCheckout();setTab('plans');await refresh();}catch(failure){setError((failure as Error).message);}finally{setBusy(false);}}
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
 return <div className="avatar-account" data-view={state.principal?tab:'guest'}>
  <PavolChromeSlot slot="headerActions">
   {state.principal?<button className="pavol-app-auth" type="button" aria-label={cs?'Odhlásit':'Sign out'} title={cs?'Odhlásit':'Sign out'} disabled={busy} onClick={()=>void logout()}><LogOut size={18} aria-hidden="true"/><span>{cs?'Odhlásit':'Sign out'}</span></button>
    :<button className="pavol-app-auth" type="button" aria-label={cs?'Přihlásit':'Sign in'} title={cs?'Přihlásit':'Sign in'} aria-haspopup="dialog" disabled={loading||busy||!state.availability.authEnabled} onClick={event=>selectPlan('chat', event.currentTarget)}><LogIn size={18} aria-hidden="true"/><span>{cs?'Přihlásit':'Sign in'}</span></button>}
  </PavolChromeSlot>
  {state.principal&&<PavolChromeSlot slot="menu">
   <div className="avatar-menu-account"><span>{state.principal.email}</span><span className="avatar-plan-badge">{plan==='full'?'Full':plan==='light'?'Light':'Free'}</span></div>
   <nav className="avatar-menu-nav" aria-label="Pavol Hejný AI">
    <button type="button" aria-current={tab==='chat'?'page':undefined} onClick={() => openDestination('chat')}>{cs?'Rozhovor':'Chat'}</button>
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
  {!state.principal && !loading && signInIntent && state.availability.authEnabled && (signInIntent !== 'full' || state.availability.billingEnabled) && (
    <EmailSignInDialog
        language={language} style={PAVOL_SITE_STYLE} returnFocus={signInTrigger}
        title={cs ? 'Přihlášení k avatarovi' : 'Sign in to the avatar'}
        description={signInIntent === 'full'
            ? (cs ? 'Po ověření e-mailu se otevře objednávka tarifu Full.' : 'Verify your email to continue to Full checkout.')
            : (cs ? 'Po ověření e-mailu se otevře tvůj chat s avatarem.' : 'Verify your email to open your avatar chat.')}
        onSend={sendSignIn}
        onVerify={(email, code) => jsonRequest('/api/pavol-avatar/auth', 'POST', { email, code })}
        onVerified={async () => {
            openDestination(signInIntent);
            setSignInIntent(null);
            await refresh();
        }}
        onDismiss={() => setSignInIntent(null)}
        footer={<>{cs ? 'Pokud máš členství v komunitě Vývojáři, použij členský e-mail.' : 'If you belong to the Developers community, use your membership email.'} <a href={AVATAR_PUBLIC_PRIVACY_PATH}>{cs ? 'Soukromí' : 'Privacy'}</a></>}
    />
  )}
  {!loading&&(!state.principal||tab==='plans')&&(checkout&&state.principal&&plan!=='full'&&state.availability.billingEnabled?<AvatarCheckout cs={cs} limit={limits.full} slovakiaEnabled={state.availability.slovakiaEnabled} onCancel={leaveCheckout}/>:<section className="avatar-offer" aria-label={cs ? 'Tarify avatara' : 'Avatar plans'}>
   <AvatarPlans language={language} availability={state.availability} currentPlan={state.principal ? plan : undefined} busy={busy}
       onFree={trigger => selectPlan('chat', trigger)} onFull={trigger => selectPlan('full', trigger)} />
   {!state.availability.billingEnabled&&<p className="avatar-notice">{cs?'Placené objednávky zatím nejsou otevřené.':'Paid checkout is not open yet.'}</p>}
   {state.access?.subscription&&<div className="avatar-subscription"><p>{state.access.subscription.cancelAtPeriodEnd?(cs?'Obnovování je zrušené. Přístup trvá do konce uhrazeného období.':'Renewal is cancelled. Access continues through the paid period.'):(cs?'Předplatné se měsíčně obnovuje.':'Your subscription renews monthly.')}</p><a href={'/api/pavol-avatar/confirmation?id='+encodeURIComponent(state.access.subscription.id)} className="avatar-text-link">{cs?'Stáhnout potvrzení a přijaté podmínky':'Download confirmation and accepted terms'}</a><br/><button disabled={busy} onClick={()=>void managePayment()}>{cs?'Spravovat platbu a zrušení':'Manage payment and cancellation'}</button></div>}
  </section>)}
  {state.principal&&<div className="avatar-chat-holder" hidden={tab!=='chat'}>
   <FloatingAgentChat key={source+':'+mount} variant="page" pageLayout="plain" showComposerHelp={false} showIntroduction={false} enableVoice={false} sourceKey={source} endpoint="/api/pavol-avatar/chat" attachmentEndpoint="/api/pavol-avatar/attachments"
    introduction={embed.introduction[language]} language={language} title="Pavol Hejný AI" launcherLabel={embed.launcher[language]}
    conversationTitle="Pavol Hejný AI" suggestionsLabel={cs?'S čím ti můžu pomoct?':'How can I help?'}
    renderPageTools={tools=><PavolChromeSlot slot="chatTools">{tools}</PavolChromeSlot>}
    onNewChat={() => openDestination('chat')}
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
