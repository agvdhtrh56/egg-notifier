import { Check, Save } from 'lucide-react';

export default function SaveButton({ saved, onClick }) {
  return <button className="save-button" onClick={onClick} disabled={saved}>
    {saved ? <Check size={16} /> : <Save size={16} />}
    {saved ? 'Saved' : 'Save changes'}
  </button>;
}
