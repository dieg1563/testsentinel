# Partie B : Détection Wazuh

## Contenu

```
rules/local_rules.xml          Règles custom (brute force, SQLi, XSS, scan, accès admin)
decoders/local_decoder.xml     Décodeur (le JSON natif fait l'essentiel)
ossec-localfile.conf           Bloc <localfile> à ajouter dans ossec.conf
docker-compose.wazuh.yml       Overlay Wazuh single-node (indexer + manager + dashboard)
```

## Principe

L'app écrit des logs JSON (cf. `CONTRACT.md`). Le **décodeur JSON natif** de Wazuh
parse chaque ligne et expose les champs sous `data.*` (`data.event_type`,
`data.source_ip`, `data.query`, etc.). Les règles custom travaillent sur ces champs.

## Déploiement

1. Préparer le single-node officiel et les certificats (une fois) :
   ```bash
   git clone https://github.com/wazuh/wazuh-docker.git -b v4.9.0
   cd wazuh-docker/single-node
   docker compose -f generate-indexer-certs.yml run --rm generator
   # copier le dossier config/ généré à côté de detection/docker-compose.wazuh.yml
   ```
2. Ajouter le bloc `<localfile>` de `ossec-localfile.conf` dans l'`ossec.conf` du manager.
3. Démarrer la stack complète :
   ```bash
   docker compose -f docker-compose.yml -f detection/docker-compose.wazuh.yml up -d
   ```
4. Dashboard Wazuh : https://localhost:8443 (admin / INDEXER_PASSWORD).

## Règles (plage 100000+)

| ID     | Niveau | Détection | MITRE |
|--------|--------|-----------|-------|
| 100100 | 5  | Échec d'authentification isolé | — |
| 100101 | 10 | Brute force (>=6 échecs/60s, même IP) | T1110 |
| 100102 | 12 | Login réussi après brute force | T1110 |
| 100200 | 12 | Injection SQL dans la query | T1190 |
| 100201 | 12 | Injection SQL dans le body | T1190 |
| 100210 | 10 | Tentative XSS | T1059.007 |
| 100300 | 2  | 404 isolé | — |
| 100301 | 8  | Scan/énumération (>=15 x 404/30s) | T1595 |
| 100400 | 6  | Accès refusé | — |
| 100401 | 10 | Accès admin refusé répété | T1548 |
| 100500 | 7  | Erreur serveur 500 | — |

> Les seuils (`frequency`/`timeframe`) sont à ajuster à l'étape 3 selon le taux de
> faux positifs mesuré avec le script de trafic.

## Tester une règle sans attaque réelle

Injecter une ligne de log de test dans le volume partagé, puis vérifier l'alerte
dans `/var/ossec/logs/alerts/alerts.json` ou le dashboard :

```bash
# depuis l'hôte, écrire dans le volume monté par le manager
docker exec supportdesk sh -c 'echo "{\"timestamp\":\"2026-10-30T10:00:00Z\",\"level\":\"WARN\",\"event_type\":\"auth_failure\",\"source_ip\":\"203.0.113.42\",\"user\":\"admin\",\"endpoint\":\"/login\",\"method\":\"POST\",\"status_code\":401,\"query\":\"\",\"body\":\"username=admin&password=***\"}" >> /var/log/supportdesk/app.json'
```

Répéter 6 fois en moins de 60 s pour déclencher la règle 100101 (brute force).

Vérifier aussi avec l'outil de test de Wazuh :
```bash
docker exec -it wazuh.manager /var/ossec/bin/wazuh-logtest
```
