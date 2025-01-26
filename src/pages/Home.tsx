// File: src/pages/HomePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";

export const HomePage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [flightStats] = useState({
    flightNumber: "AA1234",
    departure: "DFW",
    arrival: "LAX",
    remainingTime: 0, // in minutes
    altitude: 0, // in feet
    outsideTemp: 0, // in degrees Fahrenheit
  });

  // Just an example array you might reuse in future
  const sections = [
    {
      id: "map",
      icon: "🌍",
      label: "Flight Map",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "movies",
      icon: "🎬",
      label: "Entertainment",
      color: "from-red-500 to-orange-500",
    },
    {
      id: "food",
      icon: "🍔",
      label: "Dining",
      color: "from-green-500 to-teal-600",
    },
    {
      id: "games",
      icon: "🎮",
      label: "Games",
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "wifi",
      icon: "📡",
      label: "Connectivity",
      color: "from-yellow-500 to-amber-600",
    },
    {
      id: "services",
      icon: "💡",
      label: "Services",
      color: "from-gray-500 to-slate-600",
    },
  ];

  const handleMenuClick = () => {
    navigate("/menu");
  };
  const handleGamesClick = () => {
    navigate("/pacman");
  }

  return (
    <div className="grid grid-cols-5 grid-rows-3 gap-4 p-6 bg-gradient-to-br from-aa-slate to-aa-blue min-h-screen">
      {/* Flight Information */}
      <div className="col-span-3 row-span-2 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-4xl font-bold">1 hrs 30 min</h2>
        <p className="text-gray-600">left</p>
        <div className="flex justify-between mt-4">
          <p>AA 4925</p>
          <p>DFW → PHL</p>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <p>25,000 feet</p>
          <p>-50°C</p>
        </div>
      </div>

      {/* Menu Button */}
      <HomeButton
        className="col-span-1 row-span-1"
        imgPath="menu_icon.png"
        onClick={handleMenuClick}
      >
        Menu
      </HomeButton>

      {/* Games */}
      <HomeButton
        className="col-span-1 row-span-1"
        imgPath="games_icon.png"
        onClick={handleGamesClick}
      >
        Games
      </HomeButton>
      {/* <div className="col-span-1 row-span-1 bg-blue-500 rounded-2xl shadow-lg flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">Games</h3>
      </div> */}

      {/* Entertainment */}
      <HomeButton
        className="col-span-2 row-span-2"
        imgPath="entertainment_icon.png"
        onClick={handleMenuClick}
      >
        Entertainment
      </HomeButton>
      {/* <div className="col-span-2 row-span-2 bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">Entertainment</h3>
      </div> */}

      {/* Footer Icons */}
      <div className="col-span-3 row-span-1 flex justify-around mt-6">
        <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center">
          <div className="text-white">🔢</div>
        </div>
        <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center">
          <div className="text-gray-700">⚙️</div>
        </div>
        <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center">
          <div className="text-white">✈️</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
