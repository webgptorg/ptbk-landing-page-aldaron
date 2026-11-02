/** Explicit editorial asset rendering. Never imported by a build or a request. */
import React from 'react';
import { ImageResponse } from 'next/og';
import { readFileSync, writeFileSync } from 'node:fs';

async function main() {
    const portrait = 'data:image/png;base64,' + readFileSync('public/people/pavol-hejny-transparent.png').toString('base64');
    const bars = [35,75,50,105,150,90,55,120,165,100,45,85];
    const result = new ImageResponse(<div style={{display:'flex',position:'relative',width:'100%',height:'100%',background:'#203932',color:'#faf8f2',overflow:'hidden',fontFamily:'Outfit'}}>
        <div style={{display:'flex',position:'absolute',width:1160,height:1160,borderRadius:'50%',background:'#e4bc70',right:-240,bottom:-250}} />
        <img src={portrait} alt="" style={{position:'absolute',right:-170,bottom:-90,width:1180,height:1240,objectFit:'contain',objectPosition:'bottom'}} />
        <div style={{display:'flex',position:'absolute',left:100,top:100,fontSize:38,letterSpacing:8,color:'#e4bc70'}}>PODCAST</div>
        <div style={{display:'flex',flexDirection:'column',position:'absolute',left:90,top:205,fontSize:250,fontWeight:700,lineHeight:.98,letterSpacing:-12}}><span>Pavol</span><span>Hejný</span></div>
        <div style={{display:'flex',position:'absolute',left:100,bottom:150,alignItems:'center',height:170,gap:15}}>{bars.map((height,index)=><div key={index} style={{width:12,height,borderRadius:8,background:'#e4bc70'}} />)}</div>
    </div>, {width:1600,height:1600,fonts:[{name:'Outfit',data:readFileSync('public/fonts/workshop/Outfit-Bold.ttf'),weight:700,style:'normal'}]});
    writeFileSync('articles/_podcasts/pavol-hejny-v2.png',Buffer.from(await result.arrayBuffer()));
}
void main();
