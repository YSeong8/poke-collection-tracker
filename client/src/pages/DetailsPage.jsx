import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import BackButton from "../components/BackButton";

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

export default function DetailsPage() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const email = localStorage.getItem("pokedexUserEmail");

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setError("");

        const pokemonRes = await API.get(`/pokemon/${id}`);
        setPokemon(pokemonRes.data);

        if (email) {
          const collectionRes = await API.get(
            `/collection?email=${encodeURIComponent(email)}`
          );

          const existing = collectionRes.data.find(
            (item) => Number(item.pokemonId) === Number(id)
          );

          if (existing) {
            setRating(existing.rating || 0);
            setNotes(existing.notes || "");
          } else {
            setRating(0);
            setNotes("");
          }
        } else {
          setRating(0);
          setNotes("");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load Pokémon details.");
      }
    };

    loadPokemon();
  }, [id, email]);

  const saveToCollection = async () => {
    if (!email) {
      alert("Please log in first.");
      return;
    }

    try {
      setSaving(true);

      await API.post("/collection", {
        email,
        pokemonId: pokemon.id,
        name: pokemon.name,
        image: pokemon.image,
        types: pokemon.types,
        rating,
        notes,
        caught: true
      });

      alert("Saved to collection");
    } catch (error) {
      console.error(error);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <p style={{ padding: "24px" }}>{error}</p>;
  }

  if (!pokemon) {
    return <p style={{ padding: "24px" }}>Loading Pokémon details...</p>;
  }

  const primaryType = pokemon.types?.[0] || "normal";

  return (
    <div
      style={{
        ...styles.page,
        background: `linear-gradient(180deg, ${typeColors[primaryType] || "#d62828"} 0%, #f8f9fa 60%)`
      }}
    >
      <div style={styles.container}>
        <BackButton />

        <div style={styles.hero}>
          <div style={styles.heroLeft}>
            <p style={styles.dexNumber}>#{pokemon.id}</p>
            <h2 style={styles.title}>{pokemon.name}</h2>

            <div style={styles.typeRow}>
              {pokemon.types.map((type) => (
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
          </div>

          <div style={styles.heroRight}>
            <img src={pokemon.image} alt={pokemon.name} style={styles.image} />
          </div>
        </div>

        {!email && (
          <p style={styles.loginNotice}>
            Please log in to save this Pokémon to a personal collection.
          </p>
        )}

        <div style={styles.section}>
          <h3>Abilities</h3>
          <p>{pokemon.abilities.join(", ")}</p>
        </div>

        <div style={styles.section}>
          <h3>Moves</h3>
          <p>{pokemon.moves.join(", ")}</p>
        </div>

        <div style={styles.section}>
          <h3>Stats</h3>
          <ul style={styles.list}>
            {pokemon.stats.map((stat) => (
              <li key={stat.name} style={{ textTransform: "capitalize" }}>
                {stat.name}: {stat.value}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.section}>
          <h3>Forms / Versions</h3>
          {pokemon.forms && pokemon.forms.length > 0 ? (
            <ul style={styles.list}>
              {pokemon.forms.map((form) => (
                <li key={form.name} style={{ textTransform: "capitalize" }}>
                  {form.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No alternate forms found.</p>
          )}
        </div>

        <div style={styles.section}>
          <h3>Your Collection Notes</h3>

          <div style={{ marginBottom: "14px" }}>
            <label>Rating (1-5): </label>
            <input
              type="number"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Notes:</label>
            <br />
            <textarea
              rows="5"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <button
            onClick={saveToCollection}
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Catch / Update Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px"
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "#f8f9fa",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "24px"
  },
  heroLeft: {
    flex: 1,
    minWidth: "240px"
  },
  heroRight: {
    minWidth: "180px",
    display: "flex",
    justifyContent: "center"
  },
  dexNumber: {
    margin: 0,
    fontWeight: "bold",
    color: "#444"
  },
  title: {
    marginTop: "8px",
    marginBottom: "14px",
    textTransform: "capitalize",
    fontSize: "2rem"
  },
  image: {
    width: "180px",
    height: "180px",
    imageRendering: "pixelated"
  },
  typeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  typeBadge: {
    color: "white",
    fontWeight: "bold",
    fontSize: "0.85rem",
    textTransform: "capitalize",
    borderRadius: "999px",
    padding: "6px 10px"
  },
  section: {
    background: "white",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  list: {
    marginBottom: 0
  },
  textarea: {
    width: "100%",
    maxWidth: "500px"
  },
  saveButton: {
    marginTop: "16px"
  },
  loginNotice: {
    background: "#fff3cd",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px"
  }
};