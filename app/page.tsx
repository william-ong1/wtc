"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUpload from "./components/ImageUpload";

export default function Home() {
  const [image, setImage] = useState(null);

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImage(objectUrl);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <ImageUpload onChange={handleImageChange}/>
        {/* {image && (
          <Image
            src={image}
            alt="Uploaded Image"
            width={300}
            height={300}
            className="rounded-lg"
          />
        )} */}
    </div>
  );
}
