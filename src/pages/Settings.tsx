import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VisualSettings } from '../scripts/VisualSettings';

const SettingsPage: React.FC = () => {
    const [brightness, setBrightness] = useState(50);
    const [screenTimeout, setScreenTimeout] = useState('30');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const instance = VisualSettings.getInstance();
        const intervalId = setInterval(() => {
            setDarkMode(instance.isDarkMode());
            setBrightness(Math.floor(instance.getBrightness() * 100));
        }, 33);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="bg-gradient-to-br from-aa-blue to-aa-red h-screen p-6">
            <div className="w-full h-full flex flex-col bg-white rounded-3xl p-8 shadow-xl">
                <div>
                    <button
                        className="flex items-center text-aa-blue hover:text-aa-slat hover:underline transition-all duration-300 mb-6 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>
                </div>

                <p className="text-3xl font-bold text-gray-800 mb-8">Settings</p>

                <div className="space-y-8 flex-1">
                    {/* Brightness Section */}
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-4">Brightness Adjustment</label>
                        <div className="relative pt-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brightness}
                                onChange={(e) =>
                                    VisualSettings.getInstance().setBrightness(Number(e.target.value) / 100)
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg 
                                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                                  [&::-webkit-slider-thumb]:bg-aa-blue [&::-webkit-slider-thumb]:rounded-full
                                  [&::-webkit-slider-thumb]:appearance-none"
                            />
                            <div className="flex justify-between text-sm text-gray-500 font-medum mt-2">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        <div className="flex flex-row space-x-2 text-sm mt-3 text-gray-600">
                            <p>Current brightness:</p>
                            <p className="font-semibold">{brightness}%</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Screen Timeout Section */}
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-4">Screen Timeout</label>
                        <select
                            value={screenTimeout}
                            onChange={(e) => setScreenTimeout(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-aa-blue 
                             focus:ring-2 focus:ring-aa-blue/30 transition-all cursor-pointer"
                        >
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="120">2 minutes</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Dark Mode Slider Button */}
                    <div className="group flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dark Mode</label>
                            <p className="text-sm text-gray-500">Enable dark theme</p>
                        </div>
                        <div
                            onClick={() => VisualSettings.getInstance().setDarkMode(!darkMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer 
                              ${darkMode ? 'bg-aa-blue' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                                   ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
