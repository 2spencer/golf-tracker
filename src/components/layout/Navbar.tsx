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
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/nine-before-nine.png"
              alt="Nine Before Nine"
              width={72}
              height={72}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 leading-none">Brought to you by</span>
              <Image
                src="/schneider-branch-logo.png"
                alt="Schneider & Branch"
                width={110}
                height={22}
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
      </div>
    </nav>
  );
}
