import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Heart, Sparkles, X } from 'lucide-react'
import type { Experience, SceneId } from '../../types'
import { sceneLabels } from '../../data'
import './SceneCreationIntro.css'

type Props = {
  experience: Experience
  onComplete: () => void
  onCancel: () => void
}

const sceneGlyph: Record<SceneId, string> = {
  heart: '♡', intro: '✦', cake: '🎂', balloons: '🎈', letter: '💌', video: '🐈', memories: '📸', timeline: '🕰️', memorymatch: '🃏', wishjar: '🫙', finale: '✨',
}
const stageNames = ['Gathering the little details', 'Building your scenes', 'Adding the final sparkle']

/** A visual scene-assembly interlude before opening the real preview. */
export default function SceneCreationIntro({ experience, onComplete, onCancel }: Props) {
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [finished, setFinished] = useState(false)
  const scenes = useMemo(() => (experience.scenes || []).filter((scene): scene is SceneId => scene in sceneLabels), [experience.scenes])

  useEffect(() => {
    if (reducedMotion) return
    const stageTimer = window.setInterval(() => setStage(current => Math.min(2, current + 1)), 1250)
    const finishTimer = window.setTimeout(() => setFinished(true), 3900)
    const openTimer = window.setTimeout(onComplete, 4550)
    return () => { window.clearInterval(stageTimer); window.clearTimeout(finishTimer); window.clearTimeout(openTimer) }
  }, [reducedMotion, onComplete])

  useEffect(() => {
    if (reducedMotion) setFinished(true)
  }, [reducedMotion])

  const finish = () => { setFinished(true); onComplete() }
  const recipient = experience.recipient?.trim() || 'your favourite human'

  return <div className="scene-creation-overlay" role="dialog" aria-modal="true" aria-label="Creating your memory preview">
    <button className="sci-close" type="button" onClick={onCancel} aria-label="Cancel preview intro"><X size={18}/></button>
    <div className="sci-ambient sci-ambient-one"/><div className="sci-ambient sci-ambient-two"/>
    <div className="sci-content">
      <motion.div className="sci-orbit" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} aria-hidden="true">
        <i/><i/><i/><span className="sci-orbit-heart"><Heart fill="currentColor"/></span>
      </motion.div>
      <p className="sci-kicker"><Sparkles size={14}/> LOVORA STUDIO</p>
      <h2>{finished ? 'Your little world is ready.' : stageNames[stage]}</h2>
      <p className="sci-subtitle">Putting every little detail together for <strong>{recipient}</strong>.</p>
      <div className="sci-scene-stage" aria-label="Selected scenes assembling">
        {scenes.map((scene, index) => <motion.div key={scene} className={`sci-scene-token sci-token-${scene}`} initial={reducedMotion ? false : { opacity: 0, y: 28, scale: .55, rotate: index % 2 ? 12 : -12 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} transition={{ delay: reducedMotion ? 0 : index * .16, type: 'spring', stiffness: 140, damping: 13 }}>
          <span>{sceneGlyph[scene]}</span><small>{sceneLabels[scene]}</small>
        </motion.div>)}
        {scenes.length === 0 && <div className="sci-empty"><Sparkles/> Your custom story</div>}
      </div>
      <div className="sci-status"><span className="sci-status-icon"><Check size={13}/></span><span>{finished ? 'All scenes assembled' : stage === 0 ? 'Gathering colours and memories' : stage === 1 ? 'Arranging your story in order' : 'Polishing the final reveal'}</span></div>
      <div className="sci-progress"><motion.span initial={{ width: '4%' }} animate={{ width: finished ? '100%' : `${Math.min(92, 12 + (stage + 1) * 28)}%` }} transition={{ duration: reducedMotion ? 0 : .5 }}/></div>
      {finished && <div className="sci-actions"><button type="button" className="sci-skip" onClick={finish}>Open preview <ArrowRight size={15}/></button></div>}
      <p className="sci-footnote">A little visual assembly — your actual preview comes next.</p>
    </div>
  </div>
}
