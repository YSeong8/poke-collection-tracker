import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ComparePage() {
  const [user, setUser] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCodes, setSavedCodes] = useState([]);
  const [editingCode, setEditingCode] = useState(null);
  const [nicknameInput, setNicknameInput] = useState("");

  useEffect(() => {
    API.get("/session")
      .then((res) => {
        if (res.data.loggedIn) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setUser(null);
      });

    const stored = localStorage.getItem("savedCompareCodes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          // Backward compatibility with old string-only saved codes
          const normalized = parsed.map((item) =>
            typeof item === "string"
              ? { code: item, nickname: "" }
              : { code: item.code, nickname: item.nickname || "" }
          );
          setSavedCodes(normalized);
        } else {
          setSavedCodes([]);
        }
      } catch {
        setSavedCodes([]);
      }
    }
  }, []);

  const persistCodes = (codes) => {
    setSavedCodes(codes);
    localStorage.setItem("savedCompareCodes", JSON.stringify(codes));
  };

  const saveCode = (code) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    const alreadyExists = savedCodes.some((item) => item.code === normalized);
    if (alreadyExists) return;

    persistCodes([{ code: normalized, nickname: "" }, ...savedCodes]);
  };

  const removeCode = (codeToRemove) => {
    const updated = savedCodes.filter((item) => item.code !== codeToRemove);
    persistCodes(updated);

    if (editingCode === codeToRemove) {
      setEditingCode(null);
      setNicknameInput("");
    }
  };

  const startNicknameEdit = (item) => {
    setEditingCode(item.code);
    setNicknameInput(item.nickname || "");
  };

  const saveNickname = (code) => {
    const updated = savedCodes.map((item) =>
      item.code === code
        ? { ...item, nickname: nicknameInput.trim() }
        : item
    );

    persistCodes(updated);
    setEditingCode(null);
    setNicknameInput("");
  };

  const runCompare = async (code) => {
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      setError("Please enter a share code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await API.get(`/compare/${encodeURIComponent(trimmed)}`);
      setResult(res.data);
      setShareCode(trimmed);
      saveCode(trimmed);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to compare collections.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    runCompare(shareCode);
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.panel}>
          <h2 style={styles.title}>Compare Collections</h2>
          <p style={{ marginBottom: "16px" }}>
            Please log in to compare your collection with another user.
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
        <h2 style={styles.title}>Compare Collections</h2>
        <p style={styles.subtitle}>Logged in as: {user.email}</p>

        <form onSubmit={handleCompare} style={styles.form}>
          <input
            type="text"
            placeholder="Enter another user's share code"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value.toUpperCase())}
            style={styles.input}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Comparing..." : "Compare"}
          </button>
        </form>

        {savedCodes.length > 0 && (
          <div style={styles.savedSection}>
            <h3 style={styles.savedTitle}>Saved Compare Codes</h3>
            <div style={styles.savedList}>
              {savedCodes.map((item) => (
                <div key={item.code} style={styles.savedCodeCard}>
                  <div style={styles.savedCodeInfo}>
                    <button
                      onClick={() => runCompare(item.code)}
                      style={styles.savedCodeButton}
                    >
                      {item.nickname
                        ? `${item.nickname} (${item.code})`
                        : item.code}
                    </button>

                    {editingCode === item.code ? (
                      <div style={styles.nicknameEditor}>
                        <input
                          type="text"
                          placeholder="Enter nickname"
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          style={styles.nicknameInput}
                        />
                        <button
                          onClick={() => saveNickname(item.code)}
                          style={styles.smallButton}
                        >
                          Save Nickname
                        </button>
                        <button
                          onClick={() => {
                            setEditingCode(null);
                            setNicknameInput("");
                          }}
                          style={styles.smallButtonSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={styles.savedActions}>
                        <button
                          onClick={() => startNicknameEdit(item)}
                          style={styles.smallButton}
                        >
                          {item.nickname ? "Edit Nickname" : "Add Nickname"}
                        </button>
                        <button
                          onClick={() => removeCode(item.code)}
                          style={styles.removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div style={styles.results}>
            <div style={styles.summaryCard}>
              <h3>Comparison Summary</h3>
              <p><strong>Your share code:</strong> {result.me.shareCode}</p>
              <p><strong>Other user:</strong> {result.otherUser.shareCode}</p>
              <p><strong>You caught:</strong> {result.me.totalCaught}</p>
              <p><strong>They caught:</strong> {result.otherUser.totalCaught}</p>
              <p><strong>Shared Pokémon:</strong> {result.shared.length}</p>
            </div>

            <div style={styles.section}>
              <h3>Shared Pokémon</h3>
              {result.shared.length === 0 ? (
                <p>No shared Pokémon yet.</p>
              ) : (
                <ul style={styles.list}>
                  {result.shared.map((p) => (
                    <li key={p.pokemonId} style={{ textTransform: "capitalize" }}>
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={styles.section}>
              <h3>Only You Have</h3>
              {result.onlyMine.length === 0 ? (
                <p>None.</p>
              ) : (
                <ul style={styles.list}>
                  {result.onlyMine.map((p) => (
                    <li key={p.pokemonId} style={{ textTransform: "capitalize" }}>
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={styles.section}>
              <h3>Only They Have</h3>
              {result.onlyTheirs.length === 0 ? (
                <p>None.</p>
              ) : (
                <ul style={styles.list}>
                  {result.onlyTheirs.map((p) => (
                    <li key={p.pokemonId} style={{ textTransform: "capitalize" }}>
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #6a4c93 0%, #1982c4 100%)",
    padding: "24px"
  },
  panel: {
    maxWidth: "1000px",
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
  form: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px"
  },
  input: {
    minWidth: "280px",
    flex: 1
  },
  savedSection: {
    background: "white",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  savedTitle: {
    marginTop: 0,
    marginBottom: "12px"
  },
  savedList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  savedCodeCard: {
    background: "#f7f7f7",
    borderRadius: "12px",
    padding: "12px"
  },
  savedCodeInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  savedCodeButton: {
    background: "#2a75bb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "left"
  },
  savedActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  nicknameEditor: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  nicknameInput: {
    minWidth: "220px",
    flex: 1
  },
  smallButton: {
    background: "#3a86ff",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  smallButtonSecondary: {
    background: "#999",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  removeButton: {
    background: "#c1121f",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  error: {
    color: "#c1121f",
    fontWeight: "bold"
  },
  results: {
    display: "grid",
    gap: "16px"
  },
  summaryCard: {
    background: "white",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  section: {
    background: "white",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  list: {
    marginBottom: 0
  }
};