import Header from "../components/Header";
import Footer from "../components/Footer";
import AboutContent from "./AboutContent";

export default function About() {
  return (
    <>
      <title> About | What's That Car? </title>
      <div className="flex flex-col min-h-[100dvh] font-montserrat">
        <Header />

        <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
          <AboutContent />
        </main>

        <Footer />
      </div>
    </>
  );
}
