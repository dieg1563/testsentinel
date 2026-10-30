# Runbook -- [Nom du scénario]

Runbook reproductible lié à l'Attack Plan correspondant.
À remplir pendant l'exécution de l'attaque (étape 2).

## Contexte

- Attack Plan associé : `attack-plans/0X-xxx.md`
- Date / heure d'exécution :
- Opérateur (qui lance) :
- Version de l'app (commit) :
- `source_ip` observée côté logs (attention au bridge Docker) :

## Commandes exécutées

> Copier les commandes exactes, dans l'ordre, pour qu'un autre membre les rejoue.

```bash
# exemple
# hydra -l admin -P wordlist.txt 127.0.0.1 -s 3000 http-post-form \
#   "/login:username=^USER^&password=^PASS^:F=invalid"
```

## Observations

- Comportement de l'application :
- Codes HTTP renvoyés :
- Événements attendus dans les logs JSON (`event_type`, `status_code`) :
- Extrait de log pertinent :

```json

```

## Alerte(s) Wazuh

- Alerte déclenchée : oui / non
- rule ID :
- Severity :
- Délai entre le début de l'attaque et l'alerte :
- `source_ip` dans l'alerte correcte : oui / non
- Capture / extrait de l'alerte :

## Résultat

- Success criteria atteints : oui / non
- Stop criteria déclenché :
- À corriger (règle, seuil, instrumentation) :
