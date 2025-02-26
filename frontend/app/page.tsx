import Header from "./components/Header";
import Footer from "./components/Footer";
import ImageContent from "./components/ImageContent";

export default function Home() {

  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center">
        <div className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-5/12 lg:flex-col lg:border-r border-gray-700">
          <ImageContent />
        </div>

        <div className="flex flex-col lg:w-7/12 lg:pb-6 items-center justify-center">
          Results
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
};
