# CONTRACT.md -- Contrat technique SentinelX

Premier livrable du projet. Figé et validé par l'équipe **avant** l'instrumentation.
Toute modification se fait par accord des trois rôles (A = app, B = détection, C = infra).

Version : 1.0 · Date : 2026-10-30

---

## 1. Schéma de log (JSON, une ligne par événement)

L'application écrit **une ligne JSON par événement** dans le fichier défini en
section 4. Le schéma est compatible avec le décodeur JSON natif de Wazuh.

```json
{
  "timestamp": "2026-10-30T14:32:11.423Z",
  "level": "WARN",
  "event_type": "auth_failure",
  "source_ip": "203.0.113.42",
  "user": "admin",
  "endpoint": "/login",
  "method": "POST",
  "status_code": 401,
  "message": "Invalid credentials",
  "query": "",
  "body": "username=admin&password=***"
}
```

### Champs

| Champ         | Type    | Obligatoire | Description |
|---------------|---------|-------------|-------------|
| `timestamp`   | string  | oui | Date ISO 8601 UTC (ms). |
| `level`       | string  | oui | `INFO`, `WARN`, `ERROR`. |
| `event_type`  | string  | oui | Type d'événement métier (voir ci-dessous). |
| `source_ip`   | string  | oui | IP client. Derrière le bridge Docker, voir section 6. |
| `user`        | string  | non | Login concerné si connu, sinon `"-"`. |
| `endpoint`    | string  | oui | Chemin de la requête (sans query string). |
| `method`      | string  | oui | Méthode HTTP. |
| `status_code` | number  | oui | Code HTTP de la réponse. |
| `message`     | string  | non | Texte court lisible. |
| `query`       | string  | non | Query string brute (pour détecter les payloads). |
| `body`        | string  | non | Corps de requête, **mots de passe masqués** (voir section 5). |

### Valeurs de `event_type`

| `event_type`     | Quand | `level` | `status_code` typique |
|------------------|-------|---------|-----------------------|
| `request`        | Toute requête HTTP terminée | INFO | 2xx/3xx |
| `auth_success`   | Login réussi | INFO | 200/302 |
| `auth_failure`   | Login échoué | WARN | 401 |
| `access_denied`  | Accès refusé (rôle insuffisant, non authentifié) | WARN | 403 |
| `not_found`      | Ressource inexistante | INFO | 404 |
| `server_error`   | Erreur serveur non gérée | ERROR | 500 |

> Règle : chaque requête produit au minimum un événement `request`. Les événements
> métier (`auth_*`, `access_denied`, `server_error`) sont émis **en plus** quand ils
> s'appliquent.

---

## 2. Métriques Prometheus (endpoint `/metrics`, format texte)

Exposées sur `GET /metrics` au format Prometheus. Noms figés ici car le dashboard
Grafana et les requêtes PromQL en dépendent.

| Métrique | Type | Labels | Description |
|----------|------|--------|-------------|
| `http_requests_total` | counter | `method`, `route`, `status_code` | Nombre de requêtes HTTP. |
| `http_request_duration_seconds` | histogram | `method`, `route` | Latence des requêtes (buckets par défaut prom-client). |
| `auth_failures_total` | counter | — | Nombre d'échecs d'authentification. |

> `route` = chemin normalisé (ex. `/tickets/:id`, pas `/tickets/42`) pour éviter
> l'explosion de cardinalité.
> Les métriques par défaut du process (`process_*`, `nodejs_*`) sont aussi exposées.

---

## 3. Ports et services

| Service        | Conteneur     | Port interne | Port hôte | Rôle |
|----------------|---------------|--------------|-----------|------|
| Application    | `supportdesk` | 3000 | 3000 | A |
| Prometheus     | `prometheus`  | 9090 | 9090 | C |
| Grafana        | `grafana`     | 3000 | 3001 | C |
| Wazuh indexer  | `wazuh.indexer` | 9200 | 9200 | B |
| Wazuh manager  | `wazuh.manager` | 1514/1515/55000 | 1514/1515/55000 | B |
| Wazuh dashboard| `wazuh.dashboard` | 5601 | 8443 | B |

---

## 4. Réseau et volumes

- **Réseau Docker** : `sentinel` (bridge), partagé par tous les services.
- **Volume de logs partagé** : `app_logs`, monté :
  - dans `supportdesk` en lecture/écriture sur `/var/log/supportdesk`
  - dans `wazuh.manager` en **lecture seule** sur `/var/log/supportdesk:ro`
- **Chemin du fichier de log** : `/var/log/supportdesk/app.json` (variable `LOG_FILE`).

---

## 5. Variables d'environnement

| Variable | Service | Défaut | Rôle |
|----------|---------|--------|------|
| `PORT` | supportdesk | 3000 | Port d'écoute de l'app. |
| `LOG_FILE` | supportdesk | `/var/log/supportdesk/app.json` | Chemin des logs JSON. |
| `SESSION_SECRET` | supportdesk | — | Secret de session (jamais dans Git). |
| `GRAFANA_USER` / `GRAFANA_PASSWORD` | grafana | admin | Identifiants Grafana. |

**Masquage des secrets** : les champs `password`, `pass`, `pwd`, `token`, `secret`
dans `body` sont remplacés par `***` avant écriture du log. Interdiction absolue de
logger un mot de passe en clair.

---

## 6. Point d'attention : `source_ip` derrière Docker

`app.js` fait `app.set('trust proxy', true)`, donc l'app lit `X-Forwarded-For`.
Conséquences actées par l'équipe :

- En l'absence de reverse proxy, `source_ip` peut être l'IP du bridge Docker
  (`172.x.x.x`) et non l'IP réelle.
- `X-Forwarded-For` étant client-fourni, il est **falsifiable**. On l'accepte pour
  le projet (réseau local maîtrisé), et on s'en sert comme terrain du bonus
  « passer sous le radar de sa propre règle » (forge/rotation d'IP).
- Les règles Wazuh de corrélation par IP tiennent compte de cette limite.

---

## 7. Qui produit quoi

| Catégorie | Rôle | Emplacement repo |
|-----------|------|------------------|
| App instrumentée, logs, `/metrics`, tests | A | `app/` |
| Règles, décodeurs, dashboard Wazuh | B | `detection/` |
| docker-compose, Prometheus, Grafana, attaques | C | `monitoring/`, `attacks/`, racine |
| `CONTRACT.md`, `README.md`, démo | Tous | racine |
