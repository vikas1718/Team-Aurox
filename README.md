# 📰 Infynexa AI News Agency

An AI-powered newsroom platform that automates and streamlines the end-to-end workflow of modern news publishing — from content creation to multi-channel distribution.

---

## 🚀 Project Overview

The AI News Agency is a comprehensive web application built to help newsrooms automate repetitive editorial tasks, manage role-based workflows, and publish content across multiple formats using AI.

---

## ✨ Features

### 1. 🔐 Role-Based Authentication
- Secure login system with role assignment
- **Chief Editor** — Full access, approve & publish
- **Reporter** — Submit stories & media
- **Sub-Editor** — Edit, review & layout management

### 2. ✏️ Content Editing
- Minimal word count enforcement
- X-word summarization using fine-tuned LLM
- AI-powered Auto Correction (spelling, layout, developing stories)

### 3. 🖼️ Image Editor
- GenAI Image Creation
- Image Quality Detection
- Bleed, Scaling, Crop & Enhance
- Upscaling & Format Conversion

### 4. 🎙️ Notes to Voice
- Convert editorial notes to voice audio
- Multiple voice options
- For Radio & Podcast broadcasting

### 5. 🎬 Notes to Video *(Pending)*
- Script-to-video using Script2Clip
- Automated video rendering pipeline

### 6. 📐 Auto Layout
- Stringer → District → Editor workflow
- Print edition layout automation
- Adobe InDesign integration (optional)

### 7. 📅 Publication Timeline
- Cutoff time management per edition
- Recording times & publishing schedules
- Deadline reminders for editors

### 8. 📤 Multiplatform Publishing
- One source → Multiple formats
- Print, Website/App, Social Media, Radio/Podcast, e-Paper

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Next.js, Tailwind CSS |
| Backend | Node.js, Python (FastAPI) |
| Database | Supabase, PostgreSQL |
| AI / ML | OpenAI GPT, Vani HQ, Script2Clip, GenAI |
| API Keys | OpenAI API, Vani HQ API, Script2Clip API, GenAI API |

---

## 👥 User Roles & Workflow

```
Login → Role Assigned → Access Granted
         │
         ├── Chief Editor  → Approve & Publish
         ├── Reporter       → Submit Content
         └── Sub-Editor     → Edit & Review
```

---

## 📁 Project Structure

```
infynexa-ai-news-agency/
├── frontend/
│   ├── components/
│   ├── pages/
│   └── styles/
├── backend/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── database/
│   └── schema.sql
├── ai-services/
│   ├── image/
│   ├── voice/
│   └── video/
└── README.md
```

---

## ⚙️ Setup & Installation

```bash
# Clone the repository
git clone https://github.com/infynexa/ai-news-agency.git

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys in .env

# Run development server
npm run dev
```

---

## 🔑 Environment Variables

```env
OPENAI_API_KEY=your_openai_key
VANI_HQ_API_KEY=your_vanihq_key
SCRIPT2CLIP_API_KEY=your_script2clip_key
GENAI_API_KEY=your_genai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_url
```

---

## 👨‍💻 Team

| Role | Name |
|------|------|
| Developer | Vikas SP |
| Developer | Chaman Raj |
| Developer | Bhagyalakshmi |
| Developer | Shashank SM |

---

## 📄 License

This project is developed as part of the **Infynexa Internship Program**.
© 2025 Infynexa. All rights reserved.

