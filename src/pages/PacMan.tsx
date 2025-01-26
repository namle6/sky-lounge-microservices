import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import OpenAI from 'openai';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const PACMAN_SIZE = 18;

type Position = { x: number; y: number };

type Ghost = {
    position: Position;
    color: string;
    id: string;
};

const initialMaze = [
    '####################',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#.......#####.......#',
    '#...................#',
    '####.....#.....#####',
    '#...................#',
    '#.......#####.......#',
    '#...................#',
    '#.......#...........#',
    '#...................#',
    '#.......#####.......#',
    '#...................#',
    '#.......#...........#',
    '#...................#',
    '####.....#.....#####',
    '#...................#',
    '#.......#####.......#',
    '####################',
];

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const ghostColorsClasses = {
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
};
class AIGhostController {
    private gameHistory: Array<{
        pacmanPos: Position;
        ghostPositions: Position[];
        score: number;
    }> = [];

    async getNextMove(ghost: Ghost, pacmanPos: Position): Promise<{ dx: number; dy: number }> {
        const recentHistory = this.gameHistory.slice(-3);
        const prompt = `
        As a highly aggressive Pacman ghost (${ghost.id}), determine optimal intercept move:
        Current ghost: (${ghost.position.x}, ${ghost.position.y})
        Pacman: (${pacmanPos.x}, ${pacmanPos.y})
        History: ${JSON.stringify(recentHistory)}
        Your objective: Hunt down and eliminate Pacman using the shortest possible path
        Other ghosts: Use their positions to set up ambush points
        Strategy: Maximum aggression, relentless pursuit, tactical coordination
        Return only: UP, DOWN, LEFT, or RIGHT
      `;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an aggressive ghost AI focused on hunting Pacman. Prioritize direct pursuit and interception.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 10,
            });

            const direction = response.choices[0].message.content.trim().toUpperCase();
            return this.directionToVector(direction) || this.getAggressiveMove(ghost.position, pacmanPos);
        } catch (error) {
            console.error('AI Ghost Error:', error);
            return this.getAggressiveMove(ghost.position, pacmanPos);
        }
    }

    private getAggressiveMove(ghostPos: Position, pacmanPos: Position) {
        const dx = Math.sign(pacmanPos.x - ghostPos.x);
        const dy = Math.sign(pacmanPos.y - ghostPos.y);
        return { dx, dy };
    }

    updateHistory(pacmanPos: Position, ghostPositions: Position[], score: number) {
        this.gameHistory.push({ pacmanPos, ghostPositions, score });
        if (this.gameHistory.length > 5) this.gameHistory.shift();
    }

    private directionToVector(direction: string): { dx: number; dy: number } | null {
        const vectors = {
            UP: { dx: 0, dy: -1 },
            DOWN: { dx: 0, dy: 1 },
            LEFT: { dx: -1, dy: 0 },
            RIGHT: { dx: 1, dy: 0 },
        };
        return vectors[direction] || null;
    }
}

const PacmanGame: React.FC = () => {
    const [pacmanPos, setPacmanPos] = useState<Position>({ x: 1, y: 1 });
    const [score, setScore] = useState(0);
    const [maze, setMaze] = useState(initialMaze);
    const [ghosts, setGhosts] = useState<Ghost[]>([
        { position: { x: 18, y: 1 }, color: 'red', id: 'red' },
        { position: { x: 1, y: 18 }, color: 'pink', id: 'pink' },
        { position: { x: 18, y: 18 }, color: 'cyan', id: 'cyan' },
    ]);

    const ghostController = new AIGhostController();
    const navigate = useNavigate();

    const moveGhosts = useCallback(async () => {
        ghostController.updateHistory(
            pacmanPos,
            ghosts.map((g) => g.position),
            score
        );

        const newGhosts = await Promise.all(
            ghosts.map(async (ghost) => {
                const move = await ghostController.getNextMove(ghost, pacmanPos);
                const newX = ghost.position.x + move.dx;
                const newY = ghost.position.y + move.dy;

                if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && maze[newY][newX] !== '#') {
                    return {
                        ...ghost,
                        position: { x: newX, y: newY },
                    };
                }
                return ghost;
            })
        );
        setGhosts(newGhosts);
    }, [maze, ghosts, pacmanPos, score]);

    const movePlayer = useCallback(
        (dx: number, dy: number) => {
            setPacmanPos((prev) => {
                const newPos = { x: prev.x + dx, y: prev.y + dy };
                if (
                    newPos.x >= 0 &&
                    newPos.x < GRID_SIZE &&
                    newPos.y >= 0 &&
                    newPos.y < GRID_SIZE &&
                    maze[newPos.y][newPos.x] !== '#'
                ) {
                    if (maze[newPos.y][newPos.x] === '.') {
                        setScore((prevScore) => prevScore + 10);
                        setMaze((prevMaze) => {
                            const newMaze = [...prevMaze];
                            newMaze[newPos.y] =
                                newMaze[newPos.y].substring(0, newPos.x) +
                                ' ' +
                                newMaze[newPos.y].substring(newPos.x + 1);
                            return newMaze;
                        });
                    }
                    return newPos;
                }
                return prev;
            });
        },
        [maze]
    );

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    movePlayer(1, 0);
                    break;
            }
        };

        const gameLoop = setInterval(async () => {
            moveGhosts();

            const pacmanCollided = ghosts.some(
                (ghost) => ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y
            );

            if (pacmanCollided) {
                alert(`Game Over! Your score: ${score}`);
                setPacmanPos({ x: 1, y: 1 });
                setScore(0);
                setMaze(initialMaze);
                setGhosts([
                    { position: { x: 18, y: 1 }, color: 'red', id: 'red' },
                    { position: { x: 1, y: 18 }, color: 'pink', id: 'pink' },
                    { position: { x: 18, y: 18 }, color: 'cyan', id: 'cyan' },
                ]);
            }
        }, 500);

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            clearInterval(gameLoop);
        };
    }, [moveGhosts, ghosts, pacmanPos, score, movePlayer]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="text-2xl font-bold mb-4">Pacman Game</h1>
            <button onClick={() => navigate('/')} className="mb-4">
                Back
            </button>
            <div className="relative" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
                {maze.map((row, y) =>
                    row.split('').map((cell, x) => (
                        <div
                            key={`${x}-${y}`}
                            className={`absolute ${
                                cell === '#' ? 'bg-blue-800' : cell === '.' ? 'bg-yellow-500 rounded-full' : ''
                            }`}
                            style={{
                                width: cell === '.' ? 6 : CELL_SIZE,
                                height: cell === '.' ? 6 : CELL_SIZE,
                                left: x * CELL_SIZE + (cell === '.' ? 7 : 0),
                                top: y * CELL_SIZE + (cell === '.' ? 7 : 0),
                            }}
                        />
                    ))
                )}
                {ghosts.map((ghost, index) => (
                    <div
                        key={`ghost-${index}`}
                        className={`absolute rounded-full ${ghostColorsClasses[ghost.color]}`}
                        style={{
                            width: PACMAN_SIZE,
                            height: PACMAN_SIZE,
                            left: ghost.position.x * CELL_SIZE + (CELL_SIZE - PACMAN_SIZE) / 2,
                            top: ghost.position.y * CELL_SIZE + (CELL_SIZE - PACMAN_SIZE) / 2,
                        }}
                    />
                ))}
                <div
                    className="absolute bg-yellow-400 rounded-full"
                    style={{
                        width: PACMAN_SIZE,
                        height: PACMAN_SIZE,
                        left: pacmanPos.x * CELL_SIZE + (CELL_SIZE - PACMAN_SIZE) / 2,
                        top: pacmanPos.y * CELL_SIZE + (CELL_SIZE - PACMAN_SIZE) / 2,
                    }}
                />
            </div>
            <p className="mt-4">Score: {score}</p>
        </div>
    );
};

export default PacmanGame;
