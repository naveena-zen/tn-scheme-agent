import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, BookOpen, Clock, Shield, Bell, LogIn, LogOut, Globe,
  Send, Mic, MicOff, ChevronDown, ChevronUp, Cpu, Wrench, Search,
  CheckCircle2, FileText, Activity, Volume2, X, Filter, ExternalLink,
  Award, Building2, AlertTriangle, ShieldCheck, RefreshCw, Database, Sparkles, Check, AlertCircle, Info, Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    demo_disclaimer: "Application Reference ID: APP-XXXX — electronic citizen assistance record",
    demo_badge: "Autonomous Citizen Assistant",
    about_demo: "Notice & Guidelines",
    admin_title: "Government Admin Console",
    details_title: "Scheme Details & Eligibility",
    plain_criteria: "General Eligibility Requirements",
    check_my_elig: "Check My Eligibility",
    start_app_btn: "Start Demo Application",
    view_details: "View Details & Apply",
    eval_passed: "You ARE ELIGIBLE for this scheme!",
    eval_failed: "You do not meet all criteria.",
    eval_note_failed: "Note: You do not meet all criteria, but you may still submit an application if you hold special exemptions.",
    eval_note_passed: "Recommended: Your profile matches the required eligibility criteria."
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
    demo_disclaimer: "விண்ணப்பக் குறிப்பு எண்: APP-XXXX — மின்னணு குடிமக்கள் உதவி பதிவு",
    demo_badge: "தன்னாட்சி குடிமக்கள் சேவை",
    about_demo: "அறிவிப்புகள் & வழிகாட்டுதல்கள்",
    admin_title: "அரசு நிர்வாகப் பலகை",
    details_title: "திட்ட விவரங்கள் மற்றும் தகுதி வரம்புகள்",
    plain_criteria: "பொதுவான தகுதித் தேவைகள்",
    check_my_elig: "எனது தகுதியைச் சரிபார்க்கவும்",
    start_app_btn: "மாதிரி விண்ணப்பத்தைத் தொடங்கவும்",
    view_details: "விவரங்கள் & தகுதி பார்க்க",
    eval_passed: "நீங்கள் இந்தத் திட்டத்திற்கு தகுதியுடையவர்!",
    eval_failed: "நீங்கள் அனைத்து தகுதி வரம்புகளையும் பூர்த்தி செய்யவில்லை.",
    eval_note_failed: "குறிப்பு: நீங்கள் அனைத்து வரம்புகளையும் பூர்த்தி செய்யவில்லை, எனினும் சிறப்பு விலக்குகள் இருந்தால் விண்ணப்பிக்கலாம்.",
    eval_note_passed: "பரிந்துரை: உங்கள் விவரக்குறிப்பு தேவையான அனைத்து தகுதிகளுடன் பொருந்துகிறது."
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState(null);
  const [initialChatQuery, setInitialChatQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [activeAppId, setActiveAppId] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(prev => prev === message ? null : prev);
    }, 4500);
  };

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
    sessionStorage.clear();
    setUser(null);
    setActiveAppId(null);
    setActiveTab('chat');
  };

  const handleOpenDetails = (scheme) => {
    setSelectedSchemeForDetails(scheme);
    setDetailsModalOpen(true);
  };

  const handleStartDemoApp = (scheme) => {
    if (!user) { setAuthModalOpen(true); return; }
    setSelectedSchemeForApp(scheme);
    setDemoAppModalOpen(true);
  };

  const handleAskInChat = (scheme) => {
    setDetailsModalOpen(false);
    setActiveTab('chat');
    setInitialChatQuery(lang === 'ta' ? `${scheme.name_ta} திட்டத்திற்கு நான் தகுதியானவரா?` : `Am I eligible for ${scheme.name_en}?`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col relative">
      {/* Top Application Submission Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] transition-all duration-300">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/80 text-emerald-100 shadow-2xl shadow-emerald-950/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold tracking-wide truncate">{toast}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-900/50 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg">
              TN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white leading-tight">{t('app_title')}</h1>
              </div>
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
        {activeTab === 'chat' && <ChatComponent t={t} lang={lang} user={user} initialQuery={initialChatQuery} onClearInitialQuery={() => setInitialChatQuery('')} />}
        {activeTab === 'schemes' && <SchemesComponent t={t} lang={lang} onOpenDetails={handleOpenDetails} />}
        {activeTab === 'tracker' && <TrackerComponent t={t} lang={lang} user={user} activeAppId={activeAppId} onClearActiveAppId={() => setActiveAppId(null)} />}
        {activeTab === 'admin' && user && user.role === 'admin' && <AdminComponent t={t} lang={lang} />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Tamil Nadu Autonomous Citizen Service Assistant • Powered by Agentic AI & RAG Core
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={(u) => { setUser(u); setAuthModalOpen(false); }} />
      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onUnreadUpdate={setUnreadCount} lang={lang} />
      <SchemeDetailsModal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} scheme={selectedSchemeForDetails} lang={lang} t={t} user={user} onStartDemoApp={handleStartDemoApp} onAskInChat={handleAskInChat} />
      <DemoAppModal
        isOpen={demoAppModalOpen}
        onClose={() => setDemoAppModalOpen(false)}
        scheme={selectedSchemeForApp}
        lang={lang}
        t={t}
        onSubmitted={(newRefId) => {
          setActiveAppId(newRefId);
          setActiveTab('tracker');
          showToast(lang === 'ta'
            ? `✅ மாதிரி விண்ணப்பம் சமர்ப்பிக்கப்பட்டது — எண்: ${newRefId}`
            : `✅ Application submitted — Demo App ID: ${newRefId}`);
        }}
      />
    </div>
  );
}

// ============================================================================
// FORMATTED MESSAGE COMPONENT (MARKDOWN LINKS, BOLD, HEADERS & BULLETS)
// ============================================================================
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');

  const renderInline = (str) => {
    // Regex matching markdown link [label](url), raw URL http(s)://..., and bold **text**
    const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s<>)"]+|\*\*[^*]+\*\*)/g;
    const parts = [];
    let lastIdx = 0;
    let match;

    while ((match = tokenRegex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('[') && token.includes('](')) {
        const labelEnd = token.indexOf('](');
        const label = token.substring(1, labelEnd);
        const url = token.substring(labelEnd + 2, token.length - 1);
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors break-all"
          >
            <span>{label}</span>
            <ExternalLink size={12} className="inline-block flex-shrink-0" />
          </a>
        );
      } else if (token.startsWith('http://') || token.startsWith('https://')) {
        let cleanUrl = token;
        let suffix = '';
        if (/[.,;:)]$/.test(cleanUrl)) {
          suffix = cleanUrl.slice(-1);
          cleanUrl = cleanUrl.slice(0, -1);
        }
        parts.push(
          <a
            key={match.index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline font-semibold transition-colors break-all"
          >
            <span>{cleanUrl}</span>
            <ExternalLink size={12} className="inline-block flex-shrink-0" />
          </a>
        );
        if (suffix) parts.push(suffix);
      } else if (token.startsWith('**') && token.endsWith('**')) {
        const boldText = token.slice(2, -2);
        parts.push(<strong key={match.index} className="font-semibold text-white">{boldText}</strong>);
      }
      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-bold text-emerald-300 mt-2">{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="text-base font-bold text-emerald-400 mt-2">{trimmed.slice(3)}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="text-lg font-bold text-white mt-2">{trimmed.slice(2)}</h2>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <div key={idx}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

// ============================================================================
// CHAT INTERFACE COMPONENT WITH COLLAPSIBLE REASONING TRACE
// ============================================================================
function ChatComponent({ t, lang, user, initialQuery, onClearInitialQuery }) {
  const [messages, setMessages] = useState([{ id: 'welcome', sender: 'agent', text: t('welcome'), trace: [] }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

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
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ sender: m.sender, text: m.text }))
        .slice(-6);

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, language: lang, history })
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
              <FormattedMessage text={msg.text} />
              {msg.trace && msg.trace.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <Cpu size={14} />
                    <span>{expandedTraceId === msg.id ? t('hide_trace') : t('show_trace')} ({msg.trace.length} {lang === 'ta' ? 'கருவிகள்' : 'tool steps'})</span>
                    {expandedTraceId === msg.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedTraceId === msg.id && (
                    <div className="mt-2 space-y-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] font-mono">
                      <div className="font-semibold text-slate-400 flex items-center gap-1 pb-1 border-b border-slate-800">
                        <Activity size={12} className="text-emerald-400" />
                        <span>{t('trace_title')}</span>
                      </div>
                      {msg.trace.map((step, sIdx) => (
                        <div key={sIdx} className="p-2 rounded bg-slate-950/80 border border-slate-800">
                          <div className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Wrench size={11} />
                            <span>Step {sIdx + 1}: {step.tool}</span>
                          </div>
                          {step.input && (
                            <div className="text-slate-400 mt-1 truncate">
                              Input: {JSON.stringify(step.input)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 p-3 glass-panel rounded-2xl w-max flex items-center gap-2"><RefreshCw size={12} className="animate-spin text-emerald-400" /><span>Gemini Agent reasoning...</span></div>}
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
// ============================================================================
// SCHEME BROWSER COMPONENT
// ============================================================================
function SchemesComponent({ t, lang, onOpenDetails }) {
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/schemes`).then(r => r.json()).then(setSchemes).catch(() => {});
  }, []);

  const categories = Array.from(new Set(schemes.map(s => s.category).filter(Boolean))).sort();

  const filtered = schemes.filter(s => {
    const matchesCat = !category || s.category.toLowerCase() === category.toLowerCase();
    const query = search.toLowerCase().trim();
    const matchesSearch = !query ||
      (s.name_en && s.name_en.toLowerCase().includes(query)) ||
      (s.name_ta && s.name_ta.includes(query)) ||
      (s.department && s.department.toLowerCase().includes(query)) ||
      (s.category && s.category.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{t('schemes_title')}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              {filtered.length} / {schemes.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Verified Tamil Nadu State Government schemes across all welfare departments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'ta' ? 'திட்டம் அல்லது துறை தேட...' : 'Search scheme or department...'}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 w-full sm:w-56"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
          >
            <option value="">{t('all')} ({schemes.length} Schemes)</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => {
          return (
            <div key={s.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg uppercase">
                    {s.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]" title={s.department}>
                    {s.department}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {lang === 'ta' ? s.name_ta : s.name_en}
                </h3>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{t('benefits')}</span>
                  </div>
                  <p className="line-clamp-3 leading-relaxed">{lang === 'ta' ? (s.benefits_ta || s.benefits_en) : (s.benefits_en || s.benefits_ta)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDetails(s)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.01]"
              >
                <Info size={14} />
                <span>{t('view_details')}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TRACKER COMPONENT (SHIPMENT / PROCESS TRACKER REDESIGN)
// ============================================================================
function formatDuration(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return null;
  const mins = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}h` : `${days} days`;
  }
  if (hours > 0) {
    const remMins = mins % 60;
    return remMins > 0 ? `${hours} hr ${remMins} mins` : `${hours} hrs`;
  }
  if (mins > 0) return `${mins} mins`;
  return '< 1 min';
}

function TrackerComponent({ t, lang, user, activeAppId, onClearActiveAppId }) {
  const [searchId, setSearchId] = useState('');
  const [app, setApp] = useState(null);
  const [userApps, setUserApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAboutDemo, setShowAboutDemo] = useState(false);
  const [expandedStages, setExpandedStages] = useState({});
  const [trackingLoading, setTrackingLoading] = useState(false);

  const toggleStageExpand = (stageKey) => {
    setExpandedStages(prev => ({ ...prev, [stageKey]: !prev[stageKey] }));
  };

  const track = async (idToTrack) => {
    const cleanId = (idToTrack || searchId || '').trim();
    if (!cleanId) return;
    setTrackingLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setApp(null);
        setErrorMessage(lang === 'ta'
          ? 'விண்ணப்பத்தைக் கண்காணிக்க தயவுசெய்து உள்நுழையவும்.'
          : 'Please log in to track your application.');
        return;
      }
      const res = await fetch(`${API_URL}/api/applications/${encodeURIComponent(cleanId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApp(data);
        setSearchId(data.demo_reference_id);
        setErrorMessage('');
      } else {
        setApp(null);
        if (res.status === 403) {
          setErrorMessage(lang === 'ta'
            ? 'அனுமதி மறுக்கப்பட்டது: இந்த விண்ணப்பத்தை நீங்கள் பார்க்க அனுமதி இல்லை (மற்றொரு பயனரின் விண்ணப்பம்).'
            : 'Access denied: You do not have permission to view this application.');
        } else if (res.status === 404) {
          setErrorMessage(lang === 'ta'
            ? `விண்ணப்பம் '${cleanId}' கண்டறியப்படவில்லை.`
            : `Application '${cleanId}' was not found.`);
        } else {
          setErrorMessage(data.error || 'Failed to fetch application details.');
        }
      }
    } catch (e) {
      setApp(null);
      setErrorMessage(lang === 'ta' ? 'விண்ணப்பத் தகவல்களைப் பெறுவதில் பிழை ஏற்பட்டது.' : 'Network error fetching application status.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Re-fetch user applications fresh on every login, user change, or activeAppId change
  useEffect(() => {
    if (!user) {
      setUserApps([]);
      setApp(null);
      setSearchId('');
      setErrorMessage('');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUserApps([]);
      setApp(null);
      return;
    }

    setLoadingApps(true);
    setErrorMessage('');
    fetch(`${API_URL}/api/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load applications');
        return res.json();
      })
      .then(apps => {
        const list = Array.isArray(apps) ? apps : [];
        setUserApps(list);

        // Track target: activeAppId if specified, or first application in list
        const target = (activeAppId && list.find(a => a.demo_reference_id === activeAppId))
          || (list.length > 0 ? list[0] : null);

        if (target) {
          setSearchId(target.demo_reference_id);
          track(target.demo_reference_id);
        } else if (activeAppId) {
          setSearchId(activeAppId);
          track(activeAppId);
        } else {
          setApp(null);
          setSearchId('');
        }
      })
      .catch(err => {
        console.warn('Error loading user applications:', err);
        setUserApps([]);
        setApp(null);
      })
      .finally(() => setLoadingApps(false));
  }, [user?.id, activeAppId]);

  const history = app ? (typeof app.status_history === 'string' ? JSON.parse(app.status_history) : app.status_history) : [];

  const isRejected = app && (app.status === 'Rejected' || history.some(h => h.stage === 'Rejected'));
  const stages = [
    'Applied',
    'Document Verification',
    'Field Verification',
    isRejected ? 'Rejected' : 'Approved',
    'Disbursed'
  ];

  const historyMap = {};
  history.forEach(h => {
    historyMap[h.stage] = h;
  });

  const currentStageIndex = app ? stages.indexOf(app.status) : 0;
  const activeIndex = currentStageIndex !== -1 ? currentStageIndex : 0;

  const stageDisplayNames = {
    'Applied': { en: 'Application Submitted', ta: 'விண்ணப்பம் சமர்ப்பிக்கப்பட்டது' },
    'Document Verification': { en: 'Document Verification', ta: 'சான்றிதழ் சரிபார்ப்பு' },
    'Field Verification': { en: 'Field Verification & Inspection', ta: 'கள ஆய்வு & தணிக்கை' },
    'Approved': { en: 'Application Approved', ta: 'விண்ணப்பம் ஏற்றுக்கொள்ளப்பட்டது' },
    'Rejected': { en: 'Application Rejected', ta: 'விண்ணப்பம் நிராகரிக்கப்பட்டது' },
    'Disbursed': { en: 'Benefit Disbursed', ta: 'பயன்பாடு வழங்கப்பட்டது' }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {!user && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold block mb-0.5">
              {lang === 'ta' ? 'உள்நுழைவு தேவை' : 'Authentication Required'}
            </span>
            <span>
              {lang === 'ta'
                ? 'உங்கள் விண்ணப்பங்களைக் கண்காணிக்க தயவுசெய்து உள்நுழையவும். விண்ணப்ப விவரங்கள் உங்கள் கணக்கிற்கு மட்டுமே தனிப்பட்டவை.'
                : 'Please log in to view and track your applications. Applications are strictly private and isolated to your account.'}
            </span>
          </div>
        </div>
      )}

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-emerald-400" size={22} />
              {t('tracker_title')}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAboutDemo(!showAboutDemo)}
            className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl transition-colors"
          >
            <Info size={14} className="text-emerald-400" />
            <span>{t('about_demo')}</span>
            <ChevronDown size={14} className={`transform transition-transform ${showAboutDemo ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAboutDemo && (
          <div className="p-3.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-300 text-xs space-y-1.5">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <AlertCircle size={15} />
              <span>{lang === 'ta' ? 'விண்ணப்பக் கண்காணிப்பு வழிகாட்டுதல்' : 'Application Tracking Guidelines'}</span>
            </div>
            <p className="leading-relaxed">
              {lang === 'ta'
                ? 'உங்கள் மாதிரி விண்ணப்பக் குறிப்பு எண்ணை உள்ளிட்டு சரிபார்ப்பு நிலைகள், துறை கள ஆய்வுகள் மற்றும் நிதி ஒதுக்கீடுகளை நிகழ்நேரத்தில் கண்காணிக்கலாம்.'
                : 'Enter your demo application reference ID to track submission milestones, document verification, field audits, and fund disbursement in real-time.'}
            </p>
          </div>
        )}

        {/* User's own applications list / pills */}
        {user && userApps.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'ta' ? 'எனது விண்ணப்பங்கள்' : 'My Applications'} ({userApps.length}):</span>
              {loadingApps && <span className="text-[10px] text-slate-500">Updating...</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {userApps.map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { setSearchId(a.demo_reference_id); track(a.demo_reference_id); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border flex items-center gap-2 ${
                    app?.demo_reference_id === a.demo_reference_id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold shadow-sm shadow-emerald-950'
                      : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{a.demo_reference_id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase font-bold ${
                    a.status === 'Disbursed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    a.status === 'Rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                  }`}>
                    {a.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') track(); }}
            placeholder={lang === 'ta' ? 'விண்ணப்ப குறிப்பு எண்ணை உள்ளிடவும் (எ.கா. DEMO-APP-...)...' : 'Enter application reference ID (e.g. DEMO-APP-...)...'}
            className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-sm px-4 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
          />
          <button
            onClick={() => track()}
            disabled={trackingLoading || !searchId.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {trackingLoading && <Loader2 size={14} className="animate-spin" />}
            <span>Track</span>
          </button>
        </div>
      </div>

      {/* Error banner for unauthorized or not found queries */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Empty state when user is logged in but has no applications yet */}
      {user && userApps.length === 0 && !app && !trackingLoading && !errorMessage && !loadingApps && (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-3">
          <FileText size={36} className="text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">
            {lang === 'ta' ? 'விண்ணப்பங்கள் எதுவும் சமர்ப்பிக்கப்படவில்லை' : 'No Applications Submitted Yet'}
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lang === 'ta'
              ? 'திட்டங்கள் பிரிவில் சென்று தகுதியைச் சரிபார்த்து "Start Demo Application" மூலம் உங்கள் விண்ணப்பத்தைச் சமர்ப்பிக்கவும்.'
              : 'Browse schemes in the Scheme Browser, verify eligibility, and click "Start Demo Application" to submit your application.'}
          </p>
        </div>
      )}

      {app && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
            <div>
              <div className="text-xs text-slate-400 font-mono">Application Reference ID</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight mt-0.5">
                {app.demo_reference_id}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3.5 py-1.5 text-xs font-bold rounded-xl uppercase tracking-wider border ${
                app.status === 'Disbursed' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                app.status === 'Rejected' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                'bg-amber-950/70 text-amber-300 border-amber-800'
              }`}>
                {app.status}
              </span>
            </div>
          </div>

          {/* Scheme & Applicant Info */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Scheme</div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {lang === 'ta' ? (app.name_ta || app.name_en) : app.name_en}
              </h3>
            </div>
            <div className="sm:text-right">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Applicant</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">{app.applicant_name}</div>
            </div>
          </div>

          {/* Shipment-Style Vertical Process Tracker */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity size={15} className="text-emerald-400" />
              <span>Live Application Process Timeline</span>
            </div>

            <div className="relative pl-2 sm:pl-4 pt-4">
              {stages.map((stageName, i) => {
                const isCompleted = i < activeIndex || (i === activeIndex && (stageName === 'Disbursed' || (app.status === 'Disbursed' && i === stages.length - 1)));
                const isCurrent = i === activeIndex && !isCompleted;
                const isUnreached = i > activeIndex && !isCompleted;
                const isStageRejected = stageName === 'Rejected' && isCurrent;

                const stageData = historyMap[stageName];
                const stageTime = stageData?.timestamp;

                // Duration since previous stage
                let durationText = null;
                if (i > 0 && stageTime && historyMap[stages[i - 1]]?.timestamp) {
                  const ms = new Date(stageTime).getTime() - new Date(historyMap[stages[i - 1]].timestamp).getTime();
                  durationText = formatDuration(ms);
                }

                const displayName = stageDisplayNames[stageName]
                  ? (lang === 'ta' ? stageDisplayNames[stageName].ta : stageDisplayNames[stageName].en)
                  : stageName;

                const isExpanded = !!expandedStages[stageName];
                const isLastStage = i === stages.length - 1;

                return (
                  <div key={stageName} className="relative flex items-start group">
                    {/* Vertical connecting line */}
                    {!isLastStage && (
                      <div
                        className={`absolute left-[15px] top-[30px] w-[2px] h-[calc(100%-8px)] transition-colors duration-300 ${
                          i < activeIndex ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      />
                    )}

                    {/* Stage Icon Node */}
                    <div className="relative z-10 flex-shrink-0 mr-4">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      ) : isStageRejected ? (
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50">
                          <X size={16} strokeWidth={3} />
                        </div>
                      ) : isCurrent ? (
                        <div className="relative w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-950/50">
                          <span className="absolute w-full h-full rounded-full bg-amber-400/20 animate-ping" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        </div>
                      ) : (
                        /* Unreached / Pending stage — Plain greyed-out icon, explicitly NO checkmark */
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center text-xs font-mono font-medium">
                          {i + 1}
                        </div>
                      )}
                    </div>

                    {/* Stage Content Card */}
                    <div className="flex-1 pb-7 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${
                            isCompleted ? 'text-white' :
                            isCurrent ? 'text-amber-300' :
                            'text-slate-500'
                          }`}>
                            {displayName}
                          </span>

                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                              Completed
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-950 text-amber-400 border border-amber-800/80 animate-pulse">
                              In Progress
                            </span>
                          )}
                          {isUnreached && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-900 text-slate-500 border border-slate-800">
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Timestamp & Duration */}
                        <div className="flex items-center gap-3 text-xs">
                          {durationText && isCompleted && (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-900/50">
                              ⏱️ {durationText}
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-slate-400">
                            {stageTime ? new Date(stageTime).toLocaleString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : (isUnreached ? '—' : 'In Progress')}
                          </span>
                        </div>
                      </div>

                      {/* Expandable "View details" (matching "View all updates" pattern) */}
                      {(stageData || isCurrent) && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleStageExpand(stageName)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors font-medium"
                          >
                            <span>{isExpanded ? (lang === 'ta' ? 'விவரங்களை மறைக்க' : 'Hide details') : (lang === 'ta' ? 'அனைத்து விவரங்களையும் பார்க்க' : 'View all updates')}</span>
                            <ChevronDown size={13} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                              <div className="text-[11px] font-semibold text-slate-400">
                                {lang === 'ta' ? 'அலுவல் குறிப்புகள் & சரிபார்ப்பு:' : 'Audit Remarks & Notes:'}
                              </div>
                              <p className="text-slate-200 leading-relaxed font-sans">
                                {stageData?.remarks || (isCurrent ? 'Under review by authorized verification officers.' : 'Stage verified.')}
                              </p>
                              {stageTime && (
                                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                                  Logged at: {new Date(stageTime).toISOString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
    fetch(`${API_URL}/api/applications`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => { setApps(data); if (data.length > 0) setSelectedId(data[0].demo_reference_id); });
    fetch(`${API_URL}/api/admin/pending-schemes`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setPending);
  };

  useEffect(() => { load(); }, []);

  const handleAdvance = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_URL}/api/applications/${selectedId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ new_stage: stage, remarks })
    });
    setRemarks(''); load();
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${API_URL}/api/admin/approve-scheme/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password, role })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm glass-panel p-6 rounded-2xl border border-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-bold text-white mb-4">{isLogin ? 'Sign In' : 'Register Profile'}</h2>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-950/60 border border-rose-800/70 text-rose-300 rounded-xl text-xs font-medium flex items-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 text-[11px] block mb-1">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Madhu Nisha"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 text-[11px] block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. UserPass123!"
              required
              className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
              >
                <option value="user">Citizen User</option>
                <option value="admin">Government Admin</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-950"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>
        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline block text-center w-full"
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Sign In'}
        </button>
      </div>
    </div>
  );
}

function NotificationsModal({ isOpen, onClose, onUnreadUpdate, lang }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      fetch(`${API_URL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => { setList(data); onUnreadUpdate(data.filter(n => !n.is_read).length); });
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

// ============================================================================
// SCHEME DETAILS & ELIGIBILITY MODAL (REQUIREMENTS-FIRST WITH TRIGGERED CHECK)
// ============================================================================
function SchemeDetailsModal({ isOpen, onClose, scheme, lang, t, onStartDemoApp, onAskInChat, user }) {
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [inputs, setInputs] = useState({ age: '', gender: '', income: '', community_category: '', occupation: '', district: '' });
  const [evalResult, setEvalResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowCheckForm(false);
      setEvalResult(null);
      setChecking(false);
      setSaveStatus('');
      setInputs({ age: '', gender: '', income: '', community_category: '', occupation: '', district: '' });
    }
  }, [isOpen, scheme]);

  if (!isOpen || !scheme) return null;

  const rules = typeof scheme.eligibility_rules === 'string'
    ? JSON.parse(scheme.eligibility_rules)
    : (scheme.eligibility_rules || {});

  const docs = Array.isArray(scheme.documents_required)
    ? scheme.documents_required
    : (typeof scheme.documents_required === 'string'
        ? (scheme.documents_required.startsWith('[') ? JSON.parse(scheme.documents_required) : [scheme.documents_required])
        : []);

  const hasAgeReq = rules.min_age !== undefined || rules.max_age !== undefined;
  const hasGenderReq = rules.gender && rules.gender.toLowerCase() !== 'any' && rules.gender.toLowerCase() !== 'all';
  const hasIncomeReq = rules.max_income !== undefined && Number(rules.max_income) > 0;
  const hasCommunityReq = rules.community_category && !['any', 'all'].includes(String(rules.community_category).toLowerCase());
  const hasOccupationReq = rules.occupation && !['any', 'all'].includes(String(rules.occupation).toLowerCase());

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setChecking(true);
    setEvalResult(null);
    setSaveStatus('');
    try {
      const res = await fetch(`${API_URL}/api/schemes/${scheme.id}/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile: inputs })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify');
      setEvalResult(data);
    } catch (err) {
      setEvalResult({ error: err.message });
    } finally {
      setChecking(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(inputs)
      });
      if (res.ok) {
        setSaveStatus(lang === 'ta' ? 'சுயவிவரத்தில் சேமிக்கப்பட்டது ✓' : 'Saved to profile ✓');
      }
    } catch (e) {}
  };

  const handleApplyClick = () => {
    onClose();
    onStartDemoApp(scheme);
  };

  const ageText = hasAgeReq
    ? `${rules.min_age ?? 0} to ${rules.max_age ? rules.max_age + ' ' + (lang === 'ta' ? 'வயது' : 'years') : (lang === 'ta' ? 'மேல்' : 'and above')}`
    : (lang === 'ta' ? 'குறிப்பிட்ட வயது வரம்பு இல்லை' : 'No specific age limit');

  const genderText = hasGenderReq
    ? (lang === 'ta' ? (rules.gender === 'Female' ? 'பெண்கள் மட்டும்' : rules.gender) : rules.gender)
    : (lang === 'ta' ? 'அனைத்து பாலினத்தவரும்' : 'Any / All Genders');

  const incomeText = hasIncomeReq
    ? `≤ ₹${Number(rules.max_income).toLocaleString('en-IN')} / ${lang === 'ta' ? 'ஆண்டு' : 'year'}`
    : (lang === 'ta' ? 'வருமான உச்சவரம்பு இல்லை' : 'No income ceiling');

  const communityText = hasCommunityReq
    ? (Array.isArray(rules.community_category) ? rules.community_category.join(', ') : rules.community_category)
    : (lang === 'ta' ? 'அனைத்து சமூகப் பிரிவினர்' : 'All communities');

  const districtText = rules.district || (lang === 'ta' ? 'தமிழ்நாடு முழுவதும் (38 மாவட்டங்கள்)' : 'All 38 districts of Tamil Nadu');
  const occupationText = rules.occupation || (lang === 'ta' ? 'அனைத்து தகுதியான குடிமக்கள்' : 'Open to all eligible citizen groups');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg uppercase">
              {scheme.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Building2 size={13} className="text-slate-500" />
              {scheme.department}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {lang === 'ta' ? scheme.name_ta : scheme.name_en}
          </h2>
          {lang === 'ta' ? (
            <p className="text-xs text-slate-400 font-mono">{scheme.name_en}</p>
          ) : (
            scheme.name_ta && <p className="text-xs text-slate-400 font-sans">{scheme.name_ta}</p>
          )}
        </div>

        {/* Benefits & Description */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>{t('benefits')}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'ta' ? (scheme.benefits_ta || scheme.benefits_en) : (scheme.benefits_en || scheme.benefits_ta)}
          </p>
          {scheme.official_url && (
            <div className="pt-2">
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
              >
                <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதளம்' : 'Official Government Portal'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Plain Eligibility Requirements (Information Only) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>{t('plain_criteria')}</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {lang === 'ta' ? 'தகவலுக்கு மட்டுமே — தானியங்கி சரிபார்ப்பு இல்லை' : 'Information only — no automatic profile check'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'வயது வரம்பு' : 'Age Range'}</div>
              <div className="text-white font-semibold">{ageText}</div>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'பாலினம்' : 'Gender'}</div>
              <div className="text-white font-semibold">{genderText}</div>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'வருமான வரம்பு' : 'Income Limit'}</div>
              <div className="text-white font-semibold">{incomeText}</div>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'சமூகப் பிரிவு' : 'Community / Social Category'}</div>
              <div className="text-white font-semibold">{communityText}</div>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'மாவட்ட வரம்பு' : 'District Applicability'}</div>
              <div className="text-white font-semibold">{districtText}</div>
            </div>
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium text-[11px] mb-0.5">{lang === 'ta' ? 'தொழில் / தகுதி வகை' : 'Occupation / Target Group'}</div>
              <div className="text-white font-semibold">{occupationText}</div>
            </div>
          </div>

          {docs.length > 0 && (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5">
              <div className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                <FileText size={13} className="text-teal-400" />
                <span>{t('documents')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {docs.map((d, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px] border border-slate-700">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Triggered Inline Eligibility Check Form */}
        {showCheckForm && (
          <div className="p-4 bg-slate-900/90 border border-emerald-900/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>{lang === 'ta' ? 'உங்கள் தகுதியைச் சரிபார்க்கவும் (ஒருமுறை சரிபார்ப்பு)' : 'Check Your Eligibility (One-Time Verification)'}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {lang === 'ta' ? 'உள்நுழைவு தேவையில்லை' : 'No login required'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              {lang === 'ta'
                ? 'இத்திட்டத்திற்குத் தேவையான விவரங்களை மட்டும் உள்ளிடவும். உங்கள் விவரங்கள் தானாகச் சேமிக்கப்படாது.'
                : 'Enter only the specific fields required for this scheme. Your answers are not saved automatically.'}
            </p>

            <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              {hasAgeReq && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    {lang === 'ta' ? 'உங்கள் வயது' : 'Your Age'} ({rules.min_age || 0}–{rules.max_age || 100})
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="110"
                    placeholder="e.g. 21"
                    value={inputs.age}
                    onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {hasGenderReq && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    {lang === 'ta' ? 'பாலினம்' : 'Gender'}
                  </label>
                  <select
                    value={inputs.gender}
                    onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">-- {lang === 'ta' ? 'தேர்ந்தெடுக்கவும்' : 'Select'} --</option>
                    <option value="Female">{lang === 'ta' ? 'பெண் (Female)' : 'Female'}</option>
                    <option value="Male">{lang === 'ta' ? 'ஆண் (Male)' : 'Male'}</option>
                    <option value="Transgender">{lang === 'ta' ? 'மூன்றாம் பாலினம் (Transgender)' : 'Transgender'}</option>
                  </select>
                </div>
              )}

              {hasIncomeReq && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    {lang === 'ta' ? 'ஆண்டு குடும்ப வருமானம் (₹)' : 'Annual Family Income (₹)'} (Max ₹{Number(rules.max_income).toLocaleString('en-IN')})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 80000"
                    value={inputs.income}
                    onChange={(e) => setInputs({ ...inputs, income: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {hasCommunityReq && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    {lang === 'ta' ? 'சமூகப் பிரிவு' : 'Community / Social Category'}
                  </label>
                  <select
                    value={inputs.community_category}
                    onChange={(e) => setInputs({ ...inputs, community_category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">-- {lang === 'ta' ? 'தேர்ந்தெடுக்கவும்' : 'Select'} --</option>
                    <option value="General">General / OC</option>
                    <option value="BC">BC / OBC</option>
                    <option value="MBC">MBC / DNC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              )}

              {hasOccupationReq && (
                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-[11px] block mb-1">
                    {lang === 'ta' ? 'தொழில் / மாணவர் நிலை' : 'Occupation / Category Status'} ({rules.occupation})
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ta' ? 'எ.கா: அரசுப் பள்ளி மாணவி, விவசாயி...' : 'e.g. College Student (Govt School), Farmer...'}
                    value={inputs.occupation}
                    onChange={(e) => setInputs({ ...inputs, occupation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={checking}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {checking ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={15} />}
                  <span>{checking ? (lang === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying...') : (lang === 'ta' ? 'எனது விவரங்களைச் சரிபார்க்க' : 'Verify My Values')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAskInChat(scheme)}
                  className="w-full sm:w-auto py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={14} className="text-teal-400" />
                  <span>{lang === 'ta' ? 'AI அரட்டையில் கேட்க' : 'Ask in AI Chat'}</span>
                </button>
              </div>
            </form>

            {/* Verification Result Display */}
            {evalResult && (
              <div className={`mt-3 p-3.5 rounded-xl border text-xs space-y-2 ${evalResult.eligible ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200' : 'bg-rose-950/50 border-rose-800/60 text-rose-200'}`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {evalResult.eligible ? (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>{lang === 'ta' ? '✅ நீங்கள் குறிப்பிட்ட விவரங்களின்படி தகுதியுடையவர்' : '✅ You meet the requirements you provided'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} className="text-rose-400" />
                      <span>{lang === 'ta' ? '❌ வரம்புகள் பொருந்தவில்லை' : "❌ Doesn't match all requirements"}</span>
                    </>
                  )}
                </div>

                {evalResult.criteria && (
                  <div className="space-y-1 pt-1 text-[11px]">
                    {evalResult.criteria.map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className={c.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {c.passed ? '✓' : '✗'}
                        </span>
                        <span>
                          {c.passed
                            ? `${c.rule}: ${lang === 'ta' ? 'பொருந்தியது' : 'Matches'}`
                            : `${lang === 'ta' ? `${c.rule} பொருந்தவில்லை` : `Doesn't match on ${c.rule}`} (${lang === 'ta' ? 'தேவை' : 'Required'}: ${c.required}, ${lang === 'ta' ? 'வழங்கியது' : 'provided'}: ${c.user_value})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Profile Saving for Logged-In Users */}
                {user && evalResult.eligible && (
                  <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-400">
                      {lang === 'ta' ? 'எதிர்கால வருகைக்கு இந்த விவரங்களைச் சேமிக்கவா?' : 'Save these values to your profile for future visits?'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded-lg font-medium transition-colors"
                    >
                      {saveStatus || (lang === 'ta' ? 'சுயவிவரத்தில் சேமிக்க (விருப்பமானது)' : 'Save to Profile (Optional)')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          {!showCheckForm && (
            <button
              type="button"
              onClick={() => setShowCheckForm(true)}
              className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>{lang === 'ta' ? "நான் தகுதியானவரா எனப் பார்க்க" : "Check If I'm Eligible"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
          >
            <CheckCircle2 size={16} />
            <span>{t('start_app_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function DemoAppModal({ isOpen, onClose, scheme, lang, t, onSubmitted }) {
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRefId('');
    }
  }, [isOpen]);

  if (!isOpen || !scheme) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ scheme_id: scheme.id })
      });
      const data = await res.json();
      if (res.ok) {
        setRefId(data.demo_reference_id);
        if (onSubmitted) onSubmitted(data.demo_reference_id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        {refId ? (
          /* CONFIRMATION MESSAGE */
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 mx-auto flex items-center justify-center">
              <Check size={24} />
            </div>
            <div className="text-base font-bold text-white flex items-center justify-center gap-2">
              <span>{lang === 'ta' ? 'விண்ணப்ப எண்:' : 'Application ID:'}</span>
              <span className="font-mono text-emerald-400">{refId}</span>
              <span className="text-emerald-400 font-bold">✓</span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ta' ? 'விண்ணப்ப நிலை கண்காணிப்பில் பதிவு சேர்க்கப்பட்டது.' : 'Application added to your status tracker.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* APPLICATION SCREEN */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-base font-bold text-white">
                {lang === 'ta' ? 'விண்ணப்பம் சமர்ப்பிக்கவும்' : 'Submit Application'}
              </h2>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="text-slate-400 text-[11px]">Selected Scheme:</div>
              <div className="text-sm font-semibold text-white">{lang === 'ta' ? scheme.name_ta : scheme.name_en}</div>
              <div className="text-[11px] text-emerald-400 font-medium">{scheme.department}</div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-950"
              >
                {loading ? 'Submitting...' : (lang === 'ta' ? 'உறுதிசெய்து சமர்ப்பிக்கவும்' : 'Confirm & Submit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
