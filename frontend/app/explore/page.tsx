import Header from "../components/Header";
import Footer from "../components/Footer";
import ExploreContent from "./ExploreContent";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
        <ExploreContent />
      </main>

      <Footer />
    </div>
  );
}
