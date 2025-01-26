import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import MenuPage from "./pages/Menu";
import PacmanGame from "./pages/PacMan";

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Default route for HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Route for the Menu page */}
        <Route path="/menu" element={<MenuPage />} />
        
        {/* Route for the Menu page */}
        <Route path="/pacman" element={<PacmanGame />} />
      </Routes>
    </Router>
  );
};

export default App;
