const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./server/pokedex.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pokemonId INTEGER UNIQUE,
      name TEXT NOT NULL,
      image TEXT,
      types TEXT,
      rating INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      caught INTEGER DEFAULT 1
    )
  `);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.get("/api/pokemon", async (req, res) => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=300");
    const results = response.data.results;

    const detailed = await Promise.all(
      results.map(async (pokemon) => {
        const detailRes = await axios.get(pokemon.url);
        const data = detailRes.data;

        return {
          id: data.id,
          name: data.name,
          image: data.sprites.front_default,
          types: data.types.map((t) => t.type.name),
          stats: data.stats.map((s) => ({
            name: s.stat.name,
            value: s.base_stat
          }))
        };
      })
    );

    res.json(detailed);
  } catch (error) {
    console.error("Error fetching pokemon:", error.message);
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

app.get("/api/pokemon/:id", async (req, res) => {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.id}`);
    const data = response.data;

    const speciesRes = await axios.get(data.species.url);
    const speciesData = speciesRes.data;

    const forms = speciesData.varieties.map((v) => ({
      name: v.pokemon.name,
      url: v.pokemon.url
    }));

    res.json({
      id: data.id,
      name: data.name,
      image: data.sprites.front_default,
      types: data.types.map((t) => t.type.name),
      abilities: data.abilities.map((a) => a.ability.name),
      moves: data.moves.slice(0, 10).map((m) => m.move.name),
      stats: data.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      forms
    });
  } catch (error) {
    console.error("Error fetching Pokémon details:", error.message);
    res.status(500).json({ error: "Failed to fetch Pokémon details" });
  }
});

app.get("/api/collection", (req, res) => {
  db.all("SELECT * FROM collection ORDER BY pokemonId ASC", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to load collection" });
    }
    res.json(rows);
  });
});

app.post("/api/collection", (req, res) => {
  const { pokemonId, name, image, types, rating, notes, caught } = req.body;

  const sql = `
    INSERT INTO collection (pokemonId, name, image, types, rating, notes, caught)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pokemonId) DO UPDATE SET
      name=excluded.name,
      image=excluded.image,
      types=excluded.types,
      rating=excluded.rating,
      notes=excluded.notes,
      caught=excluded.caught
  `;

  db.run(
    sql,
    [
      pokemonId,
      name,
      image,
      JSON.stringify(types || []),
      rating || 0,
      notes || "",
      caught ? 1 : 0
    ],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Failed to save Pokémon" });
      }
      res.json({ success: true });
    }
  );
});

app.put("/api/collection/:pokemonId", (req, res) => {
  const { rating, notes, caught } = req.body;

  const sql = `
    UPDATE collection
    SET rating = ?, notes = ?, caught = ?
    WHERE pokemonId = ?
  `;

  db.run(sql, [rating || 0, notes || "", caught ? 1 : 0, req.params.pokemonId], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to update Pokémon" });
    }
    res.json({ success: true, changes: this.changes });
  });
});

app.delete("/api/collection/:pokemonId", (req, res) => {
  db.run("DELETE FROM collection WHERE pokemonId = ?", [req.params.pokemonId], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to delete Pokémon" });
    }
    res.json({ success: true, changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});