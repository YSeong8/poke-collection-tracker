import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/session")
      .then((res) => {
        if (res.data.loggedIn) {
          setCurrentUser(res.data.user);
          setEmail(res.data.user.email);
        } else {
          setCurrentUser(null);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter an email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const endpoint = mode === "register" ? "/register" : "/login";

      await API.post(endpoint, {
        email: trimmedEmail,
        password
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {mode === "register" ? "Create Account" : "Login"}
        </h1>

        <p style={styles.text}>
          Create a secure account with your email and password, or log in to access your private Pokédex collection.
        </p>

        {currentUser && (
          <p style={styles.currentUser}>
            Currently logged in as: {currentUser.email}
          </p>
        )}

        <div style={styles.switchRow}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            style={{
              ...styles.switchButton,
              ...(mode === "login" ? styles.activeSwitch : {})
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            style={{
              ...styles.switchButton,
              ...(mode === "register" ? styles.activeSwitch : {})
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder={mode === "register" ? "Create a password" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {mode === "register" && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading
              ? mode === "register"
                ? "Creating account..."
                : "Logging in..."
              : mode === "register"
                ? "Create Account"
                : "Login"}
          </button>
        </form>
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
    marginBottom: "18px",
    fontWeight: "bold",
    color: "#444"
  },
  switchRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "18px"
  },
  switchButton: {
    background: "#d9d9d9",
    color: "#1d3557",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  activeSwitch: {
    background: "#2a75bb",
    color: "white"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    width: "100%"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "flex-start",
    fontWeight: "bold",
    color: "#444"
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