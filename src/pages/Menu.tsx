import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    name: string;
    price: number;
}

const MenuPage: React.FC = () => {
    const navigate = useNavigate();

    // Example state for estimated time (minutes). You can update these from an API or user input.
    const [estimatedMealArrival, setEstimatedMealArrival] = useState(20);

    // Example data for add-ons
    const addOns = [
        { name: 'Extra Snack', price: 2.99 },
        { name: 'Extra Drink', price: 2.99 },
        { name: 'Dessert', price: 2.99 },
        { name: 'Premium Meal Upgrade', price: 5.99 },
    ];

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([
        // Example: already have a standard meal by default
        { name: 'Standard Meal', price: 0.0 },
    ]);

    // Add an item to the cart
    const handleAddToCart = (item: CartItem) => {
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

    return (
        <section className="bg-gradient-to-br from-aa-slate to-aa-blue p-8">
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
                                    <span className="text-gray-600">Meal Image</span>
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div className="rounded-md p-4 flex flex-col items-center justify-center">
                                <h2 className="text-xl font-bold mb-2">ETA to Your Seat</h2>
                                <p className="text-4xl font-semibold">
                                    {estimatedMealArrival} <span className="text-lg">min</span>
                                </p>
                                {/* For demonstration, you could have a button to decrement or something: */}
                                <button
                                    onClick={() => setEstimatedMealArrival((prev) => (prev > 1 ? prev - 1 : prev))}
                                    className="mt-4 px-4 py-2 bg-aa-blue text-white rounded hover:bg-blue-600"
                                >
                                    Speed Up by 1 min
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Add-Ons */}
                        <div>
                            <h2 className="text-xl font-bold mb-2">Add-Ons</h2>
                            <div className="flex space-x-4 overflow-auto">
                                {addOns.map((addOn, index) => (
                                    <div
                                        key={index}
                                        className="min-w-[100px] rounded-md p-2 flex-shrink-0 text-center hover:cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleAddToCart(addOn)}
                                    >
                                        <div className="bg-gray-300 w-full h-20 rounded-md mb-2 flex items-center justify-center">
                                            <span className="text-gray-600">{addOn.name}</span>
                                        </div>
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
                                                <span>{item.name}</span>
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
