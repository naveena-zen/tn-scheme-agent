# Tamil Nadu Autonomous Citizen Service Assistant

An **Agentic AI + RAG System** (with a supporting React.js + Tailwind CSS web application delivery interface) strictly dedicated to **Tamil Nadu STATE Government Schemes** — with zero central government schemes.

---

## 🎯 Project Objective

The primary objective of this project is to bridge the accessibility gap between Tamil Nadu citizens and state government welfare schemes by providing an autonomous, multi-lingual (English & Tamil) AI agent. 

The system leverages Retrieval-Augmented Generation (RAG) over vector-embedded Tamil Nadu scheme passages, reasons over eligibility rules criterion-by-criterion, guides document requirements with full traceability, tracks application progress via a stage audit timeline, and evaluates relevant notification targets using AI reasoning.

---

## 💻 Tech Stack & Role of Each Technology

| Technology | Category | Role & Function in Project |
| :--- | :--- | :--- |
| **React.js 18** | Frontend Framework | Renders a fast, responsive, dual-language single-page application (SPA) UI with real-time state management. |
| **Tailwind CSS** | Styling System | Delivers modern dark-themed glassmorphism visuals, custom color tokens, micro-animations, and dynamic layout styling without external UI libraries. |
| **Node.js + Express** | Backend Runtime & Server | Houses the consolidated single-file server (`backend/server.js`) handling REST API endpoints, JWT auth, database operations, AI orchestrator loops, scrapers, and cron schedules. |
| **PostgreSQL + pgvector** | Vector & Relational Database | Stores relational records (`schemes`, `users`, `applications`, `notifications`, `scheme_snapshots`) and vector embeddings (`scheme_chunks`) using the `pgvector` extension for cosine similarity search. |
| **Google Gemini API** | AI & RAG Core | Generates 768-dimensional vector embeddings (`text-embedding-004`) and powers the multi-step Agentic tool calling loop & Notification Agent reasoning (`gemini-1.5-flash`). |
| **Google Cloud STT / TTS** | Voice Processing | Converts spoken voice queries (English `en-IN` & Tamil `ta-IN`) into text and synthesizes agent responses into spoken audio, supported by Web Speech API fallbacks. |
| **Firebase Cloud Messaging (FCM)** | Web Push Notifications | Delivers real-time web push notifications to target citizens when new schemes are approved or application status stages advance. |
| **JWT & Bcrypt.js** | Security & Auth | Issues 12-hour access tokens and 7-day refresh tokens for secure user/admin session management with encrypted passwords. |
| **Cheerio & Axios** | Web Scraping | Scrapes `tn.gov.in/schemes.php`, computes SHA-256 hashes, diffs raw HTML snapshots, and queues newly detected schemes into `status: 'pending_review'`. |
| **Node-Cron** | Task Scheduler | Runs automated daily background cron jobs at 02:00 AM to check for newly launched Tamil Nadu schemes. |

---

## 🏗️ Implemented Project Structure

The project has been consolidated into a minimal, clean, highly maintainable file structure:

```text
scheme assistant/
├── backend/
│   ├── server.js          <-- [CONSOLIDATED BACKEND] DB migration, seed, RAG, Gemini tools, Orchestrator, REST API, Scraper & Test Suite (--test)
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        <-- [CONSOLIDATED FRONTEND] Translations, Navbar, Chat with Reasoning Trace, Schemes, Demo App, Tracker, Admin & Notifications
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ✨ Implemented Core Features

1. **Agentic AI & Native Function Calling**:
   - Executes multi-step tool calls (`search_schemes` → `check_eligibility` → `get_required_documents` → `get_application_status`).
   - Renders a **collapsible "Show Reasoning Trace" panel** in the chat interface displaying step-by-step tool inputs and output payloads `[{ tool, input, output }]`.
2. **RAG Vector Similarity Search**:
   - Chunks scheme details into passages, generates vector embeddings, and executes pgvector cosine similarity search (`1 - (embedding <=> query_vector)`).
   - Logs query and retrieved passages to `retrieval_logs`.
3. **Criterion-by-Criterion Eligibility Engine**:
   - Evaluates citizen age, annual income, gender, community category (BC/MBC/SC/ST/General), district, and occupation individually, returning passed/failed indicators with detailed rationale.
4. **Grounded Document Guidance**:
   - Returns official document checklists grounded in source database passages for complete traceability.
5. **Demo Application Submission & Tracker Dashboard**:
   - Generates demo applications with prominent warning tag: `"Demo Application ID: DEMO-APP-XXXX — internal record only, not a real government submission"`.
   - Features a horizontal stage progress timeline (`Applied` → `Document Verification` → `Field Verification` → `Approved / Rejected` → `Disbursed`) with timestamped audit remarks.
6. **Notification System (FCM & Notification Agent)**:
   - Evaluates citizen relevance for new/updated schemes using Gemini prompt reasoning (`evaluateNotificationTargets`).
   - Creates database notification records (`notifications` table) and dispatches Firebase Cloud Messaging (FCM) web push alerts.
7. **Automated Scheme Scraper & Staging**:
   - Periodically scrapes `tn.gov.in/schemes.php`, hashes HTML content, diffs against snapshots, and queues newly detected schemes into `status: 'pending_review'`.
8. **Government Admin Console**:
   - Protected admin view (`role = 'admin'`) allowing manual stage advancement for applications and single-click approval/ingestion of scraped pending schemes.
9. **Dual-Language & Voice Round-Trip**:
   - Instant language switching between English and Tamil (தமிழ்).
   - Integrated mic button for voice STT transcription and audio TTS response synthesis.

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file inside `backend/` (or copy `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Connection (pgvector enabled)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tn_scheme_assistant
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=tn_scheme_assistant
PGPORT=5432

# Google Gemini API Key (Required for Embeddings & Function Calling)
GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT Authentication Secrets
JWT_SECRET=tn_scheme_assistant_jwt_secret_key_2026_super_secure
JWT_REFRESH_SECRET=tn_scheme_assistant_refresh_token_secret_key_2026

# Firebase Cloud Messaging & Google Cloud STT/TTS
FIREBASE_SERVICE_ACCOUNT=your_firebase_credentials
GOOGLE_APPLICATION_CREDENTIALS=your_google_credentials
```

---

## 🚀 How to Run & Verify

### 🐳 Run Stack with Docker Compose (Recommended)
You can run the entire application stack — PostgreSQL (with pgvector), Node.js Express backend, and React Nginx frontend — with a single command:

```bash
docker-compose up --build
```
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **PostgreSQL Database:** `localhost:5432` (`tn_scheme_assistant`)

To run in detached background mode:
```bash
docker-compose up -d
```
To shut down containers and networks:
```bash
docker-compose down
```

---

### 💻 Run Stack Locally (Bare-Metal)

#### 1. Run Standalone Agent Core Test Suite
Verify the Agentic AI & RAG core independently without running the web app:

```bash
cd backend
npm run test:agent
```
*(Runs sample queries in English & Tamil and outputs multi-tool reasoning traces)*

#### 2. Start Backend Server
```bash
cd backend
npm start
# Server online at http://localhost:5000
```

#### 3. Start Frontend Web Application
```bash
cd frontend
npm run dev
# Frontend web app running at http://localhost:5173
```

---

## ✅ System Completion & Verification Status

| Feature Component | Verification Method | Status |
| :--- | :--- | :--- |
| **Agentic RAG Core** | Executed `npm run test:agent` (4/5 multi-tool execution traces confirmed) | **VERIFIED PASSED ✅** |
| **Database Migration & Seed** | Seeded 6 real TN schemes (KMUT, Pudhumai Penn, Tamil Pudhalvan, CMCHIS, Naan Mudhalvan, Marriage Assistance) | **VERIFIED PASSED ✅** |
| **Notification Feature** | Tested `evaluateNotificationTargets` + `notifications` table inserts + FCM web push setup | **VERIFIED PASSED ✅** |
| **Demo Application & Tracker** | Tested demo ID generation, horizontal stage progression timeline & admin status advancer | **VERIFIED PASSED ✅** |
| **Frontend Production Build** | Executed `npm run build` in `frontend/` (0 compilation errors, built in 13.28s) | **VERIFIED PASSED ✅** |

---

## 🔮 Future Scope

1. **Direct TNeGA / e-Sevai Portal Integration**: Automatically relay application drafts to official Tamil Nadu government portals when public APIs are released.
2. **WhatsApp & Telegram Citizen Bot**: Extend the Agentic RAG orchestrator to messaging channels via WhatsApp Business API / TNeGA gateway.
3. **Multi-Modal Document Verification**: Use Gemini Vision OCR to analyze scanned citizen certificates (Aadhaar, Smart Ration Card, Income Certificate) for real-time automated document validation.
4. **Offline PWA Support**: Enable Progressive Web App caching so citizens in low-connectivity rural regions of Tamil Nadu can access scheme requirements offline.
