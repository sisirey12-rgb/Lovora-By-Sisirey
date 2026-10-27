import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Cat, Check, CirclePlay, Clock3, Copy, Heart, Menu, Moon, Plus, Sun, X, Link2, BarChart3 } from 'lucide-react'
import Brand from './components/Brand'
const Editor = lazy(() => import('./components/Editor'))
const ScenePlayer = lazy(() => import('./components/ScenePlayer'))
import type { Experience, Occasion, Relation } from './types'
import { storage } from './services/storage'
import { supabase } from './services/supabase/client'
import { useAuth } from './services/auth'
const AuthModal = lazy(() => import('./components/AuthModal'))
import DevCredit from './components/DevCredit'
import StartSheet from './components/StartSheet'
import PayWall from './components/PayWall'
import { publishShare, clearPending, saveGiftCode, fetchGiftIntent } from './services/payments'
const GiftModal = lazy(() => import('./components/GiftModal'))
const WishPage = lazy(() => import('./components/WishPage'))
const StatsModal = lazy(() => import('./components/StatsModal'))
import TemplateGallery from './components/TemplateGallery'
import SmoothScroll from './components/SmoothScroll'
import ThemePicker from './components/ThemePicker'
import { LandingChrome } from './components/LandingFX'
import LandingNew from './components/LandingNew'
import { type Template } from './lib/templates'
import { themes } from './data'
const AccountModal=lazy(()=>import('./components/AccountModal'))
import { UserRound } from 'lucide-react'

const fb = <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#130d22', color: '#f6c7df', fontSize: 34 }} role="status" aria-label="Loading">♡</div>

type Page = 'home' | 'dashboard' | 'editor'

declare global { interface Window { __lovoraAfterAuth?: () => void } }
export default function App() {
  const [page,setPage] = useState<Page>('home')
  const [dark,setDark] = useState(()=>localStorage.getItem('lovora-theme')==='dark')
  const [menu,setMenu] = useState(false)
  const [drafts,setDrafts] = useState<Experience[]>([])
  const [editing,setEditing] = useState<Experience|undefined>()
  const [editorStartStep, setEditorStartStep] = useState(1)
  const [wishId] = useState(()=>window.location.pathname.match(/^\/wish\/([^/]+)/)?.[1])
  const [player,setPlayer] = useState<Experience|undefined>()
  const [playerIsPreview,setPlayerIsPreview] = useState(false)
  const { user, recovering, dismissRecovery, loading: authLoading } = useAuth()
  const [authOpen,setAuthOpen] = useState(false)
  const [accountOpen,setAccountOpen] = useState(false)
  const [pendingCreate,setPendingCreate] = useState(false)
  const [toast,setToast] = useState('')
  const [statsFor,setStatsFor] = useState<Experience|undefined>()
  const [remoteMessage,setRemoteMessage] = useState('')
  const [installEv,setInstallEv]=useState<{prompt:()=>Promise<void>}|null>(null)
  useEffect(()=>{const h=(e:Event)=>{e.preventDefault();setInstallEv(e as unknown as {prompt:()=>Promise<void>})};window.addEventListener('beforeinstallprompt',h);return()=>window.removeEventListener('beforeinstallprompt',h)},[])
  const [unlockedId,setUnlockedId]=useState('');const [unlockTry,setUnlockTry]=useState('');const [unlockBad,setUnlockBad]=useState(false)
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('lovora-theme',dark?'dark':'light')},[dark])
  useEffect(()=>{try{const r=new URLSearchParams(window.location.search).get('ref');if(r)localStorage.setItem('lovora-ref',r.slice(0,64))}catch{/* private mode */}},[])
  useEffect(()=>{refresh();const path=window.location.pathname;const raw=path.match(/^\/s\/([^/]+)/)?.[1];if(raw){const requested=decodeURIComponent(raw);const open=async()=>{let id=requested;if(!/^[0-9a-f-]{36}$/i.test(requested)){try{const r=await fetch(`/api/custom-link?slug=${encodeURIComponent(requested)}`);const j=await r.json();if(!r.ok||!j.experienceId)throw new Error('This custom link was not found.');id=j.experienceId}catch(e){setRemoteMessage(e instanceof Error?e.message:'This custom link was not found.');return}}const local=storage.getLocal(id);if(local?.published){setPlayer(local);return}if(supabase){try{const x=await storage.getPublic(id);x?setPlayer(x):setRemoteMessage('This experience is unavailable or has not been published.')}catch{setRemoteMessage('This experience is unavailable or has not been published.')}}else setRemoteMessage('This is not a published public experience. Ask the creator to configure cloud sharing.')};void open()}},[])
  const refresh=()=>setDrafts(storage.list())
  // Email sign-in comes first: creating or editing needs an account, so drafts and links follow the person across devices.
  const gate=(go:()=>void)=>{ if(user){go();return} setPendingCreate(true);setAuthOpen(true);window.__lovoraAfterAuth=go }
  // occasion and person are chosen on the landing page, so every "create" button leads there
  const newExperience=()=>{setPage('home');setEditing(undefined);setMenu(false);window.history.pushState({},'','/');window.setTimeout(()=>document.getElementById('templates')?.scrollIntoView({behavior:'smooth'}),80)}
  const editExperience=(x:Experience)=>gate(()=>{setEditing(x);setEditorStartStep(1);setPage('editor');window.history.pushState({},'', '/create')})
  useEffect(()=>{ if(user&&pendingCreate){ setPendingCreate(false);setAuthOpen(false);const go=window.__lovoraAfterAuth;window.__lovoraAfterAuth=undefined;go?.() } },[user,pendingCreate])
  useEffect(()=>{ if(recovering) setAuthOpen(true) },[recovering])
  const [start,setStart]=useState<{occasion:Occasion;relation?:Relation;seasonSlug?:string}|null>(null)
  const [payExp,setPayExp]=useState<Experience|null>(null)
  const [giftOpen,setGiftOpen]=useState(false), [giftCode,setGiftCode]=useState('')
  const [returnPaid,setReturnPaid]=useState<string|null>(null), [returnGiftIntent,setReturnGiftIntent]=useState<string|null>(null)
  const startTemplate=(t:Template)=>gate(()=>setStart({occasion:t.occasion,relation:t.relation}))
  const startOccasion=(o:Occasion,r?:Relation,seasonSlug?:string)=>gate(()=>setStart({occasion:o,relation:r,seasonSlug}))
  const openFull=(e:Experience)=>{setStart(null);setEditing(e);setEditorStartStep(1);setPage('editor');window.history.pushState({},'', '/create')}
  const exitEditor=()=>{setPage('home');setEditing(undefined);window.history.pushState({},'','/')}
  const onSaved=()=>{refresh();setToast('Saved on this device');window.setTimeout(()=>setToast(''),2200)}
  const copyLink=(x:Experience)=>gate(async()=>{setToast('Creating your share link…');try{const r=await publishShare(x,m=>setToast(m));if(!r.ok){setToast('');setPayExp(x);return}storage.saveDraft(r.item);refresh();const url=`${window.location.origin}/s/${r.item.id}`;try{await navigator.clipboard.writeText(url);setToast('Your surprise link is ready ♡ anyone with the link can open it')}catch{setToast(url)}}catch(err){setToast(err instanceof Error?err.message:'Could not create the link.')}window.setTimeout(()=>setToast(''),4500)})
  // Coming back from eSewa / Khalti, or opening a gift link: /?paid=<id>  /?gift_intent=<id>  /?gift=<code>  /?payment=failed
  useEffect(()=>{try{const q=new URLSearchParams(window.location.search);const clean=()=>window.history.replaceState({},'',window.location.pathname)
    const paid=q.get('paid'),gi=q.get('gift_intent'),g=q.get('gift'),f=q.get('payment')
    if(paid){clearPending();setReturnPaid(paid);clean()}
    else if(gi){setReturnGiftIntent(gi);clean()}
    else if(g){saveGiftCode(g.toUpperCase().slice(0,14));setToast('Gift code saved ♡ it will be applied when you share your surprise');window.setTimeout(()=>setToast(''),6000);clean()}
    else if(f==='failed'){setToast('The payment was not completed. You have not been charged.');window.setTimeout(()=>setToast(''),7000);clean()}}catch{/* ignore */}},[])
  useEffect(()=>{if(!returnPaid||!user)return;const id=returnPaid;setReturnPaid(null);const it=storage.list().find(x=>x.id===id);if(it){setToast('Payment received ✓ creating your link…');copyLink({...it,paid:true})}else{setToast('Payment received ✓ open My surprises and tap Share link.');window.setTimeout(()=>setToast(''),6000)}},[returnPaid,user])  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{if(!returnGiftIntent||!user)return;const id=returnGiftIntent;setReturnGiftIntent(null);void fetchGiftIntent(id).then(c=>{if(c){setGiftCode(c);setGiftOpen(true)}else{setToast('Your gift is being prepared. Open Gift a surprise in a minute.');window.setTimeout(()=>setToast(''),6000)}})},[returnGiftIntent,user])
  const remove=(x:Experience)=>{if(confirm(`Delete “${x.title}” from this device?`)){storage.removeLocal(x.id);refresh()}}
  const duplicate=(x:Experience)=>{storage.duplicate(x);refresh();setToast('Draft duplicated');window.setTimeout(()=>setToast(''),2200)}
  if(wishId) return <Suspense fallback={fb}><WishPage id={decodeURIComponent(wishId)}/></Suspense>
  const installBtn=installEv?<button className="install-btn" onClick={()=>{void installEv.prompt();setInstallEv(null)}}>📲 Install app</button>:null
  if(player && !playerIsPreview && player.unlockQuestion && player.unlockAnswer && unlockedId!==player.id){
    const norm=(t:string)=>t.trim().toLowerCase().replace(/\s+/g,' ')
    return <main className="unlock-gate"><div className="unlock-card"><p className="eyebrow">A LITTLE LOCK 🔒</p><h1>Before you open it…</h1><p className="muted">{player.unlockQuestion}</p><input value={unlockTry} onChange={e=>{setUnlockTry(e.target.value);setUnlockBad(false)}} placeholder="Your answer" onKeyDown={e=>{if(e.key==='Enter')document.getElementById('unlock-go')?.click()}}/>{unlockBad&&<p className="error-text">Not quite. Try again ♡</p>}<button id="unlock-go" className="primary-btn" onClick={()=>{if(norm(unlockTry)===norm(player.unlockAnswer||'')){setUnlockedId(player.id)}else setUnlockBad(true)}}>Open my surprise</button></div><DevCredit/></main>
  }
  const closePlayer=()=>{setPlayer(undefined);setPlayerIsPreview(false);setRemoteMessage('');window.history.pushState({},'','/')}
  if(player) return <Suspense fallback={fb}><ScenePlayer experience={player} preview={playerIsPreview} previewActions={playerIsPreview?{onEdit:()=>{const x=player;closePlayer();setEditing(x);setEditorStartStep(2);setPage('editor');window.history.pushState({},'','/create')},onShare:()=>{const x=player;closePlayer();setEditing(x);setEditorStartStep(6);setPage('editor');window.history.pushState({},'','/create')}}:undefined} onFinish={playerIsPreview?()=>{const x=player;closePlayer();setEditing(x);setEditorStartStep(6);setPage('editor');window.history.pushState({},'','/create')}:undefined} onClose={()=>{setPlayer(undefined);setPlayerIsPreview(false);setRemoteMessage('');window.history.pushState({},'','/')}}/></Suspense>
  return <div className="app-shell">
    <header className="site-nav"><Brand/><nav className={menu?'nav-open':''}><button onClick={()=>{setPage('home');setMenu(false);window.history.pushState({},'','/')}}>Discover</button><button onClick={()=>{setPage('dashboard');setMenu(false);refresh();window.history.pushState({},'','/dashboard')}}>My creations</button><a href="#how-it-works" onClick={()=>setMenu(false)}>How it works</a></nav><div className="nav-actions"><button className="theme-toggle" onClick={()=>setDark(v=>!v)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><ThemePicker setDark={setDark}/>{user?<button className="ghost-btn nav-user" onClick={()=>setAccountOpen(true)} title={`Account: ${user.email}`}><UserRound size={15}/><span>{user.email?.split('@')[0]}</span></button>:!authLoading&&<button className="ghost-btn nav-user" onClick={()=>{setPendingCreate(false);setAuthOpen(true)}}><UserRound size={15}/> Sign in</button>}<button className="primary-btn nav-create" onClick={newExperience}><Plus size={16}/> Create yours</button><button className="menu-toggle" onClick={()=>setMenu(v=>!v)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></div></header>
    {remoteMessage && <div className="route-message"><span>{remoteMessage}</span><button onClick={()=>setRemoteMessage('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {page!=='editor'&&installBtn}{page==='editor'?<Suspense fallback={fb}><Editor initial={editing} initialStep={editorStartStep} onExit={exitEditor} onSaved={onSaved} onPreview={x=>{setEditing(x);setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}/></Suspense>:page==='dashboard'?<main className="dashboard-page"><div className="section-kicker"><span/> YOUR LITTLE UNIVERSES</div><div className="dashboard-heading"><div><h1>My creations<span>.</span></h1><p>Every little world you’ve made, all in one place.</p></div><button className="primary-btn" onClick={newExperience}><Plus size={17}/> New surprise</button></div>{drafts.length===0?<div className="empty-dashboard"><div className="empty-icon"><Cat size={38}/></div><h2>Your story starts here.</h2><p>You haven’t made a surprise yet. Let’s change that.</p><button className="primary-btn" onClick={newExperience}>Create your first surprise <ArrowRight size={16}/></button></div>:<div className="draft-grid">{drafts.map(x=><article className="draft-card" key={x.id}><div className="draft-art" style={{background:themes.find(t=>t.name===x.theme)?.colors}}><span>✦ {x.occasion}</span><Heart fill="currentColor" size={36}/></div><div className="draft-info"><div className="draft-status"><span className="status-dot"/>{x.published?'Published':'Private draft'}</div><h3>{x.title}</h3><p>For {x.recipient||'someone special'}</p><small><Clock3 size={13}/> Updated {new Date(x.updatedAt).toLocaleDateString()}</small><div className="draft-actions"><button onClick={()=>editExperience(x)}>Edit</button><button onClick={()=>{setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}><CirclePlay size={14}/> Preview</button>{x.published&&<button onClick={()=>setStatsFor(x)} title="Who opened it"><BarChart3 size={14}/> Stats</button>}<button onClick={()=>copyLink(x)} title="Create a share link"><Link2 size={14}/> Share link</button><button onClick={()=>duplicate(x)} title="Duplicate"><Copy size={14}/></button><button onClick={()=>remove(x)} title="Delete">Delete</button></div></div></article>)}</div>}<TemplateGallery compact onPick={startTemplate}/>{statsFor&&<Suspense fallback={null}><StatsModal exp={statsFor} onClose={()=>setStatsFor(undefined)}/></Suspense>}</main>:<><main>
      <SmoothScroll/><LandingChrome/><LandingNew onStart={startOccasion} onGift={()=>gate(()=>{setGiftCode('');setGiftOpen(true)})}/>
    </main><footer className="site-footer"><Brand small/><p>Made for the people who make life feel like something.</p><span>© {new Date().getFullYear()} LOVORA MEOW <i>·</i> LITTLE WORLDS, BIG FEELINGS</span><DevCredit/></footer></>}
    {accountOpen&&user&&<Suspense fallback={null}><AccountModal items={drafts} onGift={()=>{setAccountOpen(false);setGiftCode('');setGiftOpen(true)}} setDark={setDark} onClose={()=>setAccountOpen(false)} onSignedOut={()=>{setAccountOpen(false);setToast('Signed out')}}/></Suspense>}
    {authOpen&&<Suspense fallback={null}><AuthModal recovery={recovering} reason={pendingCreate?'Sign in with your email to start creating — your surprises are saved to your account.':undefined} onClose={()=>{setAuthOpen(false);setPendingCreate(false);window.__lovoraAfterAuth=undefined;if(recovering)dismissRecovery()}} onDone={()=>setToast('Signed in ♡')}/></Suspense>}
    {start&&!player&&!wishId&&<StartSheet occasion={start.occasion} relation={start.relation} seasonSlug={start.seasonSlug} onClose={()=>setStart(null)} onFull={openFull} onPreview={x=>{setStart(null);setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}} onDone={refresh}/>}
    {giftOpen&&user&&<Suspense fallback={null}><GiftModal onClose={()=>{setGiftOpen(false);setGiftCode('')}} justPaidCode={giftCode}/></Suspense>}
    {payExp&&<PayWall item={payExp} onClose={()=>setPayExp(null)} onPaid={e=>{setPayExp(null);storage.saveDraft(e);refresh();copyLink(e)}} onPreview={()=>{const x=payExp;setPayExp(null);setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}/>}
    {toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}
  </div>
}
