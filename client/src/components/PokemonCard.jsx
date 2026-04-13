import { Link } from "react-router-dom";

export default function PokemonCard({ pokemon, onCatch }) {
  return (
    <div style={styles.card}>
      <img src={pokemon.image} alt={pokemon.name} />
      <h3 style={{ textTransform: "capitalize" }}>{pokemon.name}</h3>
      <p>{pokemon.types.join(", ")}</p>
      <div style={styles.buttons}>
        <Link to={`/pokemon/${pokemon.id}`}>
          <button>View Details</button>
        </Link>
        <button onClick={() => onCatch(pokemon)}>Catch</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
    background: "white"
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "12px"
  }
};