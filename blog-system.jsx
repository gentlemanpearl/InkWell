import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ─── IMAGE HELPER ────────────────────────────────────────────
// picsum.photos works without CORS issues inside artifacts
const PIC = (id, w=800, h=480) => `https://picsum.photos/id/${id}/${w}/${h}`;

// ─── SEED DATA (multi-author, rich content) ──────────────────
const SEED_USERS = [
  {_id:"u_alice",  name:"Alice Monroe",   email:"alice@inkwell.io",  password:"demo", avatar:"A", bio:"Tech writer & open source advocate", createdAt:"2024-01-10T00:00:00.000Z"},
  {_id:"u_james",  name:"James Okafor",   email:"james@inkwell.io",  password:"demo", avatar:"J", bio:"Philosophy & culture essayist", createdAt:"2024-02-01T00:00:00.000Z"},
  {_id:"u_priya",  name:"Priya Sharma",   email:"priya@inkwell.io",  password:"demo", avatar:"P", bio:"UX designer & design systems nerd", createdAt:"2024-02-15T00:00:00.000Z"},
  {_id:"u_marco",  name:"Marco Bellini",  email:"marco@inkwell.io",  password:"demo", avatar:"M", bio:"Startup founder, coffee addict", createdAt:"2024-03-01T00:00:00.000Z"},
  {_id:"u_sara",   name:"Sara Lindqvist", email:"sara@inkwell.io",   password:"demo", avatar:"S", bio:"Creative writing & poetry", createdAt:"2024-03-10T00:00:00.000Z"},
];

const SEED_POSTS = [
  {
    _id:"p1", slug:"art-of-clear-writing",
    title:"The Art of Clear Writing",
    coverImage: PIC(3059),
    excerpt:"Great writing isn't about complex words — it's about saying exactly what you mean.",
    content:"Clear writing is not about using simple words — it's about using the right words. Every sentence should earn its place. Cut anything that doesn't move the reader forward.\n\nGood writing feels effortless to read but is hard to produce. It demands revision, patience, and a willingness to cut your favourite lines.\n\nThe best writers are ruthless editors of their own work. They understand that clarity is a gift to the reader, not a concession to laziness.\n\nStart with a draft. Then cut it in half. Then cut it again. What remains will almost always be better.",
    author:{_id:"u_alice", name:"Alice Monroe"}, tags:["writing","craft","productivity"],
    createdAt:new Date(Date.now()-86400000*1).toISOString(), comments:[
      {_id:"c1",text:"This changed how I approach my weekly newsletter. Cutting ruthlessly is so hard but so worth it.",author:{_id:"u_james",name:"James Okafor"},createdAt:new Date(Date.now()-3600000*5).toISOString()},
      {_id:"c2",text:"The 'earn its place' framing is gold. Sharing this with my whole team.",author:{_id:"u_priya",name:"Priya Sharma"},createdAt:new Date(Date.now()-3600000*2).toISOString()},
    ], likes:89
  },
  {
    _id:"p2", slug:"design-systems-scale",
    title:"Building Design Systems That Actually Scale",
    coverImage: PIC(180),
    excerpt:"Most design systems fail not from bad components, but from poor adoption strategies.",
    content:"A design system is only as good as its adoption. You can build the most beautiful, well-documented component library in the world — and it will collect dust if your team doesn't use it.\n\nThe key insight most teams miss: design systems are products. They need product thinking — user research, onboarding, versioning, changelogs, and advocates.\n\nStart small. Pick the five components your team uses most often. Make those perfect before adding more. The hardest part isn't building — it's maintaining trust with your consumers.\n\nTokens first, components second. If your design tokens are solid, components follow naturally. If they aren't, no amount of clever components will save you.",
    author:{_id:"u_priya", name:"Priya Sharma"}, tags:["design","ux","systems"],
    createdAt:new Date(Date.now()-86400000*2).toISOString(), comments:[
      {_id:"c3",text:"The 'design systems as products' framing completely reframed how I think about our DS work.",author:{_id:"u_marco",name:"Marco Bellini"},createdAt:new Date(Date.now()-3600000*10).toISOString()},
    ], likes:134
  },
  {
    _id:"p3", slug:"javascript-2025",
    title:"JavaScript in 2025: What Actually Matters",
    coverImage: PIC(1181),
    excerpt:"The ecosystem changes fast. Here's what will still matter in five years.",
    content:"JavaScript continues to evolve at a remarkable pace. From React Server Components to the rise of edge computing, the ecosystem rewards those who stay curious.\n\nBut here's the truth most tutorials won't tell you: the fundamentals have not changed. The DOM, closures, the event loop, promises — these are the bedrock. Master them and no framework shift will shake you.\n\nWhat should you focus on in 2025? TypeScript is no longer optional for serious projects. Edge functions are eating server-side rendering. And AI-assisted coding has permanently changed developer productivity.\n\nThe developers who thrive aren't the ones who know the most frameworks. They're the ones who understand why frameworks exist — and when not to use them.",
    author:{_id:"u_alice", name:"Alice Monroe"}, tags:["javascript","tech","coding"],
    createdAt:new Date(Date.now()-86400000*3).toISOString(), comments:[], likes:61
  },
  {
    _id:"p4", slug:"philosophy-of-time",
    title:"We Are Terrible at Understanding Time",
    coverImage: PIC(659),
    excerpt:"Our intuitions about past and future are almost entirely wrong. Here's why.",
    content:"Humans are uniquely bad at thinking about time. We overestimate how much we'll change in the future, underestimate how much we've changed in the past, and consistently misremember the sequence of events that shaped us.\n\nPsychologists call this 'the end of history illusion' — the feeling that you've finally arrived at the person you'll always be, while recognizing that your past self was a work in progress.\n\nThe philosophical implications are profound. If our sense of personal continuity is itself a kind of story we tell — a narrative stitched together from unreliable memories — then who, exactly, are we protecting when we act in self-interest?\n\nPerhaps the most honest thing we can say is this: we are temporal creatures with spatial intuitions, forever trying to map time onto a landscape it doesn't fit.",
    author:{_id:"u_james", name:"James Okafor"}, tags:["philosophy","psychology","culture"],
    createdAt:new Date(Date.now()-86400000*4).toISOString(), comments:[
      {_id:"c4",text:"The 'end of history illusion' blew my mind when I first read about it. Great piece.",author:{_id:"u_sara",name:"Sara Lindqvist"},createdAt:new Date(Date.now()-3600000*20).toISOString()},
      {_id:"c5",text:"Beautifully written. The last paragraph is one of the best things I've read this year.",author:{_id:"u_alice",name:"Alice Monroe"},createdAt:new Date(Date.now()-3600000*8).toISOString()},
    ], likes:212
  },
  {
    _id:"p5", slug:"building-in-public",
    title:"Why I Stopped Being Afraid to Build in Public",
    coverImage: PIC(450),
    excerpt:"Sharing your process before the product is ready feels terrifying. Then it becomes your greatest growth lever.",
    content:"I spent two years building my startup in private. I was convinced the idea would be stolen, or worse — laughed at. I worked in silence, launched to silence, and got silence in return.\n\nThe second time, I shared everything from day one. Revenue numbers. Failed experiments. Embarrassing pivots. The community that formed around honesty was worth ten times the investors I failed to impress with polish.\n\nBuilding in public isn't a marketing tactic. It's a commitment to learning faster by making your failures visible. The people who laugh aren't your customers. The people who follow along through the mess — those are.\n\nStart with one honest post a week. What you tried, what broke, what you learned. The internet rewards authenticity with compound interest.",
    author:{_id:"u_marco", name:"Marco Bellini"}, tags:["startup","growth","founders"],
    createdAt:new Date(Date.now()-86400000*5).toISOString(), comments:[
      {_id:"c6",text:"This is exactly what I needed to read before my own launch. Thank you.",author:{_id:"u_priya",name:"Priya Sharma"},createdAt:new Date(Date.now()-3600000*30).toISOString()},
    ], likes:178
  },
  {
    _id:"p6", slug:"on-silence",
    title:"On Silence: A Love Letter to Doing Nothing",
    coverImage: PIC(577),
    excerpt:"In a world optimized for output, the most radical act is to sit quietly and think.",
    content:"There's a particular quality to a Tuesday morning with nowhere to be. The light comes through differently. The coffee tastes different. You notice that the tree outside your window has been slowly growing for years and you've never once stopped to watch it.\n\nWe have built a civilization around the terror of stillness. Every silence must be filled with a podcast, a notification, a task. We have confused busyness with aliveness.\n\nThe contemplative traditions — Buddhist, Stoic, Christian mystical — all converge on the same uncomfortable truth: most of what we call productivity is avoidance. We work to escape the fundamental strangeness of existing.\n\nI'm not advocating for laziness. I'm advocating for a few minutes each day when you let the world be exactly as it is, without trying to improve or document or optimize it. That's where everything that matters actually lives.",
    author:{_id:"u_sara", name:"Sara Lindqvist"}, tags:["mindfulness","culture","writing"],
    createdAt:new Date(Date.now()-86400000*6).toISOString(), comments:[
      {_id:"c7",text:"Reading this on a Tuesday morning with nowhere to be. Incredible timing.",author:{_id:"u_james",name:"James Okafor"},createdAt:new Date(Date.now()-3600000*2).toISOString()},
      {_id:"c8",text:"I needed this so much. Bookmarked.",author:{_id:"u_marco",name:"Marco Bellini"},createdAt:new Date(Date.now()-3600000*1).toISOString()},
    ], likes:305
  },
  {
    _id:"p7", slug:"typography-fundamentals",
    title:"Typography Fundamentals Every Designer Must Know",
    coverImage: PIC(26),
    excerpt:"Good typography is invisible. Bad typography is all you can see.",
    content:"Typography is the backbone of visual design, yet it's the most commonly overlooked discipline. Most designers know how to choose a font. Far fewer understand why certain combinations feel right and others feel wrong.\n\nThe hierarchy rule: establish clear size relationships between headings, subheadings, body, and captions. A ratio of 1.25 to 1.618 (the golden ratio) between steps creates natural visual rhythm.\n\nLine length matters more than most designers realize. Between 45 and 75 characters per line is the comfortable reading range for body text. Too narrow creates choppy rhythm; too wide exhausts the eye.\n\nWhitespace is not empty space. It's the breathing room that gives text clarity and weight. The best typographers use whitespace as actively as they use letterforms.\n\nFinally: learn to read like a reader, not a designer. Set your design aside, come back tomorrow, and read it as text. Does it communicate, or does it just look good? The answer will surprise you.",
    author:{_id:"u_priya", name:"Priya Sharma"}, tags:["design","typography","craft"],
    createdAt:new Date(Date.now()-86400000*7).toISOString(), comments:[], likes:97
  },
  {
    _id:"p8", slug:"how-to-think",
    title:"Nobody Teaches You How to Think",
    coverImage: PIC(355),
    excerpt:"School gives you information. It rarely gives you tools to evaluate it.",
    content:"We spend twelve or more years in formal education learning facts, formulas, and frameworks. Almost none of it teaches the underlying skill that determines whether any of it is useful: how to think.\n\nCritical thinking is not skepticism. It's the disciplined practice of evaluating claims against evidence, recognizing logical fallacies, and holding your own beliefs provisionally — subject to revision.\n\nThe most important thinking tool is the question 'how do I know this?' Not as a rhetorical challenge, but as a genuine inquiry. Chase the answer. Find the primary source. Notice when you can't.\n\nRead people who disagree with you — not to be converted, but to understand the strongest version of the opposing argument. This is called steelmanning, and it's the mark of an intellectually honest mind.\n\nThink in writing. The act of putting ideas on paper forces a precision that thinking in your head never requires. You'll discover half your beliefs are vaguer than you realized.",
    author:{_id:"u_james", name:"James Okafor"}, tags:["philosophy","education","thinking"],
    createdAt:new Date(Date.now()-86400000*8).toISOString(), comments:[
      {_id:"c9",text:"'Think in writing' changed my life when I started doing it seriously.",author:{_id:"u_alice",name:"Alice Monroe"},createdAt:new Date(Date.now()-3600000*15).toISOString()},
    ], likes:188
  },
];

// ─── DB ──────────────────────────────────────────────────────
const DB = {
  users: (() => {
    const stored = JSON.parse(localStorage.getItem("blog_users") || "[]");
    // Merge seed users (don't duplicate)
    const merged = [...SEED_USERS];
    stored.forEach(u => { if(!merged.find(m=>m._id===u._id)) merged.push(u); });
    return merged;
  })(),
  posts: (() => {
    const stored = localStorage.getItem("blog_posts");
    if(stored) {
      const parsed = JSON.parse(stored);
      // If stored posts don't include seed posts, merge
      const merged = [...SEED_POSTS];
      parsed.forEach(p => { if(!merged.find(m=>m._id===p._id)) merged.push(p); });
      return merged;
    }
    return [...SEED_POSTS];
  })(),
  save(){
    localStorage.setItem("blog_users", JSON.stringify(this.users));
    localStorage.setItem("blog_posts", JSON.stringify(this.posts));
  }
};

const api = {
  signup(name,email,password){
    if(DB.users.find(u=>u.email===email))throw new Error("Email already registered.");
    const user={_id:"u_"+Date.now(),name,email,password,bio:"",avatar:name[0].toUpperCase(),createdAt:new Date().toISOString()};
    DB.users.push(user);DB.save();
    const token=btoa(JSON.stringify({_id:user._id,exp:Date.now()+86400000*7}));
    return{token,user:{...user,password:undefined}};
  },
  login(email,password){
    const user=DB.users.find(u=>u.email===email&&u.password===password);
    if(!user)throw new Error("Invalid email or password.");
    const token=btoa(JSON.stringify({_id:user._id,exp:Date.now()+86400000*7}));
    return{token,user:{...user,password:undefined}};
  },
  verifyToken(token){
    try{const p=JSON.parse(atob(token));if(p.exp<Date.now())throw 0;const u=DB.users.find(u=>u._id===p._id);if(!u)throw 0;return{...u,password:undefined};}catch{return null;}
  },
  getPosts(page=1,limit=6,tag=null){
    let posts=[...DB.posts].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(tag)posts=posts.filter(p=>p.tags.includes(tag));
    const total=posts.length;
    return{posts:posts.slice((page-1)*limit,page*limit),total,pages:Math.ceil(total/limit)};
  },
  getPost(slug){const p=DB.posts.find(p=>p.slug===slug);if(!p)throw new Error("Not found");return p;},
  getMyPosts(uid){return DB.posts.filter(p=>p.author._id===uid).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));},
  createPost(userId,data){
    const user=DB.users.find(u=>u._id===userId);if(!user)throw new Error("Unauthorized");
    const slug=data.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")+"-"+Date.now();
    const post={_id:"p_"+Date.now(),...data,slug,author:{_id:user._id,name:user.name},createdAt:new Date().toISOString(),comments:[],likes:0};
    DB.posts.unshift(post);DB.save();return post;
  },
  updatePost(userId,postId,data){
    const i=DB.posts.findIndex(p=>p._id===postId);if(i===-1)throw new Error("Not found");
    if(DB.posts[i].author._id!==userId)throw new Error("Forbidden");
    DB.posts[i]={...DB.posts[i],...data};DB.save();return DB.posts[i];
  },
  deletePost(userId,postId){
    const i=DB.posts.findIndex(p=>p._id===postId);if(i===-1)throw new Error("Not found");
    if(DB.posts[i].author._id!==userId)throw new Error("Forbidden");
    DB.posts.splice(i,1);DB.save();
  },
  addComment(userId,postId,text){
    const user=DB.users.find(u=>u._id===userId);
    const i=DB.posts.findIndex(p=>p._id===postId);if(i===-1)throw new Error("Not found");
    const c={_id:"c_"+Date.now(),text,author:{_id:user._id,name:user.name},createdAt:new Date().toISOString()};
    DB.posts[i].comments.push(c);DB.save();return c;
  },
  deleteComment(userId,postId,commentId){
    const i=DB.posts.findIndex(p=>p._id===postId);if(i===-1)throw new Error("Not found");
    const ci=DB.posts[i].comments.findIndex(c=>c._id===commentId);if(ci===-1)throw new Error("Not found");
    if(DB.posts[i].comments[ci].author._id!==userId)throw new Error("Forbidden");
    DB.posts[i].comments.splice(ci,1);DB.save();
  },
  likePost(postId){
    const i=DB.posts.findIndex(p=>p._id===postId);
    if(i!==-1){DB.posts[i].likes++;DB.save();return DB.posts[i].likes;}
  }
};

// ─── AI HELPERS ──────────────────────────────────────────────
async function aiGenerateContent(title, tags) {
  const prompt = `Write a compelling, insightful blog post for InkWell about: "${title}".
Tags/topics: ${tags.join(", ") || "general"}.

Requirements:
- 4-6 paragraphs, each separated by \\n\\n
- Thoughtful, authoritative voice
- Concrete examples or insights
- End with a memorable closing thought
- No markdown headers, just flowing prose
- Around 300-400 words

Also provide a short 1-sentence excerpt (under 120 chars).

Respond ONLY with valid JSON: {"content":"...","excerpt":"..."}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      messages:[{role:"user",content:prompt}]
    })
  });
  const data = await res.json();
  const text = data.content?.map(b=>b.text||"").join("") || "";
  try {
    const clean = text.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  } catch {
    return {content: text, excerpt: title};
  }
}

async function aiGenerateImageKeywords(title, tags) {
  // Returns a picsum seed based on the title for deterministic image
  // In a real app this would call DALL-E or Stability AI
  const hash = [...(title+tags.join(""))].reduce((h,c)=>((h<<5)-h)+c.charCodeAt(0),0);
  const ids = [10,20,26,29,39,42,48,50,65,83,96,100,103,110,119,120,137,145,157,162,167,180,190,200,210,220,230];
  const idx = Math.abs(hash) % ids.length;
  return PIC(ids[idx]);
}

// ─── CONTEXTS ────────────────────────────────────────────────
const AuthCtx = createContext(null);
const ThemeCtx = createContext(null);
function useAuth(){return useContext(AuthCtx);}
function useTheme(){return useContext(ThemeCtx);}

function ThemeProvider({children}){
  const[dark,setDark]=useState(()=>localStorage.getItem("blog_theme")==="dark");
  const toggle=()=>setDark(d=>{const n=!d;localStorage.setItem("blog_theme",n?"dark":"light");return n;});
  return <ThemeCtx.Provider value={{dark,toggle}}>{children}</ThemeCtx.Provider>;
}
function AuthProvider({children}){
  const[user,setUser]=useState(null);
  const[token,setToken]=useState(null);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    const t=localStorage.getItem("blog_token");
    if(t){const u=api.verifyToken(t);if(u){setUser(u);setToken(t);}else localStorage.removeItem("blog_token");}
    setLoading(false);
  },[]);
  const login=useCallback((t,u)=>{setToken(t);setUser(u);localStorage.setItem("blog_token",t);},[]);
  const logout=useCallback(()=>{setToken(null);setUser(null);localStorage.removeItem("blog_token");},[]);
  return <AuthCtx.Provider value={{user,token,login,logout,loading}}>{children}</AuthCtx.Provider>;
}

// ─── UTILS ───────────────────────────────────────────────────
const fmtDate=d=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const readTime=t=>Math.max(1,Math.ceil((t||"").trim().split(/\s+/).length/200));

// Avatar colors per name
const AV_COLORS = ["#d4380d","#c9960c","#1a6b4a","#1a5fa6","#7c3aed","#db2777","#0891b2","#65a30d"];
const avColor = name => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

// ─── CSS ─────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f7f5f0;--bg2:#edeae2;--bg3:#e2ddd4;
  --sf:#fff;--sf2:#faf8f4;
  --bd:#ddd8cc;--bd2:#c4bcae;
  --ink:#1c1409;--ink2:#3a2e1c;--ink3:#6b5c48;--ink4:#9a8878;
  --ac:#d4380d;--ac2:#f5c842;--ac3:#1a6b4a;--ac-gl:rgba(212,56,13,0.13);
  --gold:#c9960c;
  --sh:rgba(28,20,9,0.06);--sh2:rgba(28,20,9,0.14);--sh3:rgba(28,20,9,0.24);
  --r:8px;--r2:14px;
  --fd:'DM Serif Display',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;
  --ease:0.28s cubic-bezier(0.4,0,0.2,1);
}
[data-theme="dark"]{
  --bg:#0d0c0a;--bg2:#131210;--bg3:#1c1916;
  --sf:#171512;--sf2:#1d1b17;
  --bd:#2a2520;--bd2:#38332c;
  --ink:#ede8dd;--ink2:#cfc5b0;--ink3:#8a7a68;--ink4:#52463a;
  --ac:#ff5722;--ac2:#f5c842;--ac3:#2dba7a;--ac-gl:rgba(255,87,34,0.16);
  --gold:#e6ad20;
  --sh:rgba(0,0,0,0.28);--sh2:rgba(0,0,0,0.5);--sh3:rgba(0,0,0,0.7);
}
html{scroll-behavior:smooth;}
body{font-family:var(--fb);background:var(--bg);color:var(--ink);line-height:1.7;transition:background var(--ease),color var(--ease);}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:var(--bg2);}::-webkit-scrollbar-thumb{background:var(--bd2);border-radius:3px;}

.c{max-width:1160px;margin:0 auto;padding:0 28px;}
.csm{max-width:760px;margin:0 auto;padding:0 28px;}

/* HEADER */
.hdr{position:sticky;top:0;z-index:200;background:rgba(247,245,240,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--bd);transition:background var(--ease);}
[data-theme="dark"] .hdr{background:rgba(13,12,10,0.92);}
.hdr-in{display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:62px;max-width:1160px;margin:0 auto;gap:12px;}
.logo{display:flex;align-items:center;gap:8px;cursor:pointer;}
.logo-dot{width:9px;height:9px;background:var(--ac);border-radius:50%;animation:pulse 2.5s ease-in-out infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.5);opacity:0.6;}}
.logo-txt{font-family:var(--fd);font-size:1.55rem;color:var(--ink);letter-spacing:-0.3px;}
.nav{display:flex;align-items:center;gap:4px;}
.nl{background:none;border:none;color:var(--ink3);font-family:var(--fb);font-size:0.8rem;cursor:pointer;padding:6px 12px;border-radius:20px;transition:all var(--ease);}
.nl:hover{color:var(--ink);background:var(--bg3);}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 22px;border-radius:30px;border:none;cursor:pointer;font-family:var(--fb);font-size:0.875rem;font-weight:500;transition:all var(--ease);white-space:nowrap;}
.btn:active{transform:scale(0.96);}
.btn-p{background:var(--ac);color:#fff;box-shadow:0 4px 16px var(--ac-gl);}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px var(--ac-gl);}
.btn-o{background:transparent;border:1.5px solid var(--bd2);color:var(--ink2);}
.btn-o:hover{border-color:var(--ink);color:var(--ink);background:var(--bg3);}
.btn-g{background:transparent;border:none;color:var(--ink3);padding:6px 12px;}
.btn-g:hover{color:var(--ac);}
.btn-d{background:#c0392b;color:#fff;}
.btn-sm{padding:6px 14px;font-size:0.78rem;}
.btn-ai{background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;box-shadow:0 4px 18px rgba(124,58,237,0.3);}
.btn-ai:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,58,237,0.4);}
.btn-ai:disabled{opacity:0.6;transform:none;cursor:not-allowed;}

/* THEME TOGGLE */
.thm{width:46px;height:25px;background:var(--bg3);border:1.5px solid var(--bd2);border-radius:13px;cursor:pointer;position:relative;transition:background var(--ease);flex-shrink:0;}
.thm-k{position:absolute;top:3px;left:3px;width:16px;height:16px;background:var(--ink);border-radius:50%;transition:transform var(--ease);display:flex;align-items:center;justify-content:center;font-size:9px;}
[data-theme="dark"] .thm-k{transform:translateX(21px);}

/* AVATAR */
.av{border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--fd);flex-shrink:0;font-weight:400;}

/* HERO */
.hero{position:relative;min-height:86vh;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:80px 28px;background:var(--bg2);}
.hero-canvas{position:absolute;inset:0;pointer-events:none;}
.hgrid{position:absolute;inset:0;background-image:linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px);background-size:52px 52px;opacity:0.4;}
[data-theme="dark"] .hgrid{opacity:0.1;}
.orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.28;animation:orbF 9s ease-in-out infinite;}
.o1{width:700px;height:700px;background:radial-gradient(circle,var(--ac),transparent 70%);top:-20%;left:-15%;animation-delay:0s;}
.o2{width:550px;height:550px;background:radial-gradient(circle,var(--ac2),transparent 70%);bottom:-15%;right:-8%;animation-delay:-4s;}
.o3{width:400px;height:400px;background:radial-gradient(circle,var(--ac3),transparent 70%);top:50%;left:45%;animation-delay:-7s;}
@keyframes orbF{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(25px,-18px) scale(1.06);}66%{transform:translate(-12px,22px) scale(0.95);}}
.hero-ct{position:relative;z-index:2;text-align:center;max-width:840px;}
.hbadge{display:inline-flex;align-items:center;gap:8px;background:var(--sf);border:1px solid var(--bd2);border-radius:30px;padding:7px 18px;font-size:0.73rem;color:var(--ink3);margin-bottom:28px;box-shadow:0 4px 20px var(--sh);animation:fU .6s ease both;}
.hbdot{width:7px;height:7px;background:var(--ac3);border-radius:50%;animation:pulse 2s infinite;}
.htitle{font-family:var(--fd);font-size:clamp(2.8rem,7vw,5.6rem);line-height:1.05;margin-bottom:24px;animation:fU .7s .1s ease both;}
.htitle em{font-style:italic;color:var(--ac);}
.hsub{font-size:clamp(.95rem,2vw,1.1rem);color:var(--ink3);max-width:520px;margin:0 auto 40px;font-weight:300;line-height:1.8;animation:fU .7s .2s ease both;}
.hcta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;animation:fU .7s .3s ease both;}
.hstats{display:flex;gap:44px;justify-content:center;margin-top:56px;animation:fU .7s .45s ease both;padding-top:44px;border-top:1px solid var(--bd);}
.snum{font-family:var(--fd);font-size:2.2rem;display:block;line-height:1;}
.slbl{font-size:0.67rem;color:var(--ink4);letter-spacing:0.12em;text-transform:uppercase;margin-top:4px;}
.hdiv{width:1px;background:var(--bd);height:44px;align-self:center;}
@keyframes fU{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}

/* TAGS BAR */
.tbar{background:var(--sf);border-bottom:1px solid var(--bd);}
.tbar-in{display:flex;gap:8px;align-items:center;overflow-x:auto;padding:10px 28px;max-width:1160px;margin:0 auto;}
.tbar-in::-webkit-scrollbar{display:none;}
.tpill{background:none;border:1.5px solid var(--bd);color:var(--ink3);font-family:var(--fb);font-size:0.71rem;padding:5px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:all var(--ease);}
.tpill:hover,.tpill.on{background:var(--ink);border-color:var(--ink);color:var(--bg);}

/* POSTS */
.posts-s{padding:64px 0;}
.sec-hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:40px;}
.sec-ttl{font-family:var(--fd);font-size:1.65rem;}
.sec-meta{font-size:0.8rem;color:var(--ink4);}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:26px;}

/* CARD */
.card{
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--r2);
  overflow:hidden;cursor:pointer;display:flex;flex-direction:column;
  transition:transform .38s cubic-bezier(.34,1.2,.64,1),box-shadow .35s,border-color .25s;
  transform-style:preserve-3d;animation:cRev .5s ease both;
}
@keyframes cRev{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
.card:hover{transform:translateY(-10px) rotateX(2deg) rotateY(-1.5deg) scale(1.015);box-shadow:0 28px 64px var(--sh2),0 4px 16px var(--sh);border-color:var(--bd2);}
[data-theme="dark"] .card:hover{box-shadow:0 28px 64px rgba(0,0,0,0.65),0 0 0 1px var(--ac),inset 0 1px 0 rgba(255,255,255,0.04);}

/* CARD IMAGE — fixed loading */
.card-img{position:relative;height:200px;overflow:hidden;background:var(--bg3);flex-shrink:0;}
.card-img img{
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .55s ease,opacity .4s ease;
  opacity:0;
}
.card-img img.loaded{opacity:1;}
.card-img-ph{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--bg3),var(--bg2));
  font-size:2.5rem;transition:opacity .4s;
}
.card-img-ph.hidden{opacity:0;pointer-events:none;}
.card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.55),transparent 60%);pointer-events:none;}
.card-ctags{position:absolute;bottom:12px;left:14px;display:flex;gap:5px;flex-wrap:wrap;}
.ctag{font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,0.44);backdrop-filter:blur(8px);padding:3px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.18);}
.card-body{padding:22px 24px;flex:1;display:flex;flex-direction:column;}
.card-ttl{font-family:var(--fd);font-size:1.12rem;color:var(--ink);margin-bottom:9px;line-height:1.32;transition:color var(--ease);}
.card:hover .card-ttl{color:var(--ac);}
.card-exc{font-size:0.875rem;color:var(--ink3);line-height:1.7;flex:1;font-weight:300;}
.card-foot{padding:13px 24px;border-top:1px solid var(--bg3);display:flex;align-items:center;justify-content:space-between;gap:8px;}
.card-auth{display:flex;align-items:center;gap:8px;font-size:0.78rem;color:var(--ink3);}
.card-auth strong{color:var(--ink2);font-weight:500;}
.card-stats{display:flex;gap:10px;font-size:0.73rem;color:var(--ink4);}
.rbadge{font-size:0.68rem;color:var(--ink4);background:var(--bg3);padding:3px 9px;border-radius:10px;}
.card.feat{grid-column:1/-1;flex-direction:row;max-height:320px;}
.card.feat .card-img{width:420px;flex-shrink:0;height:auto;}
.card.feat .card-ttl{font-size:1.55rem;}
@media(max-width:700px){.card.feat{flex-direction:column;max-height:none;}.card.feat .card-img{width:100%;height:220px;}}

/* PAGINATION */
.pgn{display:flex;justify-content:center;gap:8px;margin-top:52px;}
.pbn{width:38px;height:38px;border:1.5px solid var(--bd);background:var(--sf);color:var(--ink3);border-radius:50%;cursor:pointer;font-size:0.85rem;transition:all var(--ease);}
.pbn:hover{border-color:var(--ink3);}
.pbn.on{background:var(--ink);color:var(--bg);border-color:var(--ink);}
.pbn:disabled{opacity:.3;cursor:not-allowed;}

/* POST VIEW */
.pview{max-width:760px;margin:0 auto;padding:60px 28px;}
.pcover{border-radius:var(--r2);overflow:hidden;margin-bottom:48px;box-shadow:0 24px 70px var(--sh3);background:var(--bg3);min-height:200px;display:flex;align-items:center;justify-content:center;}
.pcover img{width:100%;max-height:480px;object-fit:cover;display:block;opacity:0;transition:opacity .4s;}
.pcover img.loaded{opacity:1;}
.pkicker{font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--ac);margin-bottom:16px;font-weight:500;}
.ptitle{font-family:var(--fd);font-size:clamp(1.9rem,4.5vw,3.3rem);line-height:1.12;margin-bottom:28px;}
.pmeta{display:flex;align-items:center;gap:14px;margin-bottom:44px;padding-bottom:28px;border-bottom:1px solid var(--bd);flex-wrap:wrap;}
.paname{font-size:0.9rem;font-weight:500;}
.pdate{font-size:0.78rem;color:var(--ink4);}
.p-acts{display:flex;gap:8px;margin-left:auto;}
.pbody{font-size:1.05rem;line-height:1.9;color:var(--ink2);font-weight:300;margin-bottom:52px;white-space:pre-wrap;}
.ptags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:44px;padding-top:28px;border-top:1px solid var(--bd);}
.ptag{font-size:0.74rem;color:var(--ink3);background:var(--bg2);padding:5px 14px;border-radius:20px;border:1.5px solid var(--bd);cursor:pointer;transition:all var(--ease);}
.ptag:hover{background:var(--ink);color:var(--bg);border-color:var(--ink);}
.lbtn{display:flex;align-items:center;gap:8px;background:var(--sf);border:1.5px solid var(--bd);border-radius:30px;padding:10px 22px;cursor:pointer;font-family:var(--fb);font-size:0.875rem;color:var(--ink2);transition:all var(--ease);}
.lbtn:hover{border-color:var(--ac);color:var(--ac);}
.lbtn.liked{background:rgba(212,56,13,0.07);border-color:var(--ac);color:var(--ac);}
.lbtn.liked svg{animation:hb .4s ease;}
@keyframes hb{50%{transform:scale(1.5);}}

/* COMMENTS */
.comm-s{border-top:2px solid var(--ink);padding-top:44px;}
.comm-ttl{font-family:var(--fd);font-size:1.4rem;margin-bottom:32px;}
.comm{padding:20px 0;border-bottom:1px solid var(--bg3);}
.comm:last-of-type{border-bottom:none;}
.comm-hd{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.comm-auth{font-size:0.875rem;font-weight:500;}
.comm-dt{font-size:0.74rem;color:var(--ink4);}
.comm-txt{font-size:0.9rem;color:var(--ink2);font-weight:300;line-height:1.7;}
.comm-form{margin-top:32px;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r2);padding:20px;}
.comm-form textarea{width:100%;border:1.5px solid var(--bd);border-radius:var(--r);padding:12px 16px;font-family:var(--fb);font-size:0.9rem;color:var(--ink);background:var(--sf);resize:vertical;min-height:100px;outline:none;transition:border-color var(--ease);}
.comm-form textarea:focus{border-color:var(--ac);}
.comm-cta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;}

/* AUTH */
.auth-pg{min-height:100vh;display:flex;align-items:stretch;}
.auth-l{flex:1;background:var(--ink);display:flex;align-items:center;justify-content:center;padding:60px;position:relative;overflow:hidden;}
[data-theme="dark"] .auth-l{background:var(--bg3);}
.auth-orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:0.28;}
.aob1{width:420px;height:420px;background:var(--ac);top:-25%;left:-15%;}
.aob2{width:320px;height:320px;background:var(--ac2);bottom:-15%;right:-10%;}
.auth-lct{position:relative;z-index:1;text-align:center;color:rgba(237,232,221,0.9);}
.auth-logo{font-family:var(--fd);font-size:2.5rem;margin-bottom:18px;}
.auth-tag{font-size:1rem;font-weight:300;opacity:0.65;line-height:1.75;}
.auth-feats{margin-top:44px;display:flex;flex-direction:column;gap:14px;}
.auth-feat{font-size:0.875rem;color:rgba(237,232,221,0.48);font-weight:300;text-align:left;}
.auth-r{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 40px;background:var(--bg);}
@media(max-width:680px){.auth-l{display:none;}.auth-r{padding:40px 22px;}}
.auth-card{width:100%;max-width:400px;}
.auth-title{font-family:var(--fd);font-size:1.9rem;margin-bottom:8px;}
.auth-sub{font-size:0.875rem;color:var(--ink4);margin-bottom:36px;font-weight:300;}
.fg{margin-bottom:20px;}
.fl{display:block;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink4);margin-bottom:6px;}
.fi{width:100%;border:1.5px solid var(--bd);border-radius:var(--r);padding:11px 16px;font-family:var(--fb);font-size:0.95rem;color:var(--ink);background:var(--sf);outline:none;transition:border-color var(--ease),box-shadow var(--ease);}
.fi:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac-gl);}
.fi.ta{min-height:260px;resize:vertical;}
.fsw{text-align:center;margin-top:22px;font-size:0.85rem;color:var(--ink4);}
.fsw button{background:none;border:none;color:var(--ac);cursor:pointer;font-family:var(--fb);font-size:0.85rem;text-decoration:underline;}

/* EDITOR */
.ed-wrap{padding:60px 0;}
.ed-card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r2);overflow:hidden;box-shadow:0 10px 40px var(--sh);}
.ed-top{background:var(--ink);padding:18px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
[data-theme="dark"] .ed-top{background:var(--bg3);border-bottom:1px solid var(--bd);}
.ed-top-ttl{font-family:var(--fd);font-size:1rem;color:rgba(237,232,221,0.78);}
[data-theme="dark"] .ed-top-ttl{color:var(--ink2);}
.ed-body{padding:32px;}
.tag-wrap{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 14px;border:1.5px solid var(--bd);border-radius:var(--r);background:var(--sf);min-height:46px;}
.tchip{background:var(--bg2);border:1px solid var(--bd);color:var(--ink2);font-size:0.74rem;padding:3px 10px;border-radius:20px;display:flex;align-items:center;gap:6px;}
.tchip button{background:none;border:none;color:var(--ink4);cursor:pointer;font-size:1rem;line-height:1;padding:0;}
.tfree{border:none;background:none;outline:none;font-family:var(--fb);font-size:0.875rem;color:var(--ink);flex:1;min-width:80px;}

/* AI PANEL */
.ai-panel{background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(192,38,211,0.06));border:1.5px solid rgba(124,58,237,0.25);border-radius:var(--r2);padding:24px;margin-bottom:24px;position:relative;overflow:hidden;}
[data-theme="dark"] .ai-panel{background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(192,38,211,0.1));}
.ai-panel::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(124,58,237,0.15),transparent);border-radius:50%;pointer-events:none;}
.ai-title{font-family:var(--fd);font-size:1rem;margin-bottom:6px;display:flex;align-items:center;gap:8px;color:var(--ink);}
.ai-title span{background:linear-gradient(135deg,#7c3aed,#c026d3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.ai-sub{font-size:0.8rem;color:var(--ink3);margin-bottom:18px;font-weight:300;}
.ai-row{display:flex;gap:10px;flex-wrap:wrap;}
.ai-spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin-right:4px;}
.ai-gen-img-prev{width:100%;height:160px;object-fit:cover;border-radius:var(--r);margin-top:12px;display:block;opacity:0;transition:opacity .4s;}
.ai-gen-img-prev.loaded{opacity:1;}
.ai-img-ph{width:100%;height:160px;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(192,38,211,0.1));border-radius:var(--r);display:flex;align-items:center;justify-content:center;margin-top:12px;font-size:0.85rem;color:var(--ink4);}
@keyframes spin{to{transform:rotate(360deg);}}

/* IMAGE UPLOAD */
.izone{border:2px dashed var(--bd2);border-radius:var(--r2);padding:36px;text-align:center;cursor:pointer;transition:all var(--ease);background:var(--bg2);}
.izone:hover,.izone.dov{border-color:var(--ac);background:var(--ac-gl);}
.izone-ico{font-size:2.8rem;margin-bottom:12px;display:block;}
.izone-txt{font-size:0.9rem;color:var(--ink3);font-weight:300;}
.izone-sub{font-size:0.74rem;color:var(--ink4);margin-top:6px;}
.ipreview{position:relative;border-radius:var(--r2);overflow:hidden;}
.ipreview img{width:100%;max-height:240px;object-fit:cover;display:block;}
.ipreview-acts{position:absolute;top:12px;right:12px;}
.iurl-row{display:flex;gap:10px;margin-top:12px;}
.iurl-row .fi{border-radius:30px;flex:1;}

/* DASHBOARD */
.dash-hero{background:var(--ink);padding:52px 28px;position:relative;overflow:hidden;}
[data-theme="dark"] .dash-hero{background:var(--bg3);border-bottom:1px solid var(--bd);}
.dash-orb{position:absolute;border-radius:50%;filter:blur(70px);opacity:0.14;width:600px;height:600px;background:var(--ac);top:-40%;right:-10%;}
.dash-in{max-width:1160px;margin:0 auto;display:flex;align-items:center;gap:24px;position:relative;z-index:1;flex-wrap:wrap;}
.dash-name{font-family:var(--fd);font-size:2rem;color:rgba(237,232,221,0.95);}
[data-theme="dark"] .dash-name{color:var(--ink);}
.dash-email{font-size:0.84rem;color:rgba(154,136,120,0.75);margin-top:4px;}
.dash-stats{display:flex;gap:36px;margin-top:18px;}
.dsnum{font-family:var(--fd);font-size:2rem;color:rgba(237,232,221,0.9);display:block;line-height:1;}
[data-theme="dark"] .dsnum{color:var(--ink);}
.dslbl{font-size:0.68rem;letter-spacing:0.1em;text-transform:uppercase;color:rgba(154,136,120,0.65);}
.dsdiv{width:1px;background:rgba(255,255,255,0.1);height:44px;align-self:center;}
.dash-acts{margin-left:auto;}
.my-list{display:flex;flex-direction:column;gap:14px;}
.my-item{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r2);padding:20px 24px;display:flex;align-items:center;gap:16px;transition:all var(--ease);animation:cRev .4s ease both;}
.my-item:hover{border-color:var(--bd2);box-shadow:0 8px 32px var(--sh);transform:translateX(4px);}
.my-thumb{width:58px;height:58px;border-radius:10px;object-fit:cover;flex-shrink:0;background:var(--bg3);}
.my-title{font-family:var(--fd);font-size:1rem;color:var(--ink);cursor:pointer;}
.my-title:hover{color:var(--ac);}
.my-meta{font-size:0.74rem;color:var(--ink4);margin-top:4px;}
.my-acts{display:flex;gap:8px;margin-left:auto;flex-shrink:0;}

/* ARCH */
.arch{margin-top:52px;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r2);overflow:hidden;}
.arch-hd{background:var(--bg3);padding:18px 24px;font-family:var(--fd);font-size:1rem;border-bottom:1px solid var(--bd);}
.arch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1px;background:var(--bd);}
.arch-item{background:var(--sf);padding:18px 20px;}
.arch-item code{font-size:0.67rem;color:var(--ac);display:block;margin-bottom:6px;font-family:monospace;}
.arch-item p{font-size:0.79rem;color:var(--ink3);line-height:1.6;}

/* EMPTY */
.empty{text-align:center;padding:80px 24px;}
.empty-ico{font-size:3.5rem;display:block;margin-bottom:20px;}
.empty-ttl{font-family:var(--fd);font-size:1.6rem;margin-bottom:10px;}

/* MODAL */
.moverlay{position:fixed;inset:0;background:rgba(0,0,0,0.62);z-index:400;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(5px);animation:mfIn .2s ease;}
@keyframes mfIn{from{opacity:0;}to{opacity:1;}}
.modal{background:var(--sf);border-radius:var(--r2);padding:40px;max-width:420px;width:100%;box-shadow:0 44px 100px var(--sh3);animation:mUp .3s ease;}
@keyframes mUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
.modal h3{font-family:var(--fd);font-size:1.3rem;margin-bottom:12px;}
.modal p{font-size:0.9rem;color:var(--ink3);margin-bottom:28px;font-weight:300;}
.modal-acts{display:flex;gap:10px;justify-content:flex-end;}

/* TOAST */
.toast{position:fixed;bottom:28px;right:28px;background:var(--ink);color:var(--bg);padding:14px 24px;border-radius:30px;font-size:0.875rem;z-index:500;border-left:3px solid var(--ac);box-shadow:0 10px 36px var(--sh3);animation:tIn .38s cubic-bezier(.34,1.56,.64,1);}
[data-theme="dark"] .toast{background:var(--sf);color:var(--ink);}
@keyframes tIn{from{opacity:0;transform:translateY(14px) scale(0.9);}to{opacity:1;transform:translateY(0) scale(1);}}

.alert{padding:12px 18px;border-radius:var(--r);margin-bottom:18px;font-size:0.875rem;}
.alert-err{background:rgba(212,56,13,0.08);border:1px solid rgba(212,56,13,0.3);color:var(--ac);}
.back-lnk{background:none;border:none;color:var(--ink4);cursor:pointer;font-family:var(--fb);font-size:0.84rem;display:flex;align-items:center;gap:6px;margin-bottom:36px;transition:color var(--ease);padding:0;}
.back-lnk:hover{color:var(--ink);}

/* SEARCH */
.srch{position:relative;}
.srch-in{border:1.5px solid var(--bd);background:var(--bg2);padding:8px 16px 8px 38px;border-radius:30px;font-family:var(--fb);font-size:0.82rem;color:var(--ink);outline:none;width:190px;transition:all var(--ease);}
.srch-in:focus{width:250px;border-color:var(--ac);background:var(--sf);box-shadow:0 0 0 3px var(--ac-gl);}
.srch-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--ink4);font-size:0.9rem;pointer-events:none;}

/* DEMO LOGIN HINT */
.demo-hint{background:var(--bg2);border:1px solid var(--bd);border-radius:var(--r);padding:12px 16px;margin-bottom:20px;font-size:0.8rem;color:var(--ink3);}
.demo-hint strong{color:var(--ac);}

/* FOOTER */
.footer{background:var(--ink);color:rgba(237,232,221,0.5);position:relative;overflow:hidden;margin-top:80px;}
[data-theme="dark"] .footer{background:#090807;border-top:1px solid var(--bd);}
.ft-orb{position:absolute;border-radius:50%;filter:blur(110px);opacity:0.1;pointer-events:none;}
.ft-o1{width:700px;height:700px;background:var(--ac);top:-50%;left:-10%;}
.ft-o2{width:500px;height:500px;background:var(--ac2);bottom:-30%;right:-5%;}
.ft-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(237,232,221,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(237,232,221,0.03) 1px,transparent 1px);background-size:64px 64px;pointer-events:none;}
.ft-top{display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr;gap:52px;padding:76px 28px 60px;max-width:1160px;margin:0 auto;position:relative;z-index:1;}
@media(max-width:900px){.ft-top{grid-template-columns:1fr 1fr;gap:40px;}}
@media(max-width:560px){.ft-top{grid-template-columns:1fr;gap:34px;}}
.ft-logo{font-family:var(--fd);font-size:2.1rem;color:rgba(237,232,221,0.88);margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.ft-logo-dot{width:10px;height:10px;background:var(--ac);border-radius:50%;flex-shrink:0;}
.ft-tagline{font-size:0.88rem;line-height:1.75;color:rgba(237,232,221,0.4);font-weight:300;max-width:270px;margin-bottom:28px;}
.ft-social{display:flex;gap:10px;}
.ft-sb{width:38px;height:38px;border:1px solid rgba(255,255,255,0.09);border-radius:50%;background:rgba(255,255,255,0.04);color:rgba(237,232,221,0.55);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.88rem;transition:all var(--ease);}
.ft-sb:hover{background:var(--ac);border-color:var(--ac);color:#fff;transform:translateY(-3px);}
.ft-col-ttl{font-size:0.67rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(237,232,221,0.3);margin-bottom:20px;font-weight:500;}
.ft-links{list-style:none;display:flex;flex-direction:column;gap:11px;}
.ft-links li{font-size:0.875rem;color:rgba(237,232,221,0.46);cursor:pointer;transition:color var(--ease);}
.ft-links li:hover{color:rgba(237,232,221,0.88);}
.ft-nl-desc{font-size:0.82rem;color:rgba(237,232,221,0.36);margin-bottom:16px;line-height:1.65;}
.ft-nl-form{display:flex;flex-direction:column;gap:8px;}
.ft-nl-in{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;padding:11px 20px;font-family:var(--fb);font-size:0.83rem;color:rgba(237,232,221,0.8);outline:none;transition:border-color var(--ease);}
.ft-nl-in::placeholder{color:rgba(237,232,221,0.22);}
.ft-nl-in:focus{border-color:var(--ac);}
.ft-nl-btn{background:var(--ac);border:none;border-radius:30px;padding:11px 24px;color:#fff;font-family:var(--fb);font-size:0.83rem;cursor:pointer;font-weight:500;transition:all var(--ease);}
.ft-nl-btn:hover{transform:translateY(-1px);}
.ft-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 28px;}
.ft-bottom{display:flex;align-items:center;justify-content:space-between;padding:24px 28px;max-width:1160px;margin:0 auto;position:relative;z-index:1;flex-wrap:wrap;gap:12px;}
.ft-copy{font-size:0.77rem;color:rgba(237,232,221,0.25);}
.ft-copy span{color:var(--ac);}
.ft-badges{display:flex;gap:8px;flex-wrap:wrap;}
.ft-badge{font-size:0.63rem;letter-spacing:0.07em;color:rgba(237,232,221,0.28);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:4px 12px;}
.ft-legal{display:flex;gap:20px;}
.ft-legal span{font-size:0.74rem;color:rgba(237,232,221,0.25);cursor:pointer;transition:color var(--ease);}
.ft-legal span:hover{color:rgba(237,232,221,0.6);}
.hr{border:none;border-top:1px solid var(--bd);margin:28px 0;}
.note-box{background:var(--bg2);border:1px solid var(--bd);border-radius:var(--r);padding:14px 18px;font-size:0.79rem;color:var(--ink4);}

@media(max-width:640px){
  .pgrid{grid-template-columns:1fr;}
  .hstats{gap:20px;}.hdiv{display:none;}
  .c,.csm{padding:0 16px;}
  .pview{padding:40px 16px;}
  .nav .srch{display:none;}
}
`;

// ─── COMPONENTS ──────────────────────────────────────────────

// Lazy image with placeholder emoji
function LazyImg({src, alt, className, style, emoji="📄"}){
  const[loaded,setLoaded]=useState(false);
  const[err,setErr]=useState(false);
  const ref=useRef();

  useEffect(()=>{
    setLoaded(false);setErr(false);
    if(!src)return;
    const img=new Image();
    img.onload=()=>setLoaded(true);
    img.onerror=()=>setErr(true);
    img.src=src;
  },[src]);

  if(!src||err){
    return <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem",background:"linear-gradient(135deg,var(--bg3),var(--bg2))",...style}}>{emoji}</div>;
  }
  return(
    <>
      {!loaded && <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.5rem",background:"linear-gradient(135deg,var(--bg3),var(--bg2))"}}>{emoji}</div>}
      <img ref={ref} src={src} alt={alt} className={className} style={{...style,opacity:loaded?1:0,transition:"opacity 0.4s"}} onLoad={()=>setLoaded(true)} onError={()=>setErr(true)}/>
    </>
  );
}

function Toast({msg,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);
  return <div className="toast">✦ {msg}</div>;
}

function Modal({title,msg,onConfirm,onCancel}){
  return(
    <div className="moverlay" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{title}</h3><p>{msg}</p>
        <div className="modal-acts">
          <button className="btn btn-o btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-d btn-sm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle(){
  const{dark,toggle}=useTheme();
  return <button className="thm" onClick={toggle} title="Toggle dark mode"><div className="thm-k">{dark?"☀":"🌙"}</div></button>;
}

// ── IMAGE UPLOADER ──────────────────────────────────────────
function ImageUploader({value,onChange}){
  const[drag,setDrag]=useState(false);
  const[mode,setMode]=useState("upload");
  const[url,setUrl]=useState("");
  const ref=useRef();

  const readFile=f=>{
    if(!f||!f.type.startsWith("image/"))return;
    const r=new FileReader();r.onload=ev=>onChange(ev.target.result);r.readAsDataURL(f);
  };

  if(value){
    return(
      <div className="ipreview">
        <img src={value} alt="Cover" style={{width:"100%",maxHeight:240,objectFit:"cover",display:"block",borderRadius:"var(--r2)"}} onError={()=>onChange("")}/>
        <div className="ipreview-acts">
          <button className="btn btn-sm" style={{background:"rgba(0,0,0,0.6)",color:"#fff",backdropFilter:"blur(6px)"}} onClick={()=>onChange("")}>✕ Remove</button>
        </div>
      </div>
    );
  }
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <button className={`btn btn-sm ${mode==="upload"?"btn-p":"btn-o"}`} onClick={()=>setMode("upload")}>📁 Upload File</button>
        <button className={`btn btn-sm ${mode==="url"?"btn-p":"btn-o"}`} onClick={()=>setMode("url")}>🔗 Paste URL</button>
      </div>
      {mode==="upload"?(
        <div className={`izone${drag?" dov":""}`}
          onDragOver={e=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);readFile(e.dataTransfer.files?.[0]);}}
          onClick={()=>ref.current?.click()}>
          <span className="izone-ico">{drag?"🎯":"🖼"}</span>
          <p className="izone-txt">{drag?"Drop here!":"Drag & drop or click to upload"}</p>
          <p className="izone-sub">JPG, PNG, WebP, GIF supported</p>
          <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile(e.target.files?.[0])}/>
        </div>
      ):(
        <div className="iurl-row">
          <input className="fi" placeholder="https://picsum.photos/id/100/800/480" value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&url.trim()&&onChange(url.trim())}/>
          <button className="btn btn-p btn-sm" onClick={()=>url.trim()&&onChange(url.trim())}>Add</button>
        </div>
      )}
    </div>
  );
}

function Header({setPage,search,setSearch}){
  const{user,logout}=useAuth();
  return(
    <header className="hdr">
      <div className="hdr-in">
        <div className="logo" onClick={()=>setPage("home")}>
          <div className="logo-dot"/><span className="logo-txt">InkWell</span>
        </div>
        <div className="nav">
          <div className="srch">
            <span className="srch-ico">⌕</span>
            <input className="srch-in" placeholder="Search stories…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <ThemeToggle/>
          {user?(
            <>
              <button className="nl" onClick={()=>setPage("dashboard")}>Dashboard</button>
              <button className="btn btn-p btn-sm" onClick={()=>setPage("editor")}>+ Write</button>
              <div className="av" style={{width:34,height:34,fontSize:"0.85rem",marginLeft:4,background:avColor(user.name)}}>{user.avatar}</div>
              <button className="nl" onClick={logout}>Sign Out</button>
            </>
          ):(
            <>
              <button className="nl" onClick={()=>setPage("login")}>Sign In</button>
              <button className="btn btn-p btn-sm" onClick={()=>setPage("signup")}>Join Free</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function PostCard({post,onView,featured=false,delay=0}){
  const emojis=["✍️","💡","🌿","🔮","📖","🎨","🚀","🌊"];
  const em=emojis[post._id.charCodeAt(post._id.length-1)%emojis.length];
  return(
    <article className={`card${featured?" feat":""}`} style={{animationDelay:`${delay}ms`}} onClick={()=>onView(post.slug)}>
      <div className="card-img">
        <LazyImg src={post.coverImage} alt={post.title} emoji={em}/>
        <div className="card-overlay"/>
        {post.tags.length>0&&<div className="card-ctags">{post.tags.slice(0,2).map(t=><span key={t} className="ctag">{t}</span>)}</div>}
      </div>
      <div className="card-body">
        <h2 className="card-ttl">{post.title}</h2>
        <p className="card-exc">{post.excerpt||post.content.slice(0,110)+"…"}</p>
      </div>
      <div className="card-foot">
        <div className="card-auth">
          <div className="av" style={{width:28,height:28,fontSize:"0.68rem",background:avColor(post.author.name)}}>{post.author.name[0]}</div>
          <strong>{post.author.name}</strong>
        </div>
        <div className="card-stats">
          <span>♥ {post.likes}</span>
          <span>💬 {post.comments.length}</span>
          <span className="rbadge">{readTime(post.content)}m</span>
        </div>
      </div>
    </article>
  );
}

// ── PAGES ───────────────────────────────────────────────────
function HomePage({setPage,setCurrentSlug,search}){
  const[pg,setPg]=useState(1);
  const[tag,setTag]=useState(null);
  const[data,setData]=useState({posts:[],total:0,pages:1});
  const allTags=[...new Set(DB.posts.flatMap(p=>p.tags))].slice(0,16);
  const filtered=search.trim()?DB.posts.filter(p=>
    p.title.toLowerCase().includes(search.toLowerCase())||
    p.content.toLowerCase().includes(search.toLowerCase())||
    p.author.name.toLowerCase().includes(search.toLowerCase())
  ):null;
  useEffect(()=>{setData(api.getPosts(pg,6,tag));},[pg,tag]);
  const display=filtered||data.posts;
  const totalLikes=DB.posts.reduce((s,p)=>s+p.likes,0);
  const totalComments=DB.posts.reduce((s,p)=>s+p.comments.length,0);

  return(
    <>
      <section className="hero">
        <div className="hero-canvas"><div className="hgrid"/><div className="orb o1"/><div className="orb o2"/><div className="orb o3"/></div>
        <div className="hero-ct">
          <div className="hbadge"><span className="hbdot"/><span>8 writers · {DB.posts.length} stories · AI-powered</span></div>
          <h1 className="htitle">Your ideas deserve<br/><em>a beautiful home.</em></h1>
          <p className="hsub">InkWell is where writers craft stories, share ideas, and build an audience — with AI writing assistance and cover image generation built right in.</p>
          <div className="hcta">
            <button className="btn btn-p" style={{padding:"13px 34px",fontSize:"1rem"}} onClick={()=>setPage("signup")}>Start Writing Free</button>
            <button className="btn btn-o" style={{padding:"13px 34px",fontSize:"1rem"}} onClick={()=>document.getElementById("posts")?.scrollIntoView({behavior:"smooth"})}>Browse Stories ↓</button>
          </div>
          <div className="hstats">
            <div><span className="snum">{DB.posts.length}</span><span className="slbl">Stories</span></div>
            <div className="hdiv"/>
            <div><span className="snum">{totalLikes}</span><span className="slbl">Likes</span></div>
            <div className="hdiv"/>
            <div><span className="snum">{totalComments}</span><span className="slbl">Comments</span></div>
            <div className="hdiv"/>
            <div><span className="snum">{SEED_USERS.length}+</span><span className="slbl">Writers</span></div>
          </div>
        </div>
      </section>

      <div className="tbar">
        <div className="tbar-in">
          <span style={{fontSize:"0.66rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--ink4)",whiteSpace:"nowrap"}}>Filter</span>
          <button className={`tpill${!tag?" on":""}`} onClick={()=>{setTag(null);setPg(1);}}>All</button>
          {allTags.map(t=><button key={t} className={`tpill${tag===t?" on":""}`} onClick={()=>{setTag(t);setPg(1);}}>{t}</button>)}
        </div>
      </div>

      <section className="posts-s" id="posts">
        <div className="c">
          <div className="sec-hd">
            <h2 className="sec-ttl">{search?`"${search}"`:(tag?`#${tag}`:"Latest Stories")}</h2>
            <span className="sec-meta">{search?`${filtered?.length??0} found`:`${data.total} stories`}</span>
          </div>
          {display.length===0?(
            <div className="empty"><span className="empty-ico">📭</span><div className="empty-ttl">Nothing found</div><p style={{color:"var(--ink4)",fontSize:"0.9rem"}}>Try a different search or filter.</p></div>
          ):(
            <div className="pgrid">
              {display.map((p,i)=><PostCard key={p._id} post={p} featured={i===0&&!search&&!tag} delay={i*50} onView={slug=>{setCurrentSlug(slug);setPage("post");}}/>)}
            </div>
          )}
          {!search&&!tag&&data.pages>1&&(
            <div className="pgn">
              <button className="pbn" disabled={pg===1} onClick={()=>setPg(p=>p-1)}>‹</button>
              {Array.from({length:data.pages},(_,i)=><button key={i} className={`pbn${pg===i+1?" on":""}`} onClick={()=>setPg(i+1)}>{i+1}</button>)}
              <button className="pbn" disabled={pg===data.pages} onClick={()=>setPg(p=>p+1)}>›</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PostPage({slug,setPage,setEditPost,showToast}){
  const{user}=useAuth();
  const[post,setPost]=useState(null);
  const[comment,setComment]=useState("");
  const[liked,setLiked]=useState(false);
  const[confirm,setConfirm]=useState(null);
  const[err,setErr]=useState("");
  useEffect(()=>{try{setPost(api.getPost(slug));}catch{setPage("home");}},[slug]);
  if(!post) return <div style={{padding:80,textAlign:"center"}}><div style={{width:42,height:42,border:"3px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"}}/></div>;

  const isAuthor=user?._id===post.author._id;
  const handleLike=()=>{if(liked)return;const l=api.likePost(post._id);setPost(p=>({...p,likes:l}));setLiked(true);};
  const handleComment=()=>{
    if(!comment.trim())return;
    if(!user){setErr("Sign in to comment.");return;}
    const c=api.addComment(user._id,post._id,comment.trim());
    setPost(p=>({...p,comments:[...p.comments,c]}));setComment("");showToast("Comment posted!");
  };
  const handleDelC=cId=>{api.deleteComment(user._id,post._id,cId);setPost(p=>({...p,comments:p.comments.filter(c=>c._id!==cId)}));showToast("Comment removed.");};
  const handleDelete=()=>setConfirm({title:"Delete Post?",msg:`"${post.title}" will be permanently removed.`,onConfirm:()=>{api.deletePost(user._id,post._id);showToast("Post deleted.");setPage("dashboard");}});

  return(
    <>
      {confirm&&<Modal {...confirm} onCancel={()=>setConfirm(null)}/>}
      <div className="pview">
        <button className="back-lnk" onClick={()=>setPage("home")}>← Back to stories</button>
        {post.coverImage&&(
          <div className="pcover">
            <LazyImg src={post.coverImage} alt={post.title} emoji="📖" style={{width:"100%",maxHeight:480,objectFit:"cover"}}/>
          </div>
        )}
        {post.tags.length>0&&<p className="pkicker">{post.tags.join(" · ")}</p>}
        <h1 className="ptitle">{post.title}</h1>
        <div className="pmeta">
          <div className="av" style={{width:44,height:44,fontSize:"1rem",background:avColor(post.author.name)}}>{post.author.name[0]}</div>
          <div><div className="paname">{post.author.name}</div><div className="pdate">{fmtDate(post.createdAt)} · {readTime(post.content)} min read</div></div>
          {isAuthor&&<div className="p-acts"><button className="btn btn-o btn-sm" onClick={()=>{setEditPost(post);setPage("editor");}}>Edit</button><button className="btn btn-d btn-sm" onClick={handleDelete}>Delete</button></div>}
        </div>
        <div className="pbody">{post.content}</div>
        <div className="ptags">{post.tags.map(t=><span key={t} className="ptag">#{t}</span>)}</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:52}}>
          <button className={`lbtn${liked?" liked":""}`} onClick={handleLike} disabled={liked}>
            <svg width="18" height="18" fill={liked?"currentColor":"none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {post.likes} {liked?"Liked":"Like"}
          </button>
          <span style={{fontSize:"0.8rem",color:"var(--ink4)"}}>{post.comments.length} comments</span>
        </div>
        <div className="comm-s">
          <h3 className="comm-ttl">Discussion ({post.comments.length})</h3>
          {post.comments.length===0&&<p style={{color:"var(--ink4)",fontSize:"0.9rem",marginBottom:28}}>Be the first to comment!</p>}
          {post.comments.map(c=>(
            <div key={c._id} className="comm">
              <div className="comm-hd">
                <div className="av" style={{width:32,height:32,fontSize:"0.74rem",background:avColor(c.author.name)}}>{c.author.name[0]}</div>
                <span className="comm-auth">{c.author.name}</span>
                <span className="comm-dt">{fmtDate(c.createdAt)}</span>
                {user?._id===c.author._id&&<button className="btn-g btn-sm" style={{marginLeft:"auto"}} onClick={()=>handleDelC(c._id)}>Remove</button>}
              </div>
              <p className="comm-txt">{c.text}</p>
            </div>
          ))}
          <div className="comm-form">
            {err&&<div className="alert alert-err">{err}</div>}
            <textarea placeholder={user?"Share your thoughts…":"Sign in to join the conversation."} value={comment} onChange={e=>setComment(e.target.value)} disabled={!user} rows={4}/>
            <div className="comm-cta">
              <span style={{fontSize:"0.77rem",color:"var(--ink4)"}}>{comment.length}/600</span>
              {user?<button className="btn btn-p btn-sm" onClick={handleComment} disabled={!comment.trim()}>Post Comment</button>:<button className="btn btn-o btn-sm" onClick={()=>setPage("login")}>Sign In</button>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginTop:44}}>
          <button className="btn btn-o" onClick={()=>setPage("home")}>← All Stories</button>
        </div>
      </div>
    </>
  );
}

function AuthPage({mode,setPage,showToast}){
  const{login}=useAuth();
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const isSignup=mode==="signup";

  const handle=()=>{
    setErr("");setLoading(true);
    try{
      const res=isSignup?api.signup(name.trim(),email.trim(),pass):api.login(email.trim(),pass);
      login(res.token,res.user);
      showToast(isSignup?`Welcome, ${res.user.name}! 🎉`:`Welcome back, ${res.user.name}!`);
      setPage("home");
    }catch(e){setErr(e.message);}
    setLoading(false);
  };

  return(
    <div className="auth-pg">
      <div className="auth-l">
        <div className="auth-orb aob1"/><div className="auth-orb aob2"/>
        <div className="auth-lct">
          <div className="auth-logo">🖊 InkWell</div>
          <p className="auth-tag">The place where great writing<br/>finds its permanent home.</p>
          <div className="auth-feats">
            {["✦ Write & publish your stories","✦ AI-powered writing assistance","✦ Auto-generate cover images","✦ Build your readership"].map(f=><div key={f} className="auth-feat">{f}</div>)}
          </div>
        </div>
      </div>
      <div className="auth-r">
        <div className="auth-card">
          <h1 className="auth-title">{isSignup?"Create account":"Welcome back"}</h1>
          <p className="auth-sub">{isSignup?"Join InkWell's community of writers.":"Sign in to continue your journey."}</p>

          {/* Demo login hint */}
          {!isSignup&&(
            <div className="demo-hint">
              <strong>Try demo accounts:</strong> alice@inkwell.io / james@inkwell.io / priya@inkwell.io<br/>
              Password for all: <strong>demo</strong>
            </div>
          )}

          {err&&<div className="alert alert-err">{err}</div>}
          {isSignup&&<div className="fg"><label className="fl">Full Name</label><input className="fi" placeholder="e.g. Jane Austen" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
          <div className="fg"><label className="fl">Password</label><input className="fi" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
          <button className="btn btn-p" style={{width:"100%",padding:"13px",fontSize:"1rem",marginTop:8}} onClick={handle} disabled={loading}>{loading?"…":isSignup?"Create Account →":"Sign In →"}</button>
          <div className="fsw" style={{marginTop:22}}>
            {isSignup?<>Already have an account? <button onClick={()=>setPage("login")}>Sign In</button></>:<>No account? <button onClick={()=>setPage("signup")}>Join Free</button></>}
          </div>
          <div className="hr"/>
          <p style={{fontSize:"0.71rem",color:"var(--ink4)",textAlign:"center",lineHeight:1.7}}>🔐 JWT auth · Data in localStorage · 5 demo writers pre-loaded</p>
        </div>
      </div>
    </div>
  );
}

// ── AI PANEL COMPONENT ──────────────────────────────────────
function AIWritingPanel({title,tags,onContent,onImage,onExcerpt}){
  const[genContent,setGenContent]=useState(false);
  const[genImg,setGenImg]=useState(false);
  const[previewImg,setPreviewImg]=useState("");
  const[imgLoaded,setImgLoaded]=useState(false);
  const[msg,setMsg]=useState("");

  const handleGenContent=async()=>{
    if(!title.trim()){setMsg("Enter a title first!");return;}
    setGenContent(true);setMsg("✨ Writing your post…");
    try{
      const result=await aiGenerateContent(title,tags);
      onContent(result.content);
      if(result.excerpt)onExcerpt(result.excerpt);
      setMsg("✅ Content generated! Review and edit it above.");
    }catch(e){setMsg("❌ Generation failed. Check your connection.");}
    setGenContent(false);
  };

  const handleGenImg=async()=>{
    if(!title.trim()){setMsg("Enter a title first!");return;}
    setGenImg(true);setMsg("🎨 Finding the perfect image…");
    setImgLoaded(false);
    try{
      const url=await aiGenerateImageKeywords(title,tags);
      setPreviewImg(url);
      onImage(url);
      setMsg("✅ Cover image set! You can replace it anytime.");
    }catch(e){setMsg("❌ Image generation failed.");}
    setGenImg(false);
  };

  return(
    <div className="ai-panel">
      <div className="ai-title">✦ <span>AI Writing Assistant</span></div>
      <div className="ai-sub">Generate full post content or a matching cover image from your title & tags.</div>
      <div className="ai-row">
        <button className="btn btn-ai btn-sm" onClick={handleGenContent} disabled={genContent||genImg}>
          {genContent?<><span className="ai-spinner"/>Writing…</>:<>✍️ Generate Content</>}
        </button>
        <button className="btn btn-ai btn-sm" onClick={handleGenImg} disabled={genImg||genContent}>
          {genImg?<><span className="ai-spinner"/>Generating…</>:<>🎨 Generate Cover Image</>}
        </button>
      </div>
      {msg&&<p style={{fontSize:"0.8rem",color:"var(--ink3)",marginTop:12}}>{msg}</p>}
      {previewImg&&(
        <>
          <img className={`ai-gen-img-prev${imgLoaded?" loaded":""}`} src={previewImg} alt="Generated cover" onLoad={()=>setImgLoaded(true)}/>
          {!imgLoaded&&<div className="ai-img-ph">Loading preview…</div>}
        </>
      )}
    </div>
  );
}

function EditorPage({editPost,setPage,showToast}){
  const{user}=useAuth();
  const[title,setTitle]=useState(editPost?.title||"");
  const[content,setContent]=useState(editPost?.content||"");
  const[excerpt,setExcerpt]=useState(editPost?.excerpt||"");
  const[coverImage,setCoverImage]=useState(editPost?.coverImage||"");
  const[tagInput,setTagInput]=useState("");
  const[tags,setTags]=useState(editPost?.tags||[]);
  const[err,setErr]=useState("");
  const[saving,setSaving]=useState(false);
  const isEdit=!!editPost;

  const addTag=()=>{const t=tagInput.trim().toLowerCase().replace(/\s+/g,"-");if(t&&!tags.includes(t)&&tags.length<5){setTags(p=>[...p,t]);setTagInput("");}};
  const handle=()=>{
    setErr("");
    if(!title.trim()){setErr("Title is required.");return;}
    if(content.trim().length<30){setErr("Content must be at least 30 characters.");return;}
    setSaving(true);
    try{
      const data={title:title.trim(),content:content.trim(),excerpt:excerpt.trim()||content.trim().slice(0,120)+"…",tags,coverImage};
      if(isEdit){api.updatePost(user._id,editPost._id,data);showToast("Post updated!");}
      else{api.createPost(user._id,data);showToast("Post published! 🎉");}
      setPage("dashboard");
    }catch(e){setErr(e.message);}
    setSaving(false);
  };

  return(
    <div className="ed-wrap">
      <div className="csm">
        <button className="back-lnk" onClick={()=>setPage("dashboard")}>← Dashboard</button>
        <div className="ed-card">
          <div className="ed-top">
            <span className="ed-top-ttl">{isEdit?"Editing Post":"New Post"} — InkWell Editor</span>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-o btn-sm" style={{borderColor:"rgba(255,255,255,0.14)",color:"rgba(237,232,221,0.55)"}} onClick={()=>setPage("dashboard")}>Cancel</button>
              <button className="btn btn-p btn-sm" onClick={handle} disabled={saving}>{saving?"Saving…":isEdit?"Update":"Publish"}</button>
            </div>
          </div>
          <div className="ed-body">
            {err&&<div className="alert alert-err">{err}</div>}

            {/* AI PANEL */}
            <AIWritingPanel
              title={title}
              tags={tags}
              onContent={setContent}
              onExcerpt={setExcerpt}
              onImage={setCoverImage}
            />

            <div className="fg"><label className="fl">Title *</label><input className="fi" placeholder="Your compelling headline…" value={title} onChange={e=>setTitle(e.target.value)} style={{fontSize:"1.1rem"}}/></div>
            <div className="fg"><label className="fl">Excerpt <span style={{fontSize:"0.68rem",color:"var(--ink4)"}}>(shown on cards — or AI will suggest one)</span></label><input className="fi" placeholder="A one-line hook…" value={excerpt} onChange={e=>setExcerpt(e.target.value)}/></div>

            <div className="fg">
              <label className="fl">Tags ({tags.length}/5) — <span style={{fontSize:"0.68rem",color:"var(--ink4)"}}>Add tags before AI generation for better results</span></label>
              <div className="tag-wrap">
                {tags.map(t=><span key={t} className="tchip">{t}<button onClick={()=>setTags(p=>p.filter(x=>x!==t))}>×</button></span>)}
                {tags.length<5&&<input className="tfree" placeholder="Type tag, press Enter…" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>(e.key==="Enter"||e.key===",")&&(e.preventDefault(),addTag())}/>}
              </div>
            </div>

            <div className="fg">
              <label className="fl">Cover Image — or use AI Generate above</label>
              <ImageUploader value={coverImage} onChange={setCoverImage}/>
            </div>

            <div className="fg">
              <label className="fl">Content * — {content.length} chars · ~{readTime(content||"x")} min read</label>
              <textarea className="fi ta" placeholder="Write your story… or click ✍️ Generate Content above!" value={content} onChange={e=>setContent(e.target.value)}/>
            </div>

            <div className="note-box">
              <strong style={{color:"var(--ink3)"}}>AI Features:</strong> Content generation uses the Claude API (<code style={{color:"var(--ac)"}}>claude-sonnet-4-20250514</code>). Image generation uses deterministic picsum seeds based on your title hash — in production this would call DALL-E 3 or Stability AI with your title as the prompt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({setPage,setCurrentSlug,setEditPost,showToast}){
  const{user}=useAuth();
  const[posts,setPosts]=useState([]);
  const[confirm,setConfirm]=useState(null);
  useEffect(()=>{setPosts(api.getMyPosts(user._id));},[]);
  const handleDelete=p=>setConfirm({title:"Delete Post?",msg:`"${p.title}" will be permanently removed.`,onConfirm:()=>{api.deletePost(user._id,p._id);setPosts(x=>x.filter(q=>q._id!==p._id));showToast("Post deleted.");setConfirm(null);}});
  const totalLikes=posts.reduce((s,p)=>s+p.likes,0);
  const totalComments=posts.reduce((s,p)=>s+p.comments.length,0);

  return(
    <>
      {confirm&&<Modal {...confirm} onCancel={()=>setConfirm(null)}/>}
      <div className="dash-hero">
        <div className="dash-orb"/>
        <div className="dash-in">
          <div className="av" style={{width:66,height:66,fontSize:"1.7rem",background:avColor(user.name)}}>{user.avatar}</div>
          <div>
            <div className="dash-name">{user.name}</div>
            <div className="dash-email">{user.email}</div>
            <div className="dash-stats">
              <div><span className="dsnum">{posts.length}</span><span className="dslbl">Posts</span></div>
              <div className="dsdiv"/>
              <div><span className="dsnum">{totalLikes}</span><span className="dslbl">Likes</span></div>
              <div className="dsdiv"/>
              <div><span className="dsnum">{totalComments}</span><span className="dslbl">Comments</span></div>
            </div>
          </div>
          <div className="dash-acts">
            <button className="btn btn-p" onClick={()=>{setEditPost(null);setPage("editor");}}>+ New Post</button>
          </div>
        </div>
      </div>
      <div style={{padding:"52px 0"}}>
        <div className="c">
          <div className="sec-hd"><h2 className="sec-ttl">My Posts</h2></div>
          {posts.length===0?(
            <div className="empty">
              <span className="empty-ico">✍️</span>
              <div className="empty-ttl">Your first story awaits</div>
              <p style={{color:"var(--ink4)",fontSize:"0.9rem",marginBottom:28}}>Use the AI assistant to write your first post in seconds.</p>
              <button className="btn btn-p" onClick={()=>setPage("editor")}>Write Your First Post</button>
            </div>
          ):(
            <div className="my-list">
              {posts.map((p,i)=>(
                <div key={p._id} className="my-item" style={{animationDelay:`${i*50}ms`}}>
                  {p.coverImage&&<img className="my-thumb" src={p.coverImage} alt="" onError={e=>e.target.style.display="none"}/>}
                  <div style={{flex:1}}>
                    <div className="my-title" onClick={()=>{setCurrentSlug(p.slug);setPage("post");}}>{p.title}</div>
                    <div className="my-meta">{fmtDate(p.createdAt)} · ♥ {p.likes} · 💬 {p.comments.length} · {readTime(p.content)} min{p.tags.length>0&&<span style={{marginLeft:8,color:"var(--ac)"}}>{p.tags.map(t=>`#${t}`).join(" ")}</span>}</div>
                  </div>
                  <div className="my-acts">
                    <button className="btn btn-o btn-sm" onClick={()=>{setEditPost(p);setPage("editor");}}>Edit</button>
                    <button className="btn btn-d btn-sm" onClick={()=>handleDelete(p)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="arch">
            <div className="arch-hd">🏗 REST API + AI Architecture Reference</div>
            <div className="arch-grid">
              {[
                {t:"POST /api/auth/signup",d:"bcrypt password hash → MongoDB user → JWT (7d) → {token, user}"},
                {t:"POST /api/auth/login",d:"Credential validation → JWT signed → stored in localStorage"},
                {t:"GET /api/posts",d:"Public. Paginated ?page&limit. Tag filter. No auth needed."},
                {t:"POST /api/posts",d:"Protected. Bearer JWT. Multer for image upload → S3/Cloudinary URL saved."},
                {t:"PUT /api/posts/:id",d:"Protected. verifyJWT middleware checks ownership before update."},
                {t:"DELETE /api/posts/:id",d:"Protected. Author-only. Returns 403 if unauthorized."},
                {t:"POST /api/ai/generate-content",d:"Calls Claude API with title+tags. Returns {content, excerpt} JSON."},
                {t:"POST /api/ai/generate-image",d:"Calls DALL-E 3 or Stability AI with prompt. Uploads result to S3."},
              ].map(r=><div key={r.t} className="arch-item"><code>{r.t}</code><p>{r.d}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Footer({setPage}){
  const[email,setEmail]=useState("");
  const[subbed,setSubbed]=useState(false);
  const doSub=()=>{if(email.trim()){setSubbed(true);setEmail("");}};
  return(
    <footer className="footer">
      <div className="ft-orb ft-o1"/><div className="ft-orb ft-o2"/><div className="ft-grid"/>
      <div className="ft-top">
        <div>
          <div className="ft-logo"><div className="ft-logo-dot"/>InkWell</div>
          <p className="ft-tagline">The modern home for writers who care about craft, clarity, and genuine connection.</p>
          <div className="ft-social">{["𝕏","in","⬡","◎","▶"].map((s,i)=><button key={i} className="ft-sb">{s}</button>)}</div>
        </div>
        <div>
          <div className="ft-col-ttl">Platform</div>
          <ul className="ft-links">{["Explore Posts","Start Writing","AI Assistant","Tags & Topics","Trending"].map(l=><li key={l} onClick={()=>setPage("home")}>{l}</li>)}</ul>
        </div>
        <div>
          <div className="ft-col-ttl">Developers</div>
          <ul className="ft-links">{["REST API Docs","JWT Auth Guide","Image Upload","AI Integration","OpenAPI Spec"].map(l=><li key={l}>{l}</li>)}</ul>
        </div>
        <div>
          <div className="ft-col-ttl">Newsletter</div>
          <p className="ft-nl-desc">Writing tips, platform updates, and curated stories. Once a week.</p>
          {subbed?(
            <div style={{background:"rgba(45,186,122,0.1)",border:"1px solid rgba(45,186,122,0.3)",borderRadius:10,padding:"11px 18px",fontSize:"0.82rem",color:"var(--ac3)"}}>✓ Subscribed! Check your inbox.</div>
          ):(
            <div className="ft-nl-form">
              <input className="ft-nl-in" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSub()}/>
              <button className="ft-nl-btn" onClick={doSub}>Subscribe →</button>
            </div>
          )}
        </div>
      </div>
      <hr className="ft-divider"/>
      <div className="ft-bottom">
        <span className="ft-copy">© 2025 InkWell. Built with <span>♥</span> for the love of writing.</span>
        <div className="ft-badges">{["Express.js","MongoDB","JWT","Claude AI","React"].map(b=><span key={b} className="ft-badge">{b}</span>)}</div>
        <div className="ft-legal"><span>Privacy</span><span>Terms</span><span>Cookies</span></div>
      </div>
    </footer>
  );
}

// ── APP ─────────────────────────────────────────────────────
function App(){
  const{user,loading}=useAuth();
  const{dark}=useTheme();
  const[page,setPage]=useState("home");
  const[currentSlug,setCurrentSlug]=useState(null);
  const[editPost,setEditPost]=useState(null);
  const[toast,setToast]=useState(null);
  const[search,setSearch]=useState("");
  const showToast=msg=>setToast(msg);
  const navTo=p=>{setSearch("");setPage(p);window.scrollTo(0,0);};

  useEffect(()=>{document.documentElement.setAttribute("data-theme",dark?"dark":"light");},[dark]);
  useEffect(()=>{if(!loading&&(page==="dashboard"||page==="editor")&&!user)setPage("login");},[user,loading,page]);

  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}><div style={{width:42,height:42,border:"3px solid var(--bd)",borderTopColor:"var(--ac)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/></div>;

  const noFooter=["login","signup"].includes(page);
  return(
    <>
      <style>{CSS}</style>
      <Header setPage={navTo} search={search} setSearch={setSearch}/>
      <main>
        {page==="home"&&<HomePage setPage={navTo} setCurrentSlug={setCurrentSlug} search={search}/>}
        {page==="post"&&<PostPage slug={currentSlug} setPage={navTo} setEditPost={setEditPost} showToast={showToast}/>}
        {page==="login"&&<AuthPage mode="login" setPage={navTo} showToast={showToast}/>}
        {page==="signup"&&<AuthPage mode="signup" setPage={navTo} showToast={showToast}/>}
        {page==="editor"&&user&&<EditorPage editPost={editPost} setPage={navTo} showToast={showToast}/>}
        {page==="dashboard"&&user&&<DashboardPage setPage={navTo} setCurrentSlug={setCurrentSlug} setEditPost={setEditPost} showToast={showToast}/>}
      </main>
      {!noFooter&&<Footer setPage={navTo}/>}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
    </>
  );
}

export default function Root(){
  return <ThemeProvider><AuthProvider><App/></AuthProvider></ThemeProvider>;
}
