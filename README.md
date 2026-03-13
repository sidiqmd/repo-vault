# RepoVault

**Pocket for GitHub repos.** Capture, organize, summarize, and retrieve GitHub repositories with AI-powered insights.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **One-click capture** — Paste any GitHub URL and get full metadata instantly
- **AI summaries** — Auto-generated plain-English descriptions via Claude (Anthropic)
- **Smart categorization** — AI auto-categorizes repos into topics like `ai-ml`, `dev-tools`, `cli`, etc.
- **Multiple views** — Grid, List, and Kanban board layouts
- **Search & filter** — Full-text search, status filters, category filters, and sort options
- **Guest-first** — Full functionality without login; data persists in localStorage
- **Social login** — Sign in with GitHub or Google via [Better Auth](https://www.better-auth.com/)
- **Cloud sync** — Authenticated users get MongoDB-backed storage with auto-migration of guest data
- **PWA ready** — Install on mobile, share GitHub links directly to your vault
- **Dark/light themes** — Warm editorial aesthetic with smooth transitions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7 |
| Backend | Express 5, Node.js |
| Database | MongoDB (Mongoose 9) |
| Auth | Better Auth (self-hosted, social OAuth) |
| AI | Anthropic Claude API |
| Security | Helmet, express-rate-limit, Zod validation |
| Logging | Pino |

## Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)
- **OAuth credentials** — GitHub and/or Google (see [OAuth Setup](#oauth-setup))

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/repo-vault.git
cd repo-vault

# Backend
cd backend
npm install
cp .env.example .env  # ← edit with your credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env  # ← edit if needed
```

### 2. Configure environment

Edit `backend/.env` with your credentials:

```env
MONGODB_URI=mongodb://localhost:27017/repovault_dev
BETTER_AUTH_SECRET=         # Generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
BETTER_AUTH_URL=http://localhost:5050
GITHUB_CLIENT_ID=           # From GitHub Developer Settings
GITHUB_CLIENT_SECRET=       # From GitHub Developer Settings
GOOGLE_CLIENT_ID=           # From Google Cloud Console
GOOGLE_CLIENT_SECRET=       # From Google Cloud Console
GITHUB_PAT=                 # Optional: enables 5000 req/hr to GitHub API
ANTHROPIC_API_KEY=           # Optional: enables AI summaries
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:8081](http://localhost:8081) in your browser.

## OAuth Setup

### GitHub

1. Go to **GitHub** → Settings → Developer Settings → [OAuth Apps](https://github.com/settings/developers) → New OAuth App
2. Set **Authorization callback URL** to: `http://localhost:5050/api/auth/callback/github`
3. Copy the Client ID and Client Secret into `backend/.env`

### Google

1. Go to **Google Cloud Console** → [Credentials](https://console.cloud.google.com/apis/credentials) → Create OAuth Client ID
2. Add **Authorized redirect URI**: `http://localhost:5050/api/auth/callback/google`
3. Copy the Client ID and Client Secret into `backend/.env`

## Project Structure

```
repo-vault/
├── frontend/                 # React (Vite) SPA
│   ├── src/
│   │   ├── components/       # Landing, Auth, Vault UI components
│   │   ├── services/         # API client, auth client, storage abstraction
│   │   ├── hooks/            # useLocalStorage
│   │   └── App.jsx           # Router + theme + session management
│   └── public/               # PWA manifest, service worker, icons
│
├── backend/                  # Express API server
│   ├── config/               # Database + Better Auth configuration
│   ├── models/               # Mongoose schemas (Repo, Settings, RepoCache)
│   ├── routes/               # REST endpoints (repos, settings, enrich)
│   ├── services/             # GitHub API + AI summary services
│   ├── middleware/            # Auth middleware
│   └── server.js             # Entry point
│
└── .env.example              # Template for environment variables
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/repos` | ✅ | List user's repos (search, filter, sort) |
| `POST` | `/api/repos` | ✅ | Save a repo |
| `PATCH` | `/api/repos/:id` | ✅ | Update repo fields |
| `DELETE` | `/api/repos/:id` | ✅ | Delete a repo |
| `POST` | `/api/enrich/github` | Optional | Fetch GitHub metadata |
| `POST` | `/api/enrich/summary` | ✅ | Generate AI summary |
| `POST` | `/api/enrich/categorize` | ✅ | AI category suggestion |
| `GET` | `/api/settings` | ✅ | Get user settings |
| `PUT` | `/api/settings` | ✅ | Update user settings |
| `GET` | `/health` | — | Health check |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
