# openotters-website (Helm chart)

Deploy the [openotters.io](https://openotters.io) site to Kubernetes.

## Install

```sh
helm install website ./helm/openotters-website \
  --namespace openotters --create-namespace
```

With ingress + TLS:

```sh
helm install website ./helm/openotters-website \
  --namespace openotters --create-namespace \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set ingress.hosts[0].host=openotters.io \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix \
  --set ingress.tls[0].secretName=openotters-tls \
  --set ingress.tls[0].hosts[0]=openotters.io
```

## Image

Default: `ghcr.io/openotters/website:<chart appVersion>`. Override:

```sh
helm install ... --set image.tag=sha-abcdef
```

## GitHub token (optional but recommended)

The `/agents`, `/binaries` and `/agentspec` pages refresh from the GitHub API
every hour via Next.js ISR. Without a token, they serve the snapshot baked into
the image at build time.

```sh
kubectl create secret generic openotters-website-gh \
  --from-literal=GITHUB_TOKEN=ghp_xxx
helm upgrade website ./helm/openotters-website \
  --namespace openotters \
  --set github.enabled=true
```

The token only needs `read:packages` and `public_repo` scopes.

## Values

| Key | Default | Description |
|---|---|---|
| `replicaCount` | `1` | Pod replicas (ignored when autoscaling is on) |
| `image.repository` | `ghcr.io/openotters/website` | Container image |
| `image.tag` | _chart appVersion_ | Override image tag |
| `image.pullPolicy` | `IfNotPresent` | Image pull policy |
| `service.type` | `ClusterIP` | Service type |
| `service.port` | `80` | Service port (container always listens on `3000`) |
| `ingress.enabled` | `false` | Provision an Ingress |
| `ingress.className` | `""` | IngressClass |
| `ingress.hosts` | _see values.yaml_ | Host/path rules |
| `ingress.tls` | `[]` | TLS secrets |
| `github.enabled` | `false` | Inject `GITHUB_TOKEN` from a Secret |
| `github.secretName` | `openotters-website-gh` | Secret name |
| `github.secretKey` | `GITHUB_TOKEN` | Key inside the Secret |
| `extraEnv` | `{}` | Extra env-var key/value pairs |
| `autoscaling.enabled` | `false` | Provision an HPA |
| `autoscaling.minReplicas` | `1` | HPA min replicas |
| `autoscaling.maxReplicas` | `5` | HPA max replicas |
| `resources` | `{}` | Container resource requests/limits |
| `livenessProbe` / `readinessProbe` | `GET /` | HTTP probes |
| `serviceAccount.create` | `true` | Create a ServiceAccount |
| `nodeSelector` / `tolerations` / `affinity` | `{}` | Standard scheduling knobs |

See [`values.yaml`](./values.yaml) for the full schema with comments.

## Local render

```sh
helm template website ./helm/openotters-website > /tmp/rendered.yaml
helm lint ./helm/openotters-website
```
