## Attack Plan -- Injection SQL sur /login et /tickets

### Rules of engagement

Attacks are limited to the local dockerized instance.
No third-party targets, no network scanning outside scope.
List any additional constraints specific to this scenario here:
- Cible unique : le conteneur `supportdesk` sur http://localhost:3000.
- Base SQLite locale (better-sqlite3) : aucune donnée réelle, uniquement le seed.
- Pas d'écriture destructrice volontaire (pas de DROP/DELETE massif) : objectif = détection, pas destruction.
- Plan validé par l'équipe avant exécution.

### Scope

Endpoints within the attack perimeter:
- `POST /login` (champs username / password).
- `GET /tickets` et paramètres de recherche/filtre éventuels.
- `GET /tickets/:id` si un identifiant est reflété dans une requête SQL.

### Attack vectors

List of attack types:
- SQL injection d'authentification (`' OR '1'='1' -- `) pour contourner le login.
- SQL injection sur paramètres de requête (UNION-based, error-based) sur `/tickets`.
- Les charges doivent apparaître dans le champ `query` ou `body` des logs JSON.

### Tools used

List of tools:
- `sqlmap` pour la détection et l'exploitation automatisées.
- `curl` pour les payloads manuels ciblés et la reproduction.

### Success criteria

The detection system must generate an alert with severity >= 12 and rule ID [X]
within [N] minutes of launch.
- Déclencheur : présence de motifs SQLi (`' OR `, `UNION SELECT`, `-- `, `;--`) dans `query`/`body`.
- Severity cible : >= 12 (plus élevée que le brute force : exploitation d'injection).
- rule ID [X] : à compléter par B.
- N = 2 minutes.

### Stop criteria

Stopping conditions:
- Une alerte Wazuh est générée (objectif atteint).
- Durée maximale atteinte : 10 minutes (sqlmap peut être long).
- Preuve d'exfiltration obtenue (contournement login réussi) -> on documente et on arrête.
- Corruption non prévue de la base -> arrêt immédiat et restauration du volume.

### MITRE ATT&CK mapping

Targeted technique: T1190 -- Exploit Public-Facing Application.
Technique associée : T1059 (Command and Scripting) si l'injection permet l'exécution.
