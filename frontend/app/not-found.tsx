import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center" style={{background: '#0A0E14'}}>
      {/* Space Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Planets */}
        <div className="planet planet-1" />
        <div className="planet planet-2" />

        {/* Nebulae */}
        <div className="nebula nebula-1" />
        <div className="nebula nebula-2" />

        {/* Grid Overlay */}
        <div className="grid-overlay" />
      </div>

      {/* 404 Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Glitch Effect 404 */}
          <div className="mb-8 relative">
            <h1 className="text-[150px] md:text-[200px] font-bold leading-none">
              <span className="hologram-text text-[#3AE8FF]">404</span>
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-[#3AE8FF] opacity-10 blur-[100px] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Error Message */}
          <div className="holo-border inline-block mb-6">
            <div className="scan-line" />
            <h2 className="hologram-text-sm text-3xl md:text-4xl font-bold px-8 py-4">
              Page Not Found
            </h2>
          </div>

          <p className="text-lg text-[#B8C2CC] mb-8 leading-relaxed">
            Looks like you've drifted into uncharted space.
            <br />
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <button className="glass-button group">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="orbit-icon"></span>
                  Back to Home
                </span>
                <div className="button-glow" />
              </button>
            </Link>
            <Link href="/app">
              <button className="glass-button-secondary group">
                <span className="relative z-10 flex items-center gap-2">
                  <span className="signal-icon"></span>
                  View Campaigns
                </span>
              </button>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="feature-card max-w-md mx-auto p-6">
            <div className="card-corner card-corner-tl" />
            <div className="card-corner card-corner-tr" />
            <div className="card-corner card-corner-bl" />
            <div className="card-corner card-corner-br" />

            <div className="flex items-center justify-center gap-2 text-[#3AE8FF] font-mono text-sm">
              <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-pulse" />
              <span>ERROR_CODE: PAGE_NOT_FOUND</span>
            </div>

            <div className="card-pulse" />
          </div>

          {/* Orbit Ring Decoration */}
          <div className="orbit-ring mt-12">
            <div className="orbit-dot orbit-dot-1" />
            <div className="orbit-dot orbit-dot-2" />
            <div className="orbit-dot orbit-dot-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
