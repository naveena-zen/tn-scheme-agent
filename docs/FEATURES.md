# Tamil Nadu Citizen Assistant — New Features Architecture & Data Flow

This document details the architecture, data models, privacy safeguards, and end-to-end data flows for the two newly implemented features:
1. **Feature 1: Nearby Government Offices & e-Sevai Maiyam Locator**
2. **Feature 2: "Find Schemes for Me" Profile-Based Recommendation Engine**

---

## 🏛️ Feature 1: Nearby Government Offices & e-Sevai Maiyam

### 1.1 Goal & Overview
After the citizen discovers or inquires about a welfare scheme, they often need to visit a designated public authority or assistance counter (e.g., e-Sevai centre for biometrics, Taluk Office for Patta/Uzhavar Card, Collectorate for CMCHIS). This feature provides an interactive Leaflet + OpenStreetMap interface with browser geolocation, manual fallback, Google Maps-style bottom card carousel, real-time operating status, directions, and phone calling.

### 1.2 Office Type Classifications & Smart Linking
Schemes and services automatically pre-select their required office type:

| Office Type Key | English Designation | Tamil Designation | Typical Scheme / Service Requirements |
| :--- | :--- | :--- | :--- |
| `esevai` | e-Sevai Maiyam (TNeGA) | இ-சேவை மையம் | KMUT biometrics, Pudhumai Penn, Aadhaar update, community certificates |
| `taluk_office` | Taluk / Tahsildar Office | வட்டாட்சியர் அலுவலகம் | Uzhavar Pathukappu, Old Age Pension (OAP), Widow Pension, Patta transfers |
| `collectorate` | Collectorate / District Office | மாவட்ட ஆட்சியர் அலுவலகம் | CMCHIS Health Insurance Smart Card, Differently Abled Welfare Office |
| `municipality` | Corporation / Municipality / Panchayat Union | மாநகராட்சி / நகராட்சி / ஊராட்சி ஒன்றியம் | Solar Powered Green House Scheme, Property Tax, Local Trade approvals |
| `ration_shop` | Ration Shop / Civil Supplies Office | நியாயவிலைக் கடை | Antyodaya Anna Yojana (AAY) free grains, Smart Ration Card biometric issues |

### 1.3 System Architecture & Component Diagram

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (React)                                  |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |   Chat Assistant   |   | Scheme Details Modal  |   | Recommended Card (F2)  |  |
|  +---------+----------+   +-----------+-----------+   +-----------+------------+  |
|            |                          |                           |               |
|            +--------------------------+---------------------------+               |
|                                       | (Smart Pre-select: office_type)          |
|                                       v                                           |
|                     +-----------------------------------+                         |
|                     |     NearbyOfficesModal.jsx        |                         |
|                     |  - Leaflet Map (OSM tiles)        |                         |
|                     |  - Filter Chips (e-Sevai/Taluk)   |                         |
|                     |  - Bottom Card Carousel           |                         |
|                     |  - Geolocation + Manual Fallback  |                         |
|                     +-----------------+-----------------+                         |
+---------------------------------------|-------------------------------------------+
                                        | HTTP GET /api/offices/nearby
                                        v
+-----------------------------------------------------------------------------------+
|                             BACKEND (Node.js Express)                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    officesService.js (Nearby Resolver)                      |  |
|  |                                                                             |  |
|  |  1. Coordinate Resolution: Lat/Lng or District Centroid / Pincode Heuristic |  |
|  |  2. 10-Minute Cache Check (Key: lat_lng_type)                               |  |
|  |  3. Verified Office Database + Overpass OpenStreetMap (4s timeout)          |  |
|  |  4. Haversine Distance Computation (in km)                                  |  |
|  |  5. Operating Hours & Real-time Open/Closed Status Evaluation                |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 1.4 Data Flow
1. **Location Access**: The modal requests `navigator.geolocation.getCurrentPosition`.
   - **Allowed**: Coordinates `{ lat, lng }` are sent to the backend.
   - **Denied / Offline**: Automatically displays the district picker and pincode input, defaulting to the citizen's selected district (or Chennai Central).
2. **Backend Resolution & 10-Minute Caching**:
   - Computes a spatial cache key: `lat.toFixed(2)_lng.toFixed(2)_officeType`.
   - If present in memory and `< 10 minutes` old, immediately returns cached places.
   - Otherwise, merges verified Tamil Nadu Government centers with live Overpass OSM nodes.
3. **Haversine Distance & Hours Computation**:
   - Calculates distance in kilometers between user coordinates and each office.
   - Evaluates current Indian Standard Time (IST) against opening and closing hours.
4. **UI Display & Interaction**:
   - Leaflet renders custom color-coded pin badges with ratings.
   - The bottom carousel displays interactive cards. Clicking any card pans and zooms the map directly to that marker.
   - Citizens can click **Get Directions** (opens Google Maps directions), **Call**, or **Share** (copies details to clipboard or triggers Web Share API).

---

## 🎯 Feature 2: "Find Schemes for Me" (Profile-Based Recommendations)

### 2.1 Goal & Overview
Provides a dedicated citizen recommendation engine where citizens input or edit their demographic profile, and the system recommends eligible Tamil Nadu welfare schemes using a deterministic rule-based filter followed by AI re-ranking and plain-language match explanations.

### 2.2 Profile Attributes (12 Criteria)
1. `name`: Citizen display name (stored locally/in DB, never sent to LLM).
2. `age`: Age in completed years (1–120).
3. `gender`: Female / Male / Transgender.
4. `district`: All 38 Tamil Nadu districts.
5. `community_category`: OC / General, BC, MBC/DNC, SC, ST.
6. `income`: Annual family income in Indian Rupees (₹).
7. `occupation`: Student, Farmer, Daily Wage / Unorganized Worker, Salaried / Private, Self-employed, Unemployed, Homemaker, Senior Citizen.
8. `education_level`: Below 10th, 10th Pass, 12th Pass, Diploma, Undergraduate, Postgraduate.
9. `marital_status`: Unmarried, Married, Widowed, Divorced/Separated.
10. `disability`: Registered differently-abled person (Yes / No).
11. `house_ownership`: Own Pucca House, Rented, Homeless / Kutcha / Hut.
12. `ration_card_type`: PHH (Priority Rice), PHH-AAY (Antyodaya Anna Yojana), NPHH, NPHH-S (Sugar), None.
13. `children_count`: Number of dependent children (0, 1, 2, 3+).
14. `consent_data_processing`: Explicit boolean consent for eligibility matching.

### 2.3 Strict Privacy Model & PII Scrubbing
To respect citizen privacy and prevent data leakage:
- **No PII Sent to LLMs**: Personally identifiable attributes (`name`, `phone`, `email`, `Aadhaar`, `user_id`) are stripped before any LLM prompt is constructed.
- **Only Anonymized Eligibility Tuples**: Only demographic attributes like `{ age: 20, gender: "Female", income: 80000, occupation: "Student" }` are evaluated.
- **Right to Erasure**: The profile form features a prominent **Delete / Clear Profile** button (`DELETE /api/users/profile`) that resets all voluntary attributes.

### 2.4 Two-Stage Recommendation Architecture

```
[ Citizen Profile Attributes ]
              |
              v
+-------------------------------------------------------------------+
| STAGE 1: Deterministic Criterion-by-Criterion Engine              |
| (backend/services/eligibilityEngine.js)                           |
|                                                                   |
| For each scheme in verified_schemes.json:                         |
|   - min_age / max_age                                             |
|   - gender restrictions                                           |
|   - annual income ceiling                                         |
|   - community eligibility                                         |
|   - occupation / student / farmer status                          |
|   - education level                                               |
|   - marital status / widowhood                                    |
|   - registered disability requirement                             |
|   - house ownership (kutcha / rented)                             |
|   - ration card type (PHH / PHH-AAY)                              |
|   - maximum children count                                        |
|                                                                   |
| Outputs Verdict:                                                  |
|   - "Eligible": All criteria met with provided fields             |
|   - "Likely eligible": High probability, minor optional gap       |
|   - "Missing info": Explicitly lists missing fields               |
|   - "Ineligible": Hard requirement unmet (filtered out)           |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| STAGE 2: PII-Scrubbed LLM Re-Ranking & Explanation Generator       |
| (Google Gemini API / Deterministic Bilingual Fallback)            |
|                                                                   |
|   - PII Sanitization: Name, Phone, ID omitted                     |
|   - Generates 1-2 sentence empathetic explanation of why the      |
|     citizen matches in English or Tamil                           |
|   - Re-ranks schemes by greatest citizen welfare impact           |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| RESULTS PRESENTATION (FindSchemesForMe.jsx)                       |
|   - Category filters (Education, Women, Agriculture, Health, etc) |
|   - Status badges: Eligible (Green), Likely (Blue), Missing (Amber)|
|   - "Why you match" customized explanation                        |
|   - Required documents checklist preview                          |
|   - Action Buttons: "How to Apply" & "Find Nearby Office"         |
|   - Disclaimer: "Please confirm eligibility on official website"  |
|   - Verified date & Official portal link                          |
+-------------------------------------------------------------------+
```

---

## 🔌 API Endpoints Summary

### Feature 1: Offices
- `GET /api/offices/nearby`
  - Query parameters: `lat`, `lng`, `district`, `query`, `office_type`, `max_distance_km`
  - Response: `{ search_location, active_filter, total_found, offices: [...], cached: boolean }`

### Feature 2: Profile & Recommendations
- `GET /api/users/profile` (Auth required): Returns logged-in citizen's 12 profile attributes.
- `POST /api/users/profile` / `PUT /api/users/profile` (Auth required): Saves/updates citizen profile attributes.
- `DELETE /api/users/profile` (Auth required): Erases voluntary demographic data.
- `GET /api/schemes/recommended` (Optional Auth): Returns ranked schemes for logged-in profile.
- `POST /api/schemes/find-for-me` (Optional Auth): Accepts profile payload and returns ranked schemes with explanations.
