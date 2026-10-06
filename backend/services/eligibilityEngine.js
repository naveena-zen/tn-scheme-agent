const fs = require('fs');
const path = require('path');

const VERIFIED_SCHEMES_PATH = path.join(__dirname, '..', 'data', 'verified_schemes.json');

function loadVerifiedSchemes() {
  try {
    const raw = fs.readFileSync(VERIFIED_SCHEMES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[EligibilityEngine] Error loading verified schemes:', e.message);
    return [];
  }
}

/**
 * Deterministic rule-based evaluation of a user profile against a scheme
 * @param {Object} profile - User profile attributes
 * @param {Object} scheme - Verified scheme definition
 * @returns {Object} Evaluation verdict, criteria breakdown, and missing fields
 */
function evaluateSchemeEligibility(profile, scheme) {
  const rules = scheme.eligibility_rules || {};
  const criteria = [];
  const missingFields = [];
  let isFailed = false;

  // 1. Age check
  if (rules.min_age !== undefined || rules.max_age !== undefined) {
    if (profile.age === undefined || profile.age === null || profile.age === '') {
      missingFields.push('age');
      criteria.push({
        field: 'age',
        rule: `${rules.min_age ? 'Min: ' + rules.min_age : ''} ${rules.max_age ? 'Max: ' + rules.max_age : ''}`.trim(),
        user_value: null,
        passed: null,
        reason: 'Age not specified in profile'
      });
    } else {
      const age = Number(profile.age);
      let passed = true;
      if (rules.min_age !== undefined && age < rules.min_age) passed = false;
      if (rules.max_age !== undefined && age > rules.max_age) passed = false;
      if (!passed) isFailed = true;
      criteria.push({
        field: 'age',
        rule: `${rules.min_age ? 'Min: ' + rules.min_age : ''} ${rules.max_age ? 'Max: ' + rules.max_age : ''}`.trim(),
        user_value: age,
        passed,
        reason: passed ? 'Within eligible age range' : 'Does not satisfy age limits'
      });
    }
  }

  // 2. Gender check
  if (rules.gender && rules.gender !== 'Any') {
    if (!profile.gender) {
      missingFields.push('gender');
      criteria.push({ field: 'gender', rule: rules.gender, user_value: null, passed: null, reason: 'Gender not specified' });
    } else {
      const passed = profile.gender.toLowerCase() === rules.gender.toLowerCase();
      if (!passed) isFailed = true;
      criteria.push({
        field: 'gender',
        rule: rules.gender,
        user_value: profile.gender,
        passed,
        reason: passed ? `Gender matches required (${rules.gender})` : `Restricted to ${rules.gender}`
      });
    }
  }

  // 3. Annual Family Income check
  if (rules.max_income !== undefined) {
    if (profile.income === undefined || profile.income === null || profile.income === '') {
      missingFields.push('income');
      criteria.push({ field: 'income', rule: `<= ₹${rules.max_income.toLocaleString('en-IN')}`, user_value: null, passed: null, reason: 'Annual family income not specified' });
    } else {
      const income = Number(profile.income);
      const passed = income <= rules.max_income;
      if (!passed) isFailed = true;
      criteria.push({
        field: 'income',
        rule: `<= ₹${rules.max_income.toLocaleString('en-IN')}`,
        user_value: income,
        passed,
        reason: passed ? `Annual income (₹${income.toLocaleString('en-IN')}) is within limit` : `Exceeds ceiling of ₹${rules.max_income.toLocaleString('en-IN')}`
      });
    }
  }

  // 4. Community / Caste category check
  if (rules.community && rules.community !== 'Any') {
    const comm = profile.community_category || profile.community;
    if (!comm) {
      missingFields.push('community_category');
      criteria.push({ field: 'community', rule: rules.community, user_value: null, passed: null, reason: 'Community category not specified' });
    } else {
      const allowed = Array.isArray(rules.community) ? rules.community : [rules.community];
      const passed = allowed.some(c => c.toLowerCase() === comm.toLowerCase());
      if (!passed) isFailed = true;
      criteria.push({
        field: 'community',
        rule: allowed.join(', '),
        user_value: comm,
        passed,
        reason: passed ? `Community category (${comm}) matches` : `Requires ${allowed.join('/')}`
      });
    }
  }

  // 5. Occupation check
  if (rules.occupation && rules.occupation !== 'Any') {
    if (!profile.occupation) {
      missingFields.push('occupation');
      criteria.push({ field: 'occupation', rule: Array.isArray(rules.occupation) ? rules.occupation.join(', ') : rules.occupation, user_value: null, passed: null, reason: 'Occupation not specified' });
    } else {
      const allowedOccs = Array.isArray(rules.occupation) ? rules.occupation : [rules.occupation];
      const userOcc = profile.occupation.toLowerCase();
      const passed = allowedOccs.some(occ => userOcc.includes(occ.toLowerCase()) || occ.toLowerCase().includes(userOcc));
      if (!passed) isFailed = true;
      criteria.push({
        field: 'occupation',
        rule: allowedOccs.join(', '),
        user_value: profile.occupation,
        passed,
        reason: passed ? `Occupation (${profile.occupation}) eligible` : `Requires ${allowedOccs.join(', ')}`
      });
    }
  }

  // 6. Education level check
  if (rules.education_level) {
    if (!profile.education_level) {
      missingFields.push('education_level');
      criteria.push({ field: 'education_level', rule: Array.isArray(rules.education_level) ? rules.education_level.join(', ') : rules.education_level, user_value: null, passed: null, reason: 'Education level not specified' });
    } else {
      const allowedEdu = Array.isArray(rules.education_level) ? rules.education_level : [rules.education_level];
      const userEdu = profile.education_level.toLowerCase();
      const passed = allowedEdu.some(ed => userEdu.includes(ed.toLowerCase()) || ed.toLowerCase().includes(userEdu));
      if (!passed) isFailed = true;
      criteria.push({
        field: 'education_level',
        rule: allowedEdu.join(', '),
        user_value: profile.education_level,
        passed,
        reason: passed ? `Education level (${profile.education_level}) matches` : `Requires ${allowedEdu.join(', ')}`
      });
    }
  }

  // 7. Marital status check
  if (rules.marital_status) {
    if (!profile.marital_status) {
      missingFields.push('marital_status');
      criteria.push({ field: 'marital_status', rule: Array.isArray(rules.marital_status) ? rules.marital_status.join(', ') : rules.marital_status, user_value: null, passed: null, reason: 'Marital status not specified' });
    } else {
      const allowedMs = Array.isArray(rules.marital_status) ? rules.marital_status : [rules.marital_status];
      const passed = allowedMs.some(m => m.toLowerCase() === profile.marital_status.toLowerCase());
      if (!passed) isFailed = true;
      criteria.push({
        field: 'marital_status',
        rule: allowedMs.join(', '),
        user_value: profile.marital_status,
        passed,
        reason: passed ? `Marital status (${profile.marital_status}) eligible` : `Requires ${allowedMs.join(', ')}`
      });
    }
  }

  // 8. Disability check
  if (rules.disability && rules.disability === 'Yes') {
    const isDis = profile.disability === true || profile.disability === 'Yes' || profile.disability === 'yes';
    if (profile.disability === undefined || profile.disability === null || profile.disability === '') {
      missingFields.push('disability');
      criteria.push({ field: 'disability', rule: 'Must have registered disability', user_value: null, passed: null, reason: 'Disability status not indicated' });
    } else {
      if (!isDis) isFailed = true;
      criteria.push({
        field: 'disability',
        rule: 'Registered disability required',
        user_value: isDis ? 'Yes' : 'No',
        passed: isDis,
        reason: isDis ? 'Differently-abled criteria met' : 'Requires registered disability'
      });
    }
  }

  // 9. House ownership check
  if (rules.house_ownership) {
    if (!profile.house_ownership) {
      missingFields.push('house_ownership');
      criteria.push({ field: 'house_ownership', rule: Array.isArray(rules.house_ownership) ? rules.house_ownership.join(', ') : rules.house_ownership, user_value: null, passed: null, reason: 'House ownership not specified' });
    } else {
      const allowedHouse = Array.isArray(rules.house_ownership) ? rules.house_ownership : [rules.house_ownership];
      const passed = allowedHouse.some(h => h.toLowerCase() === profile.house_ownership.toLowerCase());
      if (!passed) isFailed = true;
      criteria.push({
        field: 'house_ownership',
        rule: allowedHouse.join(', '),
        user_value: profile.house_ownership,
        passed,
        reason: passed ? `House ownership type (${profile.house_ownership}) eligible` : `Requires ${allowedHouse.join(', ')}`
      });
    }
  }

  // 10. Ration card type check
  if (rules.ration_card_type) {
    if (!profile.ration_card_type) {
      missingFields.push('ration_card_type');
      criteria.push({ field: 'ration_card_type', rule: Array.isArray(rules.ration_card_type) ? rules.ration_card_type.join(', ') : rules.ration_card_type, user_value: null, passed: null, reason: 'Ration card type not specified' });
    } else {
      const allowedCards = Array.isArray(rules.ration_card_type) ? rules.ration_card_type : [rules.ration_card_type];
      const userCard = profile.ration_card_type.toUpperCase();
      const passed = allowedCards.some(c => userCard.includes(c.toUpperCase()) || c.toUpperCase().includes(userCard));
      if (!passed) isFailed = true;
      criteria.push({
        field: 'ration_card_type',
        rule: allowedCards.join(', '),
        user_value: profile.ration_card_type,
        passed,
        reason: passed ? `Ration card type (${profile.ration_card_type}) matches` : `Requires card type ${allowedCards.join('/')}`
      });
    }
  }

  // 11. Children count check
  if (rules.children_count_max !== undefined) {
    if (profile.children_count !== undefined && profile.children_count !== null && profile.children_count !== '') {
      const count = Number(profile.children_count);
      const passed = count <= rules.children_count_max;
      if (!passed) isFailed = true;
      criteria.push({
        field: 'children_count',
        rule: `<= ${rules.children_count_max} children`,
        user_value: count,
        passed,
        reason: passed ? `Children count (${count}) within maximum limit` : `Exceeds maximum of ${rules.children_count_max} children`
      });
    }
  }

  // 12. District check (default TN all)
  if (rules.district && rules.district !== 'All') {
    if (profile.district) {
      const allowedDist = Array.isArray(rules.district) ? rules.district : [rules.district];
      const passed = allowedDist.some(d => d.toLowerCase() === profile.district.toLowerCase());
      if (!passed) isFailed = true;
      criteria.push({
        field: 'district',
        rule: allowedDist.join(', '),
        user_value: profile.district,
        passed,
        reason: passed ? `District (${profile.district}) matches` : `Restricted to ${allowedDist.join(', ')}`
      });
    }
  }

  // Determine overall status
  let status = 'Ineligible';
  if (isFailed) {
    status = 'Ineligible';
  } else if (missingFields.length > 0) {
    // If not failed on any evaluated rule, but has missing fields
    status = 'Missing info';
  } else {
    status = 'Eligible';
  }

  // Check if borderline or likely eligible
  if (status === 'Missing info' && missingFields.length <= 1) {
    // If only 1 optional field is missing, it is "Likely eligible" with that note
    status = 'Likely eligible';
  }

  return {
    scheme_id: scheme.id,
    scheme_name_en: scheme.name_en,
    scheme_name_ta: scheme.name_ta,
    category: scheme.category,
    status,
    missing_fields: missingFields,
    criteria
  };
}

/**
 * Generate deterministic explanation for why the scheme matches the citizen
 */
function buildDeterministicExplanation(profile, scheme, evalResult, language = 'en') {
  const isTa = language === 'ta';
  const age = profile.age ? `${profile.age} வயது / ${profile.age} years old` : '';
  const gender = profile.gender || '';
  const occ = profile.occupation || '';
  const inc = profile.income ? `₹${Number(profile.income).toLocaleString('en-IN')}` : '';

  if (evalResult.status === 'Eligible') {
    if (isTa) {
      return `உங்கள் சுயவிவரம் (${occ ? occ + ', ' : ''}${age ? age + ', ' : ''}${gender ? gender + ', ' : ''}ஆண்டு வருமானம் ${inc}) இந்த திட்டத்தின் அனைத்து தகுதி வரம்புகளுடன் முழுமையாக பொருந்துகிறது.`;
    }
    return `Your profile (${occ ? occ + ', ' : ''}${profile.age ? profile.age + ' yrs, ' : ''}${gender ? gender + ', ' : ''}income ${inc}) fully satisfies all criteria for ${scheme.name_en}.`;
  }

  if (evalResult.status === 'Likely eligible') {
    const missingStr = evalResult.missing_fields.join(', ');
    if (isTa) {
      return `உங்கள் விவரங்களின்படி நீங்கள் தகுதியுடையவராக இருக்கலாம். உறுதிப்படுத்த '${missingStr}' விவரங்களை சுயவிவரத்தில் சேர்க்கவும்.`;
    }
    return `You meet key criteria and are likely eligible. Please add ${missingStr} to your profile for 100% confirmation.`;
  }

  if (evalResult.status === 'Missing info') {
    const missingList = evalResult.missing_fields.join(', ');
    if (isTa) {
      return `இந்தத் திட்டத்திற்கான தகுதியை நிர்ணயிக்க பின்வரும் விவரங்கள் தேவைப்படுகின்றன: ${missingList}.`;
    }
    return `To assess your eligibility accurately, please provide the following missing profile information: ${missingList}.`;
  }

  if (isTa) {
    return `இந்த திட்டத்தின் அனைத்து வரம்புகளுடன் உங்கள் சுயவிவரம் பொருந்தவில்லை.`;
  }
  return `You do not meet all required criteria for this scheme at this time.`;
}

/**
 * LLM re-ranking & explanation with strict Privacy preservation (No PII sent)
 */
async function explainAndRankWithLLM(genAI, safeProfile, recommendations, language = 'en') {
  if (!genAI || recommendations.length === 0) {
    return recommendations.map(rec => ({
      ...rec,
      why_you_match: buildDeterministicExplanation(safeProfile, rec.scheme, rec.evaluation, language)
    }));
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Scrubbed anonymized profile summary (ABSOLUTELY NO PII: no name, phone, email, Aadhaar)
    const anonymizedSummary = {
      age: safeProfile.age,
      gender: safeProfile.gender,
      income_bracket: safeProfile.income ? `₹${safeProfile.income}` : 'unspecified',
      occupation: safeProfile.occupation,
      education_level: safeProfile.education_level,
      marital_status: safeProfile.marital_status,
      community: safeProfile.community_category,
      district: safeProfile.district,
      disability: safeProfile.disability ? 'Yes' : 'No',
      ration_card_type: safeProfile.ration_card_type
    };

    const schemePrompts = recommendations.map((r, idx) => ({
      index: idx,
      id: r.scheme.id,
      name: language === 'ta' ? r.scheme.name_ta : r.scheme.name_en,
      category: r.scheme.category,
      status: r.evaluation.status,
      benefit: language === 'ta' ? r.scheme.benefit_ta : r.scheme.benefit_en,
      missing_fields: r.evaluation.missing_fields
    }));

    const prompt = `You are the Tamil Nadu State Government Citizen Welfare Advisor.
Task: For the following anonymous citizen attributes and list of evaluated state schemes, provide a concise, encouraging 1-to-2 sentence explanation of "Why you match" (or what is needed) for each scheme.

Language: ${language === 'ta' ? 'TAMIL (தமிழ்)' : 'ENGLISH'}

Anonymous Citizen Profile:
${JSON.stringify(anonymizedSummary, null, 2)}

Evaluated Schemes:
${JSON.stringify(schemePrompts, null, 2)}

Return a strict JSON array of objects with fields:
[
  { "id": <scheme_id>, "why_you_match": "<1-2 sentence explanation in specified language>", "rank_priority": <integer 1 to N where 1 is highest welfare impact for this citizen> }
]

Do NOT invent schemes. Output only valid JSON.`;

    const res = await model.generateContent(prompt);
    const text = res.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);

    const explanationMap = new Map();
    if (Array.isArray(parsed)) {
      parsed.forEach(p => {
        explanationMap.set(p.id, {
          why_you_match: p.why_you_match,
          rank_priority: p.rank_priority || 99
        });
      });
    }

    const enhanced = recommendations.map(rec => {
      const llmInfo = explanationMap.get(rec.scheme.id);
      return {
        ...rec,
        why_you_match: (llmInfo && llmInfo.why_you_match)
          ? llmInfo.why_you_match
          : buildDeterministicExplanation(safeProfile, rec.scheme, rec.evaluation, language),
        rank_priority: (llmInfo && llmInfo.rank_priority) ? llmInfo.rank_priority : 99
      };
    });

    // Sort by status priority (Eligible > Likely eligible > Missing info) then rank_priority
    const statusOrder = { 'Eligible': 1, 'Likely eligible': 2, 'Missing info': 3, 'Ineligible': 4 };
    enhanced.sort((a, b) => {
      const orderA = statusOrder[a.evaluation.status] || 5;
      const orderB = statusOrder[b.evaluation.status] || 5;
      if (orderA !== orderB) return orderA - orderB;
      return (a.rank_priority || 99) - (b.rank_priority || 99);
    });

    return enhanced;
  } catch (e) {
    console.warn('[EligibilityEngine LLM Ranking Warning]', e.message);
    return recommendations.map(rec => ({
      ...rec,
      why_you_match: buildDeterministicExplanation(safeProfile, rec.scheme, rec.evaluation, language)
    }));
  }
}

/**
 * Main Recommendation Engine Function
 * Evaluates verified schemes against the citizen profile, strips PII, and returns ranked recommendations
 */
async function findSchemesForProfile(profile, options = {}) {
  const { language = 'en', category = 'all', genAI = null } = options;
  const verifiedSchemes = loadVerifiedSchemes();

  // Strip PII before processing
  const safeProfile = {
    age: profile.age,
    gender: profile.gender,
    income: profile.income,
    community_category: profile.community_category || profile.community,
    district: profile.district,
    occupation: profile.occupation,
    education_level: profile.education_level,
    marital_status: profile.marital_status,
    disability: profile.disability,
    house_ownership: profile.house_ownership,
    ration_card_type: profile.ration_card_type,
    children_count: profile.children_count
  };

  const results = [];

  for (const scheme of verifiedSchemes) {
    if (category && category !== 'all' && scheme.category.toLowerCase() !== category.toLowerCase()) {
      continue;
    }

    const evaluation = evaluateSchemeEligibility(safeProfile, scheme);

    // Keep Eligible, Likely eligible, and Missing info. Exclude hard Ineligible.
    if (evaluation.status !== 'Ineligible') {
      results.push({
        scheme: {
          id: scheme.id,
          name_en: scheme.name_en,
          name_ta: scheme.name_ta,
          department: scheme.department,
          category: scheme.category,
          benefit_en: scheme.benefit_en,
          benefit_ta: scheme.benefit_ta,
          documents_required: scheme.documents_required,
          how_to_apply_en: scheme.how_to_apply_en,
          how_to_apply_ta: scheme.how_to_apply_ta,
          official_link: scheme.official_link,
          required_office_type: scheme.required_office_type,
          last_verified_at: scheme.last_verified_at
        },
        evaluation: {
          status: evaluation.status,
          missing_fields: evaluation.missing_fields,
          criteria: evaluation.criteria
        }
      });
    }
  }

  // Sort: Eligible first, then Likely eligible, then Missing info
  const statusOrder = { 'Eligible': 1, 'Likely eligible': 2, 'Missing info': 3 };
  results.sort((a, b) => (statusOrder[a.evaluation.status] || 4) - (statusOrder[b.evaluation.status] || 4));

  // LLM Re-ranking & Plain-Language Explanation
  const ranked = await explainAndRankWithLLM(genAI, safeProfile, results, language);

  return {
    total_evaluated: verifiedSchemes.length,
    matched_count: ranked.length,
    disclaimer_en: "Please confirm eligibility and official guidelines on the respective official Tamil Nadu government website.",
    disclaimer_ta: "தயவுசெய்து அதிகாரப்பூர்வ தமிழ்நாடு அரசு இணையதளத்தில் தகுதி மற்றும் வழிகாட்டுதல்களை உறுதிப்படுத்தவும்.",
    recommendations: ranked
  };
}

module.exports = {
  loadVerifiedSchemes,
  evaluateSchemeEligibility,
  buildDeterministicExplanation,
  findSchemesForProfile
};
