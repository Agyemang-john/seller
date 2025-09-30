export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 sm:py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} Negromart. All rights reserved.</p>
        <div className="mt-2 space-x-2 sm:space-x-4">
          <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition duration-300">Privacy</a>
          <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition duration-300">Terms</a>
          <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition duration-300">Contact</a>
        </div>
      </div>
    </footer>
  );
}