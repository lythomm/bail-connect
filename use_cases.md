# Spécifications des Cas d'Utilisation Manquants (Convex) - Triés par Priorité

Ce document répertorie les cas d'utilisation manquants ou à améliorer dans les fonctions Convex de BailConnect, classés par ordre de criticité (du plus critique au moins critique).

---

## 🔒 Directives de Sécurité Générales

1. **Contrôle d'Accès Propriétaire** : Toute requête (`query`) ou mutation (`mutation`) lisant ou écrivant des données associées à un propriétaire doit valider l'utilisateur avec `getAuthUserId` et vérifier sa propriété (ex. `campaign.userId === userId`).
2. **Confidentialité PII** : Les données personnelles des candidats (`firstName`, `lastName`, `email`, `phone`, `dossierFacileUrl`) ne doivent jamais être renvoyées par des requêtes publiques sans validation (ex. exiger un `bookingToken` valide).
3. **Erreurs Utilisateur** : Lever des exceptions de type `ConvexError` avec des messages clairs en français pour permettre un affichage direct côté client.
4. **Validation Côté Serveur Obligatoire** : Les vérifications de sécurité, de limites de plan et de cohérence des données doivent impérativement être effectuées par le serveur Convex (mutations/actions) et non pas uniquement reposer sur les gardes et contrôles du frontend.

---

## 🔥 Priorité 1 : Sécurité et Intégrité des Données (Critique)

### 1. Sécurité des Actions Locataires (bookingToken) (Nouveau)
* **Objectif** : Empêcher des tiers d'accéder aux rendez-vous ou d'annuler des visites en devinant ou volant le `candidateId`.
* **Fonctions Convex à modifier/créer** :
  1. Schéma : Ajouter un champ `bookingToken: v.string()` sur la table `candidates`.
  2. Lors de la soumission d'une candidature (`candidates.ts:create`), générer un token cryptographique aléatoire unique (ex. UUID ou chaîne aléatoire longue).
  3. Exiger le `bookingToken` comme argument obligatoire dans les fonctions suivantes :
     * `appointments.ts:getBookingPageData`
     * `appointments.ts:bookAppointment`
     * `appointments.ts:cancelAppointment`
     * `candidates.ts:withdraw`
  4. Bloquer l'exécution de ces fonctions si le token fourni ne correspond pas à celui enregistré.
* **Points de vigilance** :
  * Le jeton `bookingToken` doit être intégré dans le lien de réservation envoyé par e-mail au candidat lors de son acceptation.

### 2. Validation Côté Serveur des Données Candidat (Nouveau)
* **Objectif** : Valider les informations du candidat lors du dépôt de dossier pour assurer la cohérence et conformité des données de candidature.
* **Fonctions Convex à modifier** : `candidates.ts:create`
* **Logique d'implémentation** :
  1. Valider que `age >= 18` (lever une `ConvexError` "Vous devez avoir au moins 18 ans pour candidater").
  2. Valider que `monthlyIncome >= 0` (lever une `ConvexError` "Revenu invalide").
  3. Valider que l'email est dans un format valide (contient `@`).

### 3. Validation des Paramètres de Créneau (Nouveau)
* **Objectif** : Empêcher la création de plages horaires de visite incohérentes ou abusives.
* **Fonctions Convex à modifier** : `appointments.ts:createSlot` et `appointments.ts:updateSlot`
* **Logique d'implémentation** :
  1. Valider que `startTime < endTime`.
  2. Valider que `maxCapacity` est un entier strictement supérieur à 0.
  3. Si l'une des conditions n'est pas remplie, lever une `ConvexError` spécifique.

### 4. Validation Côté Serveur du Profil Utilisateur (Nouveau)
* **Objectif** : Valider le format du numéro de téléphone lors des mises à jour de profil du propriétaire.
* **Fonctions Convex à modifier** : `users.ts:update`
* **Logique d'implémentation** :
  1. Si un numéro de téléphone est fourni dans `phone`, valider son format via une expression régulière française (regex `/^(?:(?:\+|00)33|0)[1-9]\d{8}$/`).
  2. Lever une `ConvexError` si le format est incorrect.

---

## ⚡ Priorité 2 : Modèle Économique et Limites (Important)

### 1. Limites du Plan Gratuit (Nouveau)
* **Objectif** : Limiter le nombre de campagnes actives pour les utilisateurs n'ayant pas d'abonnement Pro ou de pass actif.
* **Fonctions Convex à modifier** : `campaigns.ts:create`
* **Logique d'implémentation** :
  1. Si le type d'annonce créé est `"free"`, vérifier le statut de l'utilisateur.
  2. Si l'utilisateur est sur le plan `free` (tier non `pro`), compter ses campagnes actives (`status === "active" && adType === "free"`).
  3. Si ce nombre dépasse la limite autorisée (ex: 1 seule annonce active gratuite), refuser la création et lever une `ConvexError` ("Vous avez atteint la limite d'annonces actives pour le plan gratuit").

### 2. Nettoyage suite à Rétrogradation (Nouveau)
* **Objectif** : Archiver ou désactiver les annonces gratuites excédentaires lorsqu'un utilisateur passe de Pro à Gratuit.
* **Fonctions Convex à modifier** : `stripeMutations.ts:downgradeUser` et `stripeMutations.ts:downgradeUserBySubscriptionId`
* **Logique d'implémentation** :
  1. Lors de l'exécution de la rétrogradation d'un utilisateur vers le plan `free`, récupérer toutes ses campagnes actives.
  2. Conserver la campagne active la plus récente et modifier le statut de toutes les autres campagnes actives gratuites en `archived` (ou bloquer leur visibilité).
  * *Note* : Les campagnes créées avec un pass individuel payant (`adType === "pass"`) doivent rester actives jusqu'à leur expiration propre.

### 3. Limite de Validité du Pass Annonce (Nouveau)
* **Objectif** : Faire expirer le pass premium individuel d'une annonce au bout de 30 jours pour qu'elle repasse en mode gratuit.
* **Fonctions Convex à modifier/créer** :
  * Schéma : Ajouter un champ `passExpiresAt: v.optional(v.number())` dans la table `campaigns`.
  * Stripe Mutations : Dans `createPaidCampaign` et `markCampaignAsPaid`, définir `passExpiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)` (30 jours).
  * Cron : Créer une tâche récurrente quotidienne dans `crons.ts` appelant une nouvelle action de nettoyage. Cette action doit chercher les campagnes actives avec `adType === "pass"` et `passExpiresAt < Date.now()`, puis mettre à jour leur statut avec `adType: "free"`.
* **Mise à jour de la tarification et de la documentation (UI/Docs)** :
  * Modifier la Landing Page ([app/page.tsx](file:///c:/Users/Thomas/workspace/myProjects/bail-connect/app/page.tsx)) pour y faire apparaître explicitement la durée de 30 jours du pass annonce.
  * Mettre à jour le document ([pricing.md](file:///c:/Users/Thomas/workspace/myProjects/bail-connect/pricing.md)) pour y refléter cette durée de validité de 30 jours pour le pass.
* **Points de vigilance** :
  * Si la campagne repasse en gratuit et que l'utilisateur dépasse ainsi la limite d'annonces gratuites autorisées, ne rien faire et la garder telle quelle, sauf si l'utilisateur souhaite repayer un abonnement pro ou pass.

### 4. Résiliation Différée (Amélioration)
* **Objectif** : Éviter de priver immédiatement l'utilisateur de son accès Pro s'il a déjà payé sa période en cours.
* **Fonctions Convex à modifier** : `stripe.ts:cancelSubscription`
* **Logique d'implémentation** :
  1. Remplacer la suppression immédiate de l'abonnement Stripe (`DELETE`) par une mise à jour de l'abonnement avec l'attribut `cancel_at_period_end = true`.
  2. Supprimer l'appel immédiat à `downgradeUser` dans la mutation.
  3. Laisser le webhook Stripe (`stripeWebhook` pour l'événement `customer.subscription.deleted`) effectuer la rétrogradation et l'exécution de `downgradeUserBySubscriptionId` de manière asynchrone lorsque l'abonnement expire réellement.

---

## 📅 Priorité 3 : Logique Métier et Anti-Spam (Moyen)

### 1. Prévention des Doublons (Amélioration)
* **Objectif** : Empêcher un candidat de soumettre plusieurs fois sa candidature pour une même campagne.
* **Fonctions Convex à modifier** : `candidates.ts:create`
* **Logique d'implémentation** :
  1. Avant d'insérer un nouveau candidat, vérifier s'il existe déjà une entrée active pour ce `campaignId` avec :
     * Le même `email` OU
     * Le même `phone` OU
     * La même URL DossierFacile (`dossierFacileUrl`).
  2. Si un doublon est détecté, bloquer l'insertion en levant une `ConvexError` spécifique ("L'email, le téléphone ou le lien dossierFacile existe déjà").

### 2. Détection des Conflits d'Agendas Locataires (Nouveau)
* **Objectif** : Éviter qu'un locataire planifie des visites sur des créneaux horaires qui se chevauchent sur la plateforme.
* **Fonctions Convex à modifier** : `appointments.ts:bookAppointment`
* **Logique d'implémentation** :
  1. Lors de la réservation, récupérer tous les rendez-vous actifs associés à l'adresse e-mail ou au numéro de téléphone du candidat (toutes campagnes confondues).
  2. Vérifier si un de ces rendez-vous possède un créneau dont l'intervalle `[startTime, endTime]` chevauche le créneau cible.
  3. Si un conflit est détecté, refuser la réservation et lever une `ConvexError`.

### 3. Archivage Complet de Campagne (Amélioration)
* **Objectif** : Lorsqu'un propriétaire archive une campagne, tous les créneaux et rendez-vous associés doivent être nettoyés, et les candidats informés de la clôture de la campagne.
* **Fonctions Convex à impacter** : `campaigns.ts:archive`
* **Logique d'implémentation** :
  1. Récupérer tous les créneaux (`slots`) de la campagne.
  2. Pour chaque créneau, collecter les rendez-vous (`appointments`) associés.
  3. Pour chaque rendez-vous, envoyer un e-mail au candidat via `ctx.scheduler` avec le sujet *"Un locataire a été trouvé"* (nouvel e-mail dans `emails.ts` : `sendCampaignArchivedCancellation`).
  4. Supprimer tous les rendez-vous et créneaux associés dans la base de données.
* **Points de vigilance** : 
  * Effectuer la suppression et l'envoi de mails de manière asynchrone / planifiée si le nombre de créneaux est élevé pour éviter un timeout de la mutation.

---

## 🛠️ Priorité 4 : Expérience Utilisateur et Confort (Faible)

### 1. Édition de Créneau de Visite (Nouveau)
* **Objectif** : Permettre de modifier la date/heure ou la capacité d'un créneau existant sans le supprimer pour préserver les réservations actives.
* **Fonctions Convex à créer** : `appointments.ts:updateSlot`
* **Arguments** : `slotId`, `startTime` (optionnel), `endTime` (optionnel), `maxCapacity` (optionnel).
* **Logique d'implémentation** :
  1. Valider que le propriétaire authentifié possède la campagne liée au créneau.
  2. Empêcher de définir une date de visite dans le passé.
  3. Si la capacité `maxCapacity` est modifiée, vérifier qu'elle n'est pas inférieure au nombre actuel de candidats déjà inscrits (`bookedCount`). Si c'est le cas, lever une `ConvexError` ("La nouvelle capacité est inférieure au nombre de réservations existantes").
  4. Si les horaires (`startTime` / `endTime`) sont modifiés, envoyer un e-mail de notification de mise à jour aux candidats inscrits.
* **Points de vigilance** :
  * Ne pas modifier le `bookedCount` existant lors de la mise à jour de la capacité.

### 2. Retrait de Candidature (Nouveau)
* **Objectif** : Permettre à un candidat de retirer son dossier (par exemple, s'il a trouvé un autre logement). La modification des informations saisies reste interdite.
* **Fonctions Convex à créer** : `candidates.ts:withdraw`
* **Arguments** : `candidateId`, `bookingToken`.
* **Logique d'implémentation** :
  1. Valider la requête en comparant le `bookingToken` avec celui stocké sur le candidat.
  2. Supprimer la ligne du candidat dans la table `candidates`.
  3. Trouver tout rendez-vous en cours pour ce candidat, décrémenter le `bookedCount` du créneau concerné, et supprimer le rendez-vous.
  4. Envoyer un e-mail de notification au propriétaire indiquant que le candidat a retiré son dossier.
* **Interface Utilisateur (UI/UX)** :
  * Afficher un message de confirmation explicite (ex: boîte de dialogue de confirmation) avant de valider le retrait, avertissant le candidat que cette action est définitive et irréversible.

### 3. Notes Privées sur les Candidats (Nouveau)
* **Objectif** : Permettre au propriétaire d'ajouter et d'éditer des notes textuelles sur la fiche d'un candidat.
* **Fonctions Convex à modifier/créer** : 
  * Schéma : Ajouter un champ `notes: v.optional(v.string())` dans la table `candidates`.
  * Mutation : `candidates.ts:updateNotes`
* **Logique d'implémentation** :
  1. Valider que l'utilisateur est authentifié et possède la campagne du candidat.
  2. Vérifier que la note fournie ne dépasse pas 1024 caractères. Si c'est le cas, lever une erreur.
  3. Mettre à jour le champ `notes` du candidat.
* **Interface Utilisateur (UI/UX)** :
  * Adapter le tableau de suivi des candidats pour intégrer l'affichage et l'édition des notes de manière esthétique, fluide et ergonomique (ex: bouton d'édition rapide, bulle d'édition au clic, sauvegarde automatique ou zone de texte intégrée).
  * L'accès et la saisie de ces notes doivent être rapides et ne pas surcharger visuellement la ligne du tableau.

---

## ⏳ Priorité 5 : Évolutions Futures

### 1. Liaison de la Validation SMS au Profil Utilisateur (Futur)
* **Objectif** : Associer le numéro validé par SMS à l'utilisateur connecté dans la table `users`.
* **Fonctions Convex à modifier** : `twilio.ts:verifyPhoneOTP`
* **Logique d'implémentation** :
  1. Actuellement, `verifyPhoneOTP` ne fait que passer `verified: true` dans la table temporaire `phoneVerifications`.
  2. Demander la validation d'authentification (`getAuthUserId`). Si l'utilisateur est connecté, et après confirmation du code OTP :
     * Mettre à jour son document utilisateur dans `users` avec le champ `phone` égal au numéro vérifié, et `phoneVerificationTime` égal à `Date.now()`.
     * Supprimer l'entrée temporaire de `phoneVerifications`.
* **Points de vigilance** :
  * Ce mécanisme ne doit pas être bloquant pour l'inscription ou la mise à jour basique du profil tant que la validation SMS obligatoire n'est pas activée globalement.

### NE PAS FAIRE POUR LE MOMENT :
### 2. Enforcement Côté Serveur de la Vérification d'E-mail (Nouveau)
* **Objectif** : Sécuriser les appels d'API Convex contre le contournement des protections de l'interface utilisateur.
* **Fonctions Convex à modifier** : Toutes les mutations d'écriture propriétaire (`create` campagne, `createSlot`, `updateSlot`, `updateStatuses`, `cancelAppointment`).
* **Logique d'implémentation** :
  1. Récupérer l'utilisateur connecté via `getAuthUserId`.
  2. Valider que le champ `emailVerificationTime` est présent et non nul.
  3. Si non vérifié, rejeter l'opération avec une `ConvexError` ("Votre adresse e-mail doit être vérifiée pour effectuer cette action").
