const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>&copy; {new Date().getFullYear()} akgarments. All rights reserved.</div>
        <div className="flex gap-4">
          <button type="button" className="hover:text-amber">
            Privacy Policy
          </button>
          <button type="button" className="hover:text-amber">
            Terms
          </button>
          <button type="button" className="hover:text-amber">
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

