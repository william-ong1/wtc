"use client";

import Image from "next/image";
import ImageUpload from "./ImageUpload";
import { useState } from "react";
import axios from "axios";
import placeholderImg from "@/public/images/placeholder-dark.png";

const ImageContent = () => {
  const [image, setImage] = useState<string>("");
  const [displayImage, setDisplayImage] = useState<boolean>(false);
  const [fadeKey, setFadeKey] = useState<number>(0);

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append("file", file)

    try {
      const result = await axios.post("http://localhost:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImage(objectUrl);
      setDisplayImage(true);
      setFadeKey(fadeKey + 1)

      console.log(result.data.prediction);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-stretch justify-center w-full h-full gap-12 fade-in mt-6">

      {/* Stationary button */}
      {/* <div className="h-3/4 items-center justify-center text-center flex p-16 pb-0">
        <div className="relative flex items-center justify-center">
          <Image
            key={fadeKey}
            src={displayImage ? image : placeholderImg}
            alt="Uploaded Image"
            width={350}
            height={450}
            style={{ objectFit: "contain" }}
            className="rounded-xl fade-in border border-white/35 "
          />
        </div>
      </div>

      <div className="h-1/4 pt-12 justify-center w-full flex">
        <ImageUpload onChange={handleImageUpload} />
      </div> */}


      {/* Button moves with image */}
      <div className="relative flex items-center justify-center">
        <Image
          key={fadeKey}
          src={displayImage ? image : placeholderImg}
          alt="Uploaded Image"
          width={350}
          height={450}
          style={{ objectFit: "contain" }}
          className="rounded-xl fade-in border border-white/25"
          />
      </div>

      <ImageUpload onChange={handleImageUpload} />

    </div>
  );
};

export default ImageContent;
