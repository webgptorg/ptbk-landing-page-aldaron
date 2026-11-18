'use client';
import { calculateDiscountedAmount, createExpectedDiscount } from '@/lib/discounts/discountPricing';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CompanyNameInput } from '@/businesses/new/CompanyNameInput';
import { DiscountCodeField } from '@/components/discounts/DiscountCodeField';
import { formatSubscriptionDiscountDurationMonthCount, isSubscriptionDiscountFullAndPermanent, normalizeDiscountCode } from '@/lib/discounts/discountCode';
import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { PAVOL_AVATAR_FULL_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { isDiscountCodeReadyForSubmission, useDiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { STRIPE_CZK_MINIMUM_CHARGE_AMOUNT } from '@/lib/payments/stripeAmount';
import { AVATAR_PUBLIC_PRICE_CZK,AVATAR_PUBLIC_TERMS_PATH,AVATAR_PUBLIC_PRIVACY_PATH,AVATAR_PUBLIC_TERMS_VERSION } from '@/lib/pavol-avatar/presentation';
import type { PromptbookBillingIdentity } from '@/lib/promptbook-billing/billingIdentity';

const INITIAL_DISCOUNTS = {};

export function AvatarCheckout({cs,limit,onCancel,slovakiaEnabled=false}:{cs:boolean;limit:number;onCancel:()=>void;slovakiaEnabled?:boolean}) {
 const[country,setCountry]=useState<'CZ'|'SK'>('CZ'),[business,setBusiness]=useState(false);
 const[fullname,setFullname]=useState(''),[name,setName]=useState(''),[companyId,setCompanyId]=useState(''),[vatId,setVatId]=useState('');
 const[address,setAddress]=useState({line1:'',city:'',postal_code:''}),[terms,setTerms]=useState(false),[immediate,setImmediate]=useState(false);
 const[busy,setBusy]=useState(false),[error,setError]=useState('');
 const[initialDiscountCode,setInitialDiscountCode]=useState('');
 const[initialDiscounts,setInitialDiscounts]=useState(INITIAL_DISCOUNTS);
 useEffect(()=>{setInitialDiscountCode(new URLSearchParams(window.location.search).get(DISCOUNT_CODE_QUERY_PARAMETER)??'');},[]);
 const discount=useDiscountCodeValidation({initialDiscountCode,initialActiveDiscountByPlaceId:initialDiscounts,discountPlaceId:PAVOL_AVATAR_FULL_DISCOUNT_PLACE_ID,baseAmount:AVATAR_PUBLIC_PRICE_CZK*100});
 const activeDiscount=discount.activeDiscount;
 const discountReady=isDiscountCodeReadyForSubmission(discount);
 const amount=calculateDiscountedAmount(AVATAR_PUBLIC_PRICE_CZK*100,activeDiscount);
 const belowMinimum=amount>0&&amount<STRIPE_CZK_MINIMUM_CHARGE_AMOUNT;
 const duration=activeDiscount?.subscriptionDiscountDurationMonths??null;
 const free=isSubscriptionDiscountFullAndPermanent(activeDiscount,AVATAR_PUBLIC_PRICE_CZK*100);
 const attempt=useRef<{fingerprint:string;id:string}|null>(null);
 function choose(company:PromptbookBillingIdentity){setName(company.name);setCompanyId(company.companyId);setVatId(company.vatId??'');setAddress(company.address);}
 async function submit(event:FormEvent){event.preventDefault();if(busy||!discountReady||belowMinimum)return;setBusy(true);setError('');
  try{const payload={
   fullname,country,customerType:business?'business':'individual',companyId:business?companyId:undefined,vatId:business?vatId:undefined,billingName:name,
   billingAddress:{...address,country},termsAccepted:terms,immediateStartAccepted:immediate,termsVersion:AVATAR_PUBLIC_TERMS_VERSION,
   discountCode:normalizeDiscountCode(discount.discountCode),expectedDiscount:createExpectedDiscount(activeDiscount,AVATAR_PUBLIC_PRICE_CZK*100),
  };const fingerprint=JSON.stringify(payload);if(attempt.current?.fingerprint!==fingerprint)attempt.current={fingerprint,id:crypto.randomUUID()};
  const response=await fetch('/api/pavol-avatar/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId:attempt.current.id})});const data=await response.json() as {url?:unknown;error?:string;code?:string};
  if(!response.ok||typeof data.url!=='string'){
   if(data.code==='discount_changed'||data.code==='checkout_expired'||data.code==='checkout_rejected'){attempt.current=null;setInitialDiscounts({});}
   throw new Error(data.error??(cs?'Objednávku se nepodařilo vytvořit.':'Could not create checkout.'));
  }
  const target=new URL(data.url);if(target.hostname!=='checkout.stripe.com')throw new Error('Invalid checkout');window.location.assign(target.href);
  }catch(failure){setError(failure instanceof Error?failure.message:'Checkout unavailable');setBusy(false);}
 }
 return <form id={REGISTRATION_SECTION_ID} className="avatar-checkout avatar-form" onSubmit={event=>void submit(event)} aria-busy={busy}>
  <div className="avatar-section-heading"><h2>{cs?'Objednat Full':'Subscribe to Full'}</h2><button type="button" disabled={busy} onClick={onCancel}>{cs?'Zpět':'Back'}</button></div>
  <div aria-live="polite">
   <p className="avatar-price">{activeDiscount&&<del className="avatar-original-price">{AVATAR_PUBLIC_PRICE_CZK.toLocaleString(cs?'cs-CZ':'en-GB')} Kč</del>} <strong>{(amount/100).toLocaleString(cs?'cs-CZ':'en-GB')} Kč</strong> / {cs?'měsíc':'month'}</p>
   {activeDiscount&&<p className="avatar-small">{duration===null
    ?(cs?'Sleva platí po celou dobu předplatného.':'The discount applies for the lifetime of this subscription.')
    :(cs?`Sleva na první ${formatSubscriptionDiscountDurationMonthCount(duration)}, poté ${AVATAR_PUBLIC_PRICE_CZK.toLocaleString('cs-CZ')} Kč měsíčně.`:`Discount for the first ${duration} ${duration===1?'month':'months'}, then ${AVATAR_PUBLIC_PRICE_CZK.toLocaleString('en-GB')} Kč per month.`)}</p>}
   {free&&<p className="avatar-small">{cs?'Členství je trvale zdarma. Platební karta není potřeba.':'Free for the lifetime of this subscription. No payment card is required.'}</p>}
  </div>
  <fieldset className="avatar-discount-field" disabled={busy}><legend className="sr-only">{cs?'Sleva':'Discount'}</legend><DiscountCodeField inputId="avatar-discount-code" validation={discount} language={cs?'cs':'en'}/></fieldset>
  {belowMinimum&&<p className="avatar-error" role="alert">{cs?'Cena po slevě je pod minimální částkou 15 Kč pro platbu kartou. Použij jiný kód nebo pole vymaž.':'The discounted price is below the 15 Kč minimum card payment. Use another code or clear the field.'}</p>}
  <p>{cs?'Automaticky obnovované měsíční předplatné.':'Automatically renewing monthly subscription.'} {limit} {cs?'otázek za kalendářní měsíc; web, MCP a Telegram sdílejí jeden limit.':'questions per calendar month; shared across web, MCP and Telegram.'}</p>
  <fieldset disabled={busy}><legend>{cs?'Fakturační údaje':'Billing details'}</legend>
   <label>{cs?'Tvoje jméno':'Your name'}<input name="fullname" autoComplete="name" required maxLength={200} value={fullname} onChange={e=>setFullname(e.target.value)}/></label>
   <label>{cs?'Země':'Country'}<select value={country} onChange={e=>setCountry(e.target.value as 'CZ'|'SK')}><option value="CZ">Česko</option>{slovakiaEnabled&&<option value="SK">Slovensko</option>}</select></label>
   <label className="avatar-check"><input type="checkbox" checked={business} onChange={e=>setBusiness(e.target.checked)}/>{cs?'Nakupuji na firmu':'Purchase for a business'}</label>
   {business?<><CompanyNameInput value={name} disabled={busy} searchEnabled={country==='CZ'} onChange={setName} onSelect={choose}/>
    <div className="avatar-form-row"><label>IČO<input name="companyId" required inputMode="numeric" pattern="[0-9]{8}" value={companyId} onChange={e=>setCompanyId(e.target.value)}/></label>
    <label>{country==='SK'?'IČ DPH':'DIČ'}<input name="vatId" required={country==='SK'} value={vatId} onChange={e=>setVatId(e.target.value)} maxLength={24}/></label></div></>
    :<label>{cs?'Fakturační jméno':'Billing name'}<input name="billingName" required autoComplete="billing name" maxLength={200} value={name} onChange={e=>setName(e.target.value)}/></label>}
   <label>{cs?'Ulice a číslo':'Street and number'}<input required name="line1" autoComplete="billing street-address" maxLength={200} value={address.line1} onChange={e=>setAddress({...address,line1:e.target.value})}/></label>
   <div className="avatar-form-row"><label>{cs?'Město':'City'}<input required autoComplete="billing address-level2" maxLength={120} value={address.city} onChange={e=>setAddress({...address,city:e.target.value})}/></label>
   <label>{cs?'PSČ':'Postal code'}<input required autoComplete="billing postal-code" maxLength={16} value={address.postal_code} onChange={e=>setAddress({...address,postal_code:e.target.value})}/></label></div>
   <label className="avatar-check"><input type="checkbox" required checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>{cs?'Souhlasím s ':'I accept the '}<a href={AVATAR_PUBLIC_TERMS_PATH} target="_blank" rel="noopener noreferrer">{cs?'podmínkami avatara':'avatar terms'}</a>{cs?' a beru na vědomí ':' and acknowledge the '}<a href={AVATAR_PUBLIC_PRIVACY_PATH} target="_blank" rel="noopener noreferrer">{cs?'informace o soukromí':'privacy notice'}</a>.</span></label>
   <label className="avatar-check"><input type="checkbox" required checked={immediate} onChange={e=>setImmediate(e.target.checked)}/><span>{cs?'Žádám o okamžité zpřístupnění služby. Moje zákonné právo odstoupit tím nezaniká.':'I request immediate access. This does not waive my statutory withdrawal rights.'}</span></label>
   <button className="avatar-button" type="submit" disabled={busy||!terms||!immediate||!discountReady||belowMinimum}>{busy?(cs?'Otevírám platbu…':'Opening checkout…'):free?(cs?'Aktivovat Full zdarma':'Activate Full for free'):(cs?'Objednat s povinností platby':'Order with obligation to pay')}</button>
  </fieldset>
  {error&&<p className="avatar-error" role="alert">{error}</p>}
  <p className="avatar-small">{cs?'Prodávající: AI Web s.r.o., IČO 21012288. Neplátce DPH. Konečnou částku potvrdíš před platbou ve Stripe. Předplatné lze zrušit ke konci uhrazeného období.':'Seller: AI Web s.r.o., company no. 21012288. Not a Czech VAT payer. Confirm the final total in Stripe before payment. Cancel renewal at the end of your paid period.'}</p>
 </form>;
}
