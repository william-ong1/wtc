import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AboutContent from "./AboutContent";

export default function About() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center shadow-md">
        <AboutContent />
      </main>

      <Footer />
    </div>
  );
};
