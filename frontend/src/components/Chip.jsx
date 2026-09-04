export default function Chip({ children, label, selected = false, tone = 'neutral', onClick }) {
  const content = label || children;
  return onClick ? <button type="button" className={`chip chip-${selected ? 'success' : tone}`} onClick={onClick}>{content}</button> : <span className={`chip chip-${tone}`}>{content}</span>;
}
