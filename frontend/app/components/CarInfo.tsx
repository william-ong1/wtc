import Image, { StaticImageData } from 'next/image';
import React from 'react';

interface CarInfoProps {
  make: string;
  model: string;
  year: string;
  rarity: string;
  image: StaticImageData;
};

const CarInfo: React.FC<CarInfoProps> = ({ make, model, year, rarity, image }) => {
  return (
    <div id="info" className="bg-gray-900 text-white shadow-xl w-[350px] rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 ease-in-out p-8 text-md">
      <div className="flex justify-center">
        <Image
          src={image}
          alt="Brand logo"
          width={200}
          height={450}
          style={{ objectFit: "contain" }}
          className="rounded-xl"
        />
      </div>

      <h2 className="text-3xl font-semibold text-[#3B03FF] mt-4 mb-2"> {model == "n/a" ? "" : model} </h2>

      <p className="text-gray-200 text-xl"> {year == "n/a" ? "" : year} </p>

      <div className="space-y-2 mt-6">
        <div className="flex justify-between text-gray-200">
          <span className="font-medium"> Make: </span>
          <span> {make} </span>
        </div>

        <div className="flex justify-between text-gray-200">
          <span className="font-medium"> Model: </span>
          <span> {model} </span>
        </div>
        
        <div className="flex justify-between text-gray-200">
          <span className="font-medium"> Year: </span>
          <span> {year} </span>
        </div>

        <div className="flex justify-between text-gray-200">
          <span className="font-medium"> Rarity*: </span>
          <span> {rarity} </span>
        </div>
      </div>

      {make == "n/a" ? <p className="text-gray-200 text-xl mt-4"></p> : 
      <div className="pt-6 px-6 text-center">
        <button className="bg-[#3B03FF]/80 hover:bg-[#3B03FF]/100  cursor-pointer inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
          View Details
        </button>
      </div>
      }
    </div>
  );
};

export default CarInfo;
