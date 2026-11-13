// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SiteLocaleProvider } from './LocaleProvider';
import { LeadCaptureProvider } from './LeadCapture';
import { BrandActions } from './BrandActions';
import { NewSiteShell } from './NewSiteShell';
const nav=vi.hoisted(()=>({pathname:'/cs'}));
vi.mock('next/navigation',()=>({usePathname:()=>nav.pathname,useSearchParams:()=>new URLSearchParams()}));
vi.mock('next/image',()=>({default:({priority:_p,...props}:Record<string,unknown>)=><img {...props}/>}));
vi.mock('./typography',()=>({promptbookHeading:{variable:'heading'},promptbookBody:{variable:'body'}}));
vi.mock('./TechnologyIncubation',()=>({TechnologyIncubation:()=>null}));
function markup(node:React.ReactNode){const root=document.createElement('div');root.innerHTML=renderToStaticMarkup(node);return root;}
describe('approved Czech trial and English contact boundaries',()=>{
 it.each([false,true])('offers no-card Business before direct purchase, independent of paid-checkout flag %s',enabled=>{
  const root=markup(<SiteLocaleProvider locale="cs"><LeadCaptureProvider><BrandActions checkoutEnabled={enabled}/></LeadCaptureProvider></SiteLocaleProvider>);
  expect(root.querySelector('a[href="/cs/pricing/zkouska"]')?.textContent).toBe('Vyzkoušet Business zdarma');
  expect(root.querySelector('a[href="/cs/pricing/objednat/business"]')?.textContent).toBe('Koupit Business rovnou');
  expect(root.querySelector('a[href="/cs/open-source"]')).not.toBeNull();
 });
 it('keeps English and partner actions in existing contact intake',()=>{
  for(const [locale,partner] of [['en',false],['cs',true],['en',true]] as const){
   const root=markup(<SiteLocaleProvider locale={locale}><LeadCaptureProvider><BrandActions partner={partner} checkoutEnabled/></LeadCaptureProvider></SiteLocaleProvider>);
   expect(root.querySelector('button')).not.toBeNull();expect(root.querySelector('a[href*="/objednat/"]')).toBeNull();expect(root.querySelector('a[href*="/zkouska"]')).toBeNull();
  }
 });
 it('keeps both Czech header actions on trial, and English headers on contacts',()=>{
  for(const locale of ['cs','en'] as const){nav.pathname='/'+locale;const root=markup(<NewSiteShell checkoutEnabled><div/></NewSiteShell>);const header=root.querySelector('header')!;
   expect(header.querySelectorAll('a[href="/cs/pricing/zkouska"]')).toHaveLength(locale==='cs'?2:0);
   if(locale==='en')expect(Array.from(header.querySelectorAll('button')).filter(b=>b.textContent==='I’m interested')).toHaveLength(2);
  }
 });
});
