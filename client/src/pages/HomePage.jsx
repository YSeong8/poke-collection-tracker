import { Link } from "react-router-dom";

export default function HomePage() {
  const email = localStorage.getItem("pokedexUserEmail");

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pokédex Collection Tracker</h1>

        <p style={styles.text}>
          Browse Pokémon, view their stats, and build your own personal collection.
        </p>

        {email ? (
          <p style={styles.email}>Logged in as: {email}</p>
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
              {email ? "Switch Account" : "Login"}
            </button>
          </Link>
        </div>

        <p style={styles.footerNote}>
          Track your favorites, rate the ones you have caught, and build a personal Pokédex by email.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #ffcb05 0%, #2a75bb 100%)",
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
    marginBottom: "24px",
    fontWeight: "bold",
    color: "#444"
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