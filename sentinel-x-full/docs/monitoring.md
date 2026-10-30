# Doc : Monitoring (partie C)

## Prometheus

- Config : `monitoring/prometheus/prometheus.yml`.
- Scrape `supportdesk:3000/metrics` toutes les 15 s.
- État des cibles : http://localhost:9090/targets (DOWN tant que `/metrics` absent).

## Grafana

- Provisionné automatiquement (datasource + dashboard), rien à cliquer.
- URL : http://localhost:3001 (admin / cf `.env`).
- Dashboard "SentinelX" : requêtes/s par route, erreurs 4xx/5xx, échecs d'auth,
  latence p95, accès refusés / erreurs serveur.
- Les `expr` du dashboard dépendent des noms de métriques du `CONTRACT.md` (section 2).

## Modifier le dashboard

Éditer dans Grafana puis exporter le JSON vers
`monitoring/grafana/provisioning/dashboards/sentinelx.json` pour le versionner.
