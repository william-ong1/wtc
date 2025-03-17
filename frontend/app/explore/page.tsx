import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ExploreContent from "./ExploreContent";

export default function Explore() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center shadow-md pt-16">
        <ExploreContent />
      </main>

      <Footer />
    </div>
  );
};
