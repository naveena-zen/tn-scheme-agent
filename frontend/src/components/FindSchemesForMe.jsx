import React, { useState, useEffect } from 'react';
import {
  Sparkles, UserCheck, ShieldCheck, Filter, AlertCircle, CheckCircle2,
  FileText, ExternalLink, MapPin, ChevronRight, Edit3, Trash2,
  Save, RefreshCw, Info, HelpCircle, Layers, Check, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label_en: 'All Categories', label_ta: 'அனைத்து பிரிவுகள்' },
  { id: 'education', label_en: 'Education & Youth', label_ta: 'கல்வி & இளைஞர் நலம்' },
  { id: 'women', label_en: 'Women Welfare', label_ta: 'மகளிர் நலம்' },
  { id: 'agriculture', label_en: 'Agriculture & Farmers', label_ta: 'வேளாண்மை & உழவர்' },
  { id: 'health', label_en: 'Health & Medical', label_ta: 'மருத்துவம் & நலம்' },
  { id: 'housing', label_en: 'Housing & Shelter', label_ta: 'வீட்டு வசதி' },
  { id: 'pension', label_en: 'Pension & Senior / Disabled', label_ta: 'ஓய்வூதியம் & பாதுகாப்பு' }
];

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul',
  'Kanchipuram', 'Chengalpattu', 'Tiruppur', 'Cuddalore', 'Dharmapuri',
  'Krishnagiri', 'Namakkal', 'Thoothukudi', 'Kanyakumari', 'Nagapattinam',
  'Karur', 'Pudukkottai', 'Ramanathapuram', 'Sivaganga', 'Theni',
  'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Viluppuram', 'Virudhunagar'
];

export default function FindSchemesForMe({
  user,
  lang = 'en',
  apiUrl = 'http://localhost:5000',
  onOpenOfficeFinder,
  onOpenSchemeDetails,
  onRequireAuth
}) {
  const [profile, setProfile] = useState({
    name: user ? user.name : '',
    age: '',
    gender: 'Female',
    district: 'Chennai',
    community_category: 'BC',
    income: '',
    occupation: 'Student',
    education_level: 'Undergraduate',
    marital_status: 'Unmarried',
    disability: false,
    house_ownership: 'Rented',
    ration_card_type: 'PHH',
    children_count: 0,
    consent: true
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load existing profile from backend or localStorage
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && user) {
        try {
          const res = await fetch(`${apiUrl}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              age: data.age !== null && data.age !== undefined ? data.age : prev.age,
              gender: data.gender || prev.gender,
              district: data.district || prev.district,
              community_category: data.community_category || prev.community_category,
              income: data.income !== null && data.income !== undefined ? data.income : prev.income,
              occupation: data.occupation || prev.occupation,
              education_level: data.education_level || prev.education_level,
              marital_status: data.marital_status || prev.marital_status,
              disability: Boolean(data.disability),
              house_ownership: data.house_ownership || prev.house_ownership,
              ration_card_type: data.ration_card_type || prev.ration_card_type,
              children_count: data.children_count !== undefined ? data.children_count : prev.children_count,
              consent: data.consent_data_processing !== undefined ? data.consent_data_processing : true
            }));
            fetchRecommendations(data, activeCategory);
            return;
          }
        } catch (e) {
          console.warn('[Profile fetch notice]', e.message);
        }
      }

      // Guest / local fallback
      const saved = localStorage.getItem('citizen_profile_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          fetchRecommendations(parsed, activeCategory);
        } catch (e) {}
      } else {
        // Open form initially if no profile
        setFormOpen(true);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch recommendations
  const fetchRecommendations = async (profData = profile, cat = activeCategory) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/schemes/find-for-me`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          profile: profData,
          language: lang,
          category: cat
        })
      });

      if (!res.ok) throw new Error('Failed to compute scheme recommendations');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      setError(e.message || 'Error loading recommendations');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (profile.age && (Number(profile.age) < 1 || Number(profile.age) > 120)) {
      errs.age = lang === 'ta' ? 'சரியான வயதை உள்ளிடவும் (1-120)' : 'Please enter a valid age (1-120)';
    }
    if (profile.income && Number(profile.income) < 0) {
      errs.income = lang === 'ta' ? 'வருமானம் பூஜ்ஜியத்திற்கு மேல் இருக்க வேண்டும்' : 'Income must be positive';
    }
    if (!profile.consent) {
      errs.consent = lang === 'ta' ? 'சுயவிவரப் பயன்பாட்டிற்கு ஒப்புதல் தேவை' : 'Consent is required for profile matching';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    localStorage.setItem('citizen_profile_v2', JSON.stringify(profile));

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${apiUrl}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        });
      } catch (e) {
        console.warn('[Profile save error]', e.message);
      }
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setFormOpen(false);
    fetchRecommendations(profile, activeCategory);
  };

  const handleClearProfile = async () => {
    const confirmed = window.confirm(
      lang === 'ta'
        ? 'உங்கள் சேமிக்கப்பட்ட விவரங்களை அழிக்க விரும்புகிறீர்களா?'
        : 'Are you sure you want to clear your saved profile details?'
    );
    if (!confirmed) return;

    localStorage.removeItem('citizen_profile_v2');
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${apiUrl}/api/users/profile`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    }

    const resetProfile = {
      name: user ? user.name : '',
      age: '',
      gender: 'Female',
      district: 'Chennai',
      community_category: 'BC',
      income: '',
      occupation: 'Student',
      education_level: 'Undergraduate',
      marital_status: 'Unmarried',
      disability: false,
      house_ownership: 'Rented',
      ration_card_type: 'PHH',
      children_count: 0,
      consent: true
    };
    setProfile(resetProfile);
    setRecommendations([]);
    setFormOpen(true);
  };

  const handleCategoryFilter = (catId) => {
    setActiveCategory(catId);
    fetchRecommendations(profile, catId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{lang === 'ta' ? 'தனிப்பயனாக்கப்பட்ட அரசுத் திட்டங்கள்' : 'Profile-Based Scheme Recommendations'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'ta' ? 'எனக்கான திட்டங்கள் கண்டறி' : 'Find Schemes for Me'}
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            {lang === 'ta'
              ? 'உங்கள் வயது, தொழில், வருமானம் மற்றும் குடும்ப விவரங்களை அடிப்படையாகக் கொண்டு தமிழ்நாடு அரசின் தகுதியான நலத்திட்டங்களை கண்டறியுங்கள்.'
              : 'Discover personalized welfare benefits you are eligible for based on your verified criteria, with plain-language explanations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 transition shadow-sm"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>{formOpen ? (lang === 'ta' ? 'சுயவிவரத்தை மறை' : 'Hide Profile') : (lang === 'ta' ? 'சுயவிவரத்தை திருத்து' : 'Edit My Profile')}</span>
          </button>

          <button
            onClick={() => fetchRecommendations(profile, activeCategory)}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
            title={lang === 'ta' ? 'புதுப்பி' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* PRIVACY GUARANTEE BANNER */}
      <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-200/90 leading-relaxed">
          <strong className="text-emerald-300 font-semibold">
            {lang === 'ta' ? '🔒 குடிமக்கள் தரவு தனியுரிமை உறுதிமொழி:' : '🔒 Citizen Privacy Guarantee:'}
          </strong>{' '}
          {lang === 'ta'
            ? 'உங்கள் சுயவிவரத் தகவல்கள் உங்கள் வெளிப்படையான ஒப்புதலுடன் மட்டுமே சேமிக்கப்படுகின்றன. உங்கள் பெயர், தொலைபேசி அல்லது ஆதார் போன்ற அடையாள விவரங்கள் எந்தவொரு வெளிப்புற ஏஐ மாதிரிகளுக்கும் அனுப்பப்படாது. உங்கள் விருப்பப்படி விவரங்களை எப்போது வேண்டுமானாலும் அழிக்கலாம்.'
            : 'Your demographic profile is stored with your explicit consent. Personal identifying details (Name, Phone, Aadhaar) are NEVER shared with external AI models. Only anonymized eligibility attributes are evaluated. You can edit or delete this profile anytime.'}
        </div>
      </div>

      {/* PROFILE FORM (COLLAPSIBLE) */}
      {formOpen && (
        <form onSubmit={handleSaveProfile} className="mb-8 p-5 sm:p-6 rounded-2xl bg-gray-900/90 border border-gray-700 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                {lang === 'ta' ? 'உங்கள் தகுதி சுயவிவர விவரக்குறிப்பு' : 'Citizen Eligibility Profile'}
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              {lang === 'ta' ? '12 தகுதி அளவுகோல்கள்' : '12 Eligibility Criteria'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

            {/* 1. Name */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'முழுப் பெயர்' : 'Full Name'}
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Naveen / மல்லிகா"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* 2. Age */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'வயது (ஆண்டுகள்)' : 'Age (in years)'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: e.target.value })}
                placeholder="21"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              />
              {validationErrors.age && <p className="text-rose-400 text-[11px] mt-1">{validationErrors.age}</p>}
            </div>

            {/* 3. Gender */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'பாலினம்' : 'Gender'}
              </label>
              <select
                value={profile.gender}
                onChange={e => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Female">{lang === 'ta' ? 'பெண் (Female)' : 'Female'}</option>
                <option value="Male">{lang === 'ta' ? 'ஆண் (Male)' : 'Male'}</option>
                <option value="Transgender">{lang === 'ta' ? 'திருநங்கை / திருநம்பி (Transgender)' : 'Transgender'}</option>
              </select>
            </div>

            {/* 4. District */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'மாவட்டம்' : 'District'}
              </label>
              <select
                value={profile.district}
                onChange={e => setProfile({ ...profile, district: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {TN_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 5. Community Category */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'சமூகப் பிரிவு (Community)' : 'Community Category'}
              </label>
              <select
                value={profile.community_category}
                onChange={e => setProfile({ ...profile, community_category: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="BC">BC (Backward Classes)</option>
                <option value="MBC">MBC / DNC (Most Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="General">OC / General</option>
              </select>
            </div>

            {/* 6. Annual Family Income */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'ஆண்டு குடும்ப வருமானம் (₹)' : 'Annual Family Income (₹)'}
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={profile.income}
                onChange={e => setProfile({ ...profile, income: e.target.value })}
                placeholder="80000"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              />
              {validationErrors.income && <p className="text-rose-400 text-[11px] mt-1">{validationErrors.income}</p>}
            </div>

            {/* 7. Occupation */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'தொழில் / தற்போதைய நிலை' : 'Occupation / Current Status'}
              </label>
              <select
                value={profile.occupation}
                onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Student">{lang === 'ta' ? 'மாணவர் (Student)' : 'Student'}</option>
                <option value="Homemaker">{lang === 'ta' ? 'குடும்பத் தலைவி (Homemaker)' : 'Homemaker'}</option>
                <option value="Farmer">{lang === 'ta' ? 'விவசாயி / விவசாயத் தொழிலாளி (Farmer)' : 'Farmer / Agricultural Labourer'}</option>
                <option value="Daily Wage / Unorganized Worker">{lang === 'ta' ? 'கூலித் தொழிலாளி (Daily Wage / Unorganized Worker)' : 'Daily Wage / Unorganized Worker'}</option>
                <option value="Self-employed">{lang === 'ta' ? 'சுயதொழில் (Self-employed)' : 'Self-employed / Business'}</option>
                <option value="Senior Citizen">{lang === 'ta' ? 'மூத்த குடிமக்கள் (Senior Citizen)' : 'Senior Citizen'}</option>
                <option value="Unemployed">{lang === 'ta' ? 'வேலையற்றோர் (Unemployed / Job Seeker)' : 'Unemployed / Job Seeker'}</option>
                <option value="Salaried / Private">{lang === 'ta' ? 'தனியார் ஊழியர் (Salaried / Private)' : 'Salaried / Private'}</option>
              </select>
            </div>

            {/* 8. Education Level */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'கல்வித் தகுதி' : 'Education Level'}
              </label>
              <select
                value={profile.education_level}
                onChange={e => setProfile({ ...profile, education_level: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Undergraduate">Undergraduate Degree (கல்லூரி படிப்பு)</option>
                <option value="Diploma">Diploma / Polytechnic (டிப்ளமோ)</option>
                <option value="Postgraduate">Postgraduate Degree (முதுகலை)</option>
                <option value="12th Pass">12th Standard Passed (12-ஆம் வகுப்பு)</option>
                <option value="10th Pass">10th Standard Passed (10-ஆம் வகுப்பு)</option>
                <option value="Below 10th">Below 10th Standard (10-க்கு கீழ்)</option>
              </select>
            </div>

            {/* 9. Marital Status */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'திருமண நிலை' : 'Marital Status'}
              </label>
              <select
                value={profile.marital_status}
                onChange={e => setProfile({ ...profile, marital_status: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Unmarried">{lang === 'ta' ? 'திருமணம் ஆகாதவர் (Unmarried)' : 'Unmarried'}</option>
                <option value="Married">{lang === 'ta' ? 'திருமணமானவர் (Married)' : 'Married'}</option>
                <option value="Widowed">{lang === 'ta' ? 'விதவை (Widowed)' : 'Widowed'}</option>
                <option value="Divorced">{lang === 'ta' ? 'விவாகரத்து பெற்றவர் (Divorced)' : 'Divorced / Separated'}</option>
              </select>
            </div>

            {/* 10. House Ownership */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'வீட்டு உரிமை' : 'House Ownership'}
              </label>
              <select
                value={profile.house_ownership}
                onChange={e => setProfile({ ...profile, house_ownership: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Rented">{lang === 'ta' ? 'வாடகை வீடு (Rented)' : 'Rented'}</option>
                <option value="Homeless / Kutcha">{lang === 'ta' ? 'குடிசை / வீடற்றவர் (Kutcha / Homeless)' : 'Homeless / Kutcha / Hut'}</option>
                <option value="Own">{lang === 'ta' ? 'சொந்த வீடு (Own House)' : 'Own Pucca House'}</option>
              </select>
            </div>

            {/* 11. Ration Card Type */}
            <div>
              <label className="block text-gray-300 font-medium mb-1.5">
                {lang === 'ta' ? 'ரேஷன் அட்டை வகை' : 'Smart Ration Card Type'}
              </label>
              <select
                value={profile.ration_card_type}
                onChange={e => setProfile({ ...profile, ration_card_type: e.target.value })}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="PHH">PHH - Priority Household (அரிசி அட்டை)</option>
                <option value="PHH-AAY">PHH-AAY - Antyodaya Anna Yojana (அந்தியோதயா)</option>
                <option value="NPHH">NPHH - Non-Priority Household</option>
                <option value="NPHH-S">NPHH-S - Sugar Card (சர்க்கரை அட்டை)</option>
                <option value="None">None / இல்லை</option>
              </select>
            </div>

            {/* 12. Children Count & Disability */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  {lang === 'ta' ? 'குழந்தைகளின் எண்ணிக்கை' : 'Number of Children'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={profile.children_count}
                  onChange={e => setProfile({ ...profile, children_count: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-1.5 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="disability_toggle"
                  checked={profile.disability}
                  onChange={e => setProfile({ ...profile, disability: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-gray-900 border-gray-700 focus:ring-emerald-500"
                />
                <label htmlFor="disability_toggle" className="text-gray-300 font-medium cursor-pointer">
                  {lang === 'ta' ? 'மாற்றுத்திறனாளி (Disability)' : 'Registered Differently Abled Person'}
                </label>
              </div>
            </div>

          </div>

          {/* CONSENT CHECKBOX */}
          <div className="mt-5 pt-4 border-t border-gray-800 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="consent_box"
              checked={profile.consent}
              onChange={e => setProfile({ ...profile, consent: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded text-emerald-600 bg-gray-900 border-gray-700 focus:ring-emerald-500 shrink-0"
            />
            <label htmlFor="consent_box" className="text-xs text-gray-400 cursor-pointer">
              {lang === 'ta'
                ? 'அரசு நலத்திட்ட தகுதியை மதிப்பிடுவதற்கு எனது மேலே உள்ள விவரங்களை பயன்படுத்த சம்மதிக்கிறேன்.'
                : 'I consent to storing and evaluating my demographic attributes solely for determining government welfare scheme eligibility.'}
            </label>
          </div>
          {validationErrors.consent && <p className="text-rose-400 text-[11px] mt-1">{validationErrors.consent}</p>}

          {/* FORM ACTIONS */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClearProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-gray-700 hover:border-rose-800 text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'விவரங்களை அழி' : 'Delete / Clear Profile'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
              >
                {lang === 'ta' ? 'மூடு' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-950 text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{lang === 'ta' ? 'சேமிக்கப்பட்டது!' : 'Saved!'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{lang === 'ta' ? 'சுயவிவரத்தை சேமித்து திட்டங்களை காண்க' : 'Save & Find Eligible Schemes'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin scrollbar-thumb-gray-800">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              {lang === 'ta' ? cat.label_ta : cat.label_en}
            </button>
          );
        })}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-white font-semibold">
            {lang === 'ta' ? 'உங்கள் தகுதியை சரிபார்க்கிறது...' : 'Evaluating your profile against verified Tamil Nadu schemes...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'ta' ? 'விதிமுறை அடிப்படையிலான ஆய்வு மற்றும் மறுதரவரிசை' : 'Applying deterministic rule filters and plain-language reasoning'}
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RESULTS LIST */}
      {!loading && (
        <>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>
              {lang === 'ta'
                ? `பொருந்தக்கூடிய ${recommendations.length} நலத்திட்டங்கள் கண்டறியப்பட்டன`
                : `Found ${recommendations.length} matching welfare scheme(s)`}
            </span>
            <span className="text-[11px] text-gray-500 italic">
              {lang === 'ta' ? 'அதிகாரப்பூர்வ தமிழ்நாடு அரசு தரவுத்தொகுப்பிலிருந்து மட்டும்' : 'Verified Tamil Nadu State Schemes only'}
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-10 rounded-2xl bg-gray-900/60 border border-gray-800 text-center">
              <Layers className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                {lang === 'ta' ? 'பொருந்தக்கூடிய திட்டங்கள் இல்லை' : 'No Matching Schemes Found'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                {lang === 'ta'
                  ? 'உங்கள் தற்போதைய அளவுகோல்களுடன் திட்டங்கள் பொருந்தவில்லை. உங்கள் சுயவிவரத்தில் கூடுதல் விவரங்களை சேர்க்கவும் அல்லது வேறு பிரிவைத் தேர்ந்தெடுக்கவும்.'
                  : 'No scheme matches this current profile and category combination. Try expanding your profile information or switching category filter.'}
              </p>
              <button
                onClick={() => setFormOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-950 text-xs font-bold"
              >
                {lang === 'ta' ? 'சுயவிவரத்தை புதுப்பிக்கவும்' : 'Update Profile'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(rec => {
                const s = rec.scheme;
                const evalInfo = rec.evaluation || {};
                const status = evalInfo.status || 'Eligible';

                const statusBadge =
                  status === 'Eligible'
                    ? { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', text_en: 'Eligible', text_ta: 'தகுதியுடையவர்' }
                    : status === 'Likely eligible'
                    ? { bg: 'bg-sky-500/15 text-sky-300 border-sky-500/40', text_en: 'Likely Eligible', text_ta: 'தகுதிக்கு வாய்ப்புள்ளது' }
                    : { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40', text_en: 'Missing Info', text_ta: 'கூடுதல் விவரம் தேவை' };

                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5 group"
                  >
                    <div>
                      {/* CARD HEADER */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusBadge.bg}`}>
                          {lang === 'ta' ? statusBadge.text_ta : statusBadge.text_en}
                        </span>

                        <span className="text-[10px] text-gray-400 bg-gray-950 px-2 py-0.5 rounded-md border border-gray-800">
                          {s.category}
                        </span>
                      </div>

                      {/* TITLE */}
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                        {lang === 'ta' ? s.name_ta : s.name_en}
                      </h3>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {s.department}
                      </p>

                      {/* WHY YOU MATCH BANNER */}
                      <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80 mb-3 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === 'ta' ? 'நீங்கள் ஏன் தகுதியானவர்:' : 'Why You Match:'}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-[11px]">
                          {rec.why_you_match}
                        </p>

                        {/* LIST MISSING FIELDS IF ANY */}
                        {evalInfo.missing_fields && evalInfo.missing_fields.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-800/60 flex items-center gap-1.5 text-[10px] text-amber-300">
                            <Info className="w-3 h-3 shrink-0" />
                            <span>
                              {lang === 'ta' ? 'தேவைப்படும் விவரங்கள்: ' : 'Needed fields: '}
                              <strong>{evalInfo.missing_fields.join(', ')}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* BENEFIT SUMMARY */}
                      <div className="mb-3 text-xs">
                        <span className="text-gray-400 font-medium block mb-1">
                          {lang === 'ta' ? 'திட்ட நன்மைகள்:' : 'Benefit:'}
                        </span>
                        <p className="text-gray-200 text-xs font-semibold leading-relaxed">
                          {lang === 'ta' ? s.benefit_ta : s.benefit_en}
                        </p>
                      </div>

                      {/* REQUIRED DOCUMENTS PREVIEW */}
                      {s.documents_required && s.documents_required.length > 0 && (
                        <div className="mb-4 text-[11px]">
                          <span className="text-gray-400 font-medium block mb-1">
                            {lang === 'ta' ? 'தேவையான முக்கிய சான்றிதழ்கள்:' : 'Documents Needed:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {s.documents_required.slice(0, 3).map((doc, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] border border-gray-700/60">
                                {doc}
                              </span>
                            ))}
                            {s.documents_required.length > 3 && (
                              <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">
                                +{s.documents_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER & ACTIONS */}
                    <div className="pt-3 border-t border-gray-800/80">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3">
                        <span>
                          {lang === 'ta' ? 'சரிபார்க்கப்பட்டது: ' : 'Last verified: '}
                          <strong>{s.last_verified_at || '2026-03-20'}</strong>
                        </span>
                        {s.official_link && (
                          <a
                            href={s.official_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline"
                          >
                            <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ தளம்' : 'Official Portal'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenSchemeDetails && onOpenSchemeDetails(s)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition border border-gray-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>{lang === 'ta' ? 'எப்படி விண்ணப்பிப்பது' : 'How to Apply'}</span>
                        </button>

                        <button
                          onClick={() => onOpenOfficeFinder && onOpenOfficeFinder(s.required_office_type || 'esevai', s.name_en)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs transition shadow-md shadow-emerald-600/10"
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-950" />
                          <span>{lang === 'ta' ? 'அருகிலுள்ள மையம்' : 'Find Nearby Office'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* OFFICIAL WEBSITE DISCLAIMER */}
          <div className="mt-8 p-3 rounded-xl bg-gray-900 border border-gray-800 text-center text-xs text-gray-400">
            <p>
              ⚠️ {lang === 'ta'
                ? 'அறிவிப்பு: மேலே உள்ள பரிந்துரைகள் மாநில அரசு விதிமுறைகளின்படி தொகுக்கப்பட்டுள்ளன. தயவுசெய்து விண்ணப்பிக்கும் முன் அதிகாரப்பூர்வ தமிழ்நாடு அரசு இணையதளத்தில் தகுதி மற்றும் தேவையான சான்றிதழ்களை உறுதிப்படுத்தவும்.'
                : 'Disclaimer: Recommendations are provided for citizen facilitation based on verified government criteria. Please confirm eligibility and official guidelines on the respective official Tamil Nadu government website before applying.'}
            </p>
          </div>
        </>
      )}

    </div>
  );
}
