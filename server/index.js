const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use(
  session({
    secret: "pokedex-secret-key-change-this-later",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const db = new sqlite3.Database("./server/pokedex.db");

function makeShareCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "TRAINER-";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function createUniqueShareCode(callback) {
  const tryCode = () => {
    const code = makeShareCode();
    db.get("SELECT id FROM users WHERE shareCode = ?", [code], (err, row) => {
      if (err) return callback(err);
      if (row) return tryCode();
      callback(null, code);
    });
  };

  tryCode();
}

function ensureUserTableColumns() {
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error("PRAGMA users error:", err.message);
      return;
    }

    const hasShareCode = columns.some((col) => col.name === "shareCode");

    const afterColumnReady = () => {
      db.run(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_shareCode ON users(shareCode)",
        [],
        (indexErr) => {
          if (indexErr) {
            console.error("Share code index error:", indexErr.message);
            return;
          }

          db.all(
            "SELECT id FROM users WHERE shareCode IS NULL OR shareCode = ''",
            [],
            (selectErr, rows) => {
              if (selectErr) {
                console.error("Backfill select error:", selectErr.message);
                return;
              }

              rows.forEach((user) => {
                createUniqueShareCode((codeErr, code) => {
                  if (codeErr) {
                    console.error("Backfill share code generation error:", codeErr.message);
                    return;
                  }

                  db.run(
                    "UPDATE users SET shareCode = ? WHERE id = ?",
                    [code, user.id],
                    (updateErr) => {
                      if (updateErr) {
                        console.error("Backfill update error:", updateErr.message);
                      }
                    }
                  );
                });
              });
            }
          );
        }
      );
    };

    if (!hasShareCode) {
      db.run("ALTER TABLE users ADD COLUMN shareCode TEXT", [], (alterErr) => {
        if (alterErr) {
          console.error("Add shareCode column error:", alterErr.message);
          return;
        }
        afterColumnReady();
      });
    } else {
      afterColumnReady();
    }
  });
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS collection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      pokemonId INTEGER NOT NULL,
      name TEXT NOT NULL,
      image TEXT,
      types TEXT,
      rating INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      caught INTEGER DEFAULT 1,
      UNIQUE(userId, pokemonId),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  ensureUserTableColumns();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

app.get("/api/session", (req, res) => {
  if (!req.session.user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: {
      id: req.session.user.id,
      email: req.session.user.email,
      shareCode: req.session.user.shareCode
    }
  });
});

app.post("/api/register", authLimiter, (req, res) => {
  const { email, password } = req.body;
  const safeEmail = String(email || "").trim().toLowerCase();
  const safePassword = String(password || "");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(safeEmail)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  if (safePassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  db.get("SELECT id FROM users WHERE email = ?", [safeEmail], async (err, existingUser) => {
    if (err) {
      console.error("Register lookup error:", err.message);
      return res.status(500).json({ error: "Failed to register user" });
    }

    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    try {
      const passwordHash = await bcrypt.hash(safePassword, 10);

      createUniqueShareCode((codeErr, shareCode) => {
        if (codeErr) {
          console.error("Share code generation error:", codeErr.message);
          return res.status(500).json({ error: "Failed to register user" });
        }

        db.run(
          "INSERT INTO users (email, passwordHash, shareCode) VALUES (?, ?, ?)",
          [safeEmail, passwordHash, shareCode],
          function (insertErr) {
            if (insertErr) {
              console.error("Register insert error:", insertErr.message);
              return res.status(500).json({ error: "Failed to register user" });
            }

            req.session.user = {
              id: this.lastID,
              email: safeEmail,
              shareCode
            };

            res.json({
              success: true,
              user: {
                id: this.lastID,
                email: safeEmail,
                shareCode
              }
            });
          }
        );
      });
    } catch (hashErr) {
      console.error("Password hash error:", hashErr.message);
      res.status(500).json({ error: "Failed to register user" });
    }
  });
});

app.post("/api/login", authLimiter, (req, res) => {
  const { email, password } = req.body;
  const safeEmail = String(email || "").trim().toLowerCase();
  const safePassword = String(password || "");

  db.get("SELECT * FROM users WHERE email = ?", [safeEmail], async (err, user) => {
    if (err) {
      console.error("Login lookup error:", err.message);
      return res.status(500).json({ error: "Failed to log in" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    try {
      const isMatch = await bcrypt.compare(safePassword, user.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        shareCode: user.shareCode
      };

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          shareCode: user.shareCode
        }
      });
    } catch (compareErr) {
      console.error("Password compare error:", compareErr.message);
      res.status(500).json({ error: "Failed to log in" });
    }
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
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

app.get("/api/collection", requireAuth, (req, res) => {
  db.all(
    "SELECT * FROM collection WHERE userId = ? ORDER BY pokemonId ASC",
    [req.session.user.id],
    (err, rows) => {
      if (err) {
        console.error("Collection load error:", err.message);
        return res.status(500).json({ error: "Failed to load collection" });
      }
      res.json(rows);
    }
  );
});

app.post("/api/collection", requireAuth, (req, res) => {
  const { pokemonId, name, image, types, rating, notes, caught } = req.body;

  if (!pokemonId || !name) {
    return res.status(400).json({ error: "pokemonId and name are required" });
  }

  const safeTypes = Array.isArray(types) ? JSON.stringify(types) : "[]";

  const sql = `
    INSERT INTO collection (userId, pokemonId, name, image, types, rating, notes, caught)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId, pokemonId) DO UPDATE SET
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
      req.session.user.id,
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

app.put("/api/collection/:pokemonId", requireAuth, (req, res) => {
  const { rating, notes, caught } = req.body;

  db.run(
    `
    UPDATE collection
    SET rating = ?, notes = ?, caught = ?
    WHERE userId = ? AND pokemonId = ?
    `,
    [Number(rating) || 0, notes || "", caught ? 1 : 0, req.session.user.id, req.params.pokemonId],
    function (err) {
      if (err) {
        console.error("Update error:", err.message);
        return res.status(500).json({ error: "Failed to update Pokémon" });
      }

      res.json({ success: true, changes: this.changes });
    }
  );
});

app.delete("/api/collection/:pokemonId", requireAuth, (req, res) => {
  db.run(
    "DELETE FROM collection WHERE userId = ? AND pokemonId = ?",
    [req.session.user.id, req.params.pokemonId],
    function (err) {
      if (err) {
        console.error("Delete error:", err.message);
        return res.status(500).json({ error: "Failed to delete Pokémon" });
      }

      res.json({ success: true, changes: this.changes });
    }
  );
});

app.get("/api/compare/:shareCode", requireAuth, (req, res) => {
  const shareCode = String(req.params.shareCode || "").trim().toUpperCase();

  db.get(
    "SELECT id, email, shareCode FROM users WHERE shareCode = ?",
    [shareCode],
    (userErr, otherUser) => {
      if (userErr) {
        console.error("Compare lookup error:", userErr.message);
        return res.status(500).json({ error: "Failed to compare collections" });
      }

      if (!otherUser) {
        return res.status(404).json({ error: "No user found with that share code" });
      }

      if (otherUser.id === req.session.user.id) {
        return res.status(400).json({ error: "Use another user’s share code to compare" });
      }

      db.all(
        "SELECT pokemonId, name, image, types, rating, notes FROM collection WHERE userId = ?",
        [req.session.user.id],
        (myErr, myRows) => {
          if (myErr) {
            console.error("My collection compare error:", myErr.message);
            return res.status(500).json({ error: "Failed to compare collections" });
          }

          db.all(
            "SELECT pokemonId, name, image, types, rating, notes FROM collection WHERE userId = ?",
            [otherUser.id],
            (otherErr, otherRows) => {
              if (otherErr) {
                console.error("Other collection compare error:", otherErr.message);
                return res.status(500).json({ error: "Failed to compare collections" });
              }

              const myMap = new Map(myRows.map((p) => [p.pokemonId, p]));
              const otherMap = new Map(otherRows.map((p) => [p.pokemonId, p]));

              const shared = myRows.filter((p) => otherMap.has(p.pokemonId));
              const onlyMine = myRows.filter((p) => !otherMap.has(p.pokemonId));
              const onlyTheirs = otherRows.filter((p) => !myMap.has(p.pokemonId));

              res.json({
                me: {
                  email: req.session.user.email,
                  shareCode: req.session.user.shareCode,
                  totalCaught: myRows.length
                },
                otherUser: {
                  shareCode: otherUser.shareCode,
                  totalCaught: otherRows.length
                },
                shared,
                onlyMine,
                onlyTheirs
              });
            }
          );
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});