import React, { useState, useEffect } from "react";
import axios from "axios";
import './AddEpreuve.css'; // Assurez-vous que le chemin est correct

const AddEpreuve = () => {
  const [nomEpreuve, setNomEpreuve] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("");
  const [selectedYear, setSelectedYear] = useState("");  // Ici, nous laisserons l'utilisateur remplir l'année
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" ou "error"
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [isCorrection, setIsCorrection] = useState(false);  // État pour la checkbox de correction

  // Fonction pour récupérer les données de la base de données
  const fetchData = async () => {
    try {
      const filieresResponse = await axios.get("http://localhost:5000/api/filieres");
      const specialitesResponse = await axios.get("http://localhost:5000/api/specialites"); // Remplacez par le bon endpoint

      setFilieres(filieresResponse.data);
      setSpecialites(specialitesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données : ", error);
    }
  };

  // Charger les données dès que le composant est monté
  useEffect(() => {
    fetchData();
  }, []);

  // Fonction pour gérer la sélection du fichier
  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Fonction pour envoyer les données au serveur
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier PDF.");
      setMessageType("error"); // Type d'erreur
      return;
    }

    const formData = new FormData();
    formData.append("nom_epreuves", nomEpreuve);
    formData.append("file", selectedFile);
    formData.append("filiere_id", selectedFiliere);
    formData.append("matiere_id", selectedSpecialite);
    formData.append("annee", selectedYear);  // Envoie de l'année saisie par l'utilisateur
    formData.append("is_correction", isCorrection ? 1 : 0);  // Ajout de la valeur de correction

    try {
      const response = await axios.post("http://localhost:5000/api/epreuves", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Epreuve ajoutée avec succès !");
      setMessageType("success"); // Type succès
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage(error.response.data.message);  // Message d'erreur venant du backend
        setMessageType("error"); // Type erreur
      } else {
        setMessage("Erreur lors de l'ajout de l'épreuve.");
        setMessageType("error"); // Type erreur
      }
      console.error(error);
    }
  };

  return (
    <div className="add-epreuve-form">
      <h2>Ajouter une épreuve</h2>
      {message && (
        <p className={messageType === "success" ? "success-message" : "error-message"}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom de l'épreuve</label>
          <input
            type="text"
            value={nomEpreuve}
            onChange={(e) => setNomEpreuve(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Filière</label>
          <select
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            required
          >
            <option value="">Sélectionner une filière</option>
            {filieres.map(filiere => (
              <option key={filiere.id_filiere} value={filiere.id_filiere}>
                {filiere.nom_filiere}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Spécialité</label>
          <select
            value={selectedSpecialite}
            onChange={(e) => setSelectedSpecialite(e.target.value)}
            required
          >
            <option value="">Sélectionner une spécialité</option>
            {specialites.map(specialite => (
              <option key={specialite.id_matiere} value={specialite.id_matiere}>
                {specialite.nom_matiere}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Année</label>
          <input
            type="number"  // Champ texte pour l'année
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            required
            placeholder="Entrez l'année"
          />
        </div>
        <div>
          <label>Fichier PDF</label>
          <input type="file" onChange={onFileChange} accept="application/pdf" required />
        </div>
        <div>
          <label>Correction</label>
          <input 
            type="checkbox" 
            checked={isCorrection} 
            onChange={(e) => setIsCorrection(e.target.checked)} 
          />
        </div>
        <button type="submit">Ajouter l'épreuve</button>
      </form>
    </div>
  );
};

export default AddEpreuve;
