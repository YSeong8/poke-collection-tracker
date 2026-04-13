import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h1 style={styles.logo}>Pokédex Collection Tracker</h1>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Browse</Link>
        <Link to="/collection" style={styles.link}>My Collection</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "#e3350d",
    color: "white"
  },
  logo: {
    margin: 0,
    fontSize: "1.2rem"
  },
  links: {
    display: "flex",
    gap: "16px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold"
  }
};