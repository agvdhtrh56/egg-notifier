import { ArrowRight, Egg, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  return <main className="login-page"><section className="login-art"><div className="art-grid" /><div className="art-copy"><span className="eyebrow">EGG NOTIFIER / 01</span><h1>Know what<br /><em>hatched.</em></h1><p>A calm, reliable signal for every rare find, fresh hatch, and important coop update.</p></div><div className="art-stamp"><ShieldCheck size={17} /> Private by default</div></section><section className="login-panel"><div className="login-box"><div className="mobile-brand"><Egg size={20} /> egg notifier</div><span className="eyebrow">WELCOME BACK</span><h2>Your coop, at a glance.</h2><p className="muted">Connect Discord to manage your notification signal.</p><a className="primary-button" href={`${API}/auth/discord`}>Continue with Discord <ArrowRight size={17} /></a></div></section></main>;
}
