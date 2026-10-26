import type { Experience, Extras } from '../types'
import { AWARD_TITLE, AWARD_LINES, RECIPE } from './scenes/PersonScenes'

type Props = { item: Experience; patch: (p: Partial<Experience>) => void; has: (s: Experience['scenes'][number]) => boolean }
const Fold = ({ title, hint, children, open }: { title: string; hint?: string; children: React.ReactNode; open?: boolean }) => <details className="fold" open={open}><summary><strong>{title}</strong>{hint && <small>{hint}</small>}</summary><div className="fold-body">{children}</div></details>
const box: React.CSSProperties = { display: 'block', width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontSize: 16, lineHeight: 1.5, borderRadius: 16 }
const row: React.CSSProperties = { display: 'grid', gap: 8, width: '100%' }

/** Customisation for the scenes that depend on the occasion and the person. Everything is optional: empty fields use a fitting default. */
export default function SceneFields({ item, patch, has }: Props) {
  const ex: Extras = item.extras || {}
  const setEx = (p: Partial<Extras>) => patch({ extras: { ...ex, ...p } })
  const setAt = (key: 'starWishes' | 'parcelNotes' | 'awardLines' | 'recipe', i: number, v: string, n: number) => { const a = [...(ex[key] || [])]; while (a.length < n) a.push(''); a[i] = v; setEx({ [key]: a } as Partial<Extras>) }
  const rel = item.relation || 'Friend'
  const text = (label: string, value: string, onChange: (v: string) => void, max: number, ph: string, rows = 0) => <label style={row}>{label}{rows ? <textarea rows={rows} maxLength={max} value={value} placeholder={ph} style={{ ...box, minHeight: 90, resize: 'vertical' }} onChange={e => onChange(e.target.value)} /> : <input value={value} maxLength={max} placeholder={ph} style={{ ...box, minHeight: 54 }} onChange={e => onChange(e.target.value)} />}</label>
  const meters = (() => { const m = [...(ex.meters || [])]; while (m.length < 3) m.push({ label: '', pct: 100 }); return m })()
  const setMeter = (i: number, p: Partial<{ label: string; pct: number }>) => { const m = [...meters]; m[i] = { ...m[i], ...p }; setEx({ meters: m }) }
  return <>
    {has('petalfall') && <Fold title="Rose petals" hint="the line written in petals">{text('The line', ex.petalLine || '', v => setEx({ petalLine: v }), 120, 'Every petal is a little thank you.')}</Fold>}
    {has('shootingstars') && <Fold title="Shooting stars" hint="3 wishes">{[0, 1, 2].map(i => <div key={i}>{text(`Star ${i + 1}`, ex.starWishes?.[i] || '', v => setAt('starWishes', i, v, 3), 100, ['You light up every room.', 'You deserve every good thing.', 'You are loved, always.'][i])}</div>)}</Fold>}
    {has('parcel') && <Fold title="Pass the parcel" hint="3 layers, 3 notes">{[0, 1, 2].map(i => <div key={i}>{text(`Layer ${i + 1}`, ex.parcelNotes?.[i] || '', v => setAt('parcelNotes', i, v, 3), 120, ['You are my favourite.', 'Keep going, there is more.', 'This is all for you.'][i])}</div>)}</Fold>}
    {has('bottle') && <Fold title="Message in a bottle" hint="the note inside">{text('The note', ex.bottleNote || '', v => setEx({ bottleNote: v }), 260, 'I wanted you to find this. You mean a lot to me.', 3)}</Fold>}
    {has('trophy') && <Fold title="Award ceremony" hint={ex.awardTitle || AWARD_TITLE[rel]}>{text('Award title', ex.awardTitle || '', v => setEx({ awardTitle: v }), 50, AWARD_TITLE[rel] || 'Star of the Year')}{[0, 1, 2].map(i => <div key={i}>{text(`Reason ${i + 1}`, ex.awardLines?.[i] || '', v => setAt('awardLines', i, v, 3), 80, (AWARD_LINES[rel] || AWARD_LINES.Friend)[i])}</div>)}</Fold>}
    {has('recipe') && <Fold title="Recipe for happiness" hint="5 ingredients">{[0, 1, 2, 3, 4].map(i => <div key={i}>{text(`Ingredient ${i + 1}`, ex.recipe?.[i] || '', v => setAt('recipe', i, v, 5), 80, (RECIPE[rel] || RECIPE.Mom)[i])}</div>)}</Fold>}
    {has('meter') && <Fold title="Love-o-meter" hint="3 things to measure">{meters.map((m, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>{text(`Meter ${i + 1}`, m.label, v => setMeter(i, { label: v }), 30, ['Friendship', 'Chaos together', 'Late-night talks'][i])}<label style={row}>%<input type="number" min={0} max={100} value={m.pct} style={{ ...box, minHeight: 54 }} onChange={e => setMeter(i, { pct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></label></div>)}</Fold>}
    {has('reasons') && <Fold title="Reasons card flip" hint="one per line, up to 6">{text('Reasons', (ex.reasons || []).join('\n'), v => setEx({ reasons: v.split('\n').slice(0, 6) }), 600, 'You make ordinary days feel magical.\nYour laugh is my favourite sound.', 5)}</Fold>}
  </>
}
