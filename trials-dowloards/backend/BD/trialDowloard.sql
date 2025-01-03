DROP DATABASE IF EXISTS trialDowloard_db;
CREATE DATABASE trialDowloard_db;
USE trialDowloard_db;

-- Table pour les filières
CREATE TABLE filieres (
  id_filiere INT AUTO_INCREMENT PRIMARY KEY,
  nom_filiere VARCHAR(255) NOT NULL,
  niveau INT
);

-- Table pour les spécialités
CREATE TABLE matiere (
  id_matiere INT AUTO_INCREMENT PRIMARY KEY,
  nom_matiere VARCHAR(255) NOT NULL,
  filiere_id INT,
  FOREIGN KEY (filiere_id) REFERENCES filieres(id_filiere)
);


-- Table pour les épreuves (incluant le fichier PDF)
CREATE TABLE epreuves (
  id_epreuves INT AUTO_INCREMENT PRIMARY KEY,
  nom_epreuves VARCHAR(255) NOT NULL,
  matiere_id INT,
  annee INT,  -- Référence à l'année
  correction BOOLEAN, -- 0 pour épreuve, 1 pour non-épreuve
  file_name VARCHAR(255), -- Le nom du fichier (ex: maths_sujet_1.pdf)
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date d'ajout de l'épreuve
  FOREIGN KEY (matiere_id) REFERENCES matiere(id_matiere)
);


-- Insérer des données dans la table filieres
INSERT INTO filieres (nom_filiere, niveau) VALUES
('IGL', 1),
('Maths', 1),
('ARS', 2),
('SIN', 2);

-- Insérer des données dans la table matiere
INSERT INTO matiere (nom_matiere, filiere_id) VALUES
('Mathématiques', 1),
('Physique', 2),
('Informatique', 3),
('Chimie', 4);



-- Insérer des données dans la table epreuves (exemples d'épreuves)
INSERT INTO epreuves (nom_epreuves, matiere_id, annee, correction, file_name) 
VALUES 
('Épreuve de Mathématiques - Sujet 1', 1, 2022, 0, 'Maths_Sujet_1.pdf'),
('Épreuve de Mathématiques - Sujet 2', 1, 2022, 0, 'Maths_Sujet_2.pdf'),
('Épreuve de Physique - Sujet 1', 2, 2022, 0, 'Physique_Sujet_1.pdf'),
("Épreuve d'Informatique - Sujet 1", 3, 2024, 0, 'Informatique_Sujet_1.pdf'),
('Épreuve de Mathématiques - corrigé 1', 1, 2023, 1, 'Maths_Sujet_1.pdf'),
('Épreuve de Mathématiques - corrigé 2', 1, 2024, 1, 'Maths_Sujet_2.pdf');


DROP VIEW IF EXISTS vue_epreuves;

CREATE VIEW vue_epreuves AS
SELECT 
    e.id_epreuves,
    e.nom_epreuves,
    m.nom_matiere,
    f.nom_filiere,
    e.annee,
    e.correction,
    e.file_name,
    e.date_ajout
FROM 
    epreuves e
JOIN 
    matiere m ON e.matiere_id = m.id_matiere
JOIN 
    filieres f ON m.filiere_id = f.id_filiere;

SELECT*FROM vue_epreuves;