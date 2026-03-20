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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/nine-before-nine.png"
              alt="Nine Before Nine"
              width={120}
              height={60}
              className="object-contain"
            />
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Brought to you by bar */}
        <div className="flex items-center justify-center gap-2 py-1.5 border-t border-forest-lighter/50">
          <span className="text-gray-500 text-xs">Brought to you by</span>
          <Image
            src="/schneider-branch-logo.png"
            alt="Schneider & Branch"
            width={120}
            height={24}
            className="object-contain opacity-80"
          />
        </div>
      </div>
    </nav>
  );
}
