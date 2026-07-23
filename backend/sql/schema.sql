-- ============================================================
-- Schéma MySQL — conforme au MCD fourni :
--   User         (id, name, email, password, created_at)
--   Conversation (id, user_id, started_at, ended_at)
--   Correction   (id, conversation_id, feedback [JSON], score)
--
-- Remarques :
-- - Les tables sont nommées au pluriel/minuscule (`users`,
--   `conversations`, `corrections`) car `USER` est un mot réservé
--   en MySQL. Elles représentent exactement les mêmes entités.
-- - Le thème ("Restaurant"), les erreurs corrigées et les nouveaux
--   mots appris sont stockés dans la colonne JSON `feedback` de
--   `corrections`, puisque le MCD ne prévoit pas de colonnes
--   dédiées pour ça. `score` porte la note de prononciation/100
--   affichée dans l'app (ex: 8.5).
-- ============================================================

CREATE DATABASE IF NOT EXISTS langue_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE langue_app;

-- ------------------------------------------------------------
-- Entité : User
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,           -- haché avec bcrypt
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Entité : Conversation  (1 User -> N Conversation)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  started_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at    TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_conversation_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Entité : Correction  (1 Conversation -> N Correction)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS corrections (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id  INT NOT NULL,
  feedback         JSON NOT NULL,
  score            DECIMAL(4,2) NOT NULL,
  CONSTRAINT fk_correction_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_conversations_user   ON conversations(user_id);
CREATE INDEX idx_corrections_conv     ON corrections(conversation_id);

-- ------------------------------------------------------------
-- Exemple de contenu de `feedback` (JSON) pour une Correction,
-- repris des maquettes fournies :
-- {
--   "theme": "Restaurant",
--   "errors": [
--     { "wrong": "I have went", "right": "I went" }
--   ],
--   "newWords": [
--     { "word": "Receipt", "translation": "reçu (de paiement)" },
--     { "word": "Bill",    "translation": "addition (restaurant)" },
--     { "word": "Waiter",  "translation": "serveur" }
--   ]
-- }
-- ------------------------------------------------------------
