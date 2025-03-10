"use client";

import Image, {StaticImageData} from "next/image";
import ImageUpload from "./ImageUpload";
import { useState } from "react";
import axios from "axios";
import placeholderImg from "@/public/images/placeholder-dark.png";
import CarInfo from "./CarInfo";
import tempLogo from "@/public/images/temp-logo2.png";
import toyotaLogo from "@/public/images/toyota.png";

type Car = {
  make: string;
  model: string;
  year: string;
  rarity: string;
  image: StaticImageData;
};

// TODO: Delete
const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Nissan", "Lexus", "Hyundai", "Kia", "Mazda", "Peugeot", "Volkswagen", "Fiat", "Renault", "Jaguar", "Porsche"];
const models = ["Mustang", "Corolla", "Civic"];
const years = ["2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011"];
const rarity = ["91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107"];

const getRandomElement = (array: string[]) : string => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}


const HomeContent = () => {
  const [image, setImage] = useState<string>("");
  const [displayImage, setDisplayImage] = useState<boolean>(false);
  const [fadeKey, setFadeKey] = useState<number>(0);
  const [car, setCar] = useState<Car>({make: "n/a", model: "n/a", year: "n/a", rarity: "n/a", image: tempLogo });
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const result = await axios.post("http://localhost:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(objectUrl);
      setDisplayImage(true);
      setFadeKey(fadeKey + 1);
      setCar({make: getRandomElement(makes), model: getRandomElement(models), year: getRandomElement(years), rarity: getRandomElement(rarity), image: toyotaLogo});
      
      console.log(result.data.prediction);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center w-full h-full p-20 gap-12 fade-in">
      From regular traffic to 1-of-1 cars, WTC can detect any car brand from [insert year] with ___* accuracy. Don't believe us? Give us a try!

      <div className="flex flex-row w-3/4 p-4">
        <div className="flex flex-col flex-1 w-1/2 items-center justify-center border-r-[0.25px] border-gray- gap-12 p-4">
          <Image
            key={fadeKey}
            src={displayImage ? image : placeholderImg}
            alt="Uploaded Image"
            width={350}
            height={450}
            style={{ objectFit: "contain" }}
            className="rounded-xl fade-in border border-white/30"
          />
          
          <ImageUpload onChange={handleImageUpload} disabled={loading} />
        </div>

        <div className="flex flex-col w-1/2 items-center p-4">
          <CarInfo make={car.make} model={car.model} year={car.year} rarity={car.rarity} image={car.image}/>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
