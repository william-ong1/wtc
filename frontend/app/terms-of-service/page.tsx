import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | What's That Car",
};

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-[100dvh] font-montserrat">
      <Header />

      <main className="flex flex-row flex-1 justify-center items-stretch text-center overflow-x-hidden pt-16 pb-4">
        <div className="flex flex-col flex-1 items-center w-full lg:w-3/4 h-full py-4 lg:py-8 px-6 lg:px-12 gap-8 fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-custom-blue"> Terms of Service </h1>
          
          <div className="flex flex-col text-left text-sm lg:text-base w-full max-w-5xl gap-8">
            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Using Our Service</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                By using What's That Car, you agree to these terms. Our service helps identify cars from images using Gemini AI models. 
                While we strive for accuracy, results may vary based on image quality and other factors.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Your Account</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                You're responsible for:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>Keeping your account information secure</li>
                <li>All activity that happens on your account</li>
                <li>Following these terms when using our service</li>
              </ul>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Content Rules</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                When using our service, do not:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>Upload inappropriate or illegal content</li>
                <li>Violate others' privacy or intellectual property rights</li>
                <li>Abuse or disrupt our service</li>
                <li>Use our service for any illegal activities</li>
              </ul>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Your Content</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                You keep ownership of images you upload, but you give us permission to:
              </p>
              <ul className="list-disc ml-6 mt-2 text-gray-300 leading-relaxed">
                <li>Store and display your images</li>
                <li>Process your images with our AI service</li>
              </ul>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Service Limitations</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                Our car identification is provided "as is" without any guarantees of accuracy. Results may vary.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Changes to Terms</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We may update these terms as our service evolves. We'll notify you of significant changes.
                Continued use of our service after changes means you accept the new terms.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Account Termination</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                We reserve the right to suspend or terminate your account if you violate these terms, abuse our service, or engage in illegal activities. 
                You can also choose to delete your account at any time. After termination, you may lose access to your saved car identifications and account data.
              </p>
            </section>

            <section>
              <div className="relative mb-6">
                <h2 className="text-xl font-bold text-custom-blue">Contact Us</h2>
                <div className="absolute -bottom-2 left-0 w-16 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
              </div>
              <p className="text-gray-300 leading-relaxed mt-4">
                If you have any questions about these terms, please contact us through our 
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
