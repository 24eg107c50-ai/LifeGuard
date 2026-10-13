# LifeGuard Deployment

## GitHub

The repository remote is `https://github.com/24eg107c50-ai/LifeGuard.git`. Before pushing, authenticate in VS Code/Git Credential Manager as `24eg107c50-ai` or an account that has write access to that repository. The repository currently appears empty on GitHub; the local `main` branch contains the project.

## Render Backend

Create a **Web Service** connected to the LifeGuard repository:

- Root directory: `backend`
- Runtime: Docker (uses `backend/Dockerfile`, Java 17, and the Maven Wrapper)
- Health check path: `/api/health`

Add these environment variables in Render. Use values from your MySQL provider, and never commit real credentials:

- `DB_URL`: full JDBC URL, for example `jdbc:mysql://HOST:3306/lifeguard_db?sslMode=REQUIRED` (use the provider's required SSL options)
- `DB_USERNAME`: database username
- `DB_PASSWORD`: database password
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins, such as `https://YOUR-STATIC-SITE.onrender.com`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`: optional; omit until Twilio is configured

Render supplies `PORT`; the application uses it and falls back to port 8080 locally. The external MySQL database must be reachable from Render. No schema is dropped; JPA remains configured with `ddl-auto=update`.

## Render Frontend

Create a **Static Site** from the same repository:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable `VITE_API_URL`: the backend's public base URL, without a trailing slash, for example `https://YOUR-BACKEND.onrender.com`
- Rewrite rule: source `/*`, destination `/index.html`, action `Rewrite`

Set the backend's `CORS_ALLOWED_ORIGINS` to the resulting static-site origin, then redeploy the backend if you changed that value. The frontend API URL is embedded at build time, so redeploy the static site after changing `VITE_API_URL`.

## Local Development

From PowerShell, start the backend in one terminal:

```powershell
cd "C:\Users\svams\OneDrive\Desktop\LifeGuard\backend"
.\mvnw.cmd spring-boot:run
```

Start the frontend in a second terminal:

```powershell
cd "C:\Users\svams\OneDrive\Desktop\LifeGuard\frontend"
npm.cmd install
npm.cmd run dev
```

Local defaults use `http://localhost:8080` for the API and allow Vite at `localhost:5173` and `127.0.0.1:5173`.