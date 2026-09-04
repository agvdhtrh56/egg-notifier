import { BellRing, CircleHelp, Egg, LayoutDashboard, LogOut, Settings2 } from 'lucide-react';

export default function Sidebar({ page, setPage, user, onLogout }) {
  const links = [
    { id: 'activity', label: 'Activity', icon: LayoutDashboard },
    { id: 'preferences', label: 'Preferences', icon: Settings2 }
  ];
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><Egg size={19} /></span><span>egg notifier</span></div>
    <div className="status"><span className="status-dot" /> All systems normal</div>
    <nav>{links.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'nav-link active' : 'nav-link'} onClick={() => setPage(id)}><Icon size={18} />{label}</button>)}</nav>
    <div className="sidebar-bottom"><button className="nav-link"><CircleHelp size={18} />Help center</button><div className="user-card"><div className="avatar">{user.username.slice(0, 1).toUpperCase()}</div><div><strong>{user.username}</strong><small>Discord connected</small></div><button className="icon-button" onClick={onLogout} title="Log out"><LogOut size={16} /></button></div></div>
  </aside>;
}
