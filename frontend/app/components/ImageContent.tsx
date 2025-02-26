"use client";

import Image from "next/image";
import ImageUpload from "./ImageUpload";
import { useState } from "react";
import axios from "axios";

const ImageContent = () => {
  const [image, setImage] = useState<string>("");
  const [displayImage, setDisplayImage] = useState<boolean>(false);

  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);
    setDisplayImage(true)

    const formData = new FormData();
    formData.append("file", file)

    try {
      const result = await axios.post("http://localhost:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(result.data.prediction);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-stretch justify-center w-full h-full">
      <div className="h-3/4 items-center justify-center text-center flex p-16 pb-0">
        {displayImage && (
          <div className="relative flex items-center justify-center">
            <Image
              src={image}
              alt="Uploaded Image"
              width={300}
              height={400}
              style={{ objectFit: "contain" }}
              className="rounded-lg shadow-lg border-black border-2"
            />
          </div>
        )}
      </div>

      <div className="h-1/4 pt-8 justify-center w-full flex">
        {/* {!displayImage && (<ImageUpload onChange={handleImageUpload}/>)} */}
        <ImageUpload onChange={handleImageUpload} />
      </div>
    </div>

  );
};

export default ImageContent;
