import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import PokemonCard from "../components/PokemonCard";

export default function BrowsePage() {
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [confettiSprites, setConfettiSprites] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const sessionRes = await API.get("/session");
        if (sessionRes.data.loggedIn) {
          setUser(sessionRes.data.user);
        } else {
          setUser(null);
        }
  
        const pokemonRes = await API.get("/pokemon");
        setPokemon(pokemonRes.data);
      } catch (err) {
        console.error(err);
        setUser(null);
        setPokemon([]);
      } finally {
        setLoading(false);
      }
    };
  
    loadPage();
  }, []);

  const triggerPokemonCelebration = (imageUrl, name) => {
    const spritePieces = Array.from({ length: 36 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.35;
      const distance = 220 + Math.random() * 420;

      return {
        id: `sprite-${Date.now()}-${i}`,
        image: imageUrl,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotate: Math.random() * 720 - 360,
        size: 72 + Math.random() * 48,
        duration: 2.6 + Math.random() * 1.2,
        delay: Math.random() * 0.18
      };
    });

    const sparklePieces = Array.from({ length: 26 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.5;
      const distance = 180 + Math.random() * 520;

      return {
        id: `sparkle-${Date.now()}-${i}`,
        symbol: i % 2 === 0 ? "✦" : "★",
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotate: Math.random() * 360 - 180,
        size: 22 + Math.random() * 26,
        duration: 2.3 + Math.random() * 1.3,
        delay: Math.random() * 0.22,
        color: i % 3 === 0 ? "#ffcb05" : i % 3 === 1 ? "#ffffff" : "#ffd166"
      };
    });

    setConfettiSprites(spritePieces);
    setSparkles(sparklePieces);
    setSuccessMessage(`${name} added to your collection!`);

    setTimeout(() => {
      setConfettiSprites([]);
      setSparkles([]);
    }, 4200);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2600);
  };

  const handleCatch = async (p) => {
    if (!user) {
      setSuccessMessage("Please log in first.");
      setTimeout(() => setSuccessMessage(""), 1800);
      return;
    }

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

      triggerPokemonCelebration(p.image, p.name);
    } catch (error) {
      console.error(error);
      setSuccessMessage("Failed to save Pokémon.");
      setTimeout(() => setSuccessMessage(""), 1800);
    }
  };

  const filtered = pokemon.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? p.types.includes(typeFilter) : true;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(pokemon.flatMap((p) => p.types || []))].sort();

  if (!loading && !user) {
    return (
      <div style={styles.page}>
        <div style={styles.panel}>
          <h2 style={styles.title}>Browse Pokémon</h2>
          <p style={{ marginBottom: "16px" }}>
            Please log in to browse and catch Pokémon.
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
        <h2 style={styles.title}>Browse Pokémon</h2>
        <p style={styles.subtitle}>
          Logged in as: {user ? user.email : "Loading..."}
        </p>

        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search Pokémon by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <p style={styles.resultsText}>
          Showing {filtered.length} Pokémon
        </p>

        {loading ? (
          <p>Loading Pokémon...</p>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No Pokémon matched your search.</p>
            <p style={{ marginBottom: 0 }}>
              Try a different name or clear the type filter.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((p) => (
              <PokemonCard key={p.id} pokemon={p} onCatch={handleCatch} />
            ))}
          </div>
        )}
      </div>

      {successMessage && <div style={styles.banner}>{successMessage}</div>}

      {confettiSprites.map((piece) => (
        <img
          key={piece.id}
          src={piece.image}
          alt=""
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            marginLeft: `-${piece.size / 2}px`,
            marginTop: `-${piece.size / 2}px`,
            pointerEvents: "none",
            zIndex: 9999,
            animationName: "pokemonBurst",
            animationDuration: `${piece.duration}s`,
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            animationDelay: `${piece.delay}s`,
            ["--dx"]: `${piece.dx}px`,
            ["--dy"]: `${piece.dy}px`,
            ["--rot"]: `${piece.rotate}deg`
          }}
        />
      ))}

      {sparkles.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            marginLeft: `-${piece.size / 2}px`,
            marginTop: `-${piece.size / 2}px`,
            pointerEvents: "none",
            zIndex: 9998,
            fontSize: `${piece.size}px`,
            lineHeight: 1,
            color: piece.color,
            textShadow: "0 0 10px rgba(255,255,255,0.65)",
            animationName: "sparkleBurst",
            animationDuration: `${piece.duration}s`,
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            animationDelay: `${piece.delay}s`,
            ["--dx"]: `${piece.dx}px`,
            ["--dy"]: `${piece.dy}px`,
            ["--rot"]: `${piece.rotate}deg`
          }}
        >
          {piece.symbol}
        </div>
      ))}

      <style>
        {`
          @keyframes pokemonBurst {
            0% {
              transform: translate(0px, 0px) scale(0.6) rotate(0deg);
              opacity: 1;
            }
            15% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--dx), var(--dy)) scale(1.15) rotate(var(--rot));
              opacity: 0;
            }
          }

          @keyframes sparkleBurst {
            0% {
              transform: translate(0px, 0px) scale(0.4) rotate(0deg);
              opacity: 1;
            }
            20% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--dx), var(--dy)) scale(1.35) rotate(var(--rot));
              opacity: 0;
            }
          }
        `}
      </style>
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
  subtitle: {
    marginTop: 0,
    marginBottom: "18px",
    fontWeight: "bold",
    color: "#444"
  },
  controls: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px"
  },
  input: {
    minWidth: "260px",
    flex: 1
  },
  select: {
    minWidth: "180px"
  },
  resultsText: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#555",
    fontWeight: "bold"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px"
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
  },
  banner: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#2a75bb",
    color: "white",
    padding: "14px 22px",
    borderRadius: "999px",
    fontWeight: "bold",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    zIndex: 10000
  }
};
