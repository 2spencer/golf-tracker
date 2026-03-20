"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Leaderboard" },
  { href: "/rounds", label: "Rounds" },
  { href: "/add", label: "Add Round" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-forest-lighter bg-forest-light/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/nine-before-nine.png"
              alt="Nine Before Nine"
              width={60}
              height={60}
              className="object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-gray-500 leading-none">Brought to you by</span>
              <Image
                src="/schneider-branch-logo.png"
                alt="Schneider & Branch"
                width={100}
                height={20}
                className="object-contain mt-0.5"
              />
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex gap-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-green text-white"
                      : "text-gray-300 hover:bg-forest-lighter hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* S&B attribution — mobile only, below the main row */}
        <div className="flex sm:hidden items-center gap-1.5 mt-2 pb-1">
          <span className="text-xs text-gray-500">Brought to you by</span>
          <Image
            src="/schneider-branch-logo.png"
            alt="Schneider & Branch"
            width={90}
            height={18}
            className="object-contain"
          />
        </div>
      </div>
    </nav>
  );
}
