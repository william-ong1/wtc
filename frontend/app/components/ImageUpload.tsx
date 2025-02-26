interface ImageUploadProps {
  onChange: (event: any) => void;
}

const ImageUpload = ({onChange} : ImageUploadProps) => {
  return (
    <div className="text-center">
      <input
        type="file"
        accept="image/*"
        id="file-input"
        className="hidden"
        onChange={onChange}
      />

      <label
        htmlFor="file-input"
        className="cursor-pointer inline-block px-6 py-3 rounded-xl text-white text-md font-semibold animate-gradient transition-all duration-500 ease-in-out transform hover:scale-105 shadow-lg"
      >
        Upload Image
      </label>
    </div>
  );
};

export default ImageUpload;