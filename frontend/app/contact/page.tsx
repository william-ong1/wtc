import ContactContent from "./ContactContent";

export const metadata = {
  title: "Contact Us | What's That Car",
};

export default function Explore() {
  return (
    <div className="flex flex-row justify-center items-stretch text-center overflow-x-hidden w-full">
      <ContactContent />
    </div>
  );
}
