import React from 'react';

interface CarInfoProps {
  make: string;
  model: string;
  color: string;
  year: string;
  rarity: string;
};

const CarInfo: React.FC<CarInfoProps> = ({ make, model, color, year, rarity }) => {
  return (
    <div className="bg-gray-900 text-white shadow-xl rounded-xl overflow-hidden w-80 transform hover:scale-105 transition-all duration-300 ease-in-out">

      <div className="p-6">
        <h2 className="text-2xl font-semibold text-blue-400"> {model == "N/A" ? "" : model} </h2>
        <p className="text-gray-400 text-sm"> {year == "N/A" ? "" : model} </p>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-gray-400">
            <span className="font-medium"> Make: </span>
            <span> {make} </span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span className="font-medium"> Model: </span>
            <span> {model} </span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span className="font-md"> Color: </span>
            <span> {color} </span>
          </div>
          
          <div className="flex justify-between text-gray-400">
            <span className="font-medium"> Year: </span>
            <span> {year} </span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span className="font-medium"> Rarity*: </span>
            <span> {rarity} </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="py-4 px-6 bg-gray-800 text-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105">
          View Details
        </button>
      </div>
    </div>
  );
};

export default CarInfo;
