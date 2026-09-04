import { useEffect, useState } from 'react';
import { BellRing, Egg, PawPrint, Sparkles, Star } from 'lucide-react';
import Chip from '../components/Chip';
import Toggle from '../components/Toggle';
import SaveButton from '../components/SaveButton';
import { eggs, pets, rarities, mutations } from '../data';

function ChoiceGroup({ title, icon: Icon, options, selected, onToggle }) {
  return <section className="settings-section"><div className="section-heading"><div><h2><Icon size={17} /> {title}</h2><p className="muted">Leave empty to receive every {title.toLowerCase()}.</p></div><span className="selection-count">{selected.length} selected</span></div><div className="choice-grid">{options.map((option) => <Chip key={option} label={option} selected={selected.includes(option)} onClick={() => onToggle(option)} />)}</div></section>;
}

export default function Preferences({ preferences, onSave }) {
  const [form, setForm] = useState(preferences);
  const [saved, setSaved] = useState(false);
  useEffect(() => setForm(preferences), [preferences]);
  function toggle(key, value) { setSaved(false); setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] })); }
  async function save() { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 1800); }
  return <div className="page"><header className="page-header"><div><span className="eyebrow">SETTINGS / PREFERENCES</span><h1>Set your signal.</h1><p className="muted">Choose exactly which spawns should reach your Discord.</p></div><SaveButton saved={saved} onClick={save} /></header><div className="settings-layout"><ChoiceGroup title="Eggs" icon={Egg} options={eggs} selected={form.eggs || []} onToggle={(value) => toggle('eggs', value)} /><ChoiceGroup title="Pets" icon={PawPrint} options={pets} selected={form.pets || []} onToggle={(value) => toggle('pets', value)} /><ChoiceGroup title="Rarities" icon={Star} options={rarities} selected={form.rarities || []} onToggle={(value) => toggle('rarities', value)} /><ChoiceGroup title="Mutations" icon={Sparkles} options={mutations} selected={form.mutations || []} onToggle={(value) => toggle('mutations', value)} /><section className="settings-section"><div className="option-row quiet-header"><div className="option-icon"><BellRing size={18} /></div><div className="option-copy"><strong>Discord notifications</strong><span>Receive alerts when a matching spawn occurs.</span></div><Toggle label="Toggle Discord notifications" checked={form.notifications !== false} onChange={(value) => { setSaved(false); setForm({ ...form, notifications: value }); }} /></div></section></div></div>;
}
