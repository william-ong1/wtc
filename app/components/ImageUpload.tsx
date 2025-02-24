"use client";

interface ImageUploadProps {
  onChange: (event: any) => void;
}

const ImageUpload = ({onChange} : ImageUploadProps) => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={onChange}
      />
    </div>
  );
};

export default ImageUpload;