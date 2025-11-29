export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#3AE8FF]/30 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-[#3AE8FF] font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl"></span>
              GO BUZZ
            </h3>
            <p className="text-[#B8C2CC] text-sm">
              A SocialFi engagement marketplace where verified contributions meet fair rewards.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">How It Works</a></li>
              <li><a href="#" className="footer-link">Campaigns</a></li>
              <li><a href="#" className="footer-link">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="footer-link">Create Campaign</a></li>
              <li><a href="#" className="footer-link">Become Contributor</a></li>
              <li><a href="#" className="footer-link">Verification System</a></li>
              <li><a href="#" className="footer-link">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="footer-link">Discord</a></li>
              <li><a href="#" className="footer-link">Twitter</a></li>
              <li><a href="#" className="footer-link">Documentation</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-900 to-transparent mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#B8C2CC] text-sm font-mono">
            © 2025 GO BUZZ. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-[#3AE8FF] text-sm font-mono">
            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-pulse" />
            <span>PLATFORM ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
