# Rapport de qualification des alertes -- SentinelX

Livrable étape 3 (partie C + B). Classe chaque alerte générée en vrai ou faux
positif, justifie, et mesure le taux de faux positifs sur la durée de trafic convenue.

## Méthode de mesure

- Script de trafic réaliste utilisé (fourni par A) : `___`
- Outil / volume / durée convenus en équipe : `___ requêtes sur ___ minutes`
- Ratio attaque / normal injecté (si Log-Generator) : `___`
- Fenêtre de mesure du taux de faux positifs : `___`
- Prérequis : le script de trafic est stable et figé AVANT de lancer la mesure
  (sinon la mesure n'est pas valide -- cf. avertissement du sujet).

## Tableau de qualification

| # | Horodatage | rule ID | Severity | source_ip | Scénario / cause | Vrai ou faux positif | Justification |
|---|-----------|---------|----------|-----------|------------------|----------------------|---------------|
| 1 |           |         |          |           |                  |                      |               |
| 2 |           |         |          |           |                  |                      |               |
| 3 |           |         |          |           |                  |                      |               |

## Synthèse

- Nombre total d'alertes : `___`
- Vrais positifs : `___`
- Faux positifs : `___`
- **Taux de faux positifs** = faux positifs / total alertes = `___ %`
- Taux de faux positifs sur trafic normal seul (sans attaque) : `___ %`

## Faux positifs : analyse et correctifs

> Pour chaque faux positif : pourquoi la règle a sur-déclenché et comment l'affiner
> (seuil, fenêtre temporelle, exclusion d'une route légitime, etc.).

- FP #1 :
- FP #2 :

## Conclusion

- Qualité de détection globale :
- Règles à durcir ou à assouplir :
- Recommandations pour la démo :
