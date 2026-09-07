"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-30
        h-16
        border-b
        border-white/[0.06]
        bg-[#050608]/75
        backdrop-blur-xl
      "
    >

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:ml-64 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-3 pl-12 lg:pl-0">

          <div className="hidden h-7 w-px bg-white/[0.06] sm:block" />

          <div>
            <p className="text-[9px] font-semibold tracking-[0.25em] text-[#555D6B]">
              SECURITY OPERATIONS
            </p>

            <p className="mt-0.5 text-xs text-[#8B929F]">
              SentinelAI
            </p>
          </div>

        </div>


        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Status */}
          <div className="hidden items-center gap-2 sm:flex">

            <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />

            <span className="text-[9px] uppercase tracking-[0.16em] text-[#555D6B]">
              Systems Operational
            </span>

          </div>


          {/* Settings */}
          <Link
            href="/settings"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-white/[0.06]
              bg-white/[0.02]
              text-sm
              text-[#68707D]
              transition
              hover:border-white/[0.12]
              hover:text-white
            "
            aria-label="Settings"
          >
            ⚙
          </Link>

        </div>

      </div>

    </header>
  );
}