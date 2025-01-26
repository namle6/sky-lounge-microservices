import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';

const ChessGame: React.FC = () => {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [status, setStatus] = useState('');
    const [stockfishMove, setStockfishMove] = useState('');
    const navigate = useNavigate();

    const makeMove = useCallback(
        (move: string | { from: string; to: string; promotion?: string }) => {
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(move);
            setGame(gameCopy);
            setFen(gameCopy.fen());
            return result;
        },
        [game]
    );

    const onDrop = (sourceSquare: string, targetSquare: string) => {
        if (game.turn() !== 'b') return false; // Prevent moves if it's not black's turn

        const move = makeMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q', // always promote to queen for simplicity
        });

        if (move === null) return false;

        // After the black move, send the updated FEN to Stockfish for the white move
        sendMoveToStockfish(game.fen());

        return true;
    };

    const sendMoveToStockfish = async (fen: string) => {
        setStatus('Thinking...');
        try {
            // Send the FEN to Stockfish
            const response = await fetch('http://3.133.184.9:3000/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen }),
            });

            const data = await response.json();
            if (data.bestMove) {
                const move = data.bestMove; // Stockfish's move (e.g., "e2e4")

                // Make the move on the board
                makeMove(move);

                // Convert the move into a more beginner-friendly format
                const beginnerFriendlyMove = convertMoveToReadable(move);

                // Set the Stockfish move for you to follow
                setStockfishMove(beginnerFriendlyMove);

                updateGameStatus(); // Update the game status after Stockfish's move
            }
        } catch (error) {
            console.error('Error communicating with Stockfish server:', error);
            setStatus('Error: Could not get opponent move');
        }
    };

    // Convert the move to a more beginner-friendly format
    const convertMoveToReadable = (move: string) => {
        const fromSquare = move.slice(0, 2);
        const toSquare = move.slice(2, 4);

        // Describing the move in a more readable way
        const moveDescription = `Pawn moves from ${fromSquare} to ${toSquare}`;

        return moveDescription;
    };

    const updateGameStatus = useCallback(() => {
        if (game.isCheckmate()) {
            setStatus(`Checkmate! Black wins.`);
        } else if (game.isDraw()) {
            setStatus('Draw!');
        } else if (game.isCheck()) {
            setStatus('Check!');
        } else {
            setStatus('Black to move.');
        }
    }, [game]);

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setStatus('Thinking...');
        setStockfishMove(''); // Clear previous Stockfish move
        sendMoveToStockfish(newGame.fen()); // Start with Stockfish's move as white
    };

    const switchSides = () => {
        resetGame();
    };

    const handleBackClick = () => {
        navigate('/games');
    };

    useEffect(() => {
        resetGame();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Chess Game</h2>
            <div className="mb-4 sm:mb-6">
                <div className="aspect-square max-w-[80vw] sm:max-w-[60vw] md:max-w-[50vw] lg:max-w-[40vw] mx-auto">
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardOrientation="black" // Always show the board from the black player's perspective
                    />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-base sm:text-lg font-semibold">{status}</p>
                <p className="text-base sm:text-lg font-semibold">
                    {stockfishMove && `Stockfish's move: ${stockfishMove}`}
                </p>
                <div className="space-x-2">
                    <button
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-black text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
                        onClick={handleBackClick}
                    >
                        Back
                    </button>
                    <button
                        onClick={resetGame}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                        New Game
                    </button>
                    <button
                        onClick={switchSides}
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
                    >
                        Switch Sides
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
