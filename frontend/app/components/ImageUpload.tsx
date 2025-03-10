interface ImageUploadProps {
  onChange: (event: any) => void;
  disabled: boolean;
}

const ImageUpload = ({onChange, disabled}: ImageUploadProps) => {
  return (
    <div className="text-center">
      <input
        type="file"
        accept="image/*"
        id="file-input"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />

      <label
        htmlFor="file-input"
        className={`inline-block px-6 py-3 rounded-xl text-white text-md font-semibold animate-gradient transition-all duration-500 ease-in-out transform ${disabled ? 'opacity-50 cursor-default hover:scale-100' : 'cursor-pointer hover:scale-105 shadow-lg'}`}
        >
        Upload Image
      </label>
    </div>
  );
};

export default ImageUpload;
