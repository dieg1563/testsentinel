# SentinelX : Observe. Detect. Defend.

Rendre l'application SupportDesk observable (logs + métriques) et détecter en
temps réel les comportements anormaux (Prometheus/Grafana + Wazuh).

## Architecture du repo

```
sentinel-x/
├── CONTRACT.md                     Contrat technique (schéma, métriques, ports) : LIRE EN PREMIER
├── docker-compose.yml              Stack app + Prometheus + Grafana
├── .env.example
│
├── app/                            [A] Application instrumentée
│   ├── app.js                      app patché (logs + metrics + export test)
│   ├── middleware/logger.js        Logs JSON conformes au contrat
│   ├── middleware/metrics.js       Métriques Prometheus (/metrics)
│   ├── tests/endpoints.test.js     Tests fonctionnels (jest + supertest)
│   ├── traffic/generate-traffic.js Script de trafic réaliste
│   └── package.json
│
├── monitoring/                     [C] Prometheus + Grafana
│   ├── prometheus/prometheus.yml
│   └── grafana/provisioning/...    datasource + dashboard versionné
│
├── detection/                      [B] Wazuh
│   ├── rules/local_rules.xml
│   ├── decoders/local_decoder.xml
│   ├── ossec-localfile.conf
│   ├── docker-compose.wazuh.yml
│   └── README-detection.md
│
├── attacks/                        [C] Attaques
│   ├── attack-plans/               3 plans (brute force, SQLi, scan)
│   └── runbooks/
│
├── reports/                        Rapport de qualification des alertes
└── docs/                           Doc par partie
```

## Démarrage rapide

```bash
cp .env.example .env

# Stack légère (app + monitoring)
docker compose up -d --build

# Stack complète avec Wazuh (8-12 Go RAM, voir detection/README-detection.md)
docker compose -f docker-compose.yml -f detection/docker-compose.wazuh.yml up -d --build
```

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Wazuh dashboard | https://localhost:8443 |

## Intégration de l'app (côté A)

L'app d'origine (`routes/`, `database/`, `views/`) reste la vôtre. Pour l'instrumenter :
1. Copier `app/middleware/logger.js` et `app/middleware/metrics.js` dans votre dossier.
2. Remplacer votre `app.js` par `app/app.js` (ou reporter les lignes marquées `[INSTR]`).
3. Dans `routes/auth.js`, émettre les événements métier (`auth_success`, `auth_failure`)
   avec `logEvent()` et incrémenter `authFailures` (voir exemples en tête de `app.js`).
4. `npm install` (ajoute `prom-client`, `jest`, `supertest`, `c8`), puis `npm test`.

## Qui a fait quoi

- **A** : `app/` (instrumentation, tests, trafic)
- **B** : `detection/` (règles, décodeurs, dashboard Wazuh)
- **C** : `monitoring/`, `attacks/`, `docker-compose`, assemblage

## État

- [x] CONTRACT.md
- [x] App instrumentée (logs JSON + /metrics) + tests
- [x] Prometheus + Grafana (dashboard versionné)
- [x] Règles Wazuh + intégration
- [x] 3 Attack Plans
- [ ] Runbooks remplis (étape 2, à l'exécution des attaques)
- [ ] Rapport de qualification chiffré (étape 3)
