import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import MenuPage from './pages/Menu';
import EntertainmentPage from './pages/Entertainment';
import PSAPage from './pages/PSA';
import ChessGame from './pages/ChessGame';
import PacmanGame from './pages/PacMan';
import GamesPage from './pages/GamesPage';
import SettingsPage from './pages/Settings';
import { VisualSettings } from './scripts/VisualSettings';

export const App: React.FC = () => {
    const [isOn, setIsOn] = useState<boolean>(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Initialize SSE connection
    useEffect(() => {
        // Create an EventSource that connects to your SSE endpoint
        const es = new EventSource('http://192.168.253.26:5000/events');

        // Listen for switch changes
        es.addEventListener('switch', (evt) => {
            console.log('Switch SSE:', evt.data);
            // The Flask code sends True/False (as a string)
            setIsOn(evt.data === 'True');
        });

        // Handle errors
        es.onerror = (err) => {
            console.error('SSE error:', err);
            // Optionally handle reconnection or close
        };

        // Store the instance in a ref so we can close later
        eventSourceRef.current = es;

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const [brightness, setBrightness] = useState(1);

    useEffect(() => {
        const instance = VisualSettings.getInstance();
        const intervalId = setInterval(() => {
            setBrightness(1 - instance.getBrightness());
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Router>
            {isOn && <PSAPage />}
            <Routes>
                {/* Default route for HomePage */}
                <Route path="/" element={<HomePage />} />

                {/* Route for the Settings page */}
                <Route path="/settings" element={<SettingsPage />} />

                {/* Route for the Menu page */}
                <Route path="/menu" element={<MenuPage />} />

                {/* Route for the Games page */}
                <Route path="/games" element={<GamesPage />} />
                <Route path="/chessgame" element={<ChessGame />} />
                <Route path="/pacman" element={<PacmanGame />} />

                {/* Route for the Entertainment page */}
                <Route path="/entertainment" element={<EntertainmentPage />} />
            </Routes>

            {/* Brightness Simulation */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'black',
                    pointerEvents: 'none',
                    opacity: brightness,
                }}
            />
        </Router>
    );
};

export default App;
