import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, BookOpen, Clock, Shield, Bell, LogIn, LogOut, Globe,
  Send, Mic, MicOff, ChevronDown, ChevronUp, Cpu, Wrench, Search,
  CheckCircle2, FileText, Activity, Volume2, X, Filter, ExternalLink,
  Award, Building2, AlertTriangle, ShieldCheck, RefreshCw, Database, Sparkles, Check, AlertCircle
} from 'lucide-react';

// ============================================================================
// DUAL-LANGUAGE TRANSLATIONS (EN & TAMIL)
// ============================================================================
const translations = {
  en: {
    app_title: "TN Citizen Assistant",
    app_subtitle: "Tamil Nadu Autonomous Citizen Service Assistant",
    chat_tab: "AI Assistant",
    schemes_tab: "Scheme Browser",
    tracker_tab: "Application Tracker",
    admin_tab: "Admin Console",
    notifications_tab: "Notifications",
    login: "Login / Sign Up",
    logout: "Logout",
    welcome: "Vanakkam! I am your AI Citizen Assistant for Tamil Nadu State Government schemes.",
    placeholder: "Ask about schemes, eligibility, documents, or application status...",
    send: "Send",
    show_trace: "Show Reasoning Trace",
    hide_trace: "Hide Reasoning Trace",
    trace_title: "Agentic Reasoning & Tool Execution Steps",
    schemes_title: "Tamil Nadu State Government Schemes",
    filter_category: "Category",
    filter_district: "District",
    filter_community: "Community",
    all: "All",
    apply: "Check Eligibility & Apply",
    benefits: "Benefits",
    documents: "Required Documents",
    tracker_title: "Application Status Tracking",
    demo_disclaimer: "Demo Application ID: DEMO-APP-XXXX — internal record only, not a real government submission",
    admin_title: "Government Admin Console"
  },
  ta: {
    app_title: "தமிழ்நாடு குடிமக்கள் உதவி",
    app_subtitle: "தமிழ்நாடு தன்னாட்சி குடிமக்கள் சேவை உதவி மையம்",
    chat_tab: "AI உதவி மையம்",
    schemes_tab: "அரசுத் திட்டங்கள்",
    tracker_tab: "விண்ணப்பக் கண்காணிப்பு",
    admin_tab: "நிர்வாகக் குழு",
    notifications_tab: "அறிவிப்புகள்",
    login: "உள்நுழைவு / பதிவு",
    logout: "வெளியேறு",
    welcome: "வணக்கம்! தமிழ்நாடு அரசுத் திட்டங்களுக்கான உங்கள் AI குடிமக்கள் சேவை உதவி மையம்.",
    placeholder: "திட்டங்கள், தகுதிகள், சான்றிதழ்கள் அல்லது விண்ணப்ப நிலை பற்றி கேளுங்கள்...",
    send: "அனுப்பு",
    show_trace: "சிந்தனைப் பாதையைக் காட்டு",
    hide_trace: "சிந்தனைப் பாதையை மறை",
    trace_title: "முகவர் சிந்தனை மற்றும் கருவி செயல்பாடுகள்",
    schemes_title: "தமிழ்நாடு மாநில அரசுத் திட்டங்கள்",
    filter_category: "பிரிவு",
    filter_district: "மாவட்டம்",
    filter_community: "சமூகப் பிரிவு",
    all: "அனைத்தும்",
    apply: "தகுதியைச் சரிபார்த்து விண்ணப்பிக்கவும்",
    benefits: "நன்மைகள்",
    documents: "தேவையான சான்றிதழ்கள்",
    tracker_title: "விண்ணப்ப நிலை கண்காணிப்பு",
    demo_disclaimer: "மாதிரி விண்ணப்ப எண்: DEMO-APP-XXXX — உள் பதிவு மட்டுமே, இது உண்மையான அரசு சமர்ப்பிப்பு அல்ல",
    admin_title: "அரசு நிர்வாகப் பலகை"
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [demoAppModalOpen, setDemoAppModalOpen] = useState(false);
  const [selectedSchemeForApp, setSelectedSchemeForApp] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('chat');
  };

  const handleStartDemoApp = (scheme) => {
    if (!user) { setAuthModalOpen(true); return; }
    setSelectedSchemeForApp(scheme);
    setDemoAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg">
              TN
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{t('app_title')}</h1>
              <p className="text-xs text-emerald-400 font-medium">{t('app_subtitle')}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button onClick={() => setActiveTab('chat')} className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <MessageSquare size={16} /><span>{t('chat_tab')}</span>
            </button>
            <button onClick={() => setActiveTab('schemes')} className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'schemes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <BookOpen size={16} /><span>{t('schemes_tab')}</span>
            </button>
            <button onClick={() => setActiveTab('tracker')} className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'tracker' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Clock size={16} /><span>{t('tracker_tab')}</span>
            </button>
            {user && user.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'}`}>
                <Shield size={16} /><span>{t('admin_tab')}</span>
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            <button onClick={() => setLang(lang === 'en' ? 'ta' : 'en')} className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold border border-slate-700">
              <Globe size={14} /><span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {user && (
              <button onClick={() => setNotificationsOpen(true)} className="relative p-2 text-slate-300 bg-slate-800 rounded-lg border border-slate-700">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 hidden sm:inline-block bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">{user.name} ({user.role})</span>
                <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1.5 bg-rose-950/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold">
                  <LogOut size={14} /><span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold">
                <LogIn size={15} /><span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pb-10">
        {activeTab === 'chat' && <ChatComponent t={t} lang={lang} user={user} />}
        {activeTab === 'schemes' && <SchemesComponent t={t} lang={lang} onStartDemoApp={handleStartDemoApp} />}
        {activeTab === 'tracker' && <TrackerComponent t={t} lang={lang} user={user} />}
        {activeTab === 'admin' && user && user.role === 'admin' && <AdminComponent t={t} lang={lang} />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Tamil Nadu Autonomous Citizen Service Assistant • Powered by Agentic AI & RAG Core
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={(u) => { setUser(u); setAuthModalOpen(false); }} />
      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onUnreadUpdate={setUnreadCount} lang={lang} />
      <DemoAppModal isOpen={demoAppModalOpen} onClose={() => setDemoAppModalOpen(false)} scheme={selectedSchemeForApp} lang={lang} t={t} onSubmitted={() => setActiveTab('tracker')} />
    </div>
  );
}

// ============================================================================
// CHAT INTERFACE COMPONENT WITH COLLAPSIBLE REASONING TRACE
// ============================================================================
function ChatComponent({ t, lang, user }) {
  const [messages, setMessages] = useState([{ id: 'welcome', sender: 'agent', text: t('welcome'), trace: [] }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (customText = null) => {
    const text = customText || input;
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, language: lang })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');

      const agentMsg = { id: (Date.now() + 1).toString(), sender: 'agent', text: data.answer, trace: data.trace || [] };
      setMessages(prev => [...prev, agentMsg]);
      if (data.trace && data.trace.length > 0) setExpandedTraceId(agentMsg.id);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: `⚠️ Error: ${e.message}`, trace: [] }]);
    } finally { setLoading(false); }
  };

  const handleMic = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      handleSend(lang === 'ta' ? "புதுமைப் பெண் திட்டத்திற்கான தகுதிகள் என்ன?" : "Am I eligible for Pudhumai Penn scheme?");
      return;
    }
    const SpeechReg = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reg = new SpeechReg();
    reg.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    reg.onstart = () => setIsRecording(true);
    reg.onresult = (e) => { setIsRecording(false); handleSend(e.results[0][0].transcript); };
    reg.onerror = () => setIsRecording(false);
    reg.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-3">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none' : 'glass-panel border border-slate-800 text-slate-100 rounded-bl-none'}`}>
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 p-3 glass-panel rounded-2xl w-max">Gemini Agent reasoning...</div>}
        <div ref={endRef} />
      </div>

      <div className="mt-3 glass-panel p-2.5 rounded-2xl border border-slate-800 flex items-center space-x-2">
        <button onClick={handleMic} className={`p-2.5 rounded-xl border ${isRecording ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border-slate-800'}`}>
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('placeholder')} className="flex-1 bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500" />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SCHEME BROWSER COMPONENT
// ============================================================================
function SchemesComponent({ t, lang, onStartDemoApp }) {
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/schemes').then(r => r.json()).then(setSchemes).catch(() => {});
  }, []);

  const filtered = category ? schemes.filter(s => s.category.includes(category)) : schemes;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{t('schemes_title')}</h2>
          <p className="text-xs text-slate-400 mt-1">Verified Tamil Nadu State Government schemes</p>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-xl">
          <option value="">{t('all')} Categories</option>
          <option value="Education">Education</option>
          <option value="Women Welfare">Women Welfare</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Skill Development">Skill Development</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => {
          const docs = typeof s.documents_required === 'string' ? JSON.parse(s.documents_required) : s.documents_required;
          return (
            <div key={s.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg uppercase">{s.category}</span>
                <h3 className="text-base font-bold text-white mt-3">{lang === 'ta' ? s.name_ta : s.name_en}</h3>
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-amber-400 mb-1">{t('benefits')}</div>
                  <p>{lang === 'ta' ? s.benefits_ta : s.benefits_en}</p>
                </div>
              </div>
              <button onClick={() => onStartDemoApp(s)} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1">
                <CheckCircle2 size={14} /><span>{t('apply')}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TRACKER COMPONENT
// ============================================================================
function TrackerComponent({ t, lang, user }) {
  const [searchId, setSearchId] = useState('DEMO-APP-1001');
  const [app, setApp] = useState(null);

  const track = async (id = searchId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/applications/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setApp(await res.json());
    } catch (e) {}
  };

  useEffect(() => { track('DEMO-APP-1001'); }, []);

  const history = app ? (typeof app.status_history === 'string' ? JSON.parse(app.status_history) : app.status_history) : [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-400" size={22} />{t('tracker_title')}</h2>
        <div className="flex gap-2">
          <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="DEMO-APP-1001..." className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-sm px-4 py-2 rounded-xl" />
          <button onClick={() => track()} className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">Track</button>
        </div>
      </div>

      {app && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs text-slate-400 font-mono">Demo Ref ID</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{app.demo_reference_id}</div>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">{app.status}</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{lang === 'ta' ? app.name_ta : app.name_en}</h3>
            <p className="text-xs text-slate-400">Applicant: {app.applicant_name}</p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-300">Status Audit History</div>
            {history.map((h, i) => (
              <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
                <div><span className="font-bold text-emerald-400 mr-2">{h.stage}</span><span className="text-slate-300">{h.remarks}</span></div>
                <span className="text-[11px] text-slate-500 font-mono">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADMIN COMPONENT
// ============================================================================
function AdminComponent({ t, lang }) {
  const [apps, setApps] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [stage, setStage] = useState('Document Verification');
  const [remarks, setRemarks] = useState('');

  const load = () => {
    const token = localStorage.getItem('accessToken');
    fetch('http://localhost:5000/api/applications', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => { setApps(data); if (data.length > 0) setSelectedId(data[0].demo_reference_id); });
    fetch('http://localhost:5000/api/admin/pending-schemes', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setPending);
  };

  useEffect(() => { load(); }, []);

  const handleAdvance = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch(`http://localhost:5000/api/applications/${selectedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ new_stage: stage, remarks })
    });
    setRemarks(''); load();
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`http://localhost:5000/api/admin/approve-scheme/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-amber-900/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2"><Shield className="text-amber-400" size={24} /><span>{t('admin_title')}</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Advance Application Stage</h3>
          <form onSubmit={handleAdvance} className="space-y-3">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl font-mono">
              {apps.map(a => <option key={a.id} value={a.demo_reference_id}>{a.demo_reference_id} ({a.status})</option>)}
            </select>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl">
              <option value="Applied">Applied</option><option value="Document Verification">Document Verification</option><option value="Field Verification">Field Verification</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="Disbursed">Disbursed</option>
            </select>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Official Remarks..." className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2.5 rounded-xl" rows={3} />
            <button type="submit" className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs">Advance Stage</button>
          </form>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Pending Scraped Schemes ({pending.length})</h3>
          {pending.map(s => (
            <div key={s.id} className="p-3 bg-slate-900 rounded-xl border border-amber-900/40 text-xs space-y-2">
              <div className="font-bold text-white">{s.name_en}</div>
              <button onClick={() => handleApprove(s.id)} className="w-full py-1.5 bg-emerald-600 text-white font-semibold rounded-lg">Approve & Ingest to RAG</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL COMPONENTS
// ============================================================================
function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm glass-panel p-6 rounded-2xl border border-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button>
        <h2 className="text-lg font-bold text-white mb-4">{isLogin ? 'Sign In' : 'Register Profile'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" required className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl" />
          {!isLogin && (
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl">
              <option value="user">Citizen User</option>
              <option value="admin">Government Admin</option>
            </select>
          )}
          <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl">{isLogin ? 'Sign In' : 'Register'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-3 text-xs text-emerald-400 underline">{isLogin ? 'Need an account? Register' : 'Have an account? Sign In'}</button>
      </div>
    </div>
  );
}

function NotificationsModal({ isOpen, onClose, onUnreadUpdate, lang }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      fetch('http://localhost:5000/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => { setList(data); onUnreadUpdate(data.filter(n => !n.is_read).length); });
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5"><Bell size={16} className="text-emerald-400" /> Notifications</h2>
          <button onClick={onClose} className="text-slate-400 text-xs">Close</button>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {list.map(n => (
            <div key={n.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-300">{lang === 'ta' ? n.message_ta : n.message_en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoAppModal({ isOpen, onClose, scheme, lang, t, onSubmitted }) {
  const [refId, setRefId] = useState('');

  if (!isOpen || !scheme) return null;

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ scheme_id: scheme.id })
    });
    const data = await res.json();
    if (res.ok) { setRefId(data.demo_reference_id); if (onSubmitted) onSubmitted(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Start Demo Application</h2>
        <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-amber-200 text-xs">
          {t('demo_disclaimer')}
        </div>
        {refId ? (
          <div className="text-center space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">Demo App ID: {refId}</div>
            <button onClick={onClose} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">Done</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-900 text-slate-300 text-xs font-semibold rounded-xl">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">Confirm Demo Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
