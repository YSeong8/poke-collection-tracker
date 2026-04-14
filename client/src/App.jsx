import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import BrowsePage from "./pages/BrowsePage";
import DetailsPage from "./pages/DetailsPage";
import CollectionPage from "./pages/CollectionPage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/pokemon/:id" element={<DetailsPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  );
}