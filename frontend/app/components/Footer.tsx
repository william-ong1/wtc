import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex flex-row items-center justify-center w-full text-[0.5rem] lg:text-[0.7rem] text-gray-700 gap-8 lg:gap-20 p-3 border-t-[0.25px] border-gray-900 bg-transparent">
      <span> © 2025 What's That Car? </span>
      <Link href="/terms-of-service" className="transition-colors duration-300 hover:text-white hover:underline"> Terms of Service </Link>
      <Link href="/privacy-policy" className="transition-colors duration-300 hover:text-white hover:underline"> Privacy Policy </Link>
      {/* <a href="/faq" className="hover:text-white transition-colors">FAQ</a> */}
      <Link href="/contact" className="transition-colors duration-300 hover:text-white hover:underline"> Contact Us </Link>
    </footer>
  );
};

export default Footer;