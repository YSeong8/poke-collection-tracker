import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD"
};

export default function CollectionPage() {
  const [collection, setCollection] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  const email = localStorage.getItem("pokedexUserEmail");

  const loadCollection = async () => {
    if (!email) return;

    try {
      const res = await API.get(`/collection?email=${encodeURIComponent(email)}`);
      setCollection(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCollection();
  }, [email]);

  const handleDelete = async (pokemonId) => {
    try {
      await API.delete(`/collection/${pokemonId}?email=${encodeURIComponent(email)}`);
      loadCollection();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (pokemon) => {
    setEditingId(pokemon.pokemonId);
    setEditRating(pokemon.rating || 0);
    setEditNotes(pokemon.notes || "");
  };

  const saveEdit = async (pokemonId) => {
    try {
      await API.put(`/collection/${pokemonId}`, {
        email,
        rating: editRating,
        notes: editNotes,
        caught: true
      });

      setEditingId(null);
      loadCollection();
    } catch (error) {
      console.error(error);
      alert("Failed to update Pokémon");
    }
  };

  if (!email) {
    return (
      <div style={styles.page}>
        <div style={styles.panel}>
          <h2 style={styles.title}>My Collection</h2>
          <p style={{ marginBottom: "16px" }}>
            Please log in to view and manage your personal Pokémon collection.
          </p>
          <Link to="/login">
            <button>Go to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <h2 style={styles.title}>My Collection</h2>
        <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
          Logged in as: {email}
        </p>
        <p style={{ marginBottom: "20px", fontWeight: "bold" }}>
          Caught {collection.length} / 151 Pokémon
        </p>

        {collection.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No Pokémon caught yet.</p>
            <p style={{ marginBottom: "16px" }}>
              Go to the Browse page to start building your personal collection.
            </p>
            <Link to="/browse">
              <button>Go to Browse</button>
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {collection.map((p) => {
              let parsedTypes = [];
              try {
                parsedTypes = p.types ? JSON.parse(p.types) : [];
              } catch {
                parsedTypes = [];
              }

              const primaryType = parsedTypes[0] || "normal";

              return (
                <div
                  key={p.pokemonId}
                  style={{
                    ...styles.card,
                    background: `linear-gradient(180deg, ${typeColors[primaryType] || "#ddd"} 0%, #ffffff 38%)`
                  }}
                >
                  <div style={styles.topRow}>
                    <span style={styles.dexNumber}>#{p.pokemonId}</span>
                  </div>

                  <div style={styles.imageWrap}>
                    <img src={p.image} alt={p.name} style={styles.image} />
                  </div>

                  <h3 style={styles.name}>{p.name}</h3>

                  <div style={styles.typeRow}>
                    {parsedTypes.map((type) => (
                      <span
                        key={type}
                        style={{
                          ...styles.typeBadge,
                          backgroundColor: typeColors[type] || "#999"
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {editingId === p.pokemonId ? (
                    <>
                      <div style={{ marginBottom: "12px" }}>
                        <label>
                          <strong>Rating:</strong>{" "}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label>
                          <strong>Notes:</strong>
                        </label>
                        <br />
                        <textarea
                          rows="4"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          style={{ width: "100%" }}
                        />
                      </div>

                      <div style={styles.buttonGroup}>
                        <button onClick={() => saveEdit(p.pokemonId)}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Rating:</strong> {p.rating}</p>
                      <p><strong>Notes:</strong> {p.notes || "None"}</p>

                      <div style={styles.buttonGroup}>
                        <button onClick={() => startEdit(p)}>Edit</button>
                        <button onClick={() => handleDelete(p.pokemonId)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1d3557 0%, #457b9d 100%)",
    padding: "24px"
  },
  panel: {
    maxWidth: "1300px",
    margin: "0 auto",
    background: "#f8f9fa",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
  },
  title: {
    marginTop: 0,
    marginBottom: "8px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px"
  },
  card: {
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
    border: "2px solid #f1f1f1",
    minHeight: "360px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  topRow: {
    display: "flex",
    justifyContent: "flex-end"
  },
  dexNumber: {
    fontWeight: "bold",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "0.9rem"
  },
  imageWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0"
  },
  image: {
    width: "120px",
    height: "120px",
    imageRendering: "pixelated"
  },
  name: {
    margin: "8px 0 10px 0",
    textAlign: "center",
    textTransform: "capitalize",
    fontSize: "1.2rem"
  },
  typeRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "14px"
  },
  typeBadge: {
    color: "white",
    fontWeight: "bold",
    fontSize: "0.8rem",
    textTransform: "capitalize",
    borderRadius: "999px",
    padding: "6px 10px"
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "12px"
  },
  emptyState: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  emptyTitle: {
    marginTop: 0,
    marginBottom: "12px",
    fontWeight: "bold"
  }
};