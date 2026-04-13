import { useEffect, useState } from "react";
import API from "../api";

export default function CollectionPage() {
  const [collection, setCollection] = useState([]);

  const loadCollection = async () => {
    try {
      const res = await API.get("/collection");
      setCollection(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCollection();
  }, []);

  const handleDelete = async (pokemonId) => {
    try {
      await API.delete(`/collection/${pokemonId}`);
      loadCollection();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>My Collection</h2>

      {collection.length === 0 ? (
        <p>No Pokémon caught yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}
        >
          {collection.map((p) => (
            <div
              key={p.pokemonId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                background: "white"
              }}
            >
              <img src={p.image} alt={p.name} />
              <h3 style={{ textTransform: "capitalize" }}>{p.name}</h3>
              <p><strong>Rating:</strong> {p.rating}</p>
              <p><strong>Notes:</strong> {p.notes || "None"}</p>
              <button onClick={() => handleDelete(p.pokemonId)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}