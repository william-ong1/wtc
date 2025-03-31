import SavedContent from "./SavedContent";

export const metadata = {
  title: "Saved Cars | What's That Car",
};

export default function Saved() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <SavedContent />
    </div>
  );
}
