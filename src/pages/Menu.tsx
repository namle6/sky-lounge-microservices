import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
    name: string;
    price: number;
}

const MenuPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Menu Page</h1>
      <p className="text-xl">This is a dummy Menu Page placeholder.</p>
    </div>
  );
};

export default MenuPage;
