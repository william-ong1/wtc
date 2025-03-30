import Header from "../components/Header";
import Footer from "../components/Footer";
import ContactContent from "./ContactContent";

export const metadata = {
  title: "Contact Us | What's That Car",
};

export default function Explore() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
        <ContactContent />
      </main>

      <Footer />
    </div>
  );
}
