import { Link } from "react-router-dom";

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

export default function PokemonCard({ pokemon, onCatch }) {
  const primaryType = pokemon.types?.[0] || "normal";

  return (
    <div
      style={{
        ...styles.card,
        background: `linear-gradient(180deg, ${typeColors[primaryType] || "#ddd"} 0%, #ffffff 38%)`
      }}
    >
      <div style={styles.topRow}>
        <span style={styles.dexNumber}>#{pokemon.id}</span>
      </div>

      <div style={styles.imageWrap}>
        <img
          src={pokemon.image}
          alt={pokemon.name}
          style={styles.image}
        />
      </div>

      <h3 style={styles.name}>{pokemon.name}</h3>

      <div style={styles.typeRow}>
        {(pokemon.types || []).map((type) => (
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

      <div style={styles.buttonGroup}>
        <Link to={`/pokemon/${pokemon.id}`} style={styles.linkButtonWrap}>
          <button style={styles.secondaryButton}>View Details</button>
        </Link>
        <button onClick={() => onCatch(pokemon)} style={styles.primaryButton}>
          Catch
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
    border: "2px solid #f1f1f1",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.15s ease, box-shadow 0.15s ease"
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
    gap: "10px",
    marginTop: "auto"
  },
  linkButtonWrap: {
    flex: 1
  },
  primaryButton: {
    flex: 1,
    background: "#e3350d",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  secondaryButton: {
    width: "100%",
    background: "#2a75bb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};