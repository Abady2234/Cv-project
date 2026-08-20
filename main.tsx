import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {ArrowRight,Check,Download,FileText,LinkedinIcon,Lock,Sparkles,Upload,Wand2} from "lucide-react";
import "./styles.css";

type CV={name:string;title:string;location:string;email:string;phone:string;linkedin:string;summary:string;experience:{role:string;company:string;dates:string;bullets:string[]}[];education:{school:string;degree:string;dates:string}[];skills:string[];certifications:string[]};

const blank:CV={name:"",title:"",location:"",email:"",phone:"",linkedin:"",summary:"",experience:[],education:[],skills:[],certifications:[]};

function App(){
 const [url,setUrl]=useState(""); const [file,setFile]=useState<File|null>(null); const [cv,setCv]=useState<CV|null>(null);
 const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [source,setSource]=useState("");
 const [template,setTemplate]=useState("modern");

 async function generate(){
   setError(""); setLoading(true);
   try{
     let r:Response;
     if(file){
       const fd=new FormData(); fd.append("file",file);
       r=await fetch("/api/generate/from-pdf",{method:"POST",body:fd});
     }else{
       if(!/^https?:\/\/(www\.)?linkedin\.com\/in\/[^/]+/i.test(url.trim())) throw new Error("Enter a valid LinkedIn profile URL.");
       r=await fetch("/api/generate/from-url",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});
     }
     const data=await r.json(); if(!r.ok) throw new Error(data.error||"Generation failed.");
     setCv(data.cv); setSource(file?"LinkedIn PDF":url);
   }catch(e:any){setError(e.message||"Something went wrong.");}finally{setLoading(false);}
 }
 async function download(){
   if(!cv)return;
   const r=await fetch("/api/cv/pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cv,template})});
   const blob=await r.blob(); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="cvforge-cv.pdf"; a.click(); URL.revokeObjectURL(a.href);
 }
 if(cv)return <Editor cv={cv} setCv={setCv} template={template} setTemplate={setTemplate} source={source} download={download}/>;
 return <main className="landing">
   <header><div className="brand"><span><FileText size={17}/></span>CVForge</div><div className="secure"><Lock size={13}/> Private by design</div></header>
   <section className="hero">
    <div className="copy"><div className="badge"><Sparkles size={14}/> AI-powered CV builder</div>
    <h1>LinkedIn profile.<br/><em>Professional CV.</em><br/>One step.</h1>
    <p>Paste your LinkedIn profile URL, or upload the PDF exported from LinkedIn. CVForge turns your real experience into an ATS-friendly CV.</p>
    <div className="card">
      <label>LinkedIn profile URL</label>
      <div className="input"><Linkedin size={18}/><input value={url} onChange={e=>{setUrl(e.target.value);setFile(null)}} placeholder="https://www.linkedin.com/in/your-name"/></div>
      <div className="or"><span/>OR<span/></div>
      <label className="upload"><Upload size={17}/><span>{file?file.name:"Upload LinkedIn PDF"}</span><input type="file" accept="application/pdf" onChange={e=>{setFile(e.target.files?.[0]||null);setUrl("")}}/></label>
      <button onClick={generate} disabled={loading}>{loading?<><span className="spinner"/>Generating...</>:<>Generate my CV <ArrowRight size={17}/></>}</button>
      {error&&<div className="error">{error}</div>}
      <small><Lock size={12}/> Never enter your LinkedIn password. We only process data you provide or authorize.</small>
    </div>
    <div className="checks"><span><Check/> ATS-friendly</span><span><Check/> AI rewritten</span><span><Check/> PDF export</span></div></div>
    <div className="preview"><div className="paper"><h2>Alex Morgan</h2><b>Product & Software Specialist</b><p>Riyadh, Saudi Arabia · alex@email.com</p><hr/><h4>PROFILE</h4><div className="line wide"/><div className="line"/><h4>EXPERIENCE</h4><strong>Product Specialist</strong><i>2024 — Present</i><div className="line wide"/><div className="line wide"/><div className="line"/><strong>Software Intern</strong><i>2023 — 2024</i><div className="line wide"/><h4>EDUCATION</h4><strong>B.Sc. Computer Science</strong></div><div className="float"><Check size={14}/> CV ready for applications</div></div>
   </section>
   <footer>CVForge · Your data stays yours.</footer>
 </main>
}

function Editor({cv,setCv,template,setTemplate,source,download}:{cv:CV;setCv:(x:CV)=>void;template:string;setTemplate:(x:string)=>void;source:string;download:()=>void}){
 const update=(k:keyof CV,v:any)=>setCv({...cv,[k]:v});
 return <div className="editor"><header><div className="brand"><span><FileText size={17}/></span>CVForge</div><button onClick={download}><Download size={16}/> Download PDF</button></header>
 <div className="editor-top"><div><small>GENERATED CV</small><h1>Review & edit</h1><p>Source: {source}</p></div><select value={template} onChange={e=>setTemplate(e.target.value)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="executive">Executive</option></select></div>
 <div className="grid"><aside>
  <Panel title="Personal details"><Input l="Full name" v={cv.name} f={v=>update("name",v)}/><Input l="Professional title" v={cv.title} f={v=>update("title",v)}/><Input l="Location" v={cv.location} f={v=>update("location",v)}/><Input l="Email" v={cv.email} f={v=>update("email",v)}/><Input l="Phone" v={cv.phone} f={v=>update("phone",v)}/></Panel>
  <Panel title="Summary"><textarea value={cv.summary} onChange={e=>update("summary",e.target.value)}/><button className="ai"><Wand2 size={14}/> Improve wording with AI</button></Panel>
  <Panel title="Skills"><div className="chips">{cv.skills.map((s,i)=><span key={i}>{s}</span>)}</div></Panel>
  <Panel title="Experience">{cv.experience.map((e,i)=><div className="edit-item" key={i}><b>{e.role} · {e.company}</b><small>{e.dates}</small><textarea value={e.bullets.join("\n")} onChange={x=>{const a=[...cv.experience];a[i]={...e,bullets:x.target.value.split("\n").filter(Boolean)};update("experience",a)}}/></div>)}</Panel>
 </aside><section className={"stage "+template}><div className="cv">
   <div className="cvname"><h2>{cv.name||"Your Name"}</h2><b>{cv.title}</b><small>{[cv.location,cv.email,cv.phone].filter(Boolean).join(" · ")}</small></div>
   <Section t="PROFILE"><p>{cv.summary}</p></Section>
   {cv.experience.length>0&&<Section t="EXPERIENCE">{cv.experience.map((e,i)=><div className="job" key={i}><div><strong>{e.role}</strong><small>{e.dates}</small></div><em>{e.company}</em><ul>{e.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul></div>)}</Section>}
   {cv.education.length>0&&<Section t="EDUCATION">{cv.education.map((e,i)=><div className="job" key={i}><div><strong>{e.degree}</strong><small>{e.dates}</small></div><em>{e.school}</em></div>)}</Section>}
   {cv.skills.length>0&&<Section t="SKILLS"><p>{cv.skills.join(" · ")}</p></Section>}
   {cv.certifications.length>0&&<Section t="CERTIFICATIONS"><p>{cv.certifications.join(" · ")}</p></Section>}
 </div></section></div></div>
}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <div className="panel"><h3>{title}</h3>{children}</div>}
function Input({l,v,f}:{l:string;v:string;f:(x:string)=>void}){return <label>{l}<input value={v} onChange={e=>f(e.target.value)}/></label>}
function Section({t,children}:{t:string;children:React.ReactNode}){return <section className="cvsec"><h3>{t}</h3>{children}</section>}
createRoot(document.getElementById("root")!).render(<App/>);
