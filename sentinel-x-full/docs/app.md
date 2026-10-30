# Doc : Application instrumentée (partie A)

## Logs

- Fichier : `/var/log/supportdesk/app.json` (variable `LOG_FILE`).
- Un événement `request` par requête + événements métier (`auth_*`, `access_denied`,
  `server_error`, `not_found`).
- Schéma complet : voir `CONTRACT.md` section 1.
- Mots de passe masqués (`***`) : voir `middleware/logger.js` (`maskBody`).

## Métriques

- Endpoint : `GET /metrics` (format Prometheus).
- `http_requests_total`, `http_request_duration_seconds`, `auth_failures_total`.
- Détail : `CONTRACT.md` section 2.

## Tests

```bash
cd app
npm install
npm test            # tests fonctionnels des endpoints critiques
npm run coverage    # taux de couverture (rapport HTML dans coverage/)
```

Endpoints couverts : `/`, `/login`, `/dashboard`, `/admin`, `/metrics`, route 404.

## Script de trafic

```bash
TARGET=http://localhost:3000 DURATION=300 RPS=5 ATTACK_RATIO=0 node app/traffic/generate-traffic.js
```

Sert de référence pour mesurer le taux de faux positifs (étape 3). Garder
`ATTACK_RATIO=0` pour du trafic normal pur lors de la mesure.
