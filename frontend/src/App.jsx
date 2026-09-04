import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Activity from './pages/Activity';
import Preferences from './pages/Preferences';

const API = import.meta.env.VITE_API_URL || '/api';
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(window.location.pathname === '/activity' ? 'activity' : 'preferences');
  const [preferences, setPreferences] = useState({ eggs: [], pets: [], rarities: [], mutations: [], notifications: true });
  const [activity, setActivity] = useState([]);
  useEffect(() => { fetch(`${API}/auth/me`, { credentials: 'include' }).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!user) return; Promise.all([fetch(`${API}/preferences`, { credentials: 'include' }), fetch(`${API}/activity`, { credentials: 'include' })]).then(async ([prefs, events]) => { if (prefs.ok) setPreferences((await prefs.json()).preferences); if (events.ok) setActivity(await events.json()); }); }, [user]);
  function navigate(nextPage) { setPage(nextPage); window.history.pushState({}, '', `/${nextPage}`); }
  async function savePreferences(next) { const response = await fetch(`${API}/preferences`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }); if (!response.ok) throw new Error('Save failed'); setPreferences((await response.json()).preferences); }
  function logout() { window.location.href = `${API}/auth/logout`; }
  if (loading) return <div className="loading-screen">Loading your coop...</div>;
  if (!user) return <Login />;
  return <div className="app-shell"><Sidebar page={page} setPage={navigate} user={user} onLogout={logout} /><main className="main-content">{page === 'activity' ? <Activity activity={activity} /> : <Preferences preferences={preferences} onSave={savePreferences} />}</main></div>;
}
