import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Cat, Check, CirclePlay, Clock3, Copy, Heart, Menu, Moon, Plus, Sparkles, Sun, X, Link2, BarChart3 } from 'lucide-react'
import Brand from './components/Brand'
const Editor = lazy(() => import('./components/Editor'))
const ScenePlayer = lazy(() => import('./components/ScenePlayer'))
import type { Experience } from './types'
import PhoneDemo from './components/PhoneDemo'
import { storage } from './services/storage'
import { supabase } from './services/supabase/client'
import { useAuth } from './services/auth'
const AuthModal = lazy(() => import('./components/AuthModal'))
import DevCredit from './components/DevCredit'
import QuickStart, { type QuickForm } from './components/QuickStart'
import PayWall from './components/PayWall'
import { isPaid } from './services/payments'
const WishPage = lazy(() => import('./components/WishPage'))
const StatsModal = lazy(() => import('./components/StatsModal'))
import TemplateGallery from './components/TemplateGallery'
import { type Template } from './lib/templates'
import { themes } from './data'
import { LogOut, UserRound } from 'lucide-react'

const fb = <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#130d22', color: '#f6c7df', fontSize: 34 }} role="status" aria-label="Loading">♡</div>

type Page = 'home' | 'dashboard' | 'editor'
const insideCards = [
  { emoji: '🎈', title: 'Balloon wish tree', desc: 'Pop each balloon to reveal a sweet note written for them.', tone: 'ic-pink' },
  { emoji: '🎂', title: 'Cake and a wish', desc: 'A cake that builds itself, candle and all.', tone: 'ic-violet' },
  { emoji: '💌', title: 'A sealed letter', desc: 'Your words, typed out one letter at a time.', tone: 'ic-peach' },
  { emoji: '📸', title: 'Photos and moments', desc: 'Their best memories hung on a rope of lights.', tone: 'ic-blue' },
  { emoji: '🎬', title: 'A video surprise', desc: 'Play your own clip or the one made for the occasion.', tone: 'ic-gold' },
  { emoji: '💐', title: 'Bouquet finale', desc: 'Confetti, flowers and one last big feeling.', tone: 'ic-lilac' },
]
declare global { interface Window { __lovoraAfterAuth?: () => void } }
export default function App() {
  const [page,setPage] = useState<Page>('home')
  const [dark,setDark] = useState(()=>localStorage.getItem('lovora-theme')!=='light')
  const [menu,setMenu] = useState(false)
  const [drafts,setDrafts] = useState<Experience[]>([])
  const [editing,setEditing] = useState<Experience|undefined>()
  const [wishId] = useState(()=>window.location.pathname.match(/^\/wish\/([^/]+)/)?.[1])
  const [player,setPlayer] = useState<Experience|undefined>()
  const [playerIsPreview,setPlayerIsPreview] = useState(false)
  const { user, signOut, recovering, dismissRecovery, loading: authLoading } = useAuth()
  const [authOpen,setAuthOpen] = useState(false)
  const [pendingCreate,setPendingCreate] = useState(false)
  const [toast,setToast] = useState('')
  const [statsFor,setStatsFor] = useState<Experience|undefined>()
  const [remoteMessage,setRemoteMessage] = useState('')
  const [installEv,setInstallEv]=useState<{prompt:()=>Promise<void>}|null>(null)
  useEffect(()=>{const h=(e:Event)=>{e.preventDefault();setInstallEv(e as unknown as {prompt:()=>Promise<void>})};window.addEventListener('beforeinstallprompt',h);return()=>window.removeEventListener('beforeinstallprompt',h)},[])
  const [unlockedId,setUnlockedId]=useState('');const [unlockTry,setUnlockTry]=useState('');const [unlockBad,setUnlockBad]=useState(false)
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('lovora-theme',dark?'dark':'light')},[dark])
  useEffect(()=>{refresh();const path=window.location.pathname;const id=path.match(/^\/s\/([^/]+)/)?.[1];if(id){const local=storage.getLocal(decodeURIComponent(id));if(local?.published){setPlayer(local);return} if(supabase){storage.getPublic(decodeURIComponent(id)).then(x=>x?setPlayer(x):setRemoteMessage('This experience is unavailable or has not been published.'))}else setRemoteMessage('This is not a published public experience. Ask the creator to configure cloud sharing.')}},[])
  const refresh=()=>setDrafts(storage.list())
  // Email sign-in comes first: creating or editing needs an account, so drafts and links follow the person across devices.
  const gate=(go:()=>void)=>{ if(user){go();return} setPendingCreate(true);setAuthOpen(true);window.__lovoraAfterAuth=go }
  // occasion and person are chosen on the landing page, so every "create" button leads there
  const newExperience=()=>{setPage('home');setEditing(undefined);setMenu(false);window.history.pushState({},'','/');window.setTimeout(()=>document.getElementById('templates')?.scrollIntoView({behavior:'smooth'}),80)}
  const editExperience=(x:Experience)=>gate(()=>{setEditing(x);setPage('editor');window.history.pushState({},'', '/create')})
  useEffect(()=>{ if(user&&pendingCreate){ setPendingCreate(false);setAuthOpen(false);const go=window.__lovoraAfterAuth;window.__lovoraAfterAuth=undefined;go?.() } },[user,pendingCreate])
  useEffect(()=>{ if(recovering) setAuthOpen(true) },[recovering])
  const [quick,setQuick]=useState<Template|null>(null)
  const [quickForm,setQuickForm]=useState<QuickForm>({to:'',from:'',photo:'',id:''})
  const [payExp,setPayExp]=useState<Experience|null>(null)
  const startTemplate=(t:Template)=>gate(()=>{setQuickForm({to:'',from:'',photo:'',id:crypto.randomUUID()});setQuick(t)})
  const openFull=(e:Experience)=>{setQuick(null);setEditing(e);setPage('editor');window.history.pushState({},'', '/create')}
  const exitEditor=()=>{setPage('home');setEditing(undefined);window.history.pushState({},'','/')}
  const onSaved=()=>{refresh();setToast('Saved on this device');window.setTimeout(()=>setToast(''),2200)}
  const copyLink=(x:Experience)=>gate(async()=>{if(!isPaid(x)){setPayExp(x);return}setToast('Preparing your share link…');try{const published=await storage.publish(x);storage.saveDraft(published);refresh();const url=`${window.location.origin}/s/${published.id}`;try{await navigator.clipboard.writeText(url);setToast('Share link copied ♡ anyone can open it')}catch{setToast(url)}}catch(err){setToast(err instanceof Error?err.message:'Could not create the link.')}window.setTimeout(()=>setToast(''),4000)})
  const remove=(x:Experience)=>{if(confirm(`Delete “${x.title}” from this device?`)){storage.removeLocal(x.id);refresh()}}
  const duplicate=(x:Experience)=>{storage.duplicate(x);refresh();setToast('Draft duplicated');window.setTimeout(()=>setToast(''),2200)}
  const explore=()=>document.getElementById('templates')?.scrollIntoView({behavior:'smooth'})
  if(wishId) return <Suspense fallback={fb}><WishPage id={decodeURIComponent(wishId)}/></Suspense>
  const installBtn=installEv?<button className="install-btn" onClick={()=>{void installEv.prompt();setInstallEv(null)}}>📲 Install app</button>:null
  if(player && !playerIsPreview && player.unlockQuestion && player.unlockAnswer && unlockedId!==player.id){
    const norm=(t:string)=>t.trim().toLowerCase().replace(/\s+/g,' ')
    return <main className="unlock-gate"><div className="unlock-card"><p className="eyebrow">A LITTLE LOCK 🔒</p><h1>Before you open it…</h1><p className="muted">{player.unlockQuestion}</p><input value={unlockTry} onChange={e=>{setUnlockTry(e.target.value);setUnlockBad(false)}} placeholder="Your answer" onKeyDown={e=>{if(e.key==='Enter')document.getElementById('unlock-go')?.click()}}/>{unlockBad&&<p className="error-text">Not quite. Try again ♡</p>}<button id="unlock-go" className="primary-btn" onClick={()=>{if(norm(unlockTry)===norm(player.unlockAnswer||'')){setUnlockedId(player.id)}else setUnlockBad(true)}}>Open my surprise</button></div><DevCredit/></main>
  }
  if(player) return <Suspense fallback={fb}><ScenePlayer experience={player} preview={playerIsPreview} onClose={()=>{setPlayer(undefined);setPlayerIsPreview(false);setRemoteMessage('');window.history.pushState({},'','/')}}/></Suspense>
  return <div className="app-shell">
    <header className="site-nav"><Brand/><nav className={menu?'nav-open':''}><button onClick={()=>{setPage('home');setMenu(false);window.history.pushState({},'','/')}}>Discover</button><button onClick={()=>{setPage('dashboard');setMenu(false);refresh();window.history.pushState({},'','/dashboard')}}>My creations</button><a href="#how-it-works" onClick={()=>setMenu(false)}>How it works</a></nav><div className="nav-actions"><button className="theme-toggle" onClick={()=>setDark(v=>!v)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>{user?<button className="ghost-btn nav-user" onClick={()=>signOut().then(()=>setToast('Signed out')).catch(()=>{})} title={`Signed in as ${user.email}. Tap to sign out`}><UserRound size={15}/><span>{user.email?.split('@')[0]}</span><LogOut size={14}/></button>:!authLoading&&<button className="ghost-btn nav-user" onClick={()=>{setPendingCreate(false);setAuthOpen(true)}}><UserRound size={15}/> Sign in</button>}<button className="primary-btn nav-create" onClick={newExperience}><Plus size={16}/> Create yours</button><button className="menu-toggle" onClick={()=>setMenu(v=>!v)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></div></header>
    {remoteMessage && <div className="route-message"><span>{remoteMessage}</span><button onClick={()=>setRemoteMessage('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {page!=='editor'&&installBtn}{page==='editor'?<Suspense fallback={fb}><Editor initial={editing} onExit={exitEditor} onSaved={onSaved} onPreview={x=>{setEditing(x);setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}/></Suspense>:page==='dashboard'?<main className="dashboard-page"><div className="section-kicker"><span/> YOUR LITTLE UNIVERSES</div><div className="dashboard-heading"><div><h1>My creations<span>.</span></h1><p>Every little world you’ve made, all in one place.</p></div><button className="primary-btn" onClick={newExperience}><Plus size={17}/> New surprise</button></div>{drafts.length===0?<div className="empty-dashboard"><div className="empty-icon"><Cat size={38}/></div><h2>Your story starts here.</h2><p>You haven’t made a surprise yet. Let’s change that.</p><button className="primary-btn" onClick={newExperience}>Create your first surprise <ArrowRight size={16}/></button></div>:<div className="draft-grid">{drafts.map(x=><article className="draft-card" key={x.id}><div className="draft-art" style={{background:themes.find(t=>t.name===x.theme)?.colors}}><span>✦ {x.occasion}</span><Heart fill="currentColor" size={36}/></div><div className="draft-info"><div className="draft-status"><span className="status-dot"/>{x.published?'Published':'Private draft'}</div><h3>{x.title}</h3><p>For {x.recipient||'someone special'}</p><small><Clock3 size={13}/> Updated {new Date(x.updatedAt).toLocaleDateString()}</small><div className="draft-actions"><button onClick={()=>editExperience(x)}>Edit</button><button onClick={()=>{setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}><CirclePlay size={14}/> Preview</button>{x.published&&<button onClick={()=>setStatsFor(x)} title="Who opened it"><BarChart3 size={14}/> Stats</button>}<button onClick={()=>copyLink(x)} title="Create a share link"><Link2 size={14}/> Share link</button><button onClick={()=>duplicate(x)} title="Duplicate"><Copy size={14}/></button><button onClick={()=>remove(x)} title="Delete">Delete</button></div></div></article>)}</div>}<TemplateGallery compact onPick={startTemplate}/>{statsFor&&<Suspense fallback={null}><StatsModal exp={statsFor} onClose={()=>setStatsFor(undefined)}/></Suspense>}</main>:<><main>
      <section className="hero calm-hero pro-hero"><div className="vb-aurora" aria-hidden="true"><i/><i/><i/></div><div className="vb-float" aria-hidden="true">{['🎈','💖','✨','🦋','🎂','🌸','⭐','💌'].map((e,i)=><span key={i} style={{left:`${6+i*12}%`,animationDelay:`${-i*1.7}s`,animationDuration:`${9+(i%4)*2}s`,fontSize:`${18+(i%3)*8}px`}}>{e}</span>)}</div>
        <div className="hero-copy"><div className="hero-pill"><Sparkles size={14}/> SURPRISES, MADE INTERACTIVE</div><h1>Make their day<br/><span className="gradient-text">unforgettable.</span></h1><p className="hero-lede">Turn a birthday, an anniversary or a few kind words into a little interactive world. One link, and the surprise starts the moment they open it.</p><div className="hero-buttons"><button className="primary-btn big-btn" onClick={explore}>Create a surprise <ArrowRight size={18}/></button></div><ul className="hero-points"><li><Check size={15}/> No app needed</li><li><Check size={15}/> Free to preview</li><li><Check size={15}/> Ready in a minute</li></ul></div>
        <PhoneDemo/>
      </section>
      <TemplateGallery onPick={startTemplate}/>
      <section className="inside-section"><div className="section-kicker"><span/> EVERYTHING INSIDE</div><h2>Every surprise comes with <em>the good stuff.</em></h2><div className="inside-grid">{insideCards.map(c=><article key={c.title} className={`inside-card ${c.tone}`}><span className="inside-ico" aria-hidden="true">{c.emoji}</span><h3>{c.title}</h3><p>{c.desc}</p></article>)}</div></section>
      <section id="how-it-works" className="how-section calm-how"><div className="section-kicker"><span/> EASY AS A LOVE NOTE</div><h2>Three little steps.</h2><div className="how-steps"><div className="how-step"><span>01</span><div><strong>Pick who it is for</strong><p>Every occasion and person has its own look and its own story.</p></div></div><div className="how-step"><span>02</span><div><strong>Add your words</strong><p>Names, a message, balloon wishes and a few photos.</p></div></div><div className="how-step"><span>03</span><div><strong>Preview, then share</strong><p>Watch it first for free, then send the link when you are ready.</p></div></div></div></section>
    </main><footer className="site-footer"><Brand small/><p>Made for the people who make life feel like something.</p><span>© {new Date().getFullYear()} LOVORA MEOW <i>·</i> LITTLE WORLDS, BIG FEELINGS</span><DevCredit/></footer></>}
    {authOpen&&<Suspense fallback={null}><AuthModal recovery={recovering} reason={pendingCreate?'Sign in with your email to start creating — your surprises are saved to your account.':undefined} onClose={()=>{setAuthOpen(false);setPendingCreate(false);window.__lovoraAfterAuth=undefined;if(recovering)dismissRecovery()}} onDone={()=>setToast('Signed in ♡')}/></Suspense>}
    {quick&&<QuickStart template={quick} form={quickForm} setForm={setQuickForm} onClose={()=>setQuick(null)} onFull={openFull} onPreview={x=>{setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}} onDone={refresh}/>}
    {payExp&&<PayWall item={payExp} onClose={()=>setPayExp(null)} onPaid={e=>{setPayExp(null);storage.saveDraft(e);refresh();copyLink(e)}} onPreview={()=>{const x=payExp;setPayExp(null);setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}/>}
    {toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}
  </div>
}
