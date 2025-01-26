import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const handleChessClick = () => navigate('/chessgame');
    const handlePacmanClick = () => navigate('/pacmangame');
    const handleBackClick = () => navigate('/');

    return (
        <div className="bg-gradient-to-br from-aa-blue to-aa-red h-screen p-6">
            <div className="w-full h-full flex flex-col bg-white rounded-3xl p-8 shadow-xl">
                {/* Back Button */}
                <div>
                    <button
                        className="flex items-center text-aa-blue hover:text-aa-slat hover:underline transition-all duration-300 mb-6 cursor-pointer"
                        onClick={handleBackClick}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-12">Game Collection</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center flex-1">
                    <GameCard
                        title="Chess"
                        description="Classic strategy game"
                        image="chess_icon.png"
                        onClick={handleChessClick}
                    />
                    <GameCard
                        title="Pacman"
                        description="Arcade classic"
                        image="pacman_icon.png"
                        onClick={handlePacmanClick}
                    />
                </div>
            </div>
        </div>
    );
};

interface GameCardProps {
    title: string;
    description: string;
    image: string;
    onClick: () => void;
}
const GameCard: React.FC<GameCardProps> = ({ title, description, image, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 select-none cursor-pointer"
        >
            <div className="flex flex-col items-center">
                <div className="h-40 w-40 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img src={image} alt={title} className="w-32 h-32 object-contain transition-transform" />
                </div>
                <span className="text-xl font-semibold text-aa-blue group-hover:text-aa-darkblue transition-colors">
                    {title}
                </span>
                <p className="text-sm text-gray-500 mt-2">{description}</p>
            </div>
        </button>
    );
};

export default GamesPage;
