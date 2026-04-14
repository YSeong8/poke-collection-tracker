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
      email TEXT NOT NULL,
      pokemonId INTEGER NOT NULL,
      name TEXT NOT NULL,
      image TEXT,
      types TEXT,
      rating INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      caught INTEGER DEFAULT 1,
      UNIQUE(email, pokemonId)
    )
  `);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.get("/api/pokemon", async (req, res) => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=151");
    const results = response.data.results;

    const basicPokemon = await Promise.all(
      results.map(async (pokemon) => {
        const detailRes = await axios.get(pokemon.url);
        const data = detailRes.data;

        return {
          id: data.id,
          name: data.name,
          image: data.sprites.front_default,
          types: data.types.map((t) => t.type.name)
        };
      })
    );

    res.json(basicPokemon);
  } catch (error) {
    console.error("Error fetching pokemon list:", error.message);
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

app.get("/api/pokemon/:id", async (req, res) => {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.id}`);
    const data = response.data;

    let forms = [];
    try {
      const speciesRes = await axios.get(data.species.url);
      const speciesData = speciesRes.data;

      if (Array.isArray(speciesData.varieties)) {
        forms = speciesData.varieties.map((v) => ({
          name: v.pokemon.name,
          url: v.pokemon.url
        }));
      }
    } catch (speciesError) {
      console.error("Species lookup failed:", speciesError.message);
    }

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
  const email = (req.query.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.all(
    "SELECT * FROM collection WHERE email = ? ORDER BY pokemonId ASC",
    [email],
    (err, rows) => {
      if (err) {
        console.error("Collection load error:", err.message);
        return res.status(500).json({ error: "Failed to load collection" });
      }
      res.json(rows);
    }
  );
});

app.post("/api/collection", (req, res) => {
  console.log("POST /api/collection body:", req.body);

  const { email, pokemonId, name, image, types, rating, notes, caught } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!pokemonId || !name) {
    return res.status(400).json({ error: "pokemonId and name are required" });
  }

  const safeEmail = String(email).trim().toLowerCase();
  const safeTypes = Array.isArray(types) ? JSON.stringify(types) : "[]";

  const sql = `
    INSERT INTO collection (email, pokemonId, name, image, types, rating, notes, caught)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(email, pokemonId) DO UPDATE SET
      name = excluded.name,
      image = excluded.image,
      types = excluded.types,
      rating = excluded.rating,
      notes = excluded.notes,
      caught = excluded.caught
  `;

  db.run(
    sql,
    [
      safeEmail,
      pokemonId,
      name,
      image || "",
      safeTypes,
      Number(rating) || 0,
      notes || "",
      caught ? 1 : 0
    ],
    function (err) {
      if (err) {
        console.error("Save error:", err.message);
        return res.status(500).json({ error: "Failed to save Pokémon" });
      }

      res.json({ success: true, changes: this.changes });
    }
  );
});

app.put("/api/collection/:pokemonId", (req, res) => {
  const { email, rating, notes, caught } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const safeEmail = String(email).trim().toLowerCase();

  db.run(
    `
    UPDATE collection
    SET rating = ?, notes = ?, caught = ?
    WHERE email = ? AND pokemonId = ?
    `,
    [Number(rating) || 0, notes || "", caught ? 1 : 0, safeEmail, req.params.pokemonId],
    function (err) {
      if (err) {
        console.error("Update error:", err.message);
        return res.status(500).json({ error: "Failed to update Pokémon" });
      }

      res.json({ success: true, changes: this.changes });
    }
  );
});

app.delete("/api/collection/:pokemonId", (req, res) => {
  const email = (req.query.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.run(
    "DELETE FROM collection WHERE email = ? AND pokemonId = ?",
    [email, req.params.pokemonId],
    function (err) {
      if (err) {
        console.error("Delete error:", err.message);
        return res.status(500).json({ error: "Failed to delete Pokémon" });
      }

      res.json({ success: true, changes: this.changes });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});