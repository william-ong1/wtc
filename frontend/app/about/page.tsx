import AboutContent from "./AboutContent";

export const metadata = {
  title: "About | What's That Car",
};

export default function About() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <AboutContent />
    </div>
  );
}
