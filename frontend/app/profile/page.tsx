import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProfileContent from "./ProfileContent";

export const metadata = {
  title: "Profile | What's That Car",
};

export default function Profile() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
        <ProfileContent />
      </main>

      <Footer />
    </div>
  );
}
