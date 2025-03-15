"use client";

import Link from "next/link";
import { FeatureCard } from "../components/Cards";

const AboutContent = () => {
  return (
    <div className="flex flex-col flex-1 items-center w-3/4 h-full p-8 px-12 gap-12 fade-in">

      {/* About Us */}
      <section className="flex flex-col items-center text-center w-3/4 gap-4">
        <h1 className="text-2xl font-bold animate-gradient-text"> About Us </h1>
        <p className="text-gray-300 leading-relaxed">
          We're passionate about helping car enthusiasts and curious minds identify vehicles using the latest AI technology.
        </p>
      </section>

      {/* How It Works */}
      <section className="flex flex-col items-center text-center w-3/4 gap-4">
        <h1 className="text-2xl font-bold animate-gradient-text"> How It Works </h1>
        <div className="grid md:grid-cols-3 gap-8 w-4/5">
          <FeatureCard icon="📸" title="Upload an Image" description="Take a photo of a car or upload one to our platform." large={true} />
          <FeatureCard icon="🤖" title="AI Analysis" description="The latest AI models will identify the make, model, year, and more." large={true} />
          <FeatureCard icon="📊" title="Get Results" description="Receive vehicle details in a clean and organized format." large={true} />
        </div>
      </section>


      {/* CTA */}
      <section className="flex flex-col items-center text-center w-3/4 gap-4">
        <h1 className="text-2xl font-bold animate-gradient-text"> Ready to Identify A Car? </h1>
        <Link href="/" className={`inline-block px-6 py-3 rounded-2xl text-white text-md font-semibold bg-[#3B03FF]/80 transition-all duration-300 ease-in-out transform cursor-pointer hover:scale-105 shadow-lg hover:shadow-blue-500/20`}>
          Try It Now!
        </Link>
      </section>
    </div>
  );
};

export default AboutContent;
