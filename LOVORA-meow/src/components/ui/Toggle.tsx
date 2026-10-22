/** Theme-matched switch that replaces native checkboxes. */
export default function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`ui-toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><i /></button>
}
