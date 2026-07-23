# Coach Conversation — App mobile de coaching linguistique

Application mobile (React Native / Expo) avec authentification obligatoire,
permettant de discuter à l'oral avec un coach IA ("maintenir pour parler"),
puis de consulter ses corrections et sa progression. Backend Node/Express +
base de données MySQL, strictement conforme au MCD fourni.

## Architecture

```
.
├── backend/     API REST (Node.js + Express + MySQL)
└── mobile/      App Expo (React Native + expo-router + NativeWind/Tailwind + shadcn-style UI)
```

### Conformité au MCD

```
User ----------------       Conversation -------------       Correction
id                          id                                id
name                  1,N    user_id (FK -> User)      1,N     conversation_id (FK)
email                        started_at                        feedback (JSON)
password                     ended_at                          score
created_at
```

Voir `backend/sql/schema.sql` pour le DDL exact (tables `users`,
`conversations`, `corrections` — noms au pluriel car `USER` est un mot
réservé en MySQL, mais les entités/relations sont identiques au MCD).

Le thème de la session, les erreurs corrigées et les nouveaux mots appris
(visibles sur les maquettes) sont stockés dans la colonne JSON
`corrections.feedback`, le MCD ne prévoyant pas de colonnes dédiées.

## Démarrage rapide

### 1. Base de données + Backend

```bash
cd backend
cp .env.example .env       # renseignez vos identifiants MySQL
mysql -u root -p < sql/schema.sql
npm install
npm run dev                 # démarre l'API sur http://localhost:4000
```

Vérification : `curl http://localhost:4000/api/health` doit renvoyer
`{"status":"ok"}`.

### 2. App mobile (Expo)

```bash
cd mobile
cp .env.example .env        # mettez l'IP locale de votre machine, PAS "localhost"
npm install
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (ou lancez un simulateur iOS/
Android). Important : un téléphone physique ou un émulateur ne peut pas
joindre `localhost` pour atteindre votre ordinateur — utilisez l'adresse IP
locale de votre machine dans `EXPO_PUBLIC_API_URL` (ex: `http://192.168.1.20:4000`).

## Fonctionnement de l'application

1. **Authentification obligatoire** : l'utilisateur doit créer un compte ou
   se connecter avant d'accéder à quoi que ce soit (écrans `/login` et
   `/signup`, protégés par `Stack.Protected` dans `expo-router`). Le token
   JWT est stocké de façon sécurisée (`expo-secure-store`).
2. **Écran principal** : un gros bouton rouge à **maintenir appuyé** pour
   parler (`expo-audio` enregistre le micro). Au relâchement, l'audio est
   envoyé au backend, transcrit, et le coach IA répond — la réponse est
   lue à voix haute (`expo-speech`, TTS gratuit et embarqué).
3. **"Arrêter la discussion"** : termine la conversation côté backend, qui
   génère une `Correction` (thème, score de prononciation, erreurs,
   nouveaux mots), puis affiche l'écran "Discussion terminée".
4. **Menu (☰)** : ouvre un tiroir (drawer) sombre listant l'historique des
   conversations terminées. Sélectionner une conversation affiche le détail
   de sa correction (thème, durée, score, erreurs corrigées, vocabulaire
   appris) — reproduisant fidèlement les maquettes fournies. Un bouton
   "Deconnexion" est disponible en bas du tiroir.

## Brancher une vraie IA

Par défaut, `backend/src/services/ai.service.js` **simule** la
transcription, le dialogue et la génération de corrections (aucune clé API
requise, l'app fonctionne immédiatement de bout en bout). Pour brancher un
vrai modèle :

- **Transcription (STT)** : OpenAI Whisper, Google Speech-to-Text...
- **Dialogue** : un LLM (ex: Claude via l'API Anthropic) pour générer les
  réponses du coach et, en fin de session, un JSON structuré
  `{ theme, errors[], newWords[], score }`.
- **Voix (TTS)** : `expo-speech` est gratuit et fonctionne hors-ligne côté
  mobile ; remplaçable par ElevenLabs/Azure si une voix plus naturelle est
  souhaitée (le backend renverrait alors une URL audio).

Toute la logique est isolée dans ce seul fichier — aucune autre partie du
code n'a besoin de changer.

## Stack technique

- **Backend** : Node.js, Express, MySQL (`mysql2`), JWT (`jsonwebtoken`),
  mots de passe hachés (`bcryptjs`), upload audio (`multer`).
- **Mobile** : Expo SDK 54, `expo-router` (navigation + drawer), NativeWind
  v4 (Tailwind pour React Native), composants `components/ui/*` dans
  l'esprit shadcn/ui (Button, Input, Card), `expo-audio` (enregistrement),
  `expo-speech` (synthèse vocale), `expo-secure-store` (session).
