import { faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OpenAI from 'openai';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Movie {
    id: number;
    title: string;
    thumbnail: string;
    description: string;
    rating: string;
    file_path: string;
    genre: string;
    release_date: Date;
    duration: number;
    director: string;
}

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

interface QuestionData {
    question: string;
    options: string[];
}

const EntertainmentPage: React.FC = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [showQuestionnaire, setShowQuestionnaire] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [recommendedMovies, setRecommendedMovies] = useState<Movie[] | null>(null);

    // Define questions and options
    const questionData: QuestionData[] = [
        {
            question: 'What is your favorite movie genre?',
            options: ['Action', 'Comedy', 'Drama', 'Horror', 'Fantasy', 'Sci-Fi', 'Romance', 'No preference'],
        },
        {
            question: 'Do you prefer older movies or newer releases?',
            options: ['Older', 'Newer', 'No preference'],
        },
        {
            question: 'Do you have a preferred rating?',
            options: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'No preference'],
        },
        {
            question: 'Any particular directors or actors you enjoy?',
            options: [
                'Christopher Nolan',
                'Steven Spielberg',
                'Quentin Tarantino',
                'Meryl Streep',
                'Leonardo DiCaprio',
                'No preference',
            ],
        },
    ];

    // Fetch movies on mount
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch('http://localhost:5000/movies');
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                const data: Movie[] = await response.json();
                setMovies(data);
            } catch (err) {
                console.error('Failed to fetch movies', err);
            }
        };

        fetchMovies();
    }, []);

    /**
     * Call the OpenAI API directly from the frontend (NOT recommended in production).
     */
    const getRecommendations = async () => {
        try {
            // Compile the user answers into a text snippet
            const userResponsesText = Object.entries(userAnswers)
                .map(([index, ans]) => {
                    const questionText = questionData[parseInt(index, 10)].question;
                    return `Q: ${questionText}\nA: ${ans}`;
                })
                .join('\n\n');

            // Convert movie list to JSON for the prompt
            const moviesJson = JSON.stringify(movies);

            // Create the prompt for the Chat Completion
            const prompt = `
You are a movie recommender. 
I will provide you with a list of movies in JSON format and the user's answers to some questions. 
Recommend up to 5 of these movies that match the user's preferences. 
Return only valid JSON in the following format: 
{
  "recommendedMovieIds": [id1, id2, ...]
}

Movies JSON:
${moviesJson}

User's answers:
${userResponsesText}

Return only the JSON.
`;

            // Create ChatCompletion using GPT-3.5 (or GPT-4 if available)
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant that provides movie recommendations.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0,
            });

            // The assistant's reply should be valid JSON with the recommended IDs
            const rawText = completion.choices[0]?.message?.content?.trim();
            if (!rawText) {
                throw new Error('No response from OpenAI');
            }

            // Attempt to parse the JSON
            let recommendedIds: number[] = [];
            try {
                const parsed = JSON.parse(rawText);
                recommendedIds = parsed.recommendedMovieIds || [];
            } catch (parseErr) {
                console.error('Could not parse JSON from OpenAI:', parseErr);
            }

            // Filter the movies list to match the recommended IDs
            const recommended = movies.filter((m) => recommendedIds.includes(m.id));
            setRecommendedMovies(recommended);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            // If there's an error, show all movies or handle the error gracefully
            setRecommendedMovies(null);
        }
    };

    // Handle changes in the current select
    const handleAnswerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestionIndex]: event.target.value,
        });
    };

    // Move to the next question or get recommendations
    const handleNext = async () => {
        if (currentQuestionIndex < questionData.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            await getRecommendations();
            setShowQuestionnaire(false);
        }
    };

    // Skip the questionnaire and view the full list
    const handleSkip = () => {
        setShowQuestionnaire(false);
    };

    // Reset recommendations (show all movies again)
    const handleViewAllMovies = () => {
        setRecommendedMovies(null);
    };

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    return (
        <div className="bg-gradient-to-br to-aa-blue from-aa-red h-screen p-6">
            <div
                className="flex flex-col bg-white rounded-xl overflow-hidden"
                style={{ height: 'calc(100vh - var(--spacing)* 14)' }}
            >
                <header className="flex items-center justify-between bg-aa-blue p-4 h-16 rounded-t-xl">
                    <h1 className="text-white text-2xl font-bold">Entertainment</h1>
                    {/* Back Button */}
                    <button onClick={() => navigate(-1)} className="text-white hover:opacity-80" aria-label="Go Back">
                        <span className="text-lg">
                            <FontAwesomeIcon icon={faArrowCircleLeft} />
                        </span>
                    </button>
                </header>

                {/* Questionnaire Section */}
                {showQuestionnaire && (
                    <div className="p-6 overflow-auto flex flex-col items-start">
                        <p className="text-xl font-semibold mb-4">Let's find some great movies for you!</p>
                        <p className="mb-2">{questionData[currentQuestionIndex].question}</p>

                        <select
                            className="border border-gray-300 rounded p-2 mb-4"
                            value={userAnswers[currentQuestionIndex] || ''}
                            onChange={handleAnswerChange}
                        >
                            <option value="">-- Select an answer --</option>
                            {questionData[currentQuestionIndex].options.map((option, i) => (
                                <option key={i} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <div className="space-x-2">
                            <button
                                onClick={handleNext}
                                className="bg-aa-blue text-white px-4 py-2 rounded hover:bg-aa-blue/90"
                                disabled={!userAnswers[currentQuestionIndex]}
                            >
                                {currentQuestionIndex < questionData.length - 1 ? 'Next' : 'Get Recommendations'}
                            </button>
                            <button
                                onClick={handleSkip}
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* Movies List / Recommendations */}
                {!showQuestionnaire && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 bg-gray-100">
                            {recommendedMovies ? (
                                <>
                                    <h2 className="text-xl font-bold">Recommended Movies</h2>
                                    <button
                                        onClick={handleViewAllMovies}
                                        className="bg-aa-red text-white px-3 py-1 rounded-lg"
                                    >
                                        View All Movies
                                    </button>
                                </>
                            ) : (
                                <h2 className="text-xl font-bold">All Movies</h2>
                            )}
                        </div>

                        <div className="flex flex-row flex-wrap items-center p-6 gap-6 overflow-auto justify-around">
                            {(recommendedMovies || movies).map((m, i) => (
                                <MovieCard key={i} movie={m} onClick={() => setSelectedMovie(m)} />
                            ))}
                        </div>
                    </div>
                )}
                {selectedMovie && (
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] p-10 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-xl relative">
                            <button
                                className="absolute top-4 right-4 bg-gray-400 text-white font-semibold p-2 rounded-lg cursor-pointer"
                                onClick={() => setSelectedMovie(null)}
                            >
                                Close X
                            </button>
                            <button
                                className="absolute top-4 right-24 bg-aa-blue text-white font-semibold p-2 rounded-lg cursor-pointer"
                                onClick={() => {}}
                            >
                                Watch
                            </button>
                            <MovieDetails movie={selectedMovie} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface MovieCardProps {
    movie: Movie;
    onClick: () => void;
}
const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => (
    <div className="w-1/5 aspect-square bg-white rounded-lg drop-shadow-md" onClick={onClick}>
        <div className="w-full h-full flex flex-col items-center justify-around text-center relative">
            <img
                src={'/movies/oppenheimer.png'} // Use movie.thumbnail if available
                alt={movie.title}
                className="w-full h-full rounded-lg object-cover"
            />
            <p className="text-sm font-semibold bg-black/50 absolute text-white w-full py-4 px-2 bottom-0 rounded-b-lg">
                {movie.title}
            </p>
        </div>
    </div>
);

interface MovieDetailsProps {
    movie: Movie;
}
const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => (
    <div className="flex flex-row space-x-8">
        <img
            src={'/movies/oppenheimer.png'}
            alt={movie.title}
            className="min-w-[30%] max-w-[30%] object-cover rounded-xl"
        />
        <div className="flex flex-col">
            <p className="text-3xl font-bold pb-2 mt-12">{movie.title}</p>
            <div className="w-fit bg-aa-red rounded-lg px-3 py-1">
                <p className=" text-white font-semibold">{movie.rating}</p>
            </div>

            <p className="mt-2">{movie.description}</p>
        </div>
    </div>
);

export default EntertainmentPage;
