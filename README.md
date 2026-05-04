# openotters.io

Marketing site and documentation for [OpenOtters](https://github.com/openotters/openotters).

Built with **Next.js 16** (App Router), **Tailwind CSS v4**, **Fumadocs** for the
docs section, and `next-themes` for dark/light mode. Component patterns mirror
[`sshark-app`](https://github.com/merlindorin/sshark-app); landing-page
information design is inspired by [ollama.com](https://ollama.com/).

## Develop

```sh
npm install
npm run dev
```

The site runs on `http://localhost:3000`. The home page lives at
`components/pages/home.tsx`; docs MDX lives under `content/docs/`.

## Build

```sh
npm run build
npm start
```

## Layout

```
app/
  layout.tsx              # root layout: theme, navbar, footer
  page.tsx                # home — renders <Home />
  globals.css             # Tailwind v4 + theme tokens
  docs/
    layout.tsx            # Fumadocs sidebar layout
    [[...slug]]/page.tsx  # catch-all docs route
components/
  pages/home.tsx          # landing page sections
  templates/              # navbar + footer
  ui/                     # button, card, badge, logo, copy-command, mode-toggle
  providers/              # theme provider
content/docs/             # MDX documentation
lib/
  source.ts               # Fumadocs source loader
  utils.ts                # cn() helper
mdx-components.tsx        # MDX component overrides
source.config.ts          # Fumadocs MDX config
next.config.mts           # withMDX wrapper
```

## Docker

Multi-stage build, distroless runtime, ~150 MB image. Pass `GITHUB_TOKEN` so the
GHCR package list and the live Agentspec are baked in at build time.

```sh
docker build \
  --build-arg GITHUB_TOKEN=$GITHUB_TOKEN \
  -t ghcr.io/openotters/website:dev .
docker run --rm -p 3000:3000 \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  ghcr.io/openotters/website:dev
```

`GITHUB_TOKEN` at runtime is optional — without it the container serves the
content baked into the image; with it, the `/agents`, `/binaries` and
`/agentspec` pages refresh every hour via Next.js ISR.

## CI

`.github/workflows/docker.yml` builds and pushes to
`ghcr.io/openotters/website` on push to `main` and on `v*` tags
(SemVer-derived image tags via `docker/metadata-action`).

## Helm

Chart lives at [`helm/openotters-website/`](./helm/openotters-website/) — see
its [README](./helm/openotters-website/README.md) for install instructions and
the full values table.

```sh
helm install website ./helm/openotters-website \
  --namespace openotters --create-namespace
```

Typical knobs: `ingress.enabled`, `autoscaling.enabled`, `github.enabled`
(injects a `GITHUB_TOKEN` Secret for runtime ISR).

## Domain

Production: **openotters.io**.
