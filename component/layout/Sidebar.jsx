"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigation = [
    {
      label: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: "⌂",
        },
      ],
    },
    {
      label: "SECURITY",
      items: [
        {
          name: "Findings",
          href: "/findings",
          icon: "◇",
        },
        {
          name: "Analysis",
          href: "/analysis",
          icon: "◎",
        },
        {
          name: "Reports",
          href: "/reports",
          icon: "▤",
        },
      ],
    },
    {
      label: "WORKSPACE",
      items: [
        {
          name: "Projects",
          href: "/projects",
          icon: "◈",
        },
      ],
    },
    {
      label: "INTELLIGENCE",
      items: [
        {
          name: "Ask Sentinel",
          href: "/ask",
          icon: "✦",
        },
      ],
    },
  ];

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="
          fixed
          left-4
          top-4
          z-50
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-[#080A0D]/90
          text-[#B8BDC7]
          backdrop-blur-xl
          transition
          hover:border-[#6C63FF]/40
          hover:text-white
          lg:hidden
        "
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/70
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          border-white/[0.06]
          bg-[#050608]/95
          backdrop-blur-2xl
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#6C63FF]/30 bg-[#0D0B18] text-sm text-[#6C63FF]">
              ◇
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-white">
                SENTINEL
              </p>

              <p className="text-[8px] tracking-[0.25em] text-[#555D6B]">
                AI SECURITY
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="text-lg text-[#555D6B] hover:text-white lg:hidden"
          >
            ×
          </button>

        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {navigation.map((section) => (
            <div key={section.label} className="mb-6">

              <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.22em] text-[#3F454F]">
                {section.label}
              </p>

              <div className="space-y-1">

                {section.items.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-xs
                        transition
                        ${
                          active
                            ? "border border-[#6C63FF]/15 bg-[#6C63FF]/[0.08] text-white"
                            : "border border-transparent text-[#68707D] hover:bg-white/[0.03] hover:text-[#B8BDC7]"
                        }
                      `}
                    >

                      <span
                        className={`
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-md
                          text-sm
                          ${
                            active
                              ? "bg-[#0D0B18] text-[#6C63FF]"
                              : "text-[#555D6B] group-hover:text-[#8B929F]"
                          }
                        `}
                      >
                        {item.icon}
                      </span>

                      <span className="truncate">
                        {item.name}
                      </span>

                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
                      )}

                    </Link>
                  );
                })}

              </div>

            </div>
          ))}

        </nav>


        {/* Bottom status */}
        <div className="border-t border-white/[0.06] p-4">

          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />

              <span className="text-[9px] uppercase tracking-[0.18em] text-[#555D6B]">
                Sentinel Online
              </span>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}