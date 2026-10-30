## Attack Plan -- Brute force d'authentification sur /login

### Rules of engagement

Attacks are limited to the local dockerized instance.
No third-party targets, no network scanning outside scope.
List any additional constraints specific to this scenario here:
- Cible unique : le conteneur `supportdesk` exposé sur http://localhost:3000.
- Attaque lancée depuis la machine hôte ou un conteneur attaquant sur le réseau `sentinel`.
- Aucune tentative de déni de service : débit plafonné (voir Stop criteria).
- Le plan est validé par l'équipe (notamment B) AVANT exécution.

### Scope

Endpoints within the attack perimeter:
- `POST /login` (formulaire d'authentification).
- Comptes visés : `admin` et un compte utilisateur standard existant dans le seed.

### Attack vectors

List of attack types:
- Authentication brute force : essais répétés de mots de passe sur un login valide.
- Password spraying : un mot de passe courant testé sur plusieurs logins.
- Chaque tentative échouée doit produire un événement `auth_failure` (status 401) dans les logs JSON.

### Tools used

List of tools:
- `hydra` (http-post-form) pour le brute force principal.
- `curl` + boucle bash comme méthode de secours / vérification manuelle.
- Wordlist courte et maîtrisée (ex. extrait de `rockyou`, ~200 entrées) pour rester dans le scope.

### Success criteria

The detection system must generate an alert with severity >= 10 and rule ID [X]
within [N] minutes of launch.
- Seuil attendu : N tentatives `auth_failure` depuis la même `source_ip` en moins de 60 s.
- Severity cible : >= 10 (niveau Wazuh).
- rule ID [X] : à compléter par B une fois la règle écrite.
- N = 2 minutes après le début de l'attaque.

### Stop criteria

Stopping conditions:
- Une alerte Wazuh est générée (objectif atteint).
- Durée maximale atteinte : 5 minutes.
- Plus de 1000 requêtes envoyées.
- Détection d'un impact hors scope (autre service impacté) -> arrêt immédiat.

### MITRE ATT&CK mapping

Targeted technique: T1110 -- Brute Force.
Sous-techniques pertinentes : T1110.001 (Password Guessing), T1110.003 (Password Spraying).
