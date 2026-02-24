# homelab-dashboard

A React dashboard for monitoring Docker container health on a Raspberry Pi 5 homelab. Displays live container status, uptime history charts, and monthly uptime heatmaps.

## Features

- **Live container grid** — polls `/api/containers` every 5 seconds for real-time status
- **Status indicators** — green/red with human-readable uptime strings
- **Container detail view** — drill into any container for uptime history charts (1h / 6h / 24h toggle)
- **Restart and stop controls** — manage containers directly from the dashboard
- **Quick links** — each service links directly to its own web UI (Jellyfin, Sonarr, Radarr, etc.)
- **Uptime reports** — monthly heatmap calendar showing daily uptime percentage per day
- **Responsive layout** — 5-column grid on wide screens, scales down to single column on mobile

## Tech Stack

- **React 18** with Vite
- **React Router** — client-side routing for container detail pages and reports
- **Nginx** — serves the built app and proxies `/api` requests to the Spring Boot backend

## Architecture

The dashboard is served by an Nginx container that also proxies API calls, so the browser only ever communicates with a single host. No hardcoded IP addresses anywhere in the app.

```
browser → monitor.ellipsis.local (Nginx)
              ↓                    ↓
          React SPA           /api/* → homelab-monitor:8090
```

This means the same build works from any URL — local network, Tailscale, or a public domain — without rebuilding.

## Project Structure

```
src/
├── components/
│   ├── ContainerGrid.jsx     # Main container list
│   ├── ContainerCard.jsx     # Individual container card
│   ├── ContainerDetail.jsx   # Detail view with uptime chart
│   ├── Reports.jsx           # Monthly uptime heatmap
│   └── hooks/
│       └── useContainerActions.js  # Shared restart/stop logic
├── config.js                 # API base URL and service URL mappings
└── App.jsx                   # Router and global layout
```

## Running Locally

```bash
npm install
npm run dev
```

Requires `homelab-monitor` running on `localhost:8090`.

## Docker

The Nginx config proxies `/api` to the Spring Boot container so both services share the same origin:

```nginx
location /api {
    proxy_pass http://homelab-monitor:8090;
}
location / {
    try_files $uri $uri/ /index.html;
}
```

Build and push:
```bash
docker buildx build --platform linux/arm64 \
  -t ghcr.io/ellipsis1/homelab-dashboard:latest --push .
```

## Deployment

Deployed via Jenkins CI/CD pipeline on push to `main`. Accessible at `http://monitor.ellipsis.local` via Pi-hole DNS and Nginx Proxy Manager.