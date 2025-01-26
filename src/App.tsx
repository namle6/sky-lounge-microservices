import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import PacmanGame from './pages/PacMan';
import EntertainmentPage from './pages/Entertainment';
import PSAPage from './pages/PSA';
import SettingsPage from './pages/Settings';

export const App: React.FC = () => {
    const [isOn, setIsOn] = useState<boolean>(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Initialize SSE connection
    useEffect(() => {
        // Create an EventSource that connects to your SSE endpoint
        const es = new EventSource('http://localhost:5000/events');

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

    useEffect(() => {
        console.log(isOn);
    }, [isOn]);

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
                <Route path="/pacman" element={<PacmanGame />} />

                {/* Route for the Entertainment page */}
                <Route path="/entertainment" element={<EntertainmentPage />} />
            </Routes>
        </Router>
    );
};

export default App;
