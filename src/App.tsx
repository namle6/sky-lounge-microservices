import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import PSAPage from './pages/PSA';

export const App: React.FC = () => {
    const [isOn, setIsOn] = useState<boolean>(false);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Initialize SSE connection
    useEffect(() => {
        // Create an EventSource that connects to /events
        const es = new EventSource('http://localhost/events');

        es.onmessage = (event) => {
            // event.data could be '0' or '1'
            console.log('SSE Received:', event.data);
            setIsOn(event.data === 'True');
        };

        es.onerror = (err) => {
            console.error('SSE error', err);
            // Optionally close or handle reconnection
        };

        // Store in a ref so we can close later if needed
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

                {/* Route for the Menu page */}
                <Route path="/menu" element={<MenuPage />} />
            </Routes>
        </Router>
    );
};

export default App;
