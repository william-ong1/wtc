import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | What's That Car",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16 pb-4">
        <div className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 gap-8 fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-custom-blue"> Privacy Policy </h1>
          
          <div className="flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-8">
            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Information We Collect</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We collect information when you create an account (username, email) and when you upload car images. 
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">How We Use Your Information</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We use your information to:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>Provide and improve the car identification service</li>
                <li>Store your uploaded images and identified cars</li>
                <li>Manage your account and preferences</li>
                <li>Respond to your support requests</li>
              </ul>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Third-Party Services</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We use these services to power our app:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>AWS (image storage and user authentication)</li>
                <li>Google Gemini AI (car identification)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-2">
                These services have their own privacy policies that govern how they handle your data.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Your Rights</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                You have the right to:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>Access your personal information</li>
                <li>Delete or update your account</li>
                <li>Request deletion of your uploaded content</li>
              </ul>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Changes to This Privacy Policy</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We may update this privacy policy from time to time. We'll notify you of any significant changes.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Contact Us</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                If you have any questions about this privacy policy, please contact us through our
                <Link href="/contact" className="text-custom-blue hover:text-custom-blue/85 transition-colors mx-1">
                  contact
                </Link>
                page.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
