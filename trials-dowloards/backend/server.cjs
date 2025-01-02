const mysql = require("mysql2");
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const path = require("path");

const app = express();
const port = 5000;

// Configuration de multer pour le stockage local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public", "PDF");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Utilise le nom original du fichier
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF sont autorisés"));
    }
  },
});

// Connecter à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ou ton utilisateur MySQL
  password: '', // ton mot de passe MySQL
  database: 'trialDowloard_db', // Nom de la base de données
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Middleware pour gérer CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET, POST',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true, // Assurez-vous de gérer les cookies et les entêtes
}));

// Middleware pour analyser le corps des requêtes JSON et URL-encodées
app.use(express.json()); // Pour analyser les corps JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les corps URL-encodés

// Servir les fichiers PDF statiques
app.use('/PDF', express.static(path.join(__dirname, '../public', 'PDF')));

app.post('/api/epreuves', upload.single('file'), (req, res) => {
  const { nom_epreuves, matiere_id, annee, is_correction } = req.body;
  const fileName = req.file.originalname; // Nom du fichier d'origine (et non le nom généré)

  // Vérifier si le fichier existe déjà dans la base de données
  const checkQuery = 'SELECT * FROM epreuves WHERE file_name = ?';
  
  db.query(checkQuery, [fileName], (err, results) => {
    if (err) {
      console.error("Erreur lors de la vérification du fichier:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      // Si le fichier existe déjà, renvoyer un message d'erreur
      return res.status(400).json({ message: 'Ce fichier existe déjà dans la base de données.' });
    }

    // Si le fichier n'existe pas, procéder à l'ajout
    const insertQuery = 'INSERT INTO epreuves (nom_epreuves, matiere_id, annee_id, correction, file_name) VALUES (?, ?, ?, ?, ?)';
    const values = [nom_epreuves, matiere_id, annee, is_correction, fileName];

    db.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("Erreur lors de l'ajout de l'épreuve:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Epreuve ajoutée avec succès' });
    });
  });
});

// Route pour obtenir les filières
app.get('/api/filieres', (req, res) => {
  db.query('SELECT * FROM filieres', (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des filières:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Route pour obtenir les spécialités
app.get('/api/specialites', (req, res) => {
  db.query('SELECT * FROM matiere', (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des spécialités:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Route pour obtenir les épreuves avec fichiers
app.get('/api/epreuves', (req, res) => {
  const query = 'SELECT*FROM vue_epreuves';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des épreuves:", err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
