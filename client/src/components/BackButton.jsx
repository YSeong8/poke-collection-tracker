import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
      ← Back
    </button>
  );
}