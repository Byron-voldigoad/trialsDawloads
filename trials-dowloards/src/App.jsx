import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Page d'ajout d'épreuve
import AddEpreuve from "./components/AddEpreuve";  //a Assurez-vous que ce fichier existe

const App = () => {
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [epreuves, setEpreuves] = useState([]);

  // États pour les filtres
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showCorrected, setShowCorrected] = useState(false); // Nouveau filtre pour les corrections
  const [currentPage, setCurrentPage] = useState("list");  // Contrôle de la page actuelle
  const [sortBy, setSortBy] = useState("nom_epreuves"); // Ajout de l'état sortBy

  // Chargement des données depuis l'API
  useEffect(() => {
    axios.get("http://localhost:5000/api/filieres")
      .then((response) => setFilieres(response.data))
      .catch((error) => console.log("Erreur lors du chargement des filières:", error));

    axios.get("http://localhost:5000/api/specialites")
      .then((response) => setSpecialites(response.data))
      .catch((error) => console.log("Erreur lors du chargement des spécialités:", error));

    axios.get("http://localhost:5000/api/epreuves")
      .then((response) => setEpreuves(response.data))
      .catch((error) => console.log("Erreur lors du chargement des épreuves:", error));
  }, []);

  // Filtrage des épreuves
  const filteredEpreuves = epreuves.filter((epreuve) => {
    const epreuveName = epreuve.nom_epreuves || '';
    const specialtyMatch = selectedSpecialty === "" || epreuve.nom_matiere === selectedSpecialty;
    const yearMatch = selectedYear === "" || epreuve.num_annee === selectedYear;
    const nameMatch = epreuveName.toLowerCase().includes(search.toLowerCase());
    const correctionMatch = showCorrected ? epreuve.correction === 1 : true; // Filtre des épreuves corrigées

    return nameMatch && specialtyMatch && yearMatch && correctionMatch;
  });

  // Tri des épreuves selon la valeur de sortBy
  const sortedEpreuves = filteredEpreuves.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  // Fonction de navigation vers la page d'ajout d'épreuve
  const navigateToAddEpreuve = () => {
    setCurrentPage("addEpreuve");
  };

  // Affichage des pages
  const renderPage = () => {
    if (currentPage === "addEpreuve") {
      return <AddEpreuve />;
    }

    return (
      <div>
        <div className="filters">
          <input
            type="text"
            placeholder="Nom de l'épreuve"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Toutes les spécialités</option>
            {specialites.map((specialty) => (
              <option key={specialty.nom_matiere} value={specialty.nom_matiere}>
                {specialty.nom_matiere}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)} // Mise à jour de sortBy
          >
            <option value="nom_epreuves">Nom de l'épreuve</option>
            <option value="num_annee">Année</option>
            <option value="nom_matiere">Matière</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={showCorrected}
              onChange={() => setShowCorrected(!showCorrected)}
            />
            Afficher uniquement les épreuves corrigées
          </label>
        </div>

        {/* Affichage sous forme de tableau */}
        <div className="epreuves-table">
          <table>
            <thead>
              <tr>
                <th>Nom de l'épreuve</th>
                <th>Filière</th>
                <th>Année</th>
              </tr>
            </thead>
            <tbody>
              {sortedEpreuves.length > 0 ? (
                sortedEpreuves.map((epreuve) => (
                  <tr key={epreuve.id_epreuves || epreuve.nom_epreuves}>
                    <td>{epreuve.nom_epreuves || 'Nom non disponible'}</td>
                    <td>{epreuve.nom_matiere || 'Filière non disponible'}</td>
                    <td>{epreuve.num_annee || 'Année non disponible'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Aucune épreuve trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button onClick={navigateToAddEpreuve}>Ajouter une épreuve</button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Téléchargement d'épreuves</h1>
      </header>
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
