# 🛠️ DevToolkit

 **Developer tools in one professional web app** — formatters, generators, converters, encoders, network tools and more. 
 
 Built with React 19, Vite 8, NestJS 11, and TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue)

---

---

## 🗂️ Project Structure

```
.
├── frontend/            # React 19 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/  # Sidebar, HomePage, ToolPage, IOPanel, CopyButton
│   │   ├── contexts/    # ThemeContext, AuthContext
│   │   ├── data/        # tools.ts (tool registry)
│   │   ├── lib/         # api.ts (typed API client)
│   │   ├── pages/       # LoginPage, RegisterPage, HistoryPage, ApiAccessPage
│   │   ├── tools/       # 55+ tool components (lazy-loaded)
│   │   └── types/       # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── backend/             # NestJS 11
│   ├── src/
│   │   └── modules/
│   │       ├── auth/    # JWT register/login
│   │       ├── users/   # User entity + service
│   │       ├── history/ # Saved tool history
│   │       ├── api-keys/# API key management
│   │       └── network/ # DNS, SSL, headers, IP, WHOIS
│   └── Dockerfile
├── docker-compose.yml      # Production
├── docker-compose.dev.yml  # Development backend only
└── .github/workflows/
    ├── ci.yml           # Build + test on every push
    └── deploy.yml       # Docker build + SSH deploy on main
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10

### Development

```bash
# 1. Clone
git clone <repo-url>

# 2. Start backend
cd backend
cp .env.example .env          # edit JWT_SECRET
npm install
npm run start:dev             # http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs

# 3. Start frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Or use the helper script:
```bash
./start.sh
```

---

## 🐳 Docker (Production)

```bash
# Copy and edit env
cp backend/.env.example backend/.env
# Set a strong JWT_SECRET in backend/.env

# Build and run everything
docker compose up -d

# App is now running at http://localhost
```

Containers:
| Container | Port | Description |
|---|---|---|
| devtoolkit-frontend | 80 | Nginx serving React SPA, proxies /api/ to backend |
| devtoolkit-backend | 3001 (internal) | NestJS API |

---

## 🔑 API Reference

Base URL: `http://localhost:3001` (dev) or `https://your-domain/api/` (prod)
