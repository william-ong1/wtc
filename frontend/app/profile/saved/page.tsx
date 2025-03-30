import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SavedContent from "./SavedContent";

export const metadata = {
  title: "Saved Cars | What's That Car",
};

export default function Saved() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
        <SavedContent />
      </main>

      <Footer />
    </div>
  );
}
