import Header from "../components/Header";
import Footer from "../components/Footer";
import ExploreContent from "./ExploreContent";

export const metadata = {
  title: "Explore | What's That Car",
};

export default function Explore() {
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
