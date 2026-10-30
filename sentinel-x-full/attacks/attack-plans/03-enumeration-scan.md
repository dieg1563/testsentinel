## Attack Plan -- Énumération / scan d'endpoints et accès admin non autorisé

### Rules of engagement

Attacks are limited to the local dockerized instance.
No third-party targets, no network scanning outside scope.
List any additional constraints specific to this scenario here:
- Cible unique : le conteneur `supportdesk` sur http://localhost:3000.
- Fuzzing de chemins uniquement sur l'app cible, pas sur l'infra (Prometheus/Grafana/Wazuh).
- Débit maîtrisé pour ne pas saturer le conteneur.
- Plan validé par l'équipe avant exécution.

### Scope

Endpoints within the attack perimeter:
- Toute l'arborescence de l'app : `/`, `/login`, `/tickets`, `/admin`, `/profile`, `/kb`, `/dashboard`.
- Tentatives d'accès direct à `/admin` sans session authentifiée ou avec un compte non-admin.

### Attack vectors

List of attack types:
- Active scanning / directory enumeration : découverte de chemins et de ressources cachées.
- Forced browsing / broken access control : accès à `/admin` sans les droits.
- Génère en masse des `404` (scan) et des `403`/`access_denied` (accès refusé) dans les logs.

### Tools used

List of tools:
- `ffuf` ou `gobuster` pour l'énumération de chemins (wordlist type `common.txt`).
- `curl` pour tester l'accès direct à `/admin` sans authentification.

### Success criteria

The detection system must generate an alert with severity >= 8 and rule ID [X]
within [N] minutes of launch.
- Déclencheur scan : nombre élevé de `404` depuis une même `source_ip` sur une courte fenêtre.
- Déclencheur accès : événement `access_denied` (403) sur `/admin` sans rôle admin.
- Severity cible : >= 8 (scan) et >= 10 (accès admin refusé répété).
- rule ID [X] : à compléter par B.
- N = 2 minutes.

### Stop criteria

Stopping conditions:
- Une alerte Wazuh est générée (objectif atteint).
- Durée maximale atteinte : 5 minutes.
- Plus de 5000 requêtes envoyées.
- Instabilité du conteneur cible -> arrêt immédiat.

### MITRE ATT&CK mapping

Targeted technique: T1595 -- Active Scanning.
Techniques associées : T1083 (File and Directory Discovery), T1548 (Abuse Elevation Control -- accès admin).
