import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

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
  }, []);

  const copyShareCode = async () => {
    if (!user?.shareCode) return;

    try {
      await navigator.clipboard.writeText(user.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pokédex Collection Tracker</h1>

        <p style={styles.text}>
          Browse Pokémon, view their stats, and build your own personal collection.
        </p>

        {user ? (
          <>
            <p style={styles.email}>Logged in as: {user.email}</p>

            <div style={styles.shareBox}>
              <p style={styles.shareLabel}>Your Share Code</p>
              <div style={styles.shareRow}>
                <span style={styles.shareCode}>{user.shareCode}</span>
                <button onClick={copyShareCode} style={styles.copyButton}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p style={styles.shareHelp}>
                Share this code with another user if you want to compare collections.
              </p>
            </div>
          </>
        ) : (
          <p style={styles.email}>You are not logged in yet.</p>
        )}

        <div style={styles.buttonGroup}>
          <Link to="/browse">
            <button style={styles.primaryButton}>Browse Pokémon</button>
          </Link>
          <Link to="/collection">
            <button style={styles.secondaryButton}>My Collection</button>
          </Link>
          <Link to="/login">
            <button style={styles.tertiaryButton}>
              {user ? "Switch Account" : "Login"}
            </button>
          </Link>
        </div>

        <p style={styles.footerNote}>
          Track your favorites, rate the ones you have caught, and build a personal Pokédex with a secure account.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1d3557 0%, #457b9d 100%)",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#f8f9fa",
    borderRadius: "24px",
    padding: "40px 32px",
    maxWidth: "720px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    border: "4px solid white"
  },
  title: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "2.2rem",
    color: "#1d3557"
  },
  text: {
    marginBottom: "16px",
    lineHeight: 1.6,
    fontSize: "1.05rem"
  },
  email: {
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#444"
  },
  shareBox: {
    background: "white",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  shareLabel: {
    margin: "0 0 10px 0",
    fontWeight: "bold",
    color: "#555"
  },
  shareRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  shareCode: {
    background: "#1d3557",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "bold",
    letterSpacing: "0.05em"
  },
  copyButton: {
    background: "#2a75bb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  shareHelp: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#666",
    lineHeight: 1.4
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryButton: {
    background: "#e3350d",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  secondaryButton: {
    background: "#2a75bb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  tertiaryButton: {
    background: "#ffcb05",
    color: "#1d3557",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  footerNote: {
    marginTop: "24px",
    color: "#555",
    lineHeight: 1.5
  }
};