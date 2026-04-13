import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BrowsePage from "./pages/BrowsePage";
import DetailsPage from "./pages/DetailsPage";
import CollectionPage from "./pages/CollectionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/pokemon/:id" element={<DetailsPage />} />
        <Route path="/collection" element={<CollectionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
