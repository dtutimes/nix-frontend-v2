# Nix Frontend v2

The frontend client for DTU Times' internal portal **Nix**, built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Prerequisites

| Tool       | Version | Notes                                                                 |
| ---------- | ------- | --------------------------------------------------------------------- |
| **Node.js** | ≥ 18.x  | Recommended: use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| **npm**    | ≥ 9.x   | Ships with Node.js                                                    |
| **Git**    | ≥ 2.x   | Required for cloning and submodule support                             |

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/dtutimes/nix-frontend-v2.git
cd nix-frontend-v2
```

### 2. Initialize the Git submodule

> [!IMPORTANT]
> This repo uses a **Git submodule** ([`central-information`](https://github.com/dtutimes/central-information)) at `src/commonlib/` for shared types and constants used across both the frontend and backend. **The project will not compile without it.**

```bash
git submodule update --init --recursive
```

> [!TIP]
> If the above command fails with an SSH authentication error, you can temporarily switch the submodule URL to HTTPS:
>
> ```bash
> git config submodule.src/commonlib.url https://github.com/dtutimes/central-information.git
> git submodule update --init --recursive
> ```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Copy the default `.env` file to `.env.local`:

```bash
cp .env .env.local
```

#### Option A: Use the remote backend (easiest)

No changes needed — the default `.env` already points to the production backend:

```env
VITE_NIX_BACKEND="https://team.dtutimes.com/api/v1"
```

#### Option B: Use a local backend

If you have the [nix-backend-v2](https://github.com/dtutimes/nix-backend-v2) running locally on port 8080, update `.env.local`:

```env
VITE_NIX_BACKEND="http://localhost:8080/api/v1"
```

### 5. Start the development server

```bash
npm run dev
```

The app will start at `http://localhost:5173` with Vite's hot module replacement (HMR).

## Available Scripts

| Script    | Command            | Description                          |
| --------- | ------------------ | ------------------------------------ |
| `dev`     | `npm run dev`      | Start Vite dev server with HMR       |
| `build`   | `npm run build`    | Build for production                 |
| `preview` | `npm run preview`  | Preview the production build locally |
| `lint`    | `npm run lint`     | Lint and auto-fix with ESLint        |

## Project Structure

```
nix-frontend-v2/
├── public/                 # Static assets & service worker
├── src/
│   ├── assets/             # Images, icons, SVGs
│   ├── commonlib/          # ⚡ Git submodule — shared types & constants
│   ├── components/         # Reusable UI components
│   ├── config.ts           # App-level configuration
│   ├── contexts/           # React context providers
│   ├── pages/              # Page-level components
│   │   ├── auth/           # Login, ForgotPassword, ResetPassword
│   │   └── ...             # Dashboard, blogs, users, etc.
│   ├── router/             # React Router setup & route maps
│   ├── services/           # API client, localStorage helpers
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles (Tailwind)
├── .env                    # Default environment variables
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies and scripts
└── README.md
```

### Path Aliases

| Alias      | Path                       |
| ---------- | -------------------------- |
| `@/*`      | `./src/*`                  |
| `@/types/*`| `./src/commonlib/types/*`  |

## Full Local Portal Setup

To run the complete Nix portal on your machine (frontend + backend connected), follow these steps:

1. **Set up the backend** — Follow the [nix-backend-v2 README](https://github.com/dtutimes/nix-backend-v2) to get the backend running on `http://localhost:8080`.
2. **Set the frontend env** — In this repo's `.env.local`, set:
   ```env
   VITE_NIX_BACKEND="http://localhost:8080/api/v1"
   ```
3. **Start the frontend** — Run `npm run dev`. Visit `http://localhost:5173`.

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `Cannot find module '@/commonlib/...'` or type errors on shared types | You forgot to initialize the submodule — run `git submodule update --init --recursive` |
| SSH auth error on submodule clone | Switch to HTTPS URL (see Step 2 tip above) |
| Login page shows spinner forever | Clear your browser's localStorage for `localhost:5173`, then refresh |
| Frontend can't connect to local backend | Verify backend is running on port 8080 and `.env.local` has `VITE_NIX_BACKEND="http://localhost:8080/api/v1"` |
