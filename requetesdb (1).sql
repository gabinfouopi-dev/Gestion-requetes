-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 18 juin 2026 à 17:43
-- Version du serveur :  8.0.21
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `requetesdb`
--

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

DROP TABLE IF EXISTS `categorie`;
CREATE TABLE IF NOT EXISTS `categorie` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `priorite` varchar(255) DEFAULT NULL,
  `service` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKh7mwr3fst63le5gf900ehd38q` (`service`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categorie`
--

INSERT INTO `categorie` (`id`, `description`, `nom`, `priorite`, `service`) VALUES
(1, 'Demande de relevé officiel', 'Relevé de notes', 'normale', 1),
(2, 'Certificat d\'inscription', 'Attestation de scolarité', 'normale', 1),
(3, 'Contestation d\'une note obtenue', 'Réclamation de note', 'haute', 2),
(4, 'Nouvelle demande de bourse', 'Demande de bourse', 'haute', 3),
(5, 'Renouvellement annuel de bourse', 'Renouvellement bourse', 'normale', 3);

-- --------------------------------------------------------

--
-- Structure de la table `piecejointe`
--

DROP TABLE IF EXISTS `piecejointe`;
CREATE TABLE IF NOT EXISTS `piecejointe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chemin` varchar(255) DEFAULT NULL,
  `nom_fichier` varchar(255) DEFAULT NULL,
  `reponse` int DEFAULT NULL,
  `reponse_inter_service` int DEFAULT NULL,
  `requete` int DEFAULT NULL,
  `requete_inter_service` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKm30oi1r8cd434104ms032d8em` (`reponse`),
  KEY `FKrc2waq322otipffro30yh3w54` (`reponse_inter_service`),
  KEY `FK57dod65tljgmr26pr38bvag9u` (`requete`),
  KEY `FKaqy86voyxrym4xkgnheiytwmx` (`requete_inter_service`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `piecejointe`
--

INSERT INTO `piecejointe` (`id`, `chemin`, `nom_fichier`, `reponse`, `reponse_inter_service`, `requete`, `requete_inter_service`) VALUES
(1, 'uploads\\ebb62659-47cb-485c-8e8d-06899e3cd2d1_HTMLCSS.pdf', 'HTMLCSS.pdf', NULL, NULL, 5, NULL),
(2, 'uploads\\72f2bb9c-1817-4b43-be3d-257c6b117e6d_DOC-20250203-WA0013..pdf', 'DOC-20250203-WA0013..pdf', NULL, NULL, NULL, 4),
(3, 'uploads\\eb012690-2b0f-4bf4-8978-5155a6d51dcd_imge01.jpg', 'imge01.jpg', 4, NULL, NULL, NULL),
(4, 'uploads\\5d67f2a7-bd91-414c-8a29-5da0c2c8482d_classGabinLicence.png', 'classGabinLicence.png', NULL, 1, NULL, NULL),
(5, 'uploads\\d822c27a-4ace-4460-9b52-926c1241eb61_Capture d\'écran 2025-04-03 150841.png', 'Capture d\'écran 2025-04-03 150841.png', NULL, NULL, 7, NULL),
(6, 'uploads\\ee27f154-4028-442d-85d6-e55ea814f6e7_Capture d\'écran 2025-11-27 022421.png', 'Capture d\'écran 2025-11-27 022421.png', NULL, NULL, 7, NULL),
(7, 'uploads\\6a9a64ea-7fbe-4618-be26-fe5a99cc72bb_Capture d\'écran 2024-09-24 113804.png', 'Capture d\'écran 2024-09-24 113804.png', 5, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `reponse`
--

DROP TABLE IF EXISTS `reponse`;
CREATE TABLE IF NOT EXISTS `reponse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contenu` varchar(255) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `auteur` int DEFAULT NULL,
  `requete` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmo7e8j3rwum8qglhha9ckpnei` (`requete`),
  KEY `FKdu1dk8fjdyx446tv2j56j4l8` (`auteur`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reponse`
--

INSERT INTO `reponse` (`id`, `contenu`, `date_creation`, `titre`, `auteur`, `requete`) VALUES
(1, 'Veuiller telechar votre relever dans les piece jointes', '2026-06-15', 'Releve de note', 2, 1),
(3, 'xcvvbnmcc', '2026-06-16', 'adghb', 2, 4),
(4, 'asdfghxcvbn', '2026-06-16', 'wertyu', 2, 6),
(5, 'wertyuasdfghjk', '2026-06-18', 'note modifier', 3, 7);

-- --------------------------------------------------------

--
-- Structure de la table `reponse_inter_service`
--

DROP TABLE IF EXISTS `reponse_inter_service`;
CREATE TABLE IF NOT EXISTS `reponse_inter_service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contenu` varchar(255) DEFAULT NULL,
  `date_creation` date DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `auteur` int DEFAULT NULL,
  `requete_inter_service` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1f9961nnrbkb794gbmoct2iau` (`requete_inter_service`),
  KEY `FKkdm43wxs3q6dichh30fqwui08` (`auteur`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reponse_inter_service`
--

INSERT INTO `reponse_inter_service` (`id`, `contenu`, `date_creation`, `titre`, `auteur`, `requete_inter_service`) VALUES
(1, 'sdfghm,mvcxfghm', '2026-06-17', 'stephaneAgent', 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `requete`
--

DROP TABLE IF EXISTS `requete`;
CREATE TABLE IF NOT EXISTS `requete` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_creation` date DEFAULT NULL,
  `date_soumssion` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `objet` varchar(255) DEFAULT NULL,
  `statut` enum('BROUILLON','EN_ATTENTE','EN_COURS','REJETE','TRAITE') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `categorie` int DEFAULT NULL,
  `utilisateur` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbt9is4f2srqh87hdkwl8a3jry` (`categorie`),
  KEY `FKo0qmo34yeu6lgm8l35fifu1m7` (`utilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `requete`
--

INSERT INTO `requete` (`id`, `date_creation`, `date_soumssion`, `description`, `objet`, `statut`, `categorie`, `utilisateur`) VALUES
(1, '2026-06-15', '2026-06-15', 'Je sollicite la délivrance de mon relevé de notes officiel pour le semestre 5, afin de compléter mon dossier de candidature pour un stage.', 'Relevé de notes semestre 6', 'TRAITE', 1, 5),
(2, '2026-06-15', NULL, 'Je sollicite la délivrance de mon relevé de notes officiel pour le semestre 5, afin de compléter mon dossier de candidature pour un stage.', 'Relevé de notes semestre 5', 'BROUILLON', 1, 5),
(4, '2026-06-15', '2026-06-15', 'Demande d\'attestation d\'inscription pour l\'année académique en cours, nécessaire pour l\'obtention d\'un visa.', 'Attestation d\'inscription 2025-2026', 'TRAITE', 2, 5),
(5, '2026-06-16', '2026-06-16', 'asdfghjk', 'qwertyk', 'EN_COURS', 4, 5),
(6, '2026-06-16', '2026-06-16', 'qwertyulkjhcc ', 'note de back', 'TRAITE', 1, 6),
(7, '2026-06-18', '2026-06-18', 'note de maths', 'contestation de note de cc du semetre 5', 'TRAITE', 3, 5);

-- --------------------------------------------------------

--
-- Structure de la table `requete_inter_service`
--

DROP TABLE IF EXISTS `requete_inter_service`;
CREATE TABLE IF NOT EXISTS `requete_inter_service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_creation` date DEFAULT NULL,
  `date_soumssion` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `objet` varchar(255) DEFAULT NULL,
  `statut` enum('BROUILLON','EN_ATTENTE','EN_COURS','REJETE','TRAITE') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `auteur` int DEFAULT NULL,
  `emetteur` int DEFAULT NULL,
  `recepteur` int DEFAULT NULL,
  `infos_demandees` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgoi7f83qc1uojjpeshgyfvphu` (`auteur`),
  KEY `FKlvrvioa8jj1sgee4wc2a6es9m` (`emetteur`),
  KEY `FK7ejeiln0ut2rmum8e0l7246c` (`recepteur`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `requete_inter_service`
--

INSERT INTO `requete_inter_service` (`id`, `date_creation`, `date_soumssion`, `description`, `objet`, `statut`, `auteur`, `emetteur`, `recepteur`, `infos_demandees`) VALUES
(1, '2026-06-16', '2026-06-16', 'Dans le cadre du traitement de la dérogation d\'examen REQ-2024-003, le service Examens sollicite du service Scolarité la confirmation des crédits validés par l\'étudiant NOUWOU THERESA.', 'Vérification des crédits validés ', 'TRAITE', 3, 2, 1, 'Nombre total de crédits validés, UE en échec, historique des absences justifiées'),
(2, '2026-06-16', '2026-06-16', 'asdfghjh', 'qwertggcv', 'EN_ATTENTE', 2, 1, 3, 'xvhjkiugfdvb'),
(3, '2026-06-16', '2026-06-16', 'mnbvcxzasdfghjklpoiuytrewwsbb', 'gjkloiuy', 'EN_ATTENTE', 2, 1, 4, 'qwerty'),
(4, '2026-06-16', '2026-06-16', 'qwertyuiokjnb ', 'asdfghjklnbvcxc', 'EN_ATTENTE', 2, 1, 2, 'qwertyuikjb');

-- --------------------------------------------------------

--
-- Structure de la table `service`
--

DROP TABLE IF EXISTS `service`;
CREATE TABLE IF NOT EXISTS `service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `service`
--

INSERT INTO `service` (`id`, `description`, `nom`) VALUES
(1, 'Gestion des inscriptions et dossiers académiques', 'Scolarité'),
(2, 'Organisation des examens et résultats', 'Examens et Délibérations'),
(3, 'Attributions de bourses et aides sociales', 'Bourses et Aides'),
(4, 'Gestion des ressources documentaires', 'Bibliothèque'),
(5, 'Support technique et systèmes d\'information', 'Informatique'),
(7, 'mnjjk', 'cvbnm');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','AGENT','ETUDIANT') DEFAULT NULL,
  `tel` varchar(255) DEFAULT NULL,
  `service` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKsj3torj4w362f2sfbelrfoqy8` (`service`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `email`, `mot_de_passe`, `nom`, `prenom`, `role`, `tel`, `service`) VALUES
(1, 'pinlapgabin@gmail.com', 'pinlapAdmin', 'PINLAP', 'GABIN', 'ADMIN', '6 72 44 86 11', NULL),
(2, 'mbadjuinstephane@gmail.com', 'stephaneAgent', 'MBADJUIN', 'STEPHANE', 'AGENT', '6 82 47 47 92', 1),
(3, 'mieguinjovial@gmail.com', 'jovialAgent', 'MIEGUIN', 'JOVIAL', 'AGENT', '6 55 15 52 20', 2),
(4, 'goutiaprince@gmail.com', 'goutiaAgent', 'GOUTIA', 'PRINCE', 'AGENT', '6 55 15 52 20', 3),
(5, 'theresa@gmail.com', '$2a$10$Mrtmakk.9lRnAbdaP8lvhONEExuS36XelfrJOAD0QER.rlw.NifvS', 'NOUWOU', 'THERESA', 'ETUDIANT', NULL, NULL),
(6, 'fabiola@gmail.com', '$2a$10$DoONOoCNjjuc5hw6kEPu5.8UXiwdHMaA4j5ld9sapZTWQJgIIcZsi', 'MALACK', 'FABIOLA', 'ETUDIANT', NULL, NULL);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD CONSTRAINT `FKh7mwr3fst63le5gf900ehd38q` FOREIGN KEY (`service`) REFERENCES `service` (`id`);

--
-- Contraintes pour la table `piecejointe`
--
ALTER TABLE `piecejointe`
  ADD CONSTRAINT `FK57dod65tljgmr26pr38bvag9u` FOREIGN KEY (`requete`) REFERENCES `requete` (`id`),
  ADD CONSTRAINT `FKaqy86voyxrym4xkgnheiytwmx` FOREIGN KEY (`requete_inter_service`) REFERENCES `requete_inter_service` (`id`),
  ADD CONSTRAINT `FKm30oi1r8cd434104ms032d8em` FOREIGN KEY (`reponse`) REFERENCES `reponse` (`id`),
  ADD CONSTRAINT `FKrc2waq322otipffro30yh3w54` FOREIGN KEY (`reponse_inter_service`) REFERENCES `reponse_inter_service` (`id`);

--
-- Contraintes pour la table `reponse`
--
ALTER TABLE `reponse`
  ADD CONSTRAINT `FKdu1dk8fjdyx446tv2j56j4l8` FOREIGN KEY (`auteur`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FKpgr5erdx59f23hwcatac6mwxt` FOREIGN KEY (`requete`) REFERENCES `requete` (`id`);

--
-- Contraintes pour la table `reponse_inter_service`
--
ALTER TABLE `reponse_inter_service`
  ADD CONSTRAINT `FKkdm43wxs3q6dichh30fqwui08` FOREIGN KEY (`auteur`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FKtj6g6ei3b1oiwsn5mwlsw8h6f` FOREIGN KEY (`requete_inter_service`) REFERENCES `requete_inter_service` (`id`);

--
-- Contraintes pour la table `requete`
--
ALTER TABLE `requete`
  ADD CONSTRAINT `FKbt9is4f2srqh87hdkwl8a3jry` FOREIGN KEY (`categorie`) REFERENCES `categorie` (`id`),
  ADD CONSTRAINT `FKo0qmo34yeu6lgm8l35fifu1m7` FOREIGN KEY (`utilisateur`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `requete_inter_service`
--
ALTER TABLE `requete_inter_service`
  ADD CONSTRAINT `FK7ejeiln0ut2rmum8e0l7246c` FOREIGN KEY (`recepteur`) REFERENCES `service` (`id`),
  ADD CONSTRAINT `FKgoi7f83qc1uojjpeshgyfvphu` FOREIGN KEY (`auteur`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FKlvrvioa8jj1sgee4wc2a6es9m` FOREIGN KEY (`emetteur`) REFERENCES `service` (`id`);

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `FKsj3torj4w362f2sfbelrfoqy8` FOREIGN KEY (`service`) REFERENCES `service` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
