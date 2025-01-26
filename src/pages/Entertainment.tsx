import React, { useState } from 'react';

interface Movie {
    title: string;
    rating: string;
    thumbnailPath: string;
    description: string;
}

const EntertainmentPage: React.FC = () => {
    const [movies] = useState<Movie[]>([
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description:
                "During World War II, Lt. Gen. Leslie Groves Jr. appoints physicist J. Robert Oppenheimer to work on the top-secret Manhattan Project. Oppenheimer and a team of scientists spend years developing and designing the atomic bomb. Their work comes to fruition on July 16, 1945, as they witness the world's first nuclear explosion, forever changing the course of history.",
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer And stuff',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
        {
            title: 'Oppenheimer',
            rating: 'R',
            thumbnailPath: 'movies/oppenheimer.png',
            description: 'Cool movie',
        },
    ]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    return (
        <div className="bg-gradient-to-br from-aa-blue to-aa-red h-screen p-6">
            <div className="w-full h-full flex flex-col justify-around bg-white rounded-2xl p-4">
                <h1 className="text-2xl font-bold mb-4">Entertainment</h1>
                <div className="flex flex-row flex-wrap items-center justify-around p-2 gap-2">
                    {movies.map((m, i) => (
                        <MovieCard key={i} movie={m} onClick={() => setSelectedMovie(m)} />
                    ))}
                </div>
            </div>

            {selectedMovie && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] p-10 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl relative">
                        <button
                            className="absolute top-4 right-4 bg-gray-400 text-white font-semibold p-2 rounded-md cursor-pointer"
                            onClick={() => setSelectedMovie(null)}
                        >
                            Close X
                        </button>
                        <button
                            className="absolute top-4 right-24 bg-aa-blue text-white font-semibold p-2 rounded-md cursor-pointer"
                            onClick={() => {}}
                        >
                            Watch
                        </button>
                        <MovieDetails movie={selectedMovie} />
                    </div>
                </div>
            )}
        </div>
    );
};

interface MovieCardProps {
    movie: Movie;
    onClick: () => void;
}
const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => (
    <div className="w-1/5 bg-white rounded-md drop-shadow-md px-2 py-3 cursor-pointer" onClick={onClick}>
        <div className="w-full h-full flex flex-col items-center justify-around text-center">
            <img src={movie.thumbnailPath} alt={movie.title} className="w-[50%] rounded-sm pb-1 object-cover" />
            <p className="text-sm font-semibold">{movie.title}</p>
        </div>
    </div>
);

interface MovieDetailsProps {
    movie: Movie;
}
const MovieDetails: React.FC<MovieDetailsProps> = ({ movie }) => (
    <div className="flex flex-row space-x-8">
        <img src={movie.thumbnailPath} alt={movie.title} className="min-w-[30%] max-w-[30%] object-cover rounded-xl" />
        <div className="flex flex-col">
            <p className="text-3xl font-bold pb-2">{movie.title}</p>
            <div className="w-min bg-gray-300 rounded-md px-3 py-1">
                <p className=" text-white font-semibold">{movie.rating}</p>
            </div>

            <p className="mt-2">{movie.description}</p>
        </div>
    </div>
);

export default EntertainmentPage;
