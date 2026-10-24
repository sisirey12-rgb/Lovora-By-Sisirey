import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ImagePlus, Save, Sparkles, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { Experience, MemoryItem } from '../types'
import { occasions, revealDefaults, revealPresets, themes, defaultScenes, cakeStyles, bouquetStyles, hostedMusic, loveFonts, suggestions, textAnims, fontById, revealFor, toTitleCase } from '../data'
import { addReminder } from '../lib/reminder'
import PayWall from './PayWall'
import { isPaid } from '../services/payments'
import { useAuth } from '../services/auth'
import { compressImage, readAsDataUrl } from '../lib/media'
import { RELATIONS, momentsTitle, contentFor, messageFor, occasionKey, suggestFor } from '../lib/occasionContent'
import { worldClass } from '../lib/worlds'
import { storage } from '../services/storage'
import DevCredit from './DevCredit'
import ScenePlayer from './ScenePlayer'
import Suggest from './Suggest'
import BouquetArtwork from './BouquetArtwork'
import VoiceRecorder from './VoiceRecorder'
import VideoPicker from './VideoPicker'
import CouponEditor from './CouponEditor'

type Props = { initial?: Experience; onExit: () => void; onSaved: () => void; onPreview: (x: Experience) => void }
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const blank = (): Experience => ({ id: crypto.randomUUID(), recipient: '', sender: '', balloonCount: 5, targetDate: localDate(new Date(Date.now()+86400000)), openingInstruction: 'When the countdown ends, touch the heart. ♡', musicUrl: hostedMusic, musicName: 'LOVORA Original Soundtrack', memories: [], published: false, updatedAt: new Date().toISOString(), ...contentFor('Birthday', 'Friend', defaultScenes) })
const steps = ['', 'Who', 'Words', 'Look', 'Moments', 'Preview', 'Share']
const LAST = 6
/** A closed-by-default section, so each page only shows what matters and the rest is one tap away. */
const Fold = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => <details className="fold"><summary><strong>{title}</strong>{hint && <small>{hint}</small>}</summary><div className="fold-body">{children}</div></details>
export default function Editor({ initial, onExit, onSaved }: Props) {
  const [item, setItem] = useState<Experience>(()=>initial ? {...initial} : blank())
  const [step, setStep] = useState(1)
  const [animKey, setAnimKey] = useState(0)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [creationStage, setCreationStage] = useState(-1)
  const { user } = useAuth()
  const [autoState, setAutoState] = useState<'' | 'saving' | 'cloud' | 'local' | 'failed'>('')
  const lastSaved = useRef(JSON.stringify({ ...(initial || {}), updatedAt: '' }))
  /** Autosave: a private copy on this device after 3 seconds, and (when signed in) to your account so nothing is lost if the phone clears its storage. Published surprises are never changed behind your back. */
  useEffect(() => {
    if (creationStage >= 0) return
    const sig = JSON.stringify({ ...item, updatedAt: '' })
    if (sig === lastSaved.current || !(item.recipient || item.sender || item.message || item.memories.length)) return
    const t = window.setTimeout(async () => {
      try { storage.saveDraft({ ...item }) } catch { /* local storage full: the cloud copy below still keeps it */ }
      if (!user || item.published) { lastSaved.current = sig; setAutoState('local'); return }
      setAutoState('saving')
      try {
        const withMedia = await storage.uploadMedia(item)
        await storage.saveCloud(withMedia, false)
        lastSaved.current = sig; setAutoState('cloud')
        setItem(old => ({ ...old, memories: old.memories.map(m => { const u = withMedia.memories.find(x => x.id === m.id); return u && m.src.startsWith('data:') ? { ...m, src: u.src } : m }), videoData: old.videoData?.startsWith('data:') ? withMedia.videoData : old.videoData, musicData: old.musicData?.startsWith('data:') ? withMedia.musicData : old.musicData }))
      } catch { setAutoState('failed') }
    }, 3000)
    return () => window.clearTimeout(t)
  }, [item, user, creationStage])
  const [shareUrl, setShareUrl] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = item.targetDate ? new Date(`${item.targetDate}T12:00:00`) : new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const creationSteps = ['Names and occasion saved','Words saved','Look saved','Moments saved','Private draft saved']
  const occ = occasionKey(item.occasion), rel = item.relation || 'Friend'
  const S = suggestFor(occ, rel)
  const has = (s: Experience['scenes'][number]) => item.scenes.includes(s)
  /** Switching occasion or person swaps in the matching text and style, but never overwrites anything the creator has already edited. */
  const lang = item.language || 'English'
  const choose = (o: Experience['occasion'], r: NonNullable<Experience['relation']>, l: 'English' | 'Hinglish' = lang) => {
    const prev = contentFor(occasionKey(item.occasion), item.relation || 'Friend', defaultScenes, lang), next = contentFor(o, r, defaultScenes, l)
    const p: Partial<Experience> = { occasion: o, relation: r, language: l }
    if (JSON.stringify(item.moments||[]) === JSON.stringify(prev.moments||[])) p.moments = next.moments
    for (const k of ['title','greeting','message','closing','secretMessage','theme','cakeStyle','fontStyle','bouquetStyle','textAnim'] as const) { const cur = item[k]; if (!cur || cur === prev[k]) (p as Record<string, unknown>)[k] = next[k] }
    if (JSON.stringify((item.balloonWishes||[]).slice(0,3)) === JSON.stringify((prev.balloonWishes||[]).slice(0,3))) p.balloonWishes = next.balloonWishes
    if (o !== 'Birthday') p.age = undefined
    p.scenes = next.scenes   // the story is chosen by occasion and person, so there is no scene list to manage
    patch(p)
  }
  const patch = (p: Partial<Experience>) => setItem(old=>({...old,...p,updatedAt:new Date().toISOString()}))
  const startPreview = () => setPreview(true)   // opens straight away: no waiting screen in between
  const today = new Date(); today.setHours(0,0,0,0)
  const maxDate = new Date(today); maxDate.setMonth(maxDate.getMonth()+2)
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const calendarCells = Array.from({length:Math.ceil((monthStart.getDay()+new Date(monthStart.getFullYear(),monthStart.getMonth()+1,0).getDate())/7)*7},(_,i)=>{const day=i-monthStart.getDay()+1;return day<1||day>new Date(monthStart.getFullYear(),monthStart.getMonth()+1,0).getDate()?null:new Date(monthStart.getFullYear(),monthStart.getMonth(),day)})
  const dateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const selectedDate = item.targetDate || ''
  const save = () => { if (creationStage >= 0) return; try { const draft = {...item, published:false, updatedAt:new Date().toISOString()}; storage.saveDraft(draft); onSaved(); setCreationStage(0); let stage = 0; const tick = () => { stage += 1; if (stage < creationSteps.length) { setCreationStage(stage); window.setTimeout(tick, 260) } else { setCreationStage(creationSteps.length); window.setTimeout(() => setCreationStage(-1), 1250) } }; window.setTimeout(tick, 260) } catch { setError('Could not save the draft. Browser storage may be full; remove some large memories and try again.') } }
  const next = () => { setError(''); if (step===1 && !item.recipient.trim()) { setError('Add the recipient’s name to make this personal.'); return } if(step<LAST) { setStep(s=>s+1); window.scrollTo({top:0}) } }
  const addMemory = async (file: File) => {
    const isImg = file.type.startsWith('image/'), isVid = file.type.startsWith('video/')
    if (!isImg && !isVid) { setError('Choose an image or video file.'); return }
    if (isVid && file.size > 40*1024*1024) { setError('Videos must be 40 MB or smaller.'); return }
    if (isImg && file.size > 25*1024*1024) { setError('Photos must be 25 MB or smaller.'); return }
    try {
      const src = isImg ? await compressImage(file) : await readAsDataUrl(file)
      const memory: MemoryItem = { id: crypto.randomUUID(), kind: isVid ? 'video' : 'image', src, caption: '', name: file.name }
      patch({ memories: [...item.memories, memory] })
    } catch (e) { setError(e instanceof Error ? e.message : 'This file could not be read. Try another file.') }
  }
  const updateMemory = (id: string, p: Partial<MemoryItem>) => patch({ memories: item.memories.map(m=>m.id===id?{...m,...p}:m) })
  const [paywall, setPaywall] = useState(false)
  const publish = async (src: Experience = item) => {
    setError('')
    if (!src.recipient.trim()) { setError('Please add the recipient’s name first.'); setStep(1); return }
    if (!isPaid(src)) { setPaywall(true); return }
    try { setError('Uploading your photos and videos…'); const withMedia = await storage.uploadMedia(src, (d,t)=>setError(`Uploading media ${d} of ${t}…`)); setItem(withMedia); const published = await storage.publish(withMedia); storage.saveDraft(published); setShareUrl(`${window.location.origin}/s/${published.id}`); setError('Published successfully. Your shareable link is ready below.'); onSaved() } catch(e) { setError(e instanceof Error?e.message:'Could not publish this experience.') }
  }
  const wishId = shareUrl ? shareUrl.split('/s/').pop() : (item.published ? item.id : '')
  const setWish = (i: number, t: string) => { const w = [...(item.balloonWishes||[])]; while (w.length < (item.balloonCount||5)) w.push(''); w[i] = t; patch({ balloonWishes: w }) }
  const dateLabel = selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}) : 'Not set'
  return <div className="editor-shell">
    <header className="editor-head"><button className="icon-btn" onClick={onExit} aria-label="Exit editor"><ArrowLeft/></button><div><span className="eyebrow">YOUR LITTLE UNIVERSE</span><h2>Create a surprise</h2></div><div className="editor-head-actions"><button className="secondary-btn header-preview-btn" onClick={startPreview}><Sparkles size={15}/> Preview</button><button className="save-btn" onClick={save}><Save size={16}/> Save</button></div></header>
    <div className="step-track">{steps.map((s,i)=>i===0?null:<button key={s} className={`${step===i?'current':''} ${step>i?'done':''}`} onClick={()=>setStep(i)}><span>{step>i?<Check size={13}/>:i}</span><small>{s}</small></button>)}</div>
    <main className="editor-main">
      {step===1 && <section><p className="eyebrow">STEP 1 OF {LAST} · WHO IT IS FOR</p><h1>Who is it for?</h1><div className="form-grid">
        <div className="occasion-field"><span>Occasion</span><div className="occasion-chips" role="group" aria-label="Occasion">{occasions.map(o=><button type="button" key={o.name} className={occ===o.name?"selected":""} onClick={()=>choose(o.name,rel)}>{o.icon} {o.name}</button>)}</div></div>
        <div className="occasion-field"><span>Who is it for?</span><div className="occasion-chips" role="group" aria-label="Relationship">{RELATIONS.map(r=><button type="button" key={r.id} className={rel===r.id?"selected":""} onClick={()=>choose(occ,r.id)}>{r.emoji} {r.id}</button>)}</div></div>
        <label>Their name<input value={item.recipient} onChange={e=>patch({recipient:e.target.value})} maxLength={80} placeholder="Who is this for?"/></label>
        <label>Your name<input value={item.sender} onChange={e=>patch({sender:e.target.value})} maxLength={80} placeholder="Who is sending it?"/></label>
        {occ==='Birthday'&&<label>Turning (optional)<input type="number" inputMode="numeric" min={1} max={99} value={item.age ?? ''} onChange={e=>patch({age:e.target.value?Math.min(99,Math.max(1,Math.round(Number(e.target.value)))):undefined})} placeholder="e.g. 21"/></label>}
      </div>
      <div className="fold-stack">
        <Fold title="Reveal date" hint={dateLabel}><div className="themed-calendar-field"><button id="surprise-date-display" type="button" className={`calendar-trigger ${calendarOpen?'is-open':''}`} onClick={()=>{setCalendarMonth(selectedDate?new Date(`${selectedDate}T12:00:00`):new Date());setCalendarOpen(v=>!v)}}><CalendarDays size={18}/><span>{selectedDate?new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined,{weekday:'short',month:'long',day:'numeric',year:'numeric'}):'Choose a date'}</span><ChevronRight size={16}/></button>{calendarOpen&&<div className="theme-calendar" role="dialog" aria-label="Choose surprise date"><div className="calendar-head"><button type="button" aria-label="Previous month" disabled={calendarMonth.getFullYear()===today.getFullYear()&&calendarMonth.getMonth()===today.getMonth()} onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1))}><ChevronLeft size={17}/></button><strong>{calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</strong><button type="button" aria-label="Next month" disabled={calendarMonth.getFullYear()===maxDate.getFullYear()&&calendarMonth.getMonth()===maxDate.getMonth()} onClick={()=>setCalendarMonth(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1))}><ChevronRight size={17}/></button></div><div className="calendar-grid calendar-weekdays">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}-${i}`}>{d}</span>)}</div><div className="calendar-grid">{calendarCells.map((d,i)=>d?<button type="button" key={dateString(d)} disabled={d<today||d>maxDate} className={`${selectedDate===dateString(d)?'selected':''} ${dateString(d)===localDate()?'today':''}`} onClick={()=>{patch({targetDate:dateString(d)});setCalendarOpen(false)}}>{d.getDate()}</button>:<span key={`blank-${i}`}/>)}</div><p className="calendar-footnote">Pick a date within the next two months.</p></div>}<small>Shared links unlock at midnight on this date, on the recipient’s device. Previews always open straight away.</small></div>
          <label>Entrance instruction<input value={item.openingInstruction||''} onChange={e=>patch({openingInstruction:e.target.value})} maxLength={160} placeholder="When the countdown ends, touch here…"/></label></Fold>
        <Fold title="Wording options" hint={lang}><div className="occasion-field"><span>Language of the ready-made text</span><div className="occasion-chips" role="group" aria-label="Language">{(['English','Hinglish'] as const).map(l=><button type="button" key={l} className={lang===l?"selected":""} onClick={()=>choose(occ,rel,l)}>{l}</button>)}</div></div>
          <label>Big animated words<input value={item.revealText||""} onChange={e=>patch({revealText:e.target.value.toUpperCase()})} maxLength={40} placeholder={revealDefaults[occ]}/><small>Shown on the intro and the finale. Leave empty for the default.</small><Suggest label="Words" items={revealPresets} onPick={t=>patch({revealText:t})}/></label></Fold>
      </div></section>}
      {step===2 && <section><p className="eyebrow">STEP 2 OF {LAST} · YOUR WORDS</p><h1>Write your letter</h1><div className="form-grid">
        <label className="span-two">Greeting<input value={item.greeting} onChange={e=>patch({greeting:e.target.value})} maxLength={120} placeholder={S.greeting[0].replaceAll('{name}', item.recipient || '…')}/></label>
        <label className="span-two">Your message<textarea value={item.message} onChange={e=>patch({message:e.target.value})} maxLength={1500} rows={6} placeholder="Tell them what makes them unforgettable…"/></label>
      </div>
      <div className="fold-stack">
        <Fold title="Ready-made messages" hint={`for ${rel.toLowerCase()}`}><div className="template-cards">{([['Warm',false],['Short & sweet',true]] as const).map(([t,short])=>{const txt=messageFor(occ,rel,short,lang);return <article key={t}><strong>{t}</strong><p>{txt}</p><button type="button" className="secondary-btn" onClick={()=>patch({message:txt})}>Use this message</button></article>})}</div><Suggest label="Add a line" items={suggestions.letter} onPick={t=>patch({message:(item.message?item.message.trimEnd()+' ':'')+t})}/></Fold>
        <Fold title="Title and sign-off"><label>Experience title<input value={item.title} onChange={e=>patch({title:e.target.value})} maxLength={100}/><Suggest items={S.title} onPick={t=>patch({title:t})}/></label><label>Closing signature<input value={item.closing} onChange={e=>patch({closing:e.target.value})} maxLength={100}/><Suggest items={suggestions.closing} onPick={t=>patch({closing:t})}/></label></Fold>
      </div></section>}
      {step===3 && <section><p className="eyebrow">STEP 3 OF {LAST} · THE LOOK</p><h1>Choose their little world.</h1><div className="theme-grid">{themes.map(t=><button key={t.name} className={`theme-card ${item.theme===t.name?'selected':''}`} onClick={()=>patch({theme:t.name})}><span style={{background:t.colors}}/><strong>{t.name}</strong><small>{t.description}</small>{item.theme===t.name&&<Check className="theme-check" size={18}/>}</button>)}</div>
      <div className="fold-stack">
        <Fold title="Font and text animation" hint={fontById(item.fontStyle).title}><div className="font-grid">{loveFonts.map(f=><button type="button" key={f.id} className={`font-card ${(item.fontStyle||'classic')===f.id?'selected':''}`} onClick={()=>patch({fontStyle:f.id})}><span style={{fontFamily:f.display}}>{toTitleCase(revealFor(item))}</span><em style={{fontFamily:f.script}}>{item.recipient||'my favourite human'}</em><small>{f.title}</small></button>)}</div><div className="anim-grid">{textAnims.map(a=><button type="button" key={a.id} className={`anim-chip ${(item.textAnim||'rise')===a.id?'selected':''}`} onClick={()=>{patch({textAnim:a.id});setAnimKey(n=>n+1)}}>{a.title}</button>)}</div><div className={`text-anim-preview ta-host ta-${item.textAnim||'rise'}`}><h1 key={animKey} style={{fontFamily:fontById(item.fontStyle).display}}>{toTitleCase(revealFor(item))}</h1><em key={`e${animKey}`} style={{fontFamily:fontById(item.fontStyle).script}}>{item.recipient||'my favourite human'}</em><button type="button" className="text-btn" onClick={()=>setAnimKey(n=>n+1)}>Replay ↻</button></div></Fold>
        {has('cake') && <Fold title="Cake design" hint={cakeStyles.find(c=>c.id===item.cakeStyle)?.title}><div className="media-choice-grid cake-choice-grid">{cakeStyles.map(cake=><button type="button" key={cake.id} className={`media-choice ${item.cakeStyle===cake.id?'selected':''}`} onClick={()=>patch({cakeStyle:cake.id})}><span className={`cake-option-art cake-option-${cake.id}`}><i/><i/><i/></span><strong>{cake.title}</strong></button>)}</div></Fold>}
        <Fold title="Finale bouquet" hint={bouquetStyles.find(b=>b.id===item.bouquetStyle)?.title}><div className="bouquet-choice-grid">{bouquetStyles.map(b=><button type="button" key={b.id} className={`bouquet-choice ${item.bouquetStyle===b.id?'selected':''}`} onClick={()=>patch({bouquetStyle:b.id})}><span className="bouquet-choice-art"><BouquetArtwork style={b.id} compact label={`${b.title} bouquet preview`} /></span><strong>{b.title}</strong></button>)}</div></Fold>
      </div></section>}
      {step===4 && <section><p className="eyebrow">STEP 4 OF {LAST} · MOMENTS</p><h1>Add a few moments.</h1><p className="muted">Photos and videos are all that is needed. Everything else below is optional.</p>
        <label className="upload-zone"><ImagePlus size={30}/><strong>Add photos or videos</strong><span>JPG, PNG, WEBP, GIF or MP4/WebM</span><input type="file" accept="image/*,video/mp4,video/webm" multiple onChange={e=>{Array.from(e.target.files||[]).forEach(addMemory);e.currentTarget.value=''}}/></label>
        <div className="memory-editor-grid">{item.memories.map(m=><div className="memory-edit-card" key={m.id}>{m.kind==='image'?<img src={m.src} alt={m.caption||m.name}/>:<video src={m.src} controls/>}<input value={m.caption} maxLength={120} onChange={e=>updateMemory(m.id,{caption:e.target.value})} placeholder="Caption this moment"/><input type="date" value={m.date||''} onChange={e=>updateMemory(m.id,{date:e.target.value})}/><button className="remove-btn" onClick={()=>patch({memories:item.memories.filter(x=>x.id!==m.id)})}><Trash2 size={14}/> Remove</button></div>)}</div>
        <div className="fold-stack">
          {has('balloons') && <Fold title="Balloon wishes" hint={`${item.balloonCount||5} balloons`}><div className="count-chips" role="radiogroup" aria-label="Number of wish balloons">{[3,4,5,6,7,8,9,10].map(n=><button type="button" role="radio" aria-checked={(item.balloonCount||5)===n} key={n} className={(item.balloonCount||5)===n?'selected':''} onClick={()=>{const w=[...(item.balloonWishes||[])];while(w.length<n)w.push(S.wishes[w.length%S.wishes.length]);patch({balloonCount:n,balloonWishes:w.slice(0,n)})}}>{n}</button>)}</div>{Array.from({length:item.balloonCount||5},(_,i)=><label key={i}>Balloon {i+1}<textarea rows={2} maxLength={180} value={item.balloonWishes?.[i]||''} onChange={e=>setWish(i,e.target.value)} placeholder={`Write wish number ${i+1}…`}/></label>)}</Fold>}
          {has('moments') && <Fold title={momentsTitle(rel)} hint="one per line"><textarea rows={5} value={(item.moments||[]).join('\n')} onChange={e=>patch({moments:e.target.value.split('\n').slice(0,8)})}/></Fold>}
          {has('counter') && <Fold title="Together since" hint={item.togetherSince?'Set':'Adds a day counter'}><input type="date" value={item.togetherSince||''} max={localDate(new Date())} onChange={e=>patch({togetherSince:e.target.value})}/></Fold>}
          {has('coupons') && <Fold title="Coupon book"><CouponEditor value={item.coupons} onChange={v=>patch({coupons:v})}/></Fold>}
          {has('wishjar') && <Fold title="Wish jar" hint="wishes from friends"><p className="muted">Type wishes yourself, or share the wish link after publishing so friends can add theirs.</p>{(item.jarWishes||[]).map((w,i)=><div className="jar-row" key={i}><input value={w.name} maxLength={30} placeholder="Name" onChange={e=>patch({jarWishes:(item.jarWishes||[]).map((x,j)=>j===i?{...x,name:e.target.value}:x)})}/><input value={w.text} maxLength={140} placeholder="Their wish" onChange={e=>patch({jarWishes:(item.jarWishes||[]).map((x,j)=>j===i?{...x,text:e.target.value}:x)})}/><button type="button" className="icon-btn" aria-label="Remove wish" onClick={()=>patch({jarWishes:(item.jarWishes||[]).filter((_,j)=>j!==i)})}>×</button></div>)}{(item.jarWishes||[]).length<8&&<button type="button" className="secondary-btn" onClick={()=>patch({jarWishes:[...(item.jarWishes||[]),{name:'',text:''}]})}>+ Add a wish</button>}{wishId ? <div className="note-card live-wish"><strong>Collect wishes live</strong><input readOnly value={`${window.location.origin}/wish/${wishId}`}/><button type="button" className="secondary-btn" onClick={()=>{void navigator.clipboard.writeText(`${window.location.origin}/wish/${wishId}`)}}>Copy wish link</button><a className="secondary-btn" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent('Add a wish to the jar 🫙 '+window.location.origin+'/wish/'+wishId)}`}>Send on WhatsApp</a></div> : <p className="muted">Publish first (last step) to get a live wish link.</p>}</Fold>}
          <Fold title="Voice note and your own video"><VoiceRecorder value={item.voiceData} onChange={v=>patch({voiceData:v})}/><VideoPicker value={item.videoData} onChange={v=>patch({videoData:v})}/></Fold>
          <Fold title="Secret message and reply links"><label>Secret bonus message<input value={item.secretMessage||''} onChange={e=>patch({secretMessage:e.target.value})} maxLength={160} placeholder="Revealed if they tap the cat 5 times"/></label><label>Your WhatsApp number<input type="tel" inputMode="tel" value={item.replyWhatsApp||""} onChange={e=>patch({replyWhatsApp:e.target.value.replace(/[^0-9+]/g,"").slice(0,16)})} placeholder="Country code + number, e.g. 919876543210"/></label><label>Your Instagram username<input value={item.replyInstagram||""} onChange={e=>patch({replyInstagram:e.target.value.replace(/^@/,"").replace(/[^A-Za-z0-9._]/g,"").slice(0,30)})} placeholder="username, without @"/></label></Fold>
        </div></section>}
      {step===5 && <section><p className="eyebrow">STEP 5 OF {LAST} · THE BIG REVEAL</p><h1>Preview your surprise.</h1><p className="muted">Play the full interactive story. Your changes show up here straight away.</p><div className={`preview-card ${worldClass(occ, rel)}`} style={{background:themes.find(t=>t.name===item.theme)?.colors}}><span>✦ LOVORA ✦</span><h2>{item.recipient ? `For ${item.recipient}` : 'Your favourite human'}</h2><p>{item.title}</p><button onClick={startPreview}>Play full preview <ArrowRight size={16}/></button></div></section>}
      {step===6 && <section><p className="eyebrow">STEP 6 OF {LAST} · SEND A LITTLE MAGIC</p><h1>Make it shareable.</h1><p className="muted">Previewing is always free. Pay once to get a link you can send to anyone.</p>
        <div className="fold-stack"><Fold title="Add a lock question" hint="optional"><label>Question<input value={item.unlockQuestion||''} onChange={e=>patch({unlockQuestion:e.target.value})} placeholder="Where did we first meet?"/></label><label>Answer<input value={item.unlockAnswer||''} onChange={e=>patch({unlockAnswer:e.target.value})} placeholder="Only they would know"/></label><small>A light lock to keep casual openers out. It is not secure storage.</small></Fold></div>
        <button className="primary-btn" onClick={()=>void publish()}><Sparkles size={17}/> {isPaid(item)?'Publish experience':'Get my share link'}</button>{shareUrl&&<div className="share-link-ready"><strong>Your surprise link is ready</strong><input readOnly value={shareUrl}/><div className="share-actions"><a className="secondary-btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${item.title||'A little surprise'} 💌 ${shareUrl}`)}`}>Send on WhatsApp</a><a className="secondary-btn" href={`mailto:?subject=${encodeURIComponent(item.title||'A little surprise for you')}&body=${encodeURIComponent(`Open your surprise: ${shareUrl}`)}`}>Send by email</a><label className="remind-send">Remind me to send on<input type="date" min={localDate(new Date())} onChange={e=>{if(e.target.value)addReminder(e.target.value,`💌 Send the surprise for ${item.recipient||'someone you love'}`,shareUrl)}}/></label></div><button className="secondary-btn" onClick={()=>{void navigator.clipboard.writeText(shareUrl).then(()=>setError('Link copied to clipboard.')).catch(()=>setError(shareUrl))}}><Check size={15}/> Copy shareable link</button></div>}<button className="secondary-btn" onClick={()=>{save();setError('Draft saved on this device. It is not publicly accessible.')}}><Save size={16}/> Save private local draft</button><div className="note-card">Published surprises are public to anyone with the link. Please do not upload private content.</div></section>}
      {error && <p className={error.startsWith('Published')||error.startsWith('Draft saved')||error.startsWith('Link copied')?'success-text':'error-text'} role="status">{error}</p>}
      <div className="editor-nav"><button className="secondary-btn" onClick={()=>{setError('');if(step<=1)onExit();else setStep(s=>s-1)}}><ArrowLeft size={16}/> {step<=1?'Exit':'Back'}</button><span>{step} of {LAST}</span>{step<LAST&&<button className="primary-btn" onClick={next}>Continue <ArrowRight size={16}/></button>}</div><DevCredit/>
    </main>
    {preview&&<ScenePlayer experience={{...item, targetDate: undefined}} preview onClose={()=>setPreview(false)}/>}
    {paywall&&<PayWall item={item} onClose={()=>setPaywall(false)} onPaid={e=>{setPaywall(false);setItem(e);void publish(e)}} onPreview={()=>{setPaywall(false);setPreview(true)}}/>}
    {autoState&&<div className={`autosave-pill ${autoState}`} role="status" aria-live="polite">{autoState==='saving'?'Saving…':autoState==='cloud'?'Saved to your account ✓':autoState==='local'?'Saved on this device ✓':'Not saved to your account yet'}</div>}
    {creationStage>=0&&<div className="creation-overlay" role="status" aria-live="polite"><div className="creation-card"><div className="creation-icon"><Sparkles size={26}/></div><p className="eyebrow">LOVORA STUDIO</p><h2>{creationStage>=creationSteps.length?'Your little world is ready.':'Saving your surprise…'}</h2><div className="creation-checklist">{creationSteps.map((label,i)=><div key={label} className={creationStage>i?'complete':creationStage===i?'active':''}><span>{creationStage>i?<Check size={14}/>:creationStage===i?<span className="creation-spinner"/>:<span className="creation-empty"/>}</span><span>{label}</span>{creationStage>i&&<small>DONE</small>}</div>)}</div><div className="creation-progress"><span style={{width:`${Math.min(100,creationStage/creationSteps.length*100)}%`}}/></div>{creationStage>=creationSteps.length&&<p className="creation-ready">✓ Draft saved on this device</p>}</div></div>}
  </div>
}
