const Footer = () => {
  return (
    <footer className="relative flex flex-wrap items-center justify-center w-full text-[10px] text-gray-600 p-3 gap-10 border-t border-[0.25px] border-white/5 shadow-xl shadow-white/5">
      <span>© 2025 WTC.</span>
      <nav className="flex gap-10">
        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        {/* <a href="/faq" className="hover:text-white transition-colors">FAQ</a> */}
        <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
      </nav>
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