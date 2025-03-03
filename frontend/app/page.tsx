import Header from "./components/Header";
import Footer from "./components/Footer";
import ImageContent from "./components/ImageContent";
import TextContent from "./components/TextContent";

export default function Home() {

  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center shadow-md">
        <div className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/3 lg:flex-col lg:border-r border-[0.1px] border-white/5 shadow-sm">
          <ImageContent />
        </div>

        <div className="flex flex-col lg:w-2/3 lg:pb-6 items-center justify-center">
          <TextContent />
        </div>
      </main>

      <Footer />
    </div>
  );
};
