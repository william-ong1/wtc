import ExploreContent from "./ExploreContent";

export const metadata = {
  title: "Explore | What's That Car",
};

export default function Explore() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <ExploreContent />
    </div>
  );
}
