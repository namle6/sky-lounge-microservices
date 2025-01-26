import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    const [brightness, setBrightness] = useState(50);
    const [screenTimeout, setScreenTimeout] = useState('30');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-br from-aa-blue to-aa-red h-screen p-6">
            <div className="w-full h-full flex flex-col justify-around bg-white rounded-2xl p-4">
                <button className="text-sm text-aa-blue underline mb-4 self-start" onClick={() => navigate('/')}>
                    Back
                </button>
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <div className="flex flex-col space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold">Brightness Adjustment</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-sm mt-1">Current: {brightness}%</p>
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Screen Timeout</label>
                        <select
                            value={screenTimeout}
                            onChange={(e) => setScreenTimeout(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="120">2 minutes</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="mr-2 font-semibold">Dark Mode</label>
                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
