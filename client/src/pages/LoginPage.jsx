import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const currentEmail = localStorage.getItem("pokedexUserEmail") || "";
  const [email, setEmail] = useState(currentEmail);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Please enter an email.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    localStorage.setItem("pokedexUserEmail", trimmedEmail);
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {currentEmail ? "Login / Switch Account" : "Login"}
        </h1>

        <p style={styles.text}>
          Enter your email to access your personal Pokédex collection.
          If this email has not been used before, a new collection will be created automatically.
        </p>

        {currentEmail && (
          <p style={styles.currentUser}>
            Currently logged in as: {currentEmail}
          </p>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            {currentEmail ? "Continue / Switch Account" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #ffcb05 0%, #e3350d 100%)",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    maxWidth: "560px",
    width: "100%",
    background: "#f8f9fa",
    borderRadius: "24px",
    padding: "36px 32px",
    textAlign: "center",
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    border: "4px solid white"
  },
  title: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "2rem",
    color: "#1d3557"
  },
  text: {
    marginBottom: "16px",
    lineHeight: 1.6,
    fontSize: "1rem"
  },
  currentUser: {
    marginBottom: "20px",
    fontWeight: "bold",
    color: "#444"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    width: "100%"
  },
  error: {
    margin: 0,
    color: "#c1121f",
    fontWeight: "bold"
  },
  button: {
    background: "#2a75bb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};