import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProfileEditContent from "./ProfileEditContent";

export default function ProfileEdit() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16">
        <ProfileEditContent />
      </main>

      <Footer />
    </div>
  );
} 