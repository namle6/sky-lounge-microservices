import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    name: string;
    price: number;
}

// types.ts
export interface Order {
    order_id: number;
    time_ordered: string;
    status: string;
    meal_name: string;
    addons: string[];
}

export interface SeatInfo {
    seat_id: number;
    first_name: string;
    last_name: string;
    child_seat: boolean;
    orders: Order[];
}

export interface Food {
    id: number;
    title: string;
    type: string;
    prepare_time: number;
    availability: string;
    calories: number;
    description: string;
    price: number;
}

const MenuPage: React.FC = () => {
    const navigate = useNavigate();

    // Example state for estimated time (minutes). You can update these from an API or user input.
    const [estimatedMealArrival, setEstimatedMealArrival] = useState(20);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Cart state
    const [cart, setCart] = useState<Food[]>([
        // Example: already have a standard meal by default
        {
            id: 0,
            title: 'Standard Meal',
            type: 'breakfast',
            prepare_time: 10,
            availability: '1',
            calories: 400,
            description: 'Standard Meal includes eggs, bacon, and toast.',
            price: 0,
        },
    ]);

    // Add an item to the cart
    const handleAddToCart = (item: Food) => {
        setCart((prev) => [...prev, item]);
    };

    // Remove an item if needed
    const handleRemoveFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    // Calculate totals
    const subTotal = cart.reduce((acc, item) => acc + item.price, 0);
    const tax = +(subTotal * 0.135).toFixed(2); // example 13.5% tax
    const total = +(subTotal + tax).toFixed(2);

    const handleConfirm = () => {
        // Example confirm action
        alert('Order Confirmed!\nYou will be charged in-flight.');
    };

    // State to hold fetched seat data
    const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState('');

    const seatId = 31;

    useEffect(() => {
        const fetchSeatData = async () => {
            try {
                const response = await fetch(`http://192.168.253.26:5000/seat/${seatId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse JSON and update state
                const data: SeatInfo = await response.json();
                setSeatInfo(data);
            } catch (err) {
                // Handle error (e.g., log it, set an error state, etc.)
                console.error('Failed to fetch seat data:', err);
                if (err instanceof Error) {
                    console.log(err.message);
                }
            } finally {
                console.log(false);
            }
        };

        fetchSeatData();
    }, [seatId]);

    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await fetch('http://192.168.253.26:5000/foods');
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const data: Food[] = await response.json();
                setFoods(data);
                console.log(data);
            } catch (err) {
                console.error('Failed to fetch foods', err);
                if (err instanceof Error) {
                    console.log(err.message);
                }
            } finally {
                console.log(false);
            }
        };

        fetchFoods();
    }, []);

    // Initialize SSE connection
    useEffect(() => {
        // Create an EventSource that connects to your SSE endpoint
        const es = new EventSource('http://192.168.253.26:5000/events');

        // Listen for ETA updates
        es.addEventListener('eta', (evt) => {
            console.log('ETA SSE:', evt.data);
            // The Flask code sends JSON, e.g.: { "seat_id": 12, "eta": 15 }
            const data = JSON.parse(evt.data);
            setEstimatedMealArrival(data.eta);
            // do something with the seat_id and ETA, for example:
            // setEtaInfo(data); // or update your state accordingly
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

    return (
        <section className="bg-gradient-to-br from-aa-blue to-aa-red p-8">
            <div className="flex flex-col bg-white rounded-xl" style={{ height: 'calc(100vh - var(--spacing)* 14)' }}>
                {/* Header */}
                <header className="flex items-center justify-between bg-aa-red p-4 h-16 rounded-t-xl">
                    <h1 className="text-white text-2xl font-bold">In-Flight Menu</h1>
                    {/* Back Button */}
                    <button onClick={() => navigate(-1)} className="text-white hover:opacity-80" aria-label="Go Back">
                        {/* Could use an icon or just text. Using a simple emoji here: */}
                        <span className="text-lg">
                            <FontAwesomeIcon icon={faArrowCircleLeft} />
                        </span>
                    </button>
                </header>

                <main className="flex flex-1">
                    {/* Left Column */}
                    <div className="flex-1 p-4">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {/* Upcoming Meal */}
                            <div className="rounded-md p-4">
                                <h2 className="text-xl font-bold mb-2">Upcoming Meal</h2>
                                {/* Example placeholder image block */}
                                <div className="bg-gray-300 w-full h-32 mb-2 rounded-md flex items-center justify-center">
                                    {/* <span className="text-gray-600">Meal Image</span> */}
                                    <img
                                        src="https://iheartvegetables.com/wp-content/uploads/2023/08/15-Minute-Vegetable-Pasta-5-of-8.jpg"
                                        alt="Meal Placeholder"
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                </div>
                                <span>{seatInfo && seatInfo.orders[0].meal_name}</span>
                            </div>

                            {/* Estimated Time */}
                            <div className="rounded-md p-4 flex flex-col items-center justify-center">
                                <h2 className="text-xl font-bold mb-2">ETA to Your Seat</h2>
                                <p className="text-4xl font-semibold">
                                    {estimatedMealArrival} <span className="text-lg">min</span>
                                </p>
                                {/* For demonstration, you could have a button to decrement or something: */}
                                {/* <button
                                    onClick={() => setEstimatedMealArrival((prev) => (prev > 1 ? prev - 1 : prev))}
                                    className="mt-4 px-4 py-2 bg-aa-blue text-white rounded hover:bg-blue-600"
                                >
                                    Speed Up by 1 min
                                </button> */}
                            </div>
                        </div>

                        {/* Row 2: Add-Ons */}
                        <div>
                            <h2 className="text-xl font-bold mb-2">Add-Ons</h2>
                            <div
                                className="flex space-x-4 overflow-auto"
                                style={{ width: 'calc(100vw - var(--spacing)* 80)' }}
                            >
                                {foods &&
                                    foods.map((addOn, index) => (
                                        <div
                                            key={index}
                                            className="w-[200px] max-w-[300px] rounded-md p-2 flex-shrink-0 text-center hover:cursor-pointer hover:bg-gray-100 "
                                            onClick={() => handleAddToCart(addOn)}
                                        >
                                            <div className="bg-gray-100 w-full h-20 rounded-md mb-2 flex items-center justify-center px-2">
                                                <img
                                                    src={`/food/${addOn.title
                                                        .toLowerCase()
                                                        .replace(/ /g, '_')
                                                        .replace(/[^\w_]/g, '')}.jpg`}
                                                    alt={addOn.title}
                                                    className="h-full w-full object-cover rounded-md"
                                                />
                                            </div>
                                            <p className="text-xs font-bold">{addOn.title}</p>
                                            <p className="font-semibold">${addOn.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Orders) */}
                    <div
                        className="w-80 border-l px-4 py-6 flex flex-col"
                        style={{ height: 'calc(100vh - var(--spacing)* 30)' }}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-aa-blue">Orders</h2>
                        <div className="mb-4 space-y-1 flex-auto overflow-hidden">
                            <div className="wrapper h-full w-full !overflow-y-auto">
                                <div className="h-fit !overflow-y-auto">
                                    <div>
                                        {cart.map((item, index) => (
                                            <li key={index} className="flex justify-between text-gray-700">
                                                <span>{item.title}</span>
                                                <span>${item.price.toFixed(2)}</span>
                                                {/* Optional remove button */}
                                                {index !== 0 && ( // e.g. don't remove "Standard Meal"
                                                    <button
                                                        className="text-red-500 ml-2"
                                                        onClick={() => handleRemoveFromCart(index)}
                                                    >
                                                        <FontAwesomeIcon icon={faXmarkCircle} />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-4 mt-auto flex flex-col space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Sales Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-red-500 mt-1">*All purchases will be charged to your account</p>
                        </div>

                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 bg-aa-blue text-white rounded-md text-lg font-semibold hover:bg-s"
                        >
                            Confirm
                        </button>
                    </div>
                </main>
            </div>
        </section>
    );
};

export default MenuPage;
