export default function Toggle({ checked, onChange, label }) {
  return <button type="button" className={`toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} aria-label={label}>
    <span />
  </button>;
}
