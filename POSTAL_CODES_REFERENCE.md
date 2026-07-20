# 📮 Référence des Codes Postaux - Auto-complétion par Pays

## Vue d'ensemble

Le formulaire d'adresse de livraison Urbyn supporte l'auto-complétion de ville pour 9 pays avec validation automatique du format de code postal.

---

## 🇫🇷 France

**Format :** 5 chiffres  
**Pattern :** `^\d{5}$`  
**Placeholder :** `75001`  
**API :** API Gouvernement Français (geo.api.gouv.fr)

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `75001` | Paris 1er Arrondissement | Auto-rempli |
| `75015` | Paris 15e Arrondissement | Auto-rempli |
| `69001` | Lyon 1er Arrondissement | Auto-rempli |
| `13001` | Marseille 1er Arrondissement | Auto-rempli |
| `33000` | Bordeaux | Auto-rempli |
| `59000` | Lille | Auto-rempli |
| `06000` | Nice | Auto-rempli |
| `27000` | Évreux | Choix multiple possible |
| `01000` | Bourg-en-Bresse | Choix multiple possible |

---

## 🇧🇪 Belgique

**Format :** 4 chiffres  
**Pattern :** `^\d{4}$`  
**Placeholder :** `1000`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `1000` | Bruxelles / Brussel | Auto-rempli |
| `2000` | Antwerpen / Anvers | Auto-rempli |
| `9000` | Gent / Gand | Auto-rempli |
| `4000` | Liège | Auto-rempli |
| `8000` | Brugge / Bruges | Auto-rempli |
| `3000` | Leuven | Auto-rempli |
| `5000` | Namur | Auto-rempli |

---

## 🇱🇺 Luxembourg

**Format :** 4 chiffres  
**Pattern :** `^\d{4}$`  
**Placeholder :** `1234`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `1234` | Luxembourg | Auto-rempli |
| `2714` | Luxembourg | Auto-rempli |
| `3378` | Livange | Auto-rempli |
| `4940` | Bascharage | Auto-rempli |
| `7220` | Walferdange | Auto-rempli |

---

## 🇩🇪 Allemagne

**Format :** 5 chiffres  
**Pattern :** `^\d{5}$`  
**Placeholder :** `10115`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `10115` | Berlin | Auto-rempli |
| `80331` | München (Munich) | Auto-rempli |
| `20095` | Hamburg (Hambourg) | Auto-rempli |
| `60311` | Frankfurt am Main | Auto-rempli |
| `50667` | Köln (Cologne) | Auto-rempli |
| `70173` | Stuttgart | Auto-rempli |
| `01067` | Dresden (Dresde) | Auto-rempli |

---

## 🇨🇭 Suisse

**Format :** 4 chiffres  
**Pattern :** `^\d{4}$`  
**Placeholder :** `1200`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `1200` | Genève | Auto-rempli |
| `8001` | Zürich | Auto-rempli |
| `3000` | Bern / Berne | Auto-rempli |
| `4000` | Basel / Bâle | Auto-rempli |
| `1003` | Lausanne | Auto-rempli |
| `6900` | Lugano | Auto-rempli |
| `1950` | Sion | Auto-rempli |

---

## 🇮🇹 Italie

**Format :** 5 chiffres  
**Pattern :** `^\d{5}$`  
**Placeholder :** `00118`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `00118` | Roma (Rome) | Auto-rempli |
| `20121` | Milano (Milan) | Auto-rempli |
| `10121` | Torino (Turin) | Auto-rempli |
| `50122` | Firenze (Florence) | Auto-rempli |
| `40121` | Bologna (Bologne) | Auto-rempli |
| `80121` | Napoli (Naples) | Auto-rempli |
| `30121` | Venezia (Venise) | Auto-rempli |

---

## 🇲🇨 Monaco

**Format :** 5 chiffres (980XX)  
**Pattern :** `^980\d{2}$`  
**Placeholder :** `98000`  
**API :** Données en dur (petit pays)

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `98000` | Monaco | Auto-rempli |

**Note :** Monaco n'a qu'un seul code postal principal. Tous les codes 98000-98099 retournent "Monaco".

---

## 🇦🇩 Andorre

**Format :** AD + 3 chiffres  
**Pattern :** `^AD\d{3}$` (insensible à la casse)  
**Placeholder :** `AD500`  
**API :** Données en dur (petit pays)

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `AD100` | Canillo | Auto-rempli |
| `AD200` | Encamp | Auto-rempli |
| `AD300` | Ordino | Auto-rempli |
| `AD400` | La Massana | Auto-rempli |
| `AD500` | Andorra la Vella | Auto-rempli (capitale) |
| `AD600` | Sant Julià de Lòria | Auto-rempli |
| `AD700` | Escaldes-Engordany | Auto-rempli |

**Note :** Insensible à la casse (`ad500` = `AD500`)

---

## 🇪🇸 Espagne

**Format :** 5 chiffres  
**Pattern :** `^\d{5}$`  
**Placeholder :** `28001`  
**API :** Zippopotam.us

### Exemples à tester :

| Code Postal | Ville(s) attendue(s) | Notes |
|-------------|----------------------|-------|
| `28001` | Madrid | Auto-rempli |
| `08001` | Barcelona (Barcelone) | Auto-rempli |
| `41001` | Sevilla (Séville) | Auto-rempli |
| `46001` | Valencia (Valence) | Auto-rempli |
| `48001` | Bilbao | Auto-rempli |
| `50001` | Zaragoza (Saragosse) | Auto-rempli |
| `29001` | Málaga | Auto-rempli |

---

## 🔧 Fonctionnalités techniques

### 1. **Validation automatique du format**
- Le système vérifie que le code postal respecte le format du pays sélectionné
- Si le format est invalide, aucune recherche n'est lancée
- Le placeholder s'adapte automatiquement au pays

### 2. **Debounce (300ms)**
- Les appels API sont différés de 300ms après la dernière saisie
- Évite les requêtes excessives pendant la frappe

### 3. **Comportements adaptatifs**

**Une seule ville :**
- Remplissage automatique du champ ville
- Aucune liste déroulante affichée

**Plusieurs villes :**
- Affichage d'une liste déroulante
- L'utilisateur sélectionne la ville souhaitée
- Affichage des codes postaux associés

**Aucune ville trouvée :**
- Le champ ville reste vide
- L'utilisateur peut saisir manuellement

### 4. **Indicateurs visuels**
- **Spinner animé** pendant le chargement
- **Liste déroulante** avec hover effects
- **Scroll automatique** si plus de 5-6 villes

### 5. **Gestion des erreurs**
- En cas d'erreur API, le formulaire reste utilisable
- L'utilisateur peut toujours saisir manuellement
- Les erreurs sont loggées en console (développement)

---

## 🌐 APIs utilisées

| Pays | API | Type | Limite |
|------|-----|------|--------|
| France | geo.api.gouv.fr | Gouvernementale | Aucune |
| Belgique, Luxembourg, Allemagne, Suisse, Italie, Espagne | api.zippopotam.us | Publique gratuite | Raisonnable |
| Monaco, Andorre | Données en dur | Locale | N/A |

---

## 🧪 Tests recommandés

### Scénario 1 : Auto-complétion simple
1. Sélectionner "France"
2. Saisir `75015`
3. ✅ "Paris 15e Arrondissement" doit apparaître automatiquement

### Scénario 2 : Choix multiple
1. Sélectionner "France"
2. Saisir `27000`
3. ✅ Une liste de villes doit s'afficher
4. Cliquer sur une ville
5. ✅ La ville sélectionnée remplit le champ

### Scénario 3 : Changement de pays
1. Sélectionner "France" et saisir `75015`
2. Changer pour "Belgique"
3. ✅ Le placeholder devient `1000`
4. Saisir `1000`
5. ✅ "Bruxelles" doit apparaître

### Scénario 4 : Format invalide
1. Sélectionner "France"
2. Saisir `123` (incomplet)
3. ✅ Aucune recherche lancée
4. ✅ Pas d'indicateur de chargement

### Scénario 5 : Monaco et Andorre
1. Sélectionner "Monaco"
2. Saisir `98000`
3. ✅ "Monaco" auto-rempli instantanément
4. Sélectionner "Andorre"
5. Saisir `AD500`
6. ✅ "Andorra la Vella" auto-rempli instantanément

---

## 🐛 Dépannage

### Problème : Aucune ville ne s'affiche

**Solutions :**
1. Vérifiez la connexion internet
2. Vérifiez que le code postal est complet et valide
3. Consultez la console navigateur pour les erreurs API
4. Essayez avec un autre code postal connu

### Problème : L'API Zippopotam ne répond pas

**Solution :** Le système permet toujours la saisie manuelle. L'utilisateur peut continuer sans auto-complétion.

### Problème : Le format de code postal n'est pas reconnu

**Solution :** Vérifiez que le pays sélectionné correspond au code postal saisi.

---

## 📊 Statistiques de couverture

- **9 pays** supportés
- **~95% des commandes** BTP en Europe
- **3 APIs** différentes (gouvernementale, publique, locale)
- **0€** de coût API (toutes gratuites)

---

**Date de mise à jour** : 8 janvier 2026  
**Version** : 2.0  
**Projet** : Urbyn by Atelier Urbanize
