export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: '#0A0E14'}}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="nebula nebula-2" />
        <div className="grid-overlay" />
      </div>

      {/* Loading Card */}
      <div className="relative z-10">
        <div className="feature-card p-12 text-center">
          <div className="card-corner card-corner-tl" />
          <div className="card-corner card-corner-tr" />
          <div className="card-corner card-corner-bl" />
          <div className="card-corner card-corner-br" />

          {/* Spinner */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-t-[#3AE8FF] border-r-[#3AE8FF]/50 border-b-[#3AE8FF]/20 border-l-[#3AE8FF]/50 rounded-full animate-spin" />

            {/* Inner pulsing circle */}
            <div className="absolute inset-3 border-2 border-[#7CD2FF]/40 rounded-full animate-pulse" />

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#3AE8FF] rounded-full shadow-[0_0_20px_#3AE8FF]" />
          </div>

          {/* Text */}
          <h3 className="text-xl font-bold text-white mb-3 hologram-text-sm">
            Loading Campaigns
          </h3>

          <div className="flex gap-1 justify-center mb-4">
            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#7CD2FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <p className="text-[#B8C2CC] text-sm font-mono">
            Please wait...
          </p>

          <div className="card-pulse" />
        </div>
      </div>
    </div>
  );
}
