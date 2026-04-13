import { useEffect, useState } from "react";
import API from "../api";
import PokemonCard from "../components/PokemonCard";

export default function BrowsePage() {
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    API.get("/pokemon")
      .then((res) => setPokemon(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCatch = async (p) => {
    try {
      await API.post("/collection", {
        pokemonId: p.id,
        name: p.name,
        image: p.image,
        types: p.types,
        rating: 0,
        notes: "",
        caught: true
      });
      alert(`${p.name} added to your collection`);
    } catch (error) {
      console.error(error);
      alert("Failed to save Pokémon");
    }
  };

  const filtered = pokemon.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? p.types.includes(typeFilter) : true;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(pokemon.flatMap((p) => p.types))].sort();

  return (
    <div style={{ padding: "24px" }}>
      <h2>Browse Pokémon</h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search Pokémon"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px"
        }}
      >
        {filtered.map((p) => (
          <PokemonCard key={p.id} pokemon={p} onCatch={handleCatch} />
        ))}
      </div>
    </div>
  );
}