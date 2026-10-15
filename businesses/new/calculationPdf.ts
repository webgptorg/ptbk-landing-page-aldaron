import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { calculateEconomics, SCENARIOS } from './economics';
import { COMMERCIAL_TERMS } from './commercialTerms';
import { calculationShareUrl, NUMERIC_KEYS, type CalculatorState } from './calculatorState';
import { FIELD_LABELS } from './calculatorFields';
import { loadWorkshopPdfAssets } from '@/lib/workshops/workshopPdfAssets';
import { WORKSHOP_PDF_FONT_FILES } from '@/lib/workshops/workshopPdfBrand';

const money = (n: number) => new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(n) + ' Kč';
const table = (rows: [string, string][]): Content => ({
    table: { widths: ['*', 165], dontBreakRows: true, body: rows.map(([name,value],i) => [
        { text:name, fillColor:i % 2 ? '#ffffff':'#f1f6f2', margin:[7,6,7,6] },
        { text:value, fillColor:i % 2 ? '#ffffff':'#f1f6f2', margin:[7,6,7,6], alignment:'right' },
    ]) }, layout:'noBorders', margin:[0,10,0,18],
});
const heading = (text: string): Content => ({ text, font:'Outfit', fontSize:20, margin:[0,12,0,13], headlineLevel:1 });

/** A real, self-contained A4 report. Snapshot includes inactive inputs; calculated values use normalized periods. */
export function createCalculationPdfDefinition(state: CalculatorState): TDocumentDefinitions {
    const r = calculateEconomics(state.input);
    const p = r.partner;
    const company = state.mode === 'company';
    const period = r.isPilot ? '30 dní pilotu Start' : `${r.input.horizonMonths} měsíců Business`;
    const amount = company ? r.horizonBenefit : p.horizonContribution;
    const title = company ? 'Ekonomika vaší agendy' : 'Ekonomika partnerské služby';
    const inputRows: [string,string][] = NUMERIC_KEYS.map(key => [
        key === 'volume' ? SCENARIOS[state.scenario].volumeLabel : key === 'unitsPerItem' ? SCENARIOS[state.scenario].unitsLabel : FIELD_LABELS[key], String(state.input[key]),
    ]);
    return {
        pageSize:'A4',pageMargins:[44,65,44,48],
        defaultStyle:{font:'Inter',fontSize:9,color:'#203d34',lineHeight:1.25},
        info:{title:`Promptbook — ${title}`,author:'Promptbook / AI Web s.r.o.',subject:SCENARIOS[state.scenario].title},
        header:{columns:[{image:'promptbook-logo',width:24},{text:'promptbook.',font:'Outfit',fontSize:17,margin:[9,1,0,0]}],margin:[44,25,44,0]},
        footer:(page,count) => ({columns:[{text:'Orientační kalkulace · AI Web s.r.o. · IČO 21012288',width:'*'},{text:`${page} / ${count}`,alignment:'right',width:50}],margin:[44,15,44,0],fontSize:8,color:'#627b6c'}),
        pageBreakBefore:(node,queries) => !!node.headlineLevel && queries.getFollowingNodesOnPage().length === 0,
        content:[
            {text:title,font:'Outfit',fontSize:30,margin:[0,10,0,12]},
            {text:`${SCENARIOS[state.scenario].title} · ${period}`,fontSize:12,margin:[0,0,0,20]},
            {text:amount < 0 ? 'Náklady převýší přínos o' : company ? 'Můžete ušetřit v hodnotě práce' : 'Může vám zbýt po zadaných nákladech',fontSize:14},
            {text:money(Math.abs(amount)),font:'Outfit',fontSize:38,color:amount < 0 ? '#913441':'#1c6d49',margin:[0,8,0,10]},
            {text:amount < 0 ? 'Při těchto předpokladech nasazení ekonomicky nevychází.' : 'Odhad za celé zvolené období včetně jednorázového nasazení.',margin:[0,0,0,15]},
            {text:company ? 'Uvolněná kapacita není automaticky hotovostní úspora mezd. Výsledek porovnává hodnotu ruční práce s provozem, zbývající lidskou prací a nasazením.' : 'Výsledek je před daní z příjmů. Počítá stálý počet aktivních klientů od začátku, bez růstu a odchodů. Tržby nejsou zisk.',margin:[0,0,0,15]},
            table(company ? [
                ['Ruční práce za jedno období',money(r.baselineCost)], ['Provoz bez lidské práce za období',money(r.operatingCost)],
                ['Zbývající lidská práce za období',money(r.remainingWorkCost)], ['Čistý přínos za období',money(r.netBenefit)],
                ['Jednorázové nasazení',money(r.input.setupFeeCzk)], ['Celkové ekonomické náklady za horizont',money(r.horizonCost)],
                ['Uvolněná kapacita za období',`${r.savedHours.toFixed(1)} h`],
            ] : [
                ['Tržby za období bez nasazení',money(p.periodRevenue)], ['Z toho podíl z licencí',money(p.licenceShare)],
                ['Náklady obsluhy a režie za období',money(p.deliveryCost)], ['Tržby z jednorázového nasazení',money(p.setupRevenue)],
                ['Náklady nasazení a akvizice',money(p.setupCost)], ['Celkové tržby za horizont',money(p.horizonRevenue)],
                ['Celkové náklady za horizont',money(p.horizonPartnerCost)], ['Opakované měsíční tržby (MRR)',money(p.recurringRevenue)],
            ]),
            {text:'Otevřít a upravit tuto kalkulaci',link:calculationShareUrl(state),color:'#186a4c',decoration:'underline',fontSize:11,margin:[0,10,0,8]},
            {text:'Odkaz obsahuje všechny parametry výpočtu, nikoli e-mail nebo jméno. Každý, komu jej předáte, uvidí vaše předpoklady.',fontSize:8,color:'#627b6c'},
            {text:'Náklady jedné klientské agendy',font:'Outfit',fontSize:23,pageBreak:'before',margin:[0,0,0,15]},
            {text:`Všechny následující náklady jsou za ${r.isPilot ? 'jeden 30denní pilot' : 'jeden měsíc'} a celého klienta. Nasazení je jednorázové.`,margin:[0,0,0,10]},
            table([
                ['Licence Promptbooku',money(r.licence)],['AI / předplatné',money(r.ai)],['Externí služby podle objemu',money(r.external)],['Rezerva',money(r.reserve)],
                ['Server',money(r.input.hostingCzk)],['Databáze',money(r.input.databaseCzk)],['Zálohy a úložiště',money(r.input.backupCzk)],
                ['Elektřina',money(r.input.energyCzk)],['Rozpočítaný hardware',money(r.input.hardwareCzk)],['Ostatní nástroje',money(r.input.toolsCzk)],
                ['Servis partnera',money(r.input.serviceFeeCzk)],['Provoz placený klientem',money(r.operatingCost)],
                ['Zbývající lidská práce',money(r.remainingWorkCost)],['Celkem včetně lidské práce',money(r.economicCost)],
            ]),
            {text:r.input.costPayer === 'partner' ? 'AI a infrastrukturu hradí partner v uvedené ceně servisu. Dílčí náklady se klientovi nepřičítají podruhé. Partner je má odečtené od vlastního výsledku.' : 'AI a infrastrukturu platí klient samostatně. Tyto platby nejsou tržbami partnera.'},
            heading('Obchodní předpoklady'),
            {text:`Model ${COMMERCIAL_TERMS.version}. Start: 19 USD jednorázově na 30 dní, bez automatického pokračování. Business: 100 USD měsíčně za klientské prostředí. AI, infrastruktura a služby partnera se hradí odděleně.`,margin:[0,0,0,10]},
            {text:`${COMMERCIAL_TERMS.share} ${COMMERCIAL_TERMS.shareTerm}`},
            {text:'Všechny předpoklady výpočtu',font:'Outfit',fontSize:23,pageBreak:'before',margin:[0,0,0,15]},
            {text:'Částky jsou bez DPH. Kurz, pracovní náklady, spotřeba a sazby poskytovatelů jsou modelové odhady, nikoli ověřené cenové nabídky. Upravte je podle vlastního provozu.',margin:[0,0,0,10]},
            table([
                ['Scénář',SCENARIOS[state.scenario].title],['Režim',company?'Vlastní agenda':'Partnerství'],['Plán',r.isPilot?'Start':'Business'],
                ['Placení AI',state.input.aiBilling === 'tokens'?'Tokeny':state.input.aiBilling === 'subscription'?'Předplatné':'Lokální model'],
                ['Plátce AI a provozu',state.input.costPayer === 'client'?'Klient samostatně':'Partner v ceně servisu'],['Pevný partnerský podíl','20 %'], ...inputRows,
            ]),
            {text:'Vstupy měsíčních nákladů představují u Startu 30 dní. Start vždy počítá jednu instanci a jeden pilot, i když odkaz uchovává dřívější nastavení Business. Nepoužité tokenové / předplatné vstupy zůstávají uložené, ale nezapočítávají se. Zaokrouhlení je jen pro zobrazení.',fontSize:8},
            {text:'Výpočet nezakládá objednávku ani záruku úspory či výdělku. Nezahrnuje nezadané náklady, financování ani daň z příjmů.',margin:[0,12,0,0],fontSize:8},
        ],
    };
}

export async function downloadCalculationPdf(state: CalculatorState): Promise<void> {
    const [module,assets] = await Promise.all([import('pdfmake/build/pdfmake'),loadWorkshopPdfAssets()]);
    const pdfMake = module.default;
    pdfMake.addVirtualFileSystem(assets.fonts); pdfMake.addFonts(WORKSHOP_PDF_FONT_FILES);
    const blob = await pdfMake.createPdf({ ...createCalculationPdfDefinition(state),images:{'promptbook-logo':assets.logo} }).getBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href=url; link.download=`promptbook-${state.mode}-${state.scenario}.pdf`;
    document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url),30000);
}
