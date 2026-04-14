import { Link, useNavigate } from "react-router-dom";
import pokemonLogo from "../assets/pokemon-logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem("pokedexUserEmail");

  const handleLogout = () => {
    localStorage.removeItem("pokedexUserEmail");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <img src={pokemonLogo} alt="Pokémon logo" style={styles.logoImage} />
        <span style={styles.brandText}>Collection Tracker</span>
      </Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/browse" style={styles.link}>Browse</Link>
        <Link to="/collection" style={styles.link}>My Collection</Link>

        <Link to="/login" style={styles.link}>
          {email ? "Switch Account" : "Login"}
        </Link>

        {email && <span style={styles.email}>{email}</span>}

        {email && (
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    background: "linear-gradient(90deg, #e3350d, #2a75bb)",
    color: "white",
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
    flexWrap: "wrap",
    gap: "14px",
    borderBottom: "3px solid #ffcb05"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "white"
  },
  logoImage: {
    height: "42px",
    width: "auto",
    display: "block",
    borderRadius: "6px"
  },
  brandText: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
  },
  links: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  },
  email: {
    fontSize: "0.92rem",
    background: "rgba(255,255,255,0.15)",
    padding: "6px 10px",
    borderRadius: "999px"
  },
  logoutButton: {
    background: "#ffcb05",
    color: "#1d3557",
    border: "none",
    borderRadius: "10px",
    padding: "10px 12px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};