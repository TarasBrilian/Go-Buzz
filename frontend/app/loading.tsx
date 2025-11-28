export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: '#0A0E14'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="nebula nebula-1" />
        <div className="grid-overlay" />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Orbital Spinner */}
        <div className="relative w-32 h-32 mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-2 border-[#3AE8FF]/20 rounded-full" />

          {/* Spinning Orbit */}
          <div className="absolute inset-0 animate-spin">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#3AE8FF] rounded-full shadow-[0_0_15px_#3AE8FF]" />
          </div>

          {/* Inner Ring */}
          <div className="absolute inset-4 border-2 border-[#7CD2FF]/30 rounded-full animate-pulse" />

          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-[#3AE8FF] to-[#7CD2FF] rounded-full animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2 hologram-text-sm">
            Loading
          </h2>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-[#7CD2FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Status Text */}
        <p className="mt-4 text-[#B8C2CC] font-mono text-sm">
          Initializing system...
        </p>
      </div>
    </div>
  );
}
