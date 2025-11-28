'use client';

import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";

export default function Navbar() {
  return (
    <nav className="nav-container">
      <div className="nav-glow" />
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="nav-logo-icon">
              <div className="logo-hexagon"></div>
            </div>
            <div className="nav-logo-text">
              <span className="text-xl font-bold text-white tracking-wider">
                GO
              </span>
              <span className="text-xl font-bold text-[#3AE8FF] tracking-wider">
                {" "}
                BUZZ
              </span>
            </div>
          </Link>

          {/* Hamburger Menu */}
          <HamburgerMenu />
        </div>
      </div>
    </nav>
  );
}
