const Footer = () => {
  return (
    <footer className="flex flex-row items-center justify-center w-full text-[0.5rem] lg:text-[0.7rem] text-gray-700 gap-8 lg:gap-20 p-3 border-t-[0.25px] border-gray-900">
      <span> © 2025 What's That Car? </span>
      <a href="/terms-of-service" className="transition-colors duration-300 hover:text-white hover:underline"> Terms of Service </a>
      <a href="/privacy-policy" className="transition-colors duration-300 hover:text-white hover:underline"> Privacy Policy </a>
      {/* <a href="/faq" className="hover:text-white transition-colors">FAQ</a> */}
      <a href="mailto:williamong.dev@gmail.com" className="transition-colors duration-300 hover:text-white hover:underline"> Contact Us </a>
    </footer>

    // Vertical stack
    // <footer className="relative flex flex-col items-center justify-center w-full text-[8px] p-1 gap-1 border-t border-gray-700 text-gray-400">
    //   <nav className="flex gap-8">
    //     <a href="/terms" className="hover:text-black transition-colors">Terms of Service</a>
    //     <a href="/privacy" className="hover:text-black transition-colors">Privacy Policy</a>
    //     <a href="/faq" className="hover:text-black transition-colors">FAQ</a>
    //     <a href="/contact" className="hover:text-black transition-colors">Contact Us</a>
    //   </nav>
    //   <span>© 2025 WTC. All rights reserved.</span>
    // </footer>
  );
};

export default Footer;