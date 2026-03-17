'use client'

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Blue glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl px-8 py-10 flex flex-col items-center text-center gap-4">
        {/* Checkmark */}
        <div className="text-green-400 text-5xl leading-none">✓</div>

        {/* Heading */}
        <h1 className="text-white text-2xl font-bold">
          You&apos;re now a Pro Member! 🎉
        </h1>

        {/* Subtext */}
        <p className="text-gray-400 text-sm leading-relaxed">
          Your account has been upgraded. Owner contacts, equity data and full signal breakdowns are now unlocked.
        </p>

        {/* CTA */}
        <a
          href="/finder"
          className="mt-2 inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Start Finding Deals →
        </a>

        {/* Receipt note */}
        <p className="text-gray-500 text-sm">Check your email for your receipt</p>
      </div>
    </main>
  )
}
