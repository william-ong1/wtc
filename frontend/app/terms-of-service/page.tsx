import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsOfService() {
  return (
    <>
      <title> Terms of Service | What's That Car? </title>
      <div className="flex flex-col min-h-[100dvh] font-montserrat">
        <Header />

        <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
          <div className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 gap-12 fade-in">
            <h1 className="text-xl lg:text-2xl font-bold animate-gradient-text"> Terms of Service </h1>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
