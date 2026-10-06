const { evaluateSchemeEligibility, findSchemesForProfile, loadVerifiedSchemes } = require('../services/eligibilityEngine');

async function runTests() {
  console.log("==================================================================");
  console.log("TAMIL NADU CITIZEN ASSISTANT — ELIGIBILITY ENGINE TEST SUITE");
  console.log("==================================================================\n");

  const schemes = loadVerifiedSchemes();
  if (schemes.length === 0) {
    console.error("FAIL: No verified schemes loaded from dataset!");
    process.exit(1);
  }
  console.log(`✓ Loaded ${schemes.length} verified Tamil Nadu welfare schemes\n`);

  const kmutScheme = schemes.find(s => s.name_en.includes('KMUT') || s.name_en.includes('Magalir Urimai'));
  const pudhumaiPennScheme = schemes.find(s => s.name_en.includes('Pudhumai Penn'));
  const tamilPudhalvanScheme = schemes.find(s => s.name_en.includes('Tamil Pudhalvan'));
  const oapScheme = schemes.find(s => s.name_en.includes('Old Age Pension'));
  const cmchisScheme = schemes.find(s => s.name_en.includes('CMCHIS') || s.name_en.includes('Health Insurance'));
  const uzhavarScheme = schemes.find(s => s.name_en.includes('Uzhavar Pathukappu'));
  const greenHouseScheme = schemes.find(s => s.name_en.includes('Green House'));
  const diffAbledScheme = schemes.find(s => s.name_en.includes('Differently Abled'));
  const marriageScheme = schemes.find(s => s.name_en.includes('Marriage Assistance'));
  const widowPensionScheme = schemes.find(s => s.name_en.includes('Widow Pension'));

  const testCases = [
    // Case 1: 20yo female college student -> Pudhumai Penn
    {
      id: 1,
      name: "Female college student eligible for Pudhumai Penn",
      scheme: pudhumaiPennScheme,
      profile: { age: 20, gender: "Female", occupation: "Student", education_level: "Undergraduate", district: "Salem" },
      expectedStatus: "Eligible"
    },
    // Case 2: Male student cannot get female-only Pudhumai Penn
    {
      id: 2,
      name: "Male student ineligible for female-only Pudhumai Penn",
      scheme: pudhumaiPennScheme,
      profile: { age: 20, gender: "Male", occupation: "Student", education_level: "Undergraduate", district: "Chennai" },
      expectedStatus: "Ineligible"
    },
    // Case 3: 21yo male college student -> Tamil Pudhalvan
    {
      id: 3,
      name: "Male undergraduate student eligible for Tamil Pudhalvan",
      scheme: tamilPudhalvanScheme,
      profile: { age: 21, gender: "Male", occupation: "Student", education_level: "Undergraduate", district: "Madurai" },
      expectedStatus: "Eligible"
    },
    // Case 4: 30yo woman homemaker with income ₹1.5L & PHH ration card -> KMUT
    {
      id: 4,
      name: "Woman head of household eligible for KMUT",
      scheme: kmutScheme,
      profile: { age: 30, gender: "Female", income: 150000, occupation: "Homemaker", house_ownership: "Rented", ration_card_type: "PHH", district: "Chennai" },
      expectedStatus: "Eligible"
    },
    // Case 5: Woman with high income (> ₹2.5L) ineligible for KMUT
    {
      id: 5,
      name: "Woman with family income ₹4,00,000 ineligible for KMUT (income ceiling)",
      scheme: kmutScheme,
      profile: { age: 30, gender: "Female", income: 400000, occupation: "Salaried", house_ownership: "Own", ration_card_type: "PHH" },
      expectedStatus: "Ineligible"
    },
    // Case 6: 65yo destitute senior citizen -> OAP
    {
      id: 6,
      name: "65-year-old senior citizen eligible for Old Age Pension (OAP)",
      scheme: oapScheme,
      profile: { age: 65, gender: "Male", income: 40000, occupation: "Senior Citizen", district: "Trichy" },
      expectedStatus: "Eligible"
    },
    // Case 7: 45yo person too young for senior citizen OAP
    {
      id: 7,
      name: "45-year-old person ineligible for Old Age Pension (age < 60)",
      scheme: oapScheme,
      profile: { age: 45, gender: "Male", income: 40000, occupation: "Unemployed", district: "Trichy" },
      expectedStatus: "Ineligible"
    },
    // Case 8: Small farmer -> Uzhavar Pathukappu Thittam
    {
      id: 8,
      name: "40-year-old farmer eligible for Uzhavar Pathukappu Thittam",
      scheme: uzhavarScheme,
      profile: { age: 40, gender: "Male", occupation: "Farmer", district: "Thanjavur" },
      expectedStatus: "Eligible"
    },
    // Case 9: Low-income family (₹80,000/yr) -> CMCHIS
    {
      id: 9,
      name: "Low-income family eligible for CMCHIS Health Insurance",
      scheme: cmchisScheme,
      profile: { income: 80000, ration_card_type: "PHH", district: "Salem" },
      expectedStatus: "Eligible"
    },
    // Case 10: Differently-abled citizen -> Differently Abled Maintenance Allowance
    {
      id: 10,
      name: "Citizen with registered disability eligible for Maintenance Allowance",
      scheme: diffAbledScheme,
      profile: { age: 28, disability: true, district: "Coimbatore" },
      expectedStatus: "Eligible"
    },
    // Case 11: Rural BPL family with kutcha house -> Solar Green House
    {
      id: 11,
      name: "Rural family with kutcha home eligible for Solar Green House",
      scheme: greenHouseScheme,
      profile: { age: 35, income: 75000, house_ownership: "Homeless / Kutcha", ration_card_type: "PHH", district: "Vellore" },
      expectedStatus: "Eligible"
    },
    // Case 12: Incomplete profile missing critical fields -> Missing info
    {
      id: 12,
      name: "Profile missing ration card type & income returns Missing info with field breakdown",
      scheme: greenHouseScheme,
      profile: { age: 35, house_ownership: "Homeless / Kutcha" }, // Missing income & ration_card_type
      expectedStatus: "Missing info"
    },
    // Case 13: Destitute widow with income ₹45,000 -> Widow Pension
    {
      id: 13,
      name: "Widowed female with low income eligible for Destitute Widow Pension",
      scheme: widowPensionScheme,
      profile: { age: 38, gender: "Female", marital_status: "Widowed", income: 45000, district: "Madurai" },
      expectedStatus: "Eligible"
    },
    // Case 14: Unmarried bride with high income ineligible for Marriage Assistance
    {
      id: 14,
      name: "Unmarried female with income ₹1,80,000 exceeds Marriage Assistance ceiling (₹72,000)",
      scheme: marriageScheme,
      profile: { age: 22, gender: "Female", marital_status: "Unmarried", income: 180000, district: "Erode" },
      expectedStatus: "Ineligible"
    }
  ];

  let passedTests = 0;
  for (const tc of testCases) {
    const evalRes = evaluateSchemeEligibility(tc.profile, tc.scheme);
    const pass = evalRes.status === tc.expectedStatus;
    if (pass) {
      passedTests++;
      console.log(`[PASS] Case ${tc.id}: ${tc.name} -> Result: ${evalRes.status} ✓`);
    } else {
      console.error(`[FAIL] Case ${tc.id}: ${tc.name} -> Expected: ${tc.expectedStatus}, Got: ${evalRes.status}`);
      console.error(`       Criteria breakdown:`, evalRes.criteria);
    }
  }

  console.log("\n------------------------------------------------------------------");
  console.log("TESTING INTEGRATED PROFILE RECOMMENDATION ENGINE (findSchemesForProfile)");
  console.log("------------------------------------------------------------------");

  const sampleCitizen = {
    name: "Subha Lakshmi", // PII to verify it doesn't break engine
    age: 20,
    gender: "Female",
    income: 70000,
    occupation: "Student",
    education_level: "Undergraduate",
    district: "Salem",
    ration_card_type: "PHH",
    marital_status: "Unmarried"
  };

  const recResult = await findSchemesForProfile(sampleCitizen, { language: 'en' });
  console.log(`Evaluated ${recResult.total_evaluated} schemes. Found ${recResult.matched_count} recommendations for citizen.`);

  const pudhumaiMatch = recResult.recommendations.find(r => r.scheme.name_en.includes('Pudhumai Penn'));
  if (pudhumaiMatch && pudhumaiMatch.evaluation.status === 'Eligible') {
    passedTests++;
    console.log(`[PASS] Full Recommendation Flow: Pudhumai Penn correctly recommended as 'Eligible' ✓`);
    console.log(`       Why you match: ${pudhumaiMatch.why_you_match}`);
    console.log(`       Office linked: ${pudhumaiMatch.scheme.required_office_type}`);
  } else {
    console.error(`[FAIL] Pudhumai Penn not recommended as Eligible in full profile flow`);
  }

  console.log("==================================================================");
  console.log(`TOTAL PASSED: ${passedTests} / ${testCases.length + 1} test scenarios.`);
  if (passedTests === testCases.length + 1) {
    console.log("ALL ELIGIBILITY ENGINE TESTS PASSED SUCCESSFULLY! ✅");
    process.exit(0);
  } else {
    console.error("SOME TESTS FAILED! ❌");
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(e => {
    console.error("Fatal Test Suite Error:", e);
    process.exit(1);
  });
}

module.exports = { runTests };
