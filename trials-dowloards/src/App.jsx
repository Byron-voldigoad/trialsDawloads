import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddEpreuve from "./components/AddEpreuve"; // Assurez-vous que ce fichier existe

const App = () => {
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [epreuves, setEpreuves] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showCorrected, setShowCorrected] = useState(false);
  const [currentPage, setCurrentPage] = useState("list");
  const [sortBy, setSortBy] = useState("nom_epreuves");
  const [showModal, setShowModal] = useState(false);  // Nouvelle variable d'état pour la modal
  const [selectedEpreuve, setSelectedEpreuve] = useState(null); // Détails de l'épreuve sélectionnée

  // Chargement des données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [filieresRes, specialitesRes, epreuvesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/filieres"),
          axios.get("http://localhost:5000/api/specialites"),
          axios.get("http://localhost:5000/api/epreuves"),
        ]);
        setFilieres(filieresRes.data);
        setSpecialites(specialitesRes.data);
        setEpreuves(epreuvesRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Filtrage des épreuves
  const filteredEpreuves = epreuves.filter((epreuve) => {
    const epreuveName = epreuve.nom_epreuves || "";
    const specialtyMatch =
      selectedSpecialty === "" || epreuve.nom_matiere === selectedSpecialty;
    const yearMatch = selectedYear === "" || epreuve.annee === selectedYear;
    const nameMatch = epreuveName.toLowerCase().includes(search.toLowerCase());
    const correctionMatch = showCorrected ? epreuve.correction === 1 : true;
    return nameMatch && specialtyMatch && yearMatch && correctionMatch;
  });

  // Tri des épreuves
  const sortedEpreuves = filteredEpreuves.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });

  const navigateToAddEpreuve = () => {
    setCurrentPage("addEpreuve");
  };
  // Suppression d'une épreuve
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/epreuves/${id}`);
      setEpreuves((prevEpreuves) =>
        prevEpreuves.filter((epreuve) => epreuve.id_epreuves !== id)
      );
      alert("Épreuve supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'épreuve", error);
    }
  };

  // Mettre à jour une épreuve
  const handleUpdate = async (epreuve) => {
    try {
      await axios.put(`http://localhost:5000/api/epreuves/${epreuve.id_epreuves}`, {
        nom_epreuves: epreuve.nom_epreuves,
        nom_matiere: epreuve.nom_matiere,
        annee: epreuve.annee,
      });

      // Mise à jour dans l'état local
      setEpreuves((prevEpreuves) =>
        prevEpreuves.map((prevEpreuve) =>
          prevEpreuve.id_epreuves === epreuve.id_epreuves ? epreuve : prevEpreuve
        )
      );

      alert("Épreuve modifiée avec succès");
      closeModal(); // Fermer la modal après la mise à jour
    } catch (error) {
      console.error("Erreur lors de la modification de l'épreuve", error);
    }
  };

  // Afficher la modal avec les détails de l'épreuve
  const openModal = (epreuve) => {
    setSelectedEpreuve(epreuve);
    setShowModal(true);
  };

  // Fermer la modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedEpreuve(null);
  };

  // Rendu conditionnel
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
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="nom_epreuves">Nom de l'épreuve</option>
            <option value="annee">Année</option>
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

        <div className="epreuves-table">
          <table>
            <thead>
              <tr>
                <th>Nom de l'épreuve</th>
                <th>Filière</th>
                <th>Année</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEpreuves.length > 0 ? (
                sortedEpreuves.map((epreuve) => (
                  <tr key={epreuve.id_epreuves || epreuve.nom_epreuves}>
                    <td>{epreuve.nom_epreuves || "Nom non disponible"}</td>
                    <td>{epreuve.nom_matiere || "Filière non disponible"}</td>
                    <td>{epreuve.annee || "Année non disponible"}</td>
                    <td>
                      <button>
                        <a
                          href={`http://localhost:5000/PDF/${epreuve.file_name}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <DownloadIcon /> Télécharger
                        </a>
                      </button>
                      <button onClick={() => openModal(epreuve)}>
                        <EditIcon /> Modifier
                      </button>
                      <button onClick={() => handleDelete(epreuve.id_epreuves)}>
                        <DeleteIcon /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Aucune épreuve trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button onClick={navigateToAddEpreuve}>Ajouter une épreuve</button>

        {/* Modal pour afficher et modifier l'épreuve */}
        {showModal && selectedEpreuve && (
          <div className="modal">
            <div className="modal-content">
              <h2>Modifier l'épreuve</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(selectedEpreuve); // Mettre à jour l'épreuve au moment de la soumission
                }}
              >
                <div>
                  <label>Nom de l'épreuve:</label>
                  <input
                    type="text"
                    value={selectedEpreuve.nom_epreuves}
                    onChange={(e) =>
                      setSelectedEpreuve({
                        ...selectedEpreuve,
                        nom_epreuves: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Filière:</label>
                  <select
                    value={selectedEpreuve.nom_matiere}
                    onChange={(e) =>
                      setSelectedEpreuve({
                        ...selectedEpreuve,
                        nom_matiere: e.target.value,
                      })
                    }
                  >
                    {specialites.map((specialty) => (
                      <option key={specialty.nom_matiere} value={specialty.nom_matiere}>
                        {specialty.nom_matiere}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Année:</label>
                  <input
                    type="number"
                    value={selectedEpreuve.annee}
                    onChange={(e) =>
                      setSelectedEpreuve({
                        ...selectedEpreuve,
                        annee: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <button type="button" onClick={closeModal}>
                    Fermer
                  </button>
                  <button type="submit">Sauvegarder</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Téléchargement d'épreuves</h1>
      </header>
      <main>{renderPage()}</main>
    </div>
  );
};

export default App;
