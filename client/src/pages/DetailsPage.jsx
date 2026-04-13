import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function DetailsPage() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    API.get(`/pokemon/${id}`)
      .then((res) => setPokemon(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const saveToCollection = async () => {
    try {
      await API.post("/collection", {
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
    }
  };

  if (!pokemon) return <p style={{ padding: "24px" }}>Loading...</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ textTransform: "capitalize" }}>{pokemon.name}</h2>
      <img src={pokemon.image} alt={pokemon.name} />

      <p><strong>Types:</strong> {pokemon.types.join(", ")}</p>
      <p><strong>Abilities:</strong> {pokemon.abilities.join(", ")}</p>
      <p><strong>Moves:</strong> {pokemon.moves.join(", ")}</p>

      <h3>Stats</h3>
      <ul>
        {pokemon.stats.map((stat) => (
          <li key={stat.name}>
            {stat.name}: {stat.value}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <label>Rating (1-5): </label>
        <input
          type="number"
          min="0"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: "12px" }}>
        <label>Notes:</label>
        <br />
        <textarea
          rows="5"
          cols="40"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button onClick={saveToCollection} style={{ marginTop: "16px" }}>
        Save to Collection
      </button>
    </div>
  );
}