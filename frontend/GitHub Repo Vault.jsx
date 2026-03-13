import { useState, useEffect, useRef, useCallback } from "react";

const P = {
  bg:"#1A1816",surface:"#242220",surfHov:"#2E2B28",bdr:"#3D3835",bdrLt:"#332F2C",
  ink:"#F0EDE8",inkM:"#A8A29E",inkF:"#6B6560",
  acc:"#E8723A",accLt:"#2A2018",accBdr:"#5C3A20",
  headerBg:"rgba(26,24,22,0.92)",toolbarBg:"#242220",
  shadow:"rgba(0,0,0,0.15)",shadowHov:"rgba(0,0,0,0.25)",
  overlay:"rgba(0,0,0,0.45)",overlayHeavy:"rgba(0,0,0,0.5)",
  modalShadow:"0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
  panelShadow:"-20px 0 60px rgba(0,0,0,0.3)",
  scrollThumb:"#3D3835",sparkUp:"#4ADE80",sparkDown:"#F87171",sparkFlat:"#6B6560",
};
const PLight = {
  bg:"#FAF8F5",surface:"#FFFFFF",surfHov:"#F5F3F0",bdr:"#E8E4DF",bdrLt:"#F0ECE8",
  ink:"#1C1917",inkM:"#57534E",inkF:"#A8A29E",
  acc:"#C2410C",accLt:"#FFF7ED",accBdr:"#FED7AA",
  headerBg:"rgba(250,248,245,0.92)",toolbarBg:"#FFFFFF",
  shadow:"rgba(28,25,23,0.04)",shadowHov:"rgba(28,25,23,0.08)",
  overlay:"rgba(28,25,23,0.25)",overlayHeavy:"rgba(28,25,23,0.3)",
  modalShadow:"0 24px 80px rgba(28,25,23,0.15), 0 0 0 1px rgba(28,25,23,0.05)",
  panelShadow:"-20px 0 60px rgba(28,25,23,0.08)",
  scrollThumb:"#E8E4DF",sparkUp:"#059669",sparkDown:"#EF4444",sparkFlat:"#A8A29E",
};
const PDark = P;
const F = { display:"'Instrument Serif', Georgia, serif", body:"'DM Sans', 'Helvetica Neue', sans-serif", mono:"'IBM Plex Mono', 'SF Mono', monospace" };

// ── SVG Icons ──
const Icons = {
  capture: (c="#E8723A") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  brain: (c="#A78BFA") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2H10a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/><line x1="9" y1="22" x2="15" y2="22"/><line x1="10" y1="2" x2="10" y2="7"/><line x1="14" y1="2" x2="14" y2="7"/></svg>,
  pipeline: (c="#5B9EF5") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="8" width="5" height="13" rx="1"/><rect x="17" y="5" width="5" height="16" rx="1"/></svg>,
  chart: (c="#4ADE80") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  search: (c="#F59E0B") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/></svg>,
  tag: (c="#F472B6") => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  github: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0EDE8"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
  google: () => <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  x: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#F0EDE8"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
};

const CATEGORIES=[{id:"ai-ml",label:"AI / ML",color:"#E8723A"},{id:"dev-tools",label:"Dev Tools",color:"#5B9EF5"},{id:"cli",label:"CLI",color:"#4ADE80"},{id:"libraries",label:"Libraries",color:"#A78BFA"},{id:"learning",label:"Learning",color:"#F472B6"},{id:"apis",label:"APIs",color:"#2DD4BF"},{id:"data",label:"Data Eng",color:"#FB923C"},{id:"uncategorized",label:"Unsorted",color:"#A8A29E"}];
const STATUSES=[{id:"inbox",label:"Inbox",color:"#A8A29E"},{id:"to-review",label:"To Read",color:"#D97706"},{id:"reviewed",label:"Read",color:"#059669"},{id:"to-implement",label:"To Build",color:"#2563EB"},{id:"implemented",label:"Built",color:"#7C3AED"},{id:"archived",label:"Archived",color:"#78716C"}];

function genSpark(){const d=[];let v=5+Math.random()*15;for(let i=0;i<8;i++){v=Math.max(0,v+(Math.random()-0.45)*8);d.push(Math.round(v));}return d;}
function fmt(n){return n>=1000?(n/1000).toFixed(1).replace(/\.0$/,"")+"k":n;}
function ago(d){if(!d)return"—";const days=Math.floor((Date.now()-new Date(d).getTime())/86400000);if(days===0)return"today";if(days===1)return"yesterday";if(days<30)return`${days}d ago`;if(days<365)return`${Math.floor(days/30)}mo ago`;return`${Math.floor(days/365)}y ago`;}
function langColor(l){return{Python:"#3572A5",JavaScript:"#F1E05A",TypeScript:"#3178C6",Rust:"#DEA584",Go:"#00ADD8",Java:"#B07219"}[l]||"#A8A29E";}
function Spark({data,w=48,h=14}){if(!data?.length)return null;const max=Math.max(...data,1);const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-(v/max)*h}`).join(" ");const t=data[data.length-1]-data[0];const c=t>2?P.sparkUp:t<-2?P.sparkDown:P.sparkFlat;return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;}

const DEMO=[
  {id:"1",name:"langchain",owner:"langchain-ai",stars:98200,forks:15800,language:"Python",license:"MIT",lastCommit:"2025-03-01",topics:["llm"],category:"ai-ml",status:"reviewed",tags:["work"],rating:5,notes:"Core RAG framework.",aiSummary:"Framework for LLM-powered apps with chains, agents, retrieval and memory.",savedAt:"2025-02-15T10:30:00Z",readAt:"2025-02-18T14:00:00Z",sparkline:genSpark()},
  {id:"2",name:"ollama",owner:"ollama",stars:112000,forks:8900,language:"Go",license:"MIT",lastCommit:"2025-03-03",topics:["llm"],category:"ai-ml",status:"implemented",tags:["stable"],rating:5,notes:"Local dev.",aiSummary:"Run large language models locally with a simple CLI and API.",savedAt:"2025-01-20T08:00:00Z",readAt:"2025-01-22T09:00:00Z",sparkline:genSpark()},
  {id:"3",name:"ruff",owner:"astral-sh",stars:35600,forks:1200,language:"Rust",license:"MIT",lastCommit:"2025-03-04",topics:["python"],category:"dev-tools",status:"implemented",tags:["stable"],rating:4,notes:"Replaced flake8+black.",aiSummary:"Blazing-fast Python linter and formatter built in Rust.",savedAt:"2025-01-10T12:00:00Z",readAt:"2025-01-11T16:00:00Z",sparkline:genSpark()},
  {id:"4",name:"ui",owner:"shadcn-ui",stars:78900,forks:4800,language:"TypeScript",license:"MIT",lastCommit:"2025-03-03",topics:["react"],category:"libraries",status:"to-implement",tags:["work"],rating:4,notes:"Dashboard rebuild.",aiSummary:"Copy-paste UI components on Radix primitives with Tailwind styling.",savedAt:"2025-02-28T15:00:00Z",readAt:"2025-03-01T10:00:00Z",sparkline:genSpark()},
  {id:"5",name:"litellm",owner:"BerriAI",stars:15200,forks:1800,language:"Python",license:"MIT",lastCommit:"2025-03-04",topics:["llm"],category:"ai-ml",status:"inbox",tags:[],rating:null,notes:"",aiSummary:"Unified interface to 100+ LLM providers using OpenAI's API format.",savedAt:"2025-03-05T09:00:00Z",readAt:null,sparkline:genSpark()},
  {id:"6",name:"zed",owner:"zed-industries",stars:52300,forks:3200,language:"Rust",license:"GPL-3.0",lastCommit:"2025-03-05",topics:["editor"],category:"dev-tools",status:"inbox",tags:["weekend-project"],rating:null,notes:"",aiSummary:"GPU-accelerated code editor in Rust with real-time collaboration.",savedAt:"2025-03-04T18:00:00Z",readAt:null,sparkline:genSpark()},
];

// ── Vault Preview with enhanced animations ──
function VaultPreview() {
  const [step, setStep] = useState(0); // 0=nothing, 1=chrome, 2=toolbar, 3=progress, 4+=cards
  const previewRepos = [
    {name:"langchain",owner:"langchain-ai",lang:"Python",langC:"#3572A5",stars:"98.2k",cat:"AI / ML",catC:"#E8723A",status:"Read",statusC:"#059669",spark:genSpark()},
    {name:"ollama",owner:"ollama",lang:"Go",langC:"#00ADD8",stars:"112k",cat:"AI / ML",catC:"#E8723A",status:"Built",statusC:"#7C3AED",spark:genSpark()},
    {name:"ruff",owner:"astral-sh",lang:"Rust",langC:"#DEA584",stars:"35.6k",cat:"Dev Tools",catC:"#5B9EF5",status:"Built",statusC:"#7C3AED",spark:genSpark()},
  ];
  const [progressW, setProgressW] = useState(0);

  useEffect(()=>{
    const delays = [300,600,900,1200,1600,2000,2400];
    const timers = delays.map((d,i) => setTimeout(()=>setStep(i+1), d));
    const pw = setTimeout(()=>setProgressW(71), 1300);
    return ()=>{timers.forEach(clearTimeout);clearTimeout(pw);};
  },[]);

  const fadeIn = (s, extra="") => ({
    opacity:step>=s?1:0,
    transform:step>=s?"translateY(0)":"translateY(12px)",
    transition:`all 0.5s cubic-bezier(0.16,1,0.3,1)${extra}`,
  });

  return (
    <div style={{background:"#0D0C0A",border:`1px solid ${P.bdr}`,borderRadius:12,overflow:"hidden",width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",...fadeIn(0)}}>
      {/* Title bar */}
      <div style={{padding:"8px 14px",background:"#1A1816",borderBottom:`1px solid ${P.bdr}`,display:"flex",alignItems:"center",gap:6,...fadeIn(1)}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#EF4444"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#F59E0B"}}/>
        <div style={{width:10,height:10,borderRadius:"50%",background:"#22C55E"}}/>
        <span style={{marginLeft:8,fontSize:"11px",color:P.inkF,fontFamily:F.mono}}>RepoVault</span>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:"10px",fontFamily:F.mono,color:P.inkF,padding:"2px 6px",borderRadius:4,background:P.surface}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:"#4ADE80"}}/>Synced
        </div>
      </div>

      {/* Toolbar */}
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${P.bdrLt}`,display:"flex",alignItems:"center",gap:6,...fadeIn(2)}}>
        <div style={{flex:1,padding:"5px 8px 5px 24px",borderRadius:6,border:`1px solid ${P.bdr}`,background:P.surface,fontSize:"11px",color:P.inkF,fontFamily:F.body,position:"relative"}}>
          <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:10}}>⌕</span>Search repos…
        </div>
        <div style={{display:"flex",gap:2,padding:2,borderRadius:4,background:P.surface}}>
          <div style={{padding:"3px 6px",borderRadius:3,background:P.surfHov,fontSize:"10px",color:P.ink}}>▦</div>
          <div style={{padding:"3px 6px",borderRadius:3,fontSize:"10px",color:P.inkF}}>☰</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{padding:"8px 14px",display:"flex",alignItems:"center",gap:8,...fadeIn(3)}}>
        <span style={{fontSize:"10px",color:P.inkM,fontFamily:F.body,fontWeight:600}}>Progress</span>
        <div style={{flex:1,height:4,borderRadius:2,background:P.bdr,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${P.acc},#D97706)`,width:`${progressW}%`,transition:"width 1s cubic-bezier(0.16,1,0.3,1)"}}/>
        </div>
        <span style={{fontSize:"10px",color:P.inkF,fontFamily:F.mono,opacity:step>=3?1:0,transition:"opacity 0.5s"}}>{progressW}%</span>
      </div>

      {/* Cards */}
      <div style={{padding:"4px 14px 14px",display:"flex",flexDirection:"column",gap:8}}>
        {previewRepos.map((r,i) => (
          <div key={i} style={{
            background:P.surface,border:`1px solid ${P.bdr}`,borderRadius:8,overflow:"hidden",
            ...fadeIn(4+i, `, ${0.05*i}s`),
          }}>
            <div style={{height:2,background:r.statusC}}/>
            <div style={{padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div>
                  <p style={{fontSize:"9px",color:P.inkF,fontFamily:F.mono,marginBottom:1}}>{r.owner}</p>
                  <p style={{fontFamily:F.display,fontSize:"15px",fontWeight:400,color:P.ink,margin:0}}>{r.name}</p>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <span style={{fontSize:"8px",fontWeight:600,fontFamily:F.mono,color:r.catC,background:`${r.catC}18`,padding:"1px 5px",borderRadius:3}}>{r.cat}</span>
                  <Spark data={r.spark} w={36} h={10}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,fontSize:"9px",color:P.inkF,fontFamily:F.mono}}>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:r.langC}}/>{r.lang}</span>
                <span>★ {r.stars}</span>
                <span style={{marginLeft:"auto",color:r.statusC,fontWeight:600}}>{r.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB hint */}
      <div style={{position:"absolute",bottom:12,right:26,width:28,height:28,borderRadius:8,background:P.acc,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"16px",fontWeight:300,boxShadow:`0 4px 12px ${P.acc}55`,...fadeIn(7),pointerEvents:"none"}}>+</div>
    </div>
  );
}

// ── Onboarding Guide ──
function OnboardingGuide({T,onClose}) {
  const [step, setStep] = useState(0);
  const steps = [
    {title:"Welcome to RepoVault",desc:"Your personal vault for GitHub repos. Let's take a quick tour.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {title:"Capture repos",desc:"Tap the orange + button to add any GitHub URL. Paste a link and press Enter — metadata and AI summary auto-generate.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>},
    {title:"Organize with status",desc:"Move repos through your pipeline: Inbox → To Read → Read → To Build → Built → Archived. Click any card to change status.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5B9EF5" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="8" width="5" height="13" rx="1"/><rect x="17" y="5" width="5" height="16" rx="1"/></svg>},
    {title:"Search everything",desc:"Press / to focus search. Find repos by name, AI summary, your notes, or tags. Filter by status and category.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>},
    {title:"Track activity",desc:"Each repo shows a sparkline of recent commit activity. Green = trending up, red = declining, gray = stable.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
    {title:"You're all set!",desc:"Start by adding a GitHub URL. You can replay this guide anytime from the ? button in the header.",icon:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>},
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.surface,borderRadius:16,width:"100%",maxWidth:400,boxShadow:T.modalShadow,overflow:"hidden"}}>
        {/* Progress dots */}
        <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"center",gap:6}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?T.acc:i<step?`${T.acc}66`:T.bdr,transition:"all 0.3s",cursor:"pointer"}} onClick={()=>setStep(i)}/>
          ))}
        </div>

        {/* Content */}
        <div style={{padding:"28px 28px 20px",textAlign:"center",minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{marginBottom:16,opacity:1,transition:"opacity 0.3s"}} key={step}>
            {steps[step].icon}
          </div>
          <h3 style={{fontFamily:F.display,fontSize:"22px",fontWeight:400,color:T.ink,marginBottom:8}} key={`t${step}`}>{steps[step].title}</h3>
          <p style={{fontFamily:F.body,fontSize:"14px",color:T.inkM,lineHeight:1.6,maxWidth:320}} key={`d${step}`}>{steps[step].desc}</p>
        </div>

        {/* Actions */}
        <div style={{padding:"0 28px 24px",display:"flex",gap:8,justifyContent:"center"}}>
          {step > 0 && (
            <button onClick={()=>setStep(step-1)} style={{padding:"9px 20px",borderRadius:8,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.inkM,fontSize:"13px",fontFamily:F.body,cursor:"pointer"}}>Back</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={()=>setStep(step+1)} style={{padding:"9px 24px",borderRadius:8,border:"none",background:T.acc,color:"#fff",fontSize:"13px",fontFamily:F.body,fontWeight:600,cursor:"pointer"}}>Next</button>
          ) : (
            <button onClick={onClose} style={{padding:"9px 24px",borderRadius:8,border:"none",background:T.acc,color:"#fff",fontSize:"13px",fontFamily:F.body,fontWeight:600,cursor:"pointer"}}>Start using RepoVault</button>
          )}
        </div>

        {/* Skip */}
        {step < steps.length - 1 && (
          <div style={{textAlign:"center",paddingBottom:16}}>
            <button onClick={onClose} style={{background:"none",border:"none",color:T.inkF,fontSize:"12px",fontFamily:F.body,cursor:"pointer",padding:4}}>Skip tour</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Landing Page ──
function LandingPage({T,dark,setDark,onStart,onLogin}) {
  const [show, setShow] = useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),100);},[]);

  const features = [
    {icon:Icons.capture(),title:"One-tap capture",desc:"Share from Chrome, paste URLs, or bulk-import. Metadata auto-populates."},
    {icon:Icons.brain(),title:"AI summaries",desc:"Every repo gets a plain-English summary on save. Know what it does instantly."},
    {icon:Icons.pipeline(),title:"Pipeline workflow",desc:"Inbox → To Read → Read → To Build → Built → Archived."},
    {icon:Icons.chart(),title:"Activity sparklines",desc:"8-week commit charts. Spot trending repos, avoid abandoned ones."},
    {icon:Icons.search(),title:"Semantic search",desc:"Search across names, summaries, notes, and tags."},
    {icon:Icons.tag(),title:"Auto-categorize",desc:"AI suggests categories and tags. Override anytime."},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,opacity:0.03,backgroundImage:`linear-gradient(${T.inkF} 1px,transparent 1px),linear-gradient(90deg,${T.inkF} 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      <nav style={{position:"sticky",top:0,zIndex:50,background:T.headerBg,backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",height:50}}>
          <div style={{display:"flex",alignItems:"baseline",gap:2}}>
            <span style={{fontFamily:F.display,fontSize:"20px",color:T.ink}}>Repo</span>
            <span style={{fontFamily:F.display,fontSize:"20px",fontStyle:"italic",color:T.acc}}>Vault</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setDark(!dark)} title={dark?"Light mode":"Dark mode"} style={{width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",background:dark?T.acc:T.bdr,position:"relative",transition:"background 0.3s",display:"flex",alignItems:"center",padding:2,flexShrink:0}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:T.surface,transition:"transform 0.3s",transform:dark?"translateX(16px)":"translateX(0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px"}}>{dark?"☽":"☀"}</div>
            </button>
            <button onClick={onLogin} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${T.bdr}`,background:"transparent",color:T.inkM,fontSize:"13px",fontFamily:F.body,cursor:"pointer"}}>Log in</button>
            <button onClick={onStart} style={{padding:"7px 14px",borderRadius:8,border:"none",background:T.acc,color:"#fff",fontSize:"13px",fontFamily:F.body,cursor:"pointer",fontWeight:600}}>Start free</button>
          </div>
        </div>
      </nav>

      <section style={{maxWidth:1100,margin:"0 auto",padding:"48px 20px 40px",position:"relative",zIndex:1}}>
        <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(30px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px 4px 6px",borderRadius:20,border:`1px solid ${T.bdr}`,marginBottom:20,background:T.surface}}>
            <span style={{background:T.acc,color:"#fff",fontSize:"10px",fontWeight:700,padding:"2px 6px",borderRadius:10,fontFamily:F.mono}}>NEW</span>
            <span style={{fontSize:"12px",color:T.inkM,fontFamily:F.body}}>AI summaries auto-generate on save</span>
          </div>
          <h1 style={{fontFamily:F.display,fontSize:"clamp(36px, 8vw, 52px)",fontWeight:400,color:T.ink,lineHeight:1.1,marginBottom:16}}>
            Stop hoarding<br/><span style={{fontStyle:"italic",color:T.acc}}>GitHub tabs.</span>
          </h1>
          <p style={{fontFamily:F.body,fontSize:"clamp(15px, 3.5vw, 17px)",color:T.inkM,lineHeight:1.7,marginBottom:28,maxWidth:480}}>
            Capture repos from anywhere, get AI summaries instantly, track what you've reviewed, and find anything in seconds. Built for developers who discover faster than they can read.
          </p>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:20}}>
            <button onClick={onStart} style={{padding:"12px 24px",borderRadius:10,border:"none",background:T.acc,color:"#fff",fontSize:"15px",fontFamily:F.body,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 20px ${T.acc}44`}}>Start free — no signup</button>
            <button onClick={onLogin} style={{padding:"12px 18px",borderRadius:10,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.ink,fontSize:"14px",fontFamily:F.body,cursor:"pointer"}}>Sign in to sync</button>
          </div>
          <div style={{display:"flex",gap:16,fontSize:"12px",color:T.inkF,fontFamily:F.mono,flexWrap:"wrap"}}>
            <span>✓ Free forever</span><span>✓ No credit card</span><span>✓ Works offline</span>
          </div>
        </div>
        <div style={{marginTop:32,opacity:show?1:0,transform:show?"translateY(0)":"translateY(20px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",maxWidth:480,position:"relative"}}>
          <VaultPreview/>
        </div>
      </section>

      {/* How it works */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"40px 20px 48px",position:"relative",zIndex:1}}>
        <p style={{fontSize:"11px",fontWeight:700,color:T.acc,fontFamily:F.mono,letterSpacing:"0.1em",marginBottom:8}}>HOW IT WORKS</p>
        <h2 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,32px)",color:T.ink,marginBottom:32}}>Three steps. Zero friction.</h2>
        <div style={{display:"flex",gap:2,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingBottom:8}}>
          {[{step:"01",title:"Capture",desc:"Share from mobile Chrome, paste a URL, or bulk-import your bookmark backlog.",color:T.acc},{step:"02",title:"Enrich",desc:"We pull stars, language, license, README. AI generates a summary and suggests a category.",color:"#D97706"},{step:"03",title:"Retrieve",desc:"Search by name, topic, your notes, or natural language. Filter by status, category, language.",color:"#059669"}].map((s,i)=>(
            <div key={i} style={{background:T.surface,padding:"28px 24px",minWidth:240,flex:"1 0 240px",scrollSnapAlign:"start",borderRight:i<2?`1px solid ${T.bdr}`:"none",borderRadius:i===0?"12px 0 0 12px":i===2?"0 12px 12px 0":"0"}}>
              <span style={{fontFamily:F.mono,fontSize:"28px",fontWeight:800,color:s.color,opacity:0.3}}>{s.step}</span>
              <h3 style={{fontFamily:F.body,fontSize:"16px",fontWeight:700,color:T.ink,margin:"8px 0"}}>{s.title}</h3>
              <p style={{fontFamily:F.body,fontSize:"13px",color:T.inkM,lineHeight:1.6}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features with SVG icons */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"40px 20px 48px",position:"relative",zIndex:1}}>
        <p style={{fontSize:"11px",fontWeight:700,color:T.acc,fontFamily:F.mono,letterSpacing:"0.1em",marginBottom:8}}>FEATURES</p>
        <h2 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,32px)",color:T.ink,marginBottom:32}}>Everything you need. Nothing you don't.</h2>
        <div className="feat-grid" style={{display:"grid",gap:14}}>
          {features.map((f,i)=>(
            <div key={i} style={{background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:12,padding:"20px 18px"}}>
              <div style={{marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontFamily:F.body,fontSize:"15px",fontWeight:700,color:T.ink,marginBottom:4}}>{f.title}</h3>
              <p style={{fontFamily:F.body,fontSize:"13px",color:T.inkM,lineHeight:1.5}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"48px 20px 60px",position:"relative",zIndex:1}}>
        <p style={{fontSize:"11px",fontWeight:700,color:T.acc,fontFamily:F.mono,letterSpacing:"0.1em",marginBottom:8}}>PRICING</p>
        <h2 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,32px)",color:T.ink,marginBottom:32}}>Free to start. Pro when you're ready.</h2>
        <div style={{display:"flex",gap:14,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingBottom:8,paddingTop:14}}>
          {/* Free */}
          <div style={{background:T.surface,border:`2px solid ${T.acc}`,borderRadius:14,padding:"24px 20px",minWidth:260,flex:"1 0 260px",scrollSnapAlign:"start",position:"relative",boxShadow:`0 0 40px ${T.acc}15`}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translate(-50%,-50%)",background:T.acc,color:"#fff",fontSize:"10px",fontWeight:700,padding:"4px 14px",borderRadius:20,fontFamily:F.mono,whiteSpace:"nowrap"}}>AVAILABLE NOW</div>
            <p style={{fontSize:"12px",fontWeight:700,color:T.acc,fontFamily:F.mono,marginBottom:4}}>FREE</p>
            <div style={{fontFamily:F.display,fontSize:"32px",color:T.ink,marginBottom:4}}>$0</div>
            <p style={{fontSize:"12px",color:T.inkF,fontFamily:F.body,marginBottom:16}}>forever · no card</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
              {["Up to 50 repos","AI summaries","All views (grid/list/kanban)","Browser storage","Full-text search","Manual categories","Activity sparklines","Status pipeline"].map(f=>(
                <div key={f} style={{display:"flex",gap:6,fontSize:"13px",color:T.inkM,fontFamily:F.body}}><span style={{color:"#4ADE80",flexShrink:0}}>✓</span>{f}</div>
              ))}
            </div>
            <button onClick={onStart} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:T.acc,color:"#fff",fontSize:"13px",fontFamily:F.body,fontWeight:600,cursor:"pointer"}}>Start free</button>
          </div>
          {/* Pro */}
          <div style={{background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:14,padding:"24px 20px",minWidth:260,flex:"1 0 260px",scrollSnapAlign:"start",position:"relative",opacity:0.65}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translate(-50%,-50%)",background:T.bdr,color:T.inkM,fontSize:"10px",fontWeight:700,padding:"4px 14px",borderRadius:20,fontFamily:F.mono,whiteSpace:"nowrap"}}>COMING SOON</div>
            <p style={{fontSize:"12px",fontWeight:700,color:T.inkF,fontFamily:F.mono,marginBottom:4}}>PRO</p>
            <div style={{fontFamily:F.display,fontSize:"32px",color:T.ink,marginBottom:4}}>$8<span style={{fontSize:"14px",color:T.inkM}}>/mo</span></div>
            <p style={{fontSize:"12px",color:T.inkF,fontFamily:F.body,marginBottom:16}}>annual · $10/mo monthly</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
              {["Unlimited repos","Cloud sync","Semantic search","Auto-categorize","README snapshots","Activity alerts","Stale detection","Weekly digest","Export","Priority support"].map(f=>(
                <div key={f} style={{display:"flex",gap:6,fontSize:"13px",color:T.inkM,fontFamily:F.body}}><span style={{color:T.inkF,flexShrink:0}}>✓</span>{f}</div>
              ))}
            </div>
            <button disabled style={{width:"100%",padding:"10px",borderRadius:8,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.inkF,fontSize:"13px",fontFamily:F.body,fontWeight:600,cursor:"default"}}>Coming soon</button>
          </div>
          {/* Team */}
          <div style={{background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:14,padding:"24px 20px",minWidth:260,flex:"1 0 260px",scrollSnapAlign:"start",position:"relative",opacity:0.65}}>
            <div style={{position:"absolute",top:0,left:"50%",transform:"translate(-50%,-50%)",background:T.bdr,color:T.inkM,fontSize:"10px",fontWeight:700,padding:"4px 14px",borderRadius:20,fontFamily:F.mono,whiteSpace:"nowrap"}}>COMING SOON</div>
            <p style={{fontSize:"12px",fontWeight:700,color:T.inkF,fontFamily:F.mono,marginBottom:4}}>TEAM</p>
            <div style={{fontFamily:F.display,fontSize:"32px",color:T.ink,marginBottom:4}}>$6<span style={{fontSize:"14px",color:T.inkM}}>/user/mo</span></div>
            <p style={{fontSize:"12px",color:T.inkF,fontFamily:F.body,marginBottom:16}}>min 3 users · annual</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
              {["Everything in Pro","Shared collections","Team activity feed","Shared tags","Admin dashboard","SSO (coming soon)","API access","Slack integration","Notion integration"].map(f=>(
                <div key={f} style={{display:"flex",gap:6,fontSize:"13px",color:T.inkM,fontFamily:F.body}}><span style={{color:T.inkF,flexShrink:0}}>✓</span>{f}</div>
              ))}
            </div>
            <button disabled style={{width:"100%",padding:"10px",borderRadius:8,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.inkF,fontSize:"13px",fontFamily:F.body,fontWeight:600,cursor:"default"}}>Coming soon</button>
          </div>
        </div>
      </section>

      <footer style={{borderTop:`1px solid ${T.bdr}`,padding:"28px 20px",position:"relative",zIndex:1}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"baseline",gap:2}}>
            <span style={{fontFamily:F.display,fontSize:"16px",color:T.inkF}}>Repo</span>
            <span style={{fontFamily:F.display,fontSize:"16px",fontStyle:"italic",color:T.inkF}}>Vault</span>
          </div>
          <div style={{display:"flex",gap:16,fontSize:"12px",color:T.inkF,fontFamily:F.body}}><span>Privacy</span><span>Terms</span><span>GitHub</span></div>
        </div>
      </footer>
    </div>
  );
}

// ── Auth Page ──
function AuthPage({T,onLogin,onSkip}) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:2,marginBottom:12}}>
            <span style={{fontFamily:F.display,fontSize:"26px",color:T.ink}}>Repo</span>
            <span style={{fontFamily:F.display,fontSize:"26px",fontStyle:"italic",color:T.acc}}>Vault</span>
          </div>
          <h2 style={{fontFamily:F.display,fontSize:"22px",color:T.ink,marginBottom:4}}>Welcome back</h2>
          <p style={{fontSize:"14px",color:T.inkM,fontFamily:F.body}}>Sign in to sync across devices.</p>
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:14,padding:24}}>
          {[
            {name:"GitHub",icon:Icons.github()},
            {name:"Google",icon:Icons.google()},
            {name:"Twitter",icon:Icons.x()},
          ].map(p=>(
            <button key={p.name} onClick={()=>onLogin({name:"Developer",provider:p.name.toLowerCase(),avatar:p.name[0]})} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.ink,fontSize:"14px",fontWeight:500,fontFamily:F.body,cursor:"pointer",marginBottom:8,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=T.surfHov;e.currentTarget.style.borderColor=T.acc;}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=T.bdr;}}>
              {p.icon}<span>Continue with {p.name}</span>
            </button>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:T.bdr}}/><span style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono}}>or</span><div style={{flex:1,height:1,background:T.bdr}}/>
          </div>
          <button onClick={onSkip} style={{width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${T.bdr}`,background:"transparent",color:T.inkM,fontSize:"14px",fontFamily:F.body,cursor:"pointer"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.acc;e.currentTarget.style.color=T.ink;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bdr;e.currentTarget.style.color=T.inkM;}}>
            Continue as guest
          </button>
          <p style={{fontSize:"11px",color:T.inkF,fontFamily:F.body,textAlign:"center",marginTop:10}}>Guest data stored in browser only.</p>
        </div>
      </div>
    </div>
  );
}

const Toggle = ({ checked, onChange, T }) => (
  <button onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: checked ? T.acc : T.bdr, position: "relative", transition: "background 0.2s", padding: 2, display: "flex", alignItems: "center" }}>
    <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.surface, transition: "transform 0.2s", transform: checked ? "translateX(18px)" : "translateX(0)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
  </button>
);

const Sel = ({ value, onChange, options, T }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "5px 8px", borderRadius: 6, border: `1.5px solid ${T.bdr}`, background: T.bg, color: T.ink, fontSize: "12px", fontFamily: F.body, outline: "none", cursor: "pointer" }}>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

const Row = ({ label, desc, children, T }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.bdrLt}` }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: "13px", color: T.ink, fontFamily: F.body, marginBottom: 1 }}>{label}</p>
      {desc && <p style={{ fontSize: "11px", color: T.inkF, fontFamily: F.body }}>{desc}</p>}
    </div>
    <div style={{ flexShrink: 0, marginLeft: 12 }}>{children}</div>
  </div>
);

const Sec = ({ title, children, T }) => (
  <div style={{ marginBottom: 22 }}>
    <h3 style={{ fontFamily: F.body, fontSize: "13px", fontWeight: 700, color: T.ink, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${T.bdrLt}` }}>{title}</h3>
    {children}
  </div>
);

// ── Settings Page ──
function SettingsPage({T, dark, setDark, config, setConfig, onClose}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1200,background:T.overlayHeavy,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:16,width:"100%",maxWidth:500,maxHeight:"85vh",boxShadow:T.modalShadow,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <h2 style={{fontFamily:F.display,fontSize:"24px",fontWeight:400,color:T.ink}}>Settings</h2>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.bdr}`,background:T.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",color:T.inkM}}
            onMouseEnter={e=>e.currentTarget.style.background=T.surfHov}
            onMouseLeave={e=>e.currentTarget.style.background=T.bg}>✕</button>
        </div>
        <div style={{padding:"16px 24px 24px",overflowY:"auto",flex:1}}>
          <Sec title="Appearance" T={T}>
            {setDark && <Row label="Theme" desc={dark ? "Dark mode" : "Light mode"} T={T}><Toggle checked={dark} onChange={v => setDark(v)} T={T} /></Row>}
            <Row label="Default view" T={T}><Sel value={config.defaultView} onChange={v=>setConfig({...config,defaultView:v})} options={[{v:"grid",l:"Grid"},{v:"list",l:"List"},{v:"kanban",l:"Kanban"}]} T={T} /></Row>
            <Row label="Card density" T={T}><Sel value={config.cardDensity} onChange={v=>setConfig({...config,cardDensity:v})} options={[{v:"compact",l:"Compact"},{v:"default",l:"Default"},{v:"expanded",l:"Expanded"}]} T={T} /></Row>
          </Sec>
          <Sec title="Enrichment" T={T}>
            <Row label="Auto-fetch metadata" desc="Stars, forks, language on save" T={T}><Toggle checked={config.autoFetch} onChange={v=>setConfig({...config,autoFetch:v})} T={T} /></Row>
            <Row label="AI summaries" T={T}><Toggle checked={config.aiSummary} onChange={v=>setConfig({...config,aiSummary:v})} T={T}/></Row>
            <Row label="Snapshot README" T={T}><Toggle checked={config.snapshotReadme} onChange={v=>setConfig({...config,snapshotReadme:v})} T={T} /></Row>
            <Row label="Auto-categorize" T={T}><Toggle checked={config.autoCategory} onChange={v=>setConfig({...config,autoCategory:v})} T={T} /></Row>
          </Sec>
          <Sec title="Notifications" T={T}>
            <Row label="Stale repo alerts" desc="No commits in 6+ months" T={T}><Toggle checked={config.staleAlert} onChange={v=>setConfig({...config,staleAlert:v})} T={T} /></Row>
            <Row label="Weekly digest" T={T}><Toggle checked={config.weeklyDigest} onChange={v=>setConfig({...config,weeklyDigest:v})} T={T}/></Row>
            <Row label="Release alerts" T={T}><Toggle checked={config.releaseAlert} onChange={v=>setConfig({...config,releaseAlert:v})} T={T}/></Row>
          </Sec>
          <Sec title="Data & Export" T={T}>
            <Row label="Default sort" T={T}><Sel value={config.defaultSort} onChange={v=>setConfig({...config,defaultSort:v})} options={[{v:"savedAt",l:"Recent"},{v:"stars",l:"Stars"},{v:"name",l:"Name"}]} T={T} /></Row>
            <Row label="Export format" T={T}><Sel value={config.exportFormat} onChange={v=>setConfig({...config,exportFormat:v})} options={[{v:"json",l:"JSON"},{v:"csv",l:"CSV"},{v:"markdown",l:"Markdown"}]} T={T} /></Row>
          </Sec>
          <Sec title="Integrations" T={T}>
            <Row label="GitHub stars sync" T={T}><Toggle checked={config.ghSync} onChange={v=>setConfig({...config,ghSync:v})} T={T}/></Row>
            <Row label="Obsidian export" T={T}><Toggle checked={config.obsidian} onChange={v=>setConfig({...config,obsidian:v})} T={T} /></Row>
          </Sec>
          <div style={{padding:12,borderRadius:8,border:"1px solid #EF444433",background:"#EF444408",marginTop:4}}>
            <p style={{fontSize:"12px",fontWeight:600,color:"#EF4444",fontFamily:F.body,marginBottom:6}}>Danger Zone</p>
            <div style={{display:"flex",gap:6}}>
              <button style={{padding:"5px 12px",borderRadius:5,border:"1px solid #EF444433",background:"transparent",color:"#EF4444",fontSize:"11px",fontFamily:F.body,cursor:"pointer"}}>Export all</button>
              <button style={{padding:"5px 12px",borderRadius:5,border:"1px solid #EF444433",background:"transparent",color:"#EF4444",fontSize:"11px",fontFamily:F.body,cursor:"pointer"}}>Clear repos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vault App ──
function VaultApp({T,dark,setDark,user,isGuest,onLogout,onLogin}) {
  const [repos,setRepos]=useState(DEMO);
  const [search,setSearch]=useState("");
  const [fCat,setFCat]=useState("all");
  const [fSt,setFSt]=useState("all");
  const [view,setView]=useState("grid");
  const [sel,setSel]=useState(null);
  const [showCap,setShowCap]=useState(false);
  const [sort,setSort]=useState("savedAt");
  const [showGuide,setShowGuide]=useState(true);
  const [showSettings,setShowSettings]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const searchRef=useRef(null);

  useEffect(()=>{
    const h=e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT")return;if(e.key==="/"){e.preventDefault();searchRef.current?.focus();}if(e.key==="n"){e.preventDefault();setShowCap(true);}if(e.key==="Escape"){setSel(null);setShowCap(false);setShowMenu(false);}};
    const clickOut=()=>setShowMenu(false);
    window.addEventListener("keydown",h);
    if(showMenu) setTimeout(()=>window.addEventListener("click",clickOut),0);
    return()=>{window.removeEventListener("keydown",h);window.removeEventListener("click",clickOut);};
  },[showMenu]);

  const filtered=repos.filter(r=>{
    if(search){const q=search.toLowerCase();if(![r.name,r.owner,r.aiSummary,r.notes,...(r.tags||[]),...(r.topics||[])].some(s=>s?.toLowerCase().includes(q)))return false;}
    if(fCat!=="all"&&r.category!==fCat)return false;if(fSt!=="all"&&r.status!==fSt)return false;return true;
  }).sort((a,b)=>sort==="stars"?b.stars-a.stars:sort==="name"?a.name.localeCompare(b.name):new Date(b.savedAt)-new Date(a.savedAt));

  const stats={total:repos.length,inbox:repos.filter(r=>r.status==="inbox").length};
  const processed=repos.filter(r=>r.status!=="inbox").length;
  const pct=repos.length?Math.round((processed/repos.length)*100):0;
  const selS={padding:"6px 10px",borderRadius:6,border:`1.5px solid ${T.bdr}`,background:T.surface,color:T.ink,fontSize:"12px",fontFamily:F.body,outline:"none",cursor:"pointer",fontWeight:500};

  return (
    <div style={{minHeight:"100vh",background:T.bg}}>
      {showGuide && <OnboardingGuide T={T} onClose={()=>setShowGuide(false)} />}
      {showSettings && <SettingsPage T={T} onClose={()=>setShowSettings(false)} />}

      <header style={{position:"sticky",top:0,zIndex:100,background:T.headerBg,backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",height:48,gap:10}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"baseline",gap:2,flexShrink:0}}>
            <span style={{fontFamily:F.display,fontSize:"18px",color:T.ink}}>Repo</span>
            <span style={{fontFamily:F.display,fontSize:"18px",fontStyle:"italic",color:T.acc}}>Vault</span>
          </div>

          {/* Search */}
          <div style={{flex:1,maxWidth:360,position:"relative"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.inkF,fontSize:12}}>⌕</span>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search… /" style={{width:"100%",padding:"6px 10px 6px 28px",borderRadius:7,border:`1.5px solid ${T.bdr}`,background:T.surface,color:T.ink,fontSize:"12px",fontFamily:F.body,outline:"none"}} onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=T.bdr}/>
          </div>

          {/* Desktop stats */}
          <span className="hide-mobile" style={{fontSize:"11px",fontFamily:F.body,color:T.inkF}}><strong style={{color:T.ink}}>{stats.total}</strong> repos</span>
          <span className="hide-mobile" style={{fontSize:"11px",fontFamily:F.body,color:T.inkF}}><strong style={{color:"#D97706"}}>{stats.inbox}</strong> inbox</span>

          {/* Right side: sync dot + avatar + menu */}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            {/* Compact sync dot — no label on mobile */}
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:"10px",fontFamily:F.mono,color:T.inkF}} title={isGuest?"Local storage":"Cloud synced"}>
              <div style={{width:6,height:6,borderRadius:"50%",background:isGuest?T.inkF:"#4ADE80"}}/>
              <span className="hide-mobile">{isGuest?"Local":"Synced"}</span>
            </div>

            {/* Avatar — also triggers menu */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowMenu(!showMenu)} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:7,border:`1px solid ${showMenu?T.acc:T.bdr}`,background:T.bg,cursor:"pointer",fontSize:"11px",color:T.inkM,fontFamily:F.body,transition:"border-color 0.15s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:T.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:"#fff"}}>{user?.avatar||"?"}</div>
                <span className="hide-mobile">{user?.name||"Guest"}</span>
                <span style={{fontSize:"10px",color:T.inkF,marginLeft:2,transition:"transform 0.2s",transform:showMenu?"rotate(180deg)":"rotate(0)"}}>▾</span>
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:10,padding:6,minWidth:200,boxShadow:T.modalShadow,zIndex:200}}>
                  {/* Theme toggle row */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      <span style={{fontSize:"13px",color:T.ink,fontFamily:F.body}}>{dark?"Dark":"Light"} mode</span>
                    </div>
                    <button onClick={(e)=>{e.stopPropagation();setDark(!dark);}} style={{width:36,height:20,borderRadius:10,border:"none",cursor:"pointer",background:dark?T.acc:T.bdr,position:"relative",transition:"background 0.3s",display:"flex",alignItems:"center",padding:2}}>
                      <div style={{width:16,height:16,borderRadius:"50%",background:T.surface,transition:"transform 0.3s",transform:dark?"translateX(16px)":"translateX(0)"}}/>
                    </button>
                  </div>

                  <div style={{height:1,background:T.bdrLt,margin:"4px 0"}}/>

                  {/* Settings */}
                  <button onClick={()=>{setShowSettings(true);setShowMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",background:"transparent",color:T.ink,fontSize:"13px",fontFamily:F.body,cursor:"pointer",textAlign:"left",transition:"background 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.surfHov}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    Settings
                  </button>

                  {/* How to use */}
                  <button onClick={()=>{setShowGuide(true);setShowMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",background:"transparent",color:T.ink,fontSize:"13px",fontFamily:F.body,cursor:"pointer",textAlign:"left",transition:"background 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.surfHov}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.inkF} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    How to use
                  </button>

                  <div style={{height:1,background:T.bdrLt,margin:"4px 0"}}/>

                  {/* Sync status */}
                  <div style={{padding:"8px 10px",display:"flex",alignItems:"center",gap:8}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isGuest?T.inkF:"#4ADE80"} strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                    <span style={{fontSize:"12px",color:T.inkF,fontFamily:F.body}}>{isGuest?"Browser storage only":"Cloud synced"}</span>
                  </div>

                  {isGuest && (
                    <button onClick={()=>{onLogin();setShowMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",background:T.accLt,color:T.acc,fontSize:"13px",fontFamily:F.body,cursor:"pointer",fontWeight:600,textAlign:"left"}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.accBdr}
                      onMouseLeave={e=>e.currentTarget.style.background=T.accLt}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Sign in to sync
                    </button>
                  )}

                  <div style={{height:1,background:T.bdrLt,margin:"4px 0"}}/>

                  <button onClick={()=>{onLogout();setShowMenu(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",background:"transparent",color:"#EF4444",fontSize:"13px",fontFamily:F.body,cursor:"pointer",textAlign:"left",transition:"background 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#EF444410"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{borderBottom:`1px solid ${T.bdrLt}`,background:T.toolbarBg}}>
        <div style={{maxWidth:1360,margin:"0 auto",padding:"6px 16px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <select value={fSt} onChange={e=>setFSt(e.target.value)} style={selS}><option value="all">Status</option>{STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
          <select value={fCat} onChange={e=>setFCat(e.target.value)} style={selS}><option value="all">Category</option>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={selS}><option value="savedAt">Recent</option><option value="stars">Stars</option><option value="name">A→Z</option></select>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:2,background:T.bg,borderRadius:5,padding:2,border:`1px solid ${T.bdrLt}`}}>
            {[{id:"grid",l:"▦"},{id:"list",l:"☰"},{id:"kanban",l:"▥"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"3px 9px",borderRadius:4,border:"none",cursor:"pointer",fontSize:"13px",background:view===v.id?T.surface:"transparent",color:view===v.id?T.ink:T.inkF,boxShadow:view===v.id?`0 1px 3px ${T.shadow}`:"none"}}>{v.l}</button>
            ))}
          </div>
        </div>
      </div>

      <main style={{maxWidth:1360,margin:"0 auto",padding:"14px 16px 80px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"8px 14px",background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:8}}>
          <span style={{fontSize:"11px",fontWeight:600,color:T.ink,fontFamily:F.body}}>Progress</span>
          <div style={{flex:1,height:4,borderRadius:2,background:T.bg,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${T.acc},#D97706)`,width:`${pct}%`,transition:"width 0.5s"}}/></div>
          <span style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono}}>{pct}%</span>
        </div>

        {isGuest&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"8px 14px",background:T.accLt,border:`1px solid ${T.accBdr}`,borderRadius:8,flexWrap:"wrap"}}>
          <span style={{fontSize:"12px",color:T.ink,fontFamily:F.body,flex:1,minWidth:150}}>Guest mode — data in this browser only.</span>
          <button onClick={onLogin} style={{padding:"4px 12px",borderRadius:5,border:"none",background:T.acc,color:"#fff",fontSize:"11px",fontFamily:F.body,fontWeight:600,cursor:"pointer"}}>Sign in to sync</button>
        </div>}

        {view==="kanban"?(
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:12,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>
            {STATUSES.map(s=>{const cr=filtered.filter(r=>r.status===s.id);return(
              <div key={s.id} style={{minWidth:0,flex:"0 0 82vw",maxWidth:290,background:T.bg,borderRadius:10,border:`1px solid ${T.bdrLt}`,display:"flex",flexDirection:"column",maxHeight:"calc(100vh - 220px)",scrollSnapAlign:"start"}}>
                <div style={{padding:"10px 12px",borderBottom:`1px solid ${T.bdrLt}`,display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/><span style={{fontSize:"12px",fontWeight:600,color:T.ink,fontFamily:F.body}}>{s.label}</span><span style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono,marginLeft:"auto"}}>{cr.length}</span>
                </div>
                <div style={{padding:5,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:5}}>
                  {cr.map(r=>(
                    <div key={r.id} onClick={()=>setSel(r)} style={{background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:7,padding:10,cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}><div><p style={{fontSize:"12px",fontWeight:600,color:T.ink,fontFamily:F.body,margin:0}}>{r.name}</p><p style={{fontSize:"10px",color:T.inkF,fontFamily:F.mono,margin:0}}>{r.owner}</p></div><Spark data={r.sparkline} w={32} h={10}/></div>
                      <div style={{display:"flex",gap:8,fontSize:"10px",color:T.inkF,fontFamily:F.mono,marginTop:5}}><span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:langColor(r.language)}}/>{r.language}</span><span>★{fmt(r.stars)}</span></div>
                    </div>
                  ))}
                  {cr.length===0&&<p style={{padding:12,textAlign:"center",fontSize:"11px",color:T.inkF,fontStyle:"italic"}}>Empty</p>}
                </div>
              </div>
            );})}
          </div>
        ):view==="list"?(
          <div style={{background:T.surface,borderRadius:10,border:`1px solid ${T.bdr}`,overflow:"auto"}}>
            <table style={{borderCollapse:"collapse",width:"100%",minWidth:480}}>
              <thead><tr style={{borderBottom:`1px solid ${T.bdr}`}}>
                {["Repo","Cat","Lang","","Stars","Saved"].map((h,i)=>(<th key={i} style={{padding:"7px 10px",fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,textAlign:i>=4?"right":i===3?"center":"left",background:T.bg}}>{h}</th>))}
              </tr></thead>
              <tbody>{filtered.map(r=>{const cat=CATEGORIES.find(c=>c.id===r.category);const st=STATUSES.find(s=>s.id===r.status);return(
                <tr key={r.id} onClick={()=>setSel(r)} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.surfHov} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 10px",borderBottom:`1px solid ${T.bdrLt}`}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:3,height:20,borderRadius:2,background:st.color}}/><span style={{fontSize:"13px",fontWeight:600,color:T.ink,fontFamily:F.body}}>{r.name}</span><span style={{fontSize:"10px",color:T.inkF,fontFamily:F.mono}}>{r.owner}</span></div></td>
                  <td style={{padding:"9px 8px",borderBottom:`1px solid ${T.bdrLt}`,fontSize:"10px",color:cat?.color,fontFamily:F.mono,fontWeight:600}}>{cat?.label}</td>
                  <td style={{padding:"9px 8px",borderBottom:`1px solid ${T.bdrLt}`}}><span style={{display:"flex",alignItems:"center",gap:3,fontSize:"10px",color:T.inkM,fontFamily:F.mono}}><span style={{width:6,height:6,borderRadius:"50%",background:langColor(r.language)}}/>{r.language}</span></td>
                  <td style={{padding:"9px 6px",borderBottom:`1px solid ${T.bdrLt}`,textAlign:"center"}}><Spark data={r.sparkline} w={40} h={10}/></td>
                  <td style={{padding:"9px 8px",borderBottom:`1px solid ${T.bdrLt}`,fontSize:"11px",color:T.inkM,fontFamily:F.mono,textAlign:"right"}}>★{fmt(r.stars)}</td>
                  <td style={{padding:"9px 10px",borderBottom:`1px solid ${T.bdrLt}`,fontSize:"10px",color:T.inkF,fontFamily:F.mono,textAlign:"right"}}>{ago(r.savedAt)}</td>
                </tr>);})}
              </tbody>
            </table>
          </div>
        ):(
          <div className="card-grid" style={{display:"grid",gap:12}}>
            {filtered.map(r=>{const cat=CATEGORIES.find(c=>c.id===r.category);const st=STATUSES.find(s=>s.id===r.status);return(
              <div key={r.id} onClick={()=>setSel(r)} style={{background:T.surface,borderRadius:11,cursor:"pointer",border:`1px solid ${T.bdr}`,overflow:"hidden",transition:"all 0.2s",boxShadow:`0 1px 3px ${T.shadow}`}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 30px ${T.shadowHov}`;e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 1px 3px ${T.shadow}`;e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{height:3,background:st.color}}/>
                <div style={{padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <div><p style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono,marginBottom:1}}>{r.owner}</p><h3 style={{fontFamily:F.display,fontSize:"19px",fontWeight:400,color:T.ink,lineHeight:1.15,margin:0}}>{r.name}</h3></div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                      <span style={{fontSize:"10px",fontWeight:600,fontFamily:F.mono,color:cat?.color,background:`${cat?.color}14`,padding:"2px 6px",borderRadius:3}}>{cat?.label}</span>
                      <Spark data={r.sparkline} w={40} h={12}/>
                    </div>
                  </div>
                  <p style={{fontSize:"12px",color:T.inkM,lineHeight:1.5,fontFamily:F.body,margin:"0 0 10px",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{r.aiSummary}</p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:10,fontSize:"11px",color:T.inkF,fontFamily:F.mono}}>
                      <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:langColor(r.language)}}/>{r.language}</span>
                      <span style={{color:T.inkM}}>★{fmt(r.stars)}</span>
                    </div>
                    {r.rating>0&&<span style={{fontSize:"10px",color:"#D97706",fontFamily:F.mono}}>{"★".repeat(r.rating)}</span>}
                  </div>
                </div>
              </div>);})}
          </div>
        )}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><p style={{fontFamily:F.display,fontSize:"22px",color:T.inkF}}>Nothing here</p></div>}
      </main>

      <button onClick={()=>setShowCap(true)} title="Add (N)" style={{position:"fixed",bottom:20,right:20,zIndex:90,width:48,height:48,borderRadius:14,border:"none",background:T.acc,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",fontWeight:300,lineHeight:1,boxShadow:`0 6px 20px ${T.acc}55`,transition:"all 0.2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>+</button>

      <div style={{position:"fixed",bottom:24,left:20,display:"flex",gap:8,fontSize:"10px",color:T.inkF,fontFamily:F.mono,opacity:0.4}}>
        <span style={{padding:"2px 5px",borderRadius:3,border:`1px solid ${T.bdr}`}}>/</span><span>search</span>
        <span style={{padding:"2px 5px",borderRadius:3,border:`1px solid ${T.bdr}`,marginLeft:4}}>N</span><span>new</span>
      </div>

      {showCap&&(
        <div onClick={()=>setShowCap(false)} style={{position:"fixed",inset:0,zIndex:1100,background:T.overlayHeavy,backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:14,width:"100%",maxWidth:460,boxShadow:T.modalShadow,position:"relative"}}>
            <button onClick={()=>setShowCap(false)} style={{position:"absolute",top:12,right:12,width:28,height:28,borderRadius:7,border:`1px solid ${T.bdr}`,background:T.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:T.inkM}}>✕</button>
            <div style={{padding:24}}>
              <h2 style={{fontFamily:F.display,fontSize:"24px",fontWeight:400,color:T.ink,marginBottom:14}}>Add to vault</h2>
              <input autoFocus placeholder="https://github.com/owner/repo" style={{width:"100%",padding:"11px 14px",borderRadius:8,border:`1.5px solid ${T.bdr}`,background:T.bg,color:T.ink,fontSize:"14px",fontFamily:F.body,outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=T.acc} onBlur={e=>e.target.style.borderColor=T.bdr}
                onKeyDown={e=>{if(e.key==="Enter"&&e.target.value){const m=e.target.value.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);if(m){setRepos(prev=>[{id:Date.now().toString(),url:e.target.value.trim(),name:m[2],owner:m[1],stars:Math.floor(Math.random()*40000),forks:Math.floor(Math.random()*3000),language:["Python","TypeScript","Rust","Go"][Math.floor(Math.random()*4)],license:"MIT",lastCommit:new Date().toISOString().split("T")[0],topics:[],category:"uncategorized",status:"inbox",tags:[],rating:null,notes:"",aiSummary:"Summary generating…",savedAt:new Date().toISOString(),readAt:null,sparkline:genSpark()},...prev]);setShowCap(false);}}}}
              />
              <p style={{fontSize:"11px",color:T.inkF,fontFamily:F.body,marginTop:6}}>Press Enter to add.</p>
            </div>
          </div>
        </div>
      )}

      {sel&&<DetailPanel T={T} sel={sel} setSel={setSel} repos={repos} setRepos={setRepos} />}
    </div>
  );
}

// ── Full Detail Panel ──
function DetailPanel({T,sel,setSel,repos,setRepos}) {
  const [tab,setTab]=useState("overview");
  const [notes,setNotes]=useState(sel.notes||"");
  const [status,setStatus]=useState(sel.status);
  const [category,setCategory]=useState(sel.category);
  const [rating,setRating]=useState(sel.rating||0);
  const [tags,setTags]=useState(sel.tags||[]);
  const [showTags,setShowTags]=useState(false);
  const [showNotes,setShowNotes]=useState(!!sel.notes);
  const TAG_PRESETS=["weekend-project","work","reference","urgent","experimental","stable","lightweight"];

  useEffect(() => {
    setTimeout(() => {
      setNotes(sel.notes||"");
      setStatus(sel.status);
      setCategory(sel.category);
      setRating(sel.rating||0);
      setTags(sel.tags||[]);
      setShowNotes(!!sel.notes);
      setTab("overview");
    }, 0);
  }, [sel.id]);

  const saveToRepos = useCallback((overrides={})=>{
    const u={...sel,...overrides,readAt:sel.readAt||new Date().toISOString()};
    setRepos(p=>p.map(r=>r.id===u.id?u:r));
  }, [sel, setRepos]);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    saveToRepos({status, category, rating, tags});
  }, [status, category, rating, tags, saveToRepos]);
  const saveNotes=()=>saveToRepos({notes,status,category,rating,tags});

  const cat=CATEGORIES.find(c=>c.id===category);
  const st=STATUSES.find(s=>s.id===status);
  const trend=sel.sparkline?(sel.sparkline[sel.sparkline.length-1]-sel.sparkline[0]):0;
  const trendLabel=trend>2?"Trending up":trend<-2?"Declining":"Stable";
  const trendColor=trend>2?T.sparkUp:trend<-2?T.sparkDown:T.sparkFlat;

  // Similar repos
  const similar=repos.filter(r=>r.id!==sel.id&&(r.category===sel.category||r.topics?.some(t=>sel.topics?.includes(t)))).slice(0,3);

  // Quick advance
  const stIdx=STATUSES.findIndex(s=>s.id===status);
  const nextSt=stIdx<STATUSES.length-1?STATUSES[stIdx+1]:null;
  const prevSt=stIdx>0?STATUSES[stIdx-1]:null;

  // Simple README
  const readmeText=`# ${sel.name}\n\n${sel.aiSummary}\n\n## Quick Start\n\nRefer to the GitHub repository for installation instructions and documentation.\n\n## Links\n\n- Repository: github.com/${sel.owner}/${sel.name}\n- License: ${sel.license}\n- Stars: ${fmt(sel.stars)}`;

  const tabBtn=(id)=>({padding:"7px 14px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:tab===id?600:400,fontFamily:F.body,background:tab===id?`${T.acc}18`:"transparent",color:tab===id?T.acc:T.inkF,borderBottom:tab===id?`2px solid ${T.acc}`:"2px solid transparent",transition:"all 0.15s",paddingBottom:9});

  return (
    <div onClick={()=>setSel(null)} style={{position:"fixed",inset:0,zIndex:1000,background:T.overlay,backdropFilter:"blur(3px)",display:"flex",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:580,height:"100%",background:T.surface,borderLeft:`1px solid ${T.bdr}`,overflowY:"auto",boxShadow:T.panelShadow}}>

        {/* Sticky header */}
        <div style={{position:"sticky",top:0,zIndex:10,background:T.headerBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.bdrLt}`,padding:"14px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono,marginBottom:2}}>{sel.owner}</p>
              <h2 style={{fontFamily:F.display,fontSize:"24px",fontWeight:400,color:T.ink,lineHeight:1.1,margin:0}}>{sel.name}</h2>
            </div>
            <div style={{display:"flex",gap:5,flexShrink:0}}>
              <a href={`https://github.com/${sel.owner}/${sel.name}`} target="_blank" rel="noopener noreferrer" style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.bdr}`,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",color:T.inkM,textDecoration:"none"}}>↗</a>
              <button onClick={()=>setSel(null)} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.bdr}`,background:T.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",color:T.inkM}}>✕</button>
            </div>
          </div>

          {/* Meta + sparkline */}
          <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center",fontSize:"11px",fontFamily:F.mono,color:T.inkM,flexWrap:"wrap"}}>
            <span><span style={{color:T.acc}}>★</span>{fmt(sel.stars)}</span>
            <span>⑂{fmt(sel.forks)}</span>
            <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:6,height:6,borderRadius:"50%",background:langColor(sel.language)}}/>{sel.language}</span>
            <span style={{color:T.inkF}}>{sel.license}</span>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
              <Spark data={sel.sparkline} w={44} h={14}/>
              <span style={{fontSize:"9px",color:trendColor,fontWeight:600}}>{trendLabel}</span>
            </div>
          </div>

          {/* Quick status advance */}
          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
            {prevSt&&<button onClick={()=>setStatus(prevSt.id)} style={{padding:"4px 8px",borderRadius:5,border:`1px solid ${T.bdr}`,background:"transparent",color:T.inkF,cursor:"pointer",fontSize:"10px",fontFamily:F.body}}>← {prevSt.label}</button>}
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
              {STATUSES.map((s,i)=>(
                <div key={s.id} onClick={()=>setStatus(s.id)} style={{cursor:"pointer",width:stIdx>=i?14:7,height:5,borderRadius:3,background:stIdx>=i?st.color:T.bdr,transition:"all 0.2s"}} title={s.label}/>
              ))}
            </div>
            {nextSt&&<button onClick={()=>setStatus(nextSt.id)} style={{padding:"4px 8px",borderRadius:5,border:"none",background:T.acc,color:"#fff",cursor:"pointer",fontSize:"10px",fontFamily:F.body,fontWeight:600}}>{nextSt.label} →</button>}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setTab("overview")} style={tabBtn("overview","Overview")}>Overview</button>
            <button onClick={()=>setTab("readme")} style={tabBtn("readme","README")}>README</button>
          </div>
        </div>

        {/* Tab content */}
        <div style={{padding:"16px 20px"}}>

          {tab==="overview"&&(<>
            {/* AI Summary */}
            <div style={{background:T.accLt,border:`1px solid ${T.accBdr}`,borderRadius:8,padding:"12px 14px",marginBottom:14}}>
              <p style={{fontSize:"10px",fontWeight:700,color:T.acc,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:4}}>AI SUMMARY</p>
              <p style={{fontSize:"13px",color:T.ink,lineHeight:1.7,fontFamily:F.body,margin:0}}>{sel.aiSummary}</p>
            </div>

            {/* Compact 2x2 settings */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <p style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:4}}>STATUS</p>
                <select value={status} onChange={e=>setStatus(e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:`1.5px solid ${T.bdr}`,background:T.bg,color:st?.color,fontSize:"12px",fontFamily:F.body,fontWeight:600,outline:"none",cursor:"pointer",width:"100%"}}>
                  {STATUSES.map(s=><option key={s.id} value={s.id} style={{color:T.ink}}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:4}}>CATEGORY</p>
                <select value={category} onChange={e=>setCategory(e.target.value)} style={{padding:"6px 8px",borderRadius:6,border:`1.5px solid ${T.bdr}`,background:T.bg,color:cat?.color,fontSize:"12px",fontFamily:F.body,fontWeight:600,outline:"none",cursor:"pointer",width:"100%"}}>
                  {CATEGORIES.map(c=><option key={c.id} value={c.id} style={{color:T.ink}}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:4}}>RATING</p>
                <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setRating(n===rating?0:n)} style={{background:"none",border:"none",cursor:"pointer",padding:"1px",fontSize:"16px",color:n<=rating?"#D97706":T.bdr,lineHeight:1}}>★</button>
                ))}</div>
              </div>
              <div>
                <p style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:4}}>TIMELINE</p>
                <p style={{fontSize:"11px",color:T.inkM,fontFamily:F.mono}}>Saved {ago(sel.savedAt)}</p>
                <p style={{fontSize:"11px",color:T.inkM,fontFamily:F.mono}}>Read {ago(sel.readAt)}</p>
              </div>
            </div>

            {/* Tags */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
                <span style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginRight:4}}>TAGS</span>
                {tags.map(t=>(
                  <span key={t} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:5,background:T.bg,border:`1px solid ${T.bdr}`,color:T.inkM,fontSize:"11px",fontFamily:F.mono}}>
                    {t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} style={{background:"none",border:"none",color:T.inkF,cursor:"pointer",padding:0,fontSize:11,lineHeight:1}}>×</button>
                  </span>
                ))}
                <div style={{position:"relative"}}>
                  <button onClick={()=>setShowTags(!showTags)} style={{padding:"2px 8px",borderRadius:5,border:`1px dashed ${T.bdr}`,background:"transparent",color:T.inkF,cursor:"pointer",fontSize:"11px",fontFamily:F.body}}>+</button>
                  {showTags&&(<div style={{position:"absolute",top:"100%",left:0,marginTop:4,background:T.surface,border:`1px solid ${T.bdr}`,borderRadius:8,padding:4,boxShadow:T.modalShadow,zIndex:20,minWidth:140}}>
                    {TAG_PRESETS.filter(t=>!tags.includes(t)).map(t=>(
                      <button key={t} onClick={()=>{setTags([...tags,t]);setShowTags(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"4px 8px",borderRadius:4,border:"none",background:"transparent",color:T.inkM,cursor:"pointer",fontSize:"11px",fontFamily:F.mono}}
                        onMouseEnter={e=>e.currentTarget.style.background=T.surfHov}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t}</button>
                    ))}
                  </div>)}
                </div>
              </div>
            </div>

            {/* Topics */}
            {sel.topics?.length>0&&(<div style={{marginBottom:12,display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
              <span style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginRight:4}}>TOPICS</span>
              {sel.topics.map(t=><span key={t} style={{padding:"2px 8px",borderRadius:12,background:T.bg,color:T.inkF,fontSize:"11px",fontFamily:F.mono}}>{t}</span>)}
            </div>)}

            {/* Notes — collapsible */}
            <div style={{marginBottom:14}}>
              <button onClick={()=>setShowNotes(!showNotes)} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:showNotes?6:0}}>
                <span style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em"}}>NOTES</span>
                <span style={{fontSize:"10px",color:T.inkF,transform:showNotes?"rotate(90deg)":"rotate(0)",transition:"transform 0.2s"}}>▶</span>
                {!showNotes&&notes&&<span style={{fontSize:"11px",color:T.inkM,fontFamily:F.body,marginLeft:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{notes}</span>}
              </button>
              {showNotes&&<textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={saveNotes} placeholder="What's this for? When would you use it?" rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1.5px solid ${T.bdr}`,background:T.bg,color:T.ink,fontSize:"12px",fontFamily:F.body,outline:"none",resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=T.acc}/>}
            </div>

            {/* Similar repos */}
            {similar.length>0&&(<div>
              <p style={{fontSize:"10px",fontWeight:700,color:T.inkF,fontFamily:F.mono,letterSpacing:"0.06em",marginBottom:6}}>RELATED IN YOUR VAULT</p>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {similar.map(r=>{
                  const sc=CATEGORIES.find(c=>c.id===r.category);
                  return(
                    <div key={r.id} onClick={()=>setSel(r)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:6,background:T.bg,border:`1px solid ${T.bdrLt}`,cursor:"pointer",transition:"border-color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=T.acc}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=T.bdrLt}>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:"12px",fontWeight:600,color:T.ink,fontFamily:F.body}}>{r.name}</span>
                        <span style={{fontSize:"10px",color:T.inkF,fontFamily:F.mono,marginLeft:6}}>{r.owner}</span>
                      </div>
                      <Spark data={r.sparkline} w={36} h={10}/>
                      <span style={{fontSize:"10px",color:sc?.color,fontFamily:F.mono,fontWeight:600}}>{sc?.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>)}
          </>)}

          {tab==="readme"&&(<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <p style={{fontSize:"11px",color:T.inkF,fontFamily:F.mono}}>README.md</p>
              <a href={`https://github.com/${sel.owner}/${sel.name}#readme`} target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",color:T.acc,textDecoration:"none",fontFamily:F.mono}}>View on GitHub ↗</a>
            </div>
            <div style={{background:T.bg,border:`1px solid ${T.bdrLt}`,borderRadius:8,padding:"16px 18px"}}>
              {readmeText.split("\n").map((line,i)=>{
                if(line.startsWith("# ")) return <h1 key={i} style={{fontFamily:F.display,fontSize:"22px",fontWeight:400,color:T.ink,margin:"16px 0 6px"}}>{line.slice(2)}</h1>;
                if(line.startsWith("## ")) return <h2 key={i} style={{fontFamily:F.display,fontSize:"18px",fontWeight:400,color:T.ink,margin:"14px 0 4px",borderBottom:`1px solid ${T.bdrLt}`,paddingBottom:6}}>{line.slice(3)}</h2>;
                if(line.startsWith("- ")) return <li key={i} style={{fontSize:"13px",color:T.inkM,fontFamily:F.body,lineHeight:1.6,marginLeft:16,marginBottom:2}}>{line.slice(2)}</li>;
                if(line.trim()==="") return <div key={i} style={{height:6}}/>;
                return <p key={i} style={{fontSize:"13px",color:T.inkM,fontFamily:F.body,lineHeight:1.6,margin:"3px 0"}}>{line}</p>;
              })}
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ── App Root ──
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(true);
  const isGuest = !user || user.isGuest;
  const T = dark ? PDark : PLight;

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg};color:${T.ink};transition:background 0.3s,color 0.3s;}
        ::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:3px;}
        ::selection{background:${T.acc}22;}input::placeholder,textarea::placeholder{color:${T.inkF};}select option{background:${T.surface};color:${T.ink};}
        table{border-collapse:collapse;width:100%;}
        .feat-grid{grid-template-columns:1fr 1fr;}
        .card-grid{grid-template-columns:1fr;}
        .hide-mobile{display:none;}
        @media(min-width:640px){.card-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));}.hide-mobile{display:inline;}}
        @media(min-width:768px){.feat-grid{grid-template-columns:repeat(3,1fr);}}
      `}</style>
      {page==="landing"&&<LandingPage T={T} dark={dark} setDark={setDark} onStart={()=>{setUser({name:"Guest",avatar:"?",isGuest:true});setPage("vault");}} onLogin={()=>setPage("auth")}/>}
      {page==="auth"&&<AuthPage T={T} onLogin={u=>{setUser(u);setPage("vault");}} onSkip={()=>{setUser({name:"Guest",avatar:"?",isGuest:true});setPage("vault");}}/>}
      {page==="vault"&&<VaultApp T={T} dark={dark} setDark={setDark} user={user} isGuest={isGuest} onLogout={()=>{setUser(null);setPage("landing");}} onLogin={()=>setPage("auth")}/>}
    </div>
  );
}
