import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import PacmanGame from './pages/PacMan';
import EntertainmentPage from './pages/Entertainment';

export const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Default route for HomePage */}
                <Route path="/" element={<HomePage />} />

                {/* Route for the Menu page */}
                <Route path="/menu" element={<MenuPage />} />

                {/* Route for the Games page */}
                <Route path="/pacman" element={<PacmanGame />} />

                {/* Route for the Entertainment page */}
                <Route path="/entertainment" element={<EntertainmentPage />} />
            </Routes>
        </Router>
    );
};

export default App;
