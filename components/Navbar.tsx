"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Building, Calendar, User } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated } = useConvexAuth();

  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldSignOut, setShouldSignOut] = useState(false);

  const excludedPaths = ["/signin", "/cgu", "/cgv", "/confidentialite", "/mentions-legales"];
  const isExcluded =
    excludedPaths.includes(pathname) ||
    pathname?.startsWith("/apply") ||
    pathname?.startsWith("/calendar/book");

  useEffect(() => {
    if (shouldSignOut && pathname === "/") {
      setShouldSignOut(false);
      signOut();
    }
  }, [shouldSignOut, pathname, signOut]);

  useEffect(() => {
    const shouldAddPadding = isAuthenticated && !isExcluded;

    if (shouldAddPadding) {
      document.body.classList.add("pb-16", "md:pb-0");
    } else {
      document.body.classList.remove("pb-16", "md:pb-0");
    }

    return () => {
      document.body.classList.remove("pb-16", "md:pb-0");
    };
  }, [isAuthenticated, pathname, isExcluded]);

  if (isExcluded) {
    return null;
  }

  const handleSignOut = () => {
    setShouldSignOut(true);
    router.push("/");
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${targetId}`);
      }
    }
  };


  return (
    <>
      <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left brand logo */}
      <div className="flex items-center gap-4">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 select-none group">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm rounded-[0.25rem] transition-colors group-hover:bg-[#1212ff]">
            BC
          </div>
          <span className="font-bold text-[#161616] text-lg hover:underline decoration-2 decoration-[#000091] underline-offset-4">
            BailConnect
          </span>
        </Link>
      </div>

      {/* Middle: Landing page links (NOT authenticated) */}
      {!isAuthenticated && (
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#comparatif"
            onClick={(e) => handleScroll(e, "comparatif")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            Pourquoi nous ?
          </Link>
          <Link
            href="/#fonctionnement"
            onClick={(e) => handleScroll(e, "fonctionnement")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            Comment ça marche
          </Link>
          <Link
            href="/#espace-locataire"
            onClick={(e) => handleScroll(e, "espace-locataire")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            Locataires
          </Link>
          <Link
            href="/#tarifs"
            onClick={(e) => handleScroll(e, "tarifs")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            Tarifs
          </Link>
          <Link
            href="/#faq"
            onClick={(e) => handleScroll(e, "faq")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            FAQ
          </Link>
        </nav>
      )}

      {/* Middle: Dashboard links (authenticated) */}
      {isAuthenticated && (
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard" className={`text-sm font-medium px-4 py-2 transition-colors ${pathname === "/dashboard" ? "text-[#000091] underline underline-offset-8" : "text-[#3A3A3A] hover:text-[#000091]"}`}>
            Tableau de bord
          </Link>
          <Link href="/annonces" className={`text-sm font-medium px-4 py-2 transition-colors ${pathname === "/annonces" || pathname?.startsWith("/dashboard/campaigns") ? "text-[#000091] underline underline-offset-8" : "text-[#3A3A3A] hover:text-[#000091]"}`}>
            Mes logements
          </Link>
          <Link href="/calendar" className={`text-sm font-medium px-4 py-2 transition-colors ${pathname === "/calendar" ? "text-[#000091] underline underline-offset-8" : "text-[#3A3A3A] hover:text-[#000091]"}`}>
            Calendrier
          </Link>
          <Link href="/profile" className={`text-sm font-medium px-4 py-2 transition-colors ${pathname === "/profile" ? "text-[#000091] underline underline-offset-8" : "text-[#3A3A3A] hover:text-[#000091]"}`}>
            Mon Profil
          </Link>
        </nav>
      )}

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <button
            onClick={handleSignOut}
            className="btn-secondary text-sm h-9 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        ) : (
          <>
            <Link
              href="/apply"
              className="btn-secondary text-sm h-9 flex items-center cursor-pointer"
            >
              Je suis locataire
            </Link>
            <Link href="/signin" className="btn-primary text-sm h-9 flex items-center cursor-pointer">
              Se connecter
            </Link>
          </>
        )}
      </div>
    </header>

    {/* Bottom bar for mobile users (authenticated only) */}
    {isAuthenticated && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD] h-16 flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-[10px] font-medium transition-colors ${
            pathname === "/dashboard" ? "text-[#000091]" : "text-[#666666] hover:text-[#000091]"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/annonces"
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-[10px] font-medium transition-colors ${
            pathname === "/annonces" || pathname?.startsWith("/dashboard/campaigns")
              ? "text-[#000091]"
              : "text-[#666666] hover:text-[#000091]"
          }`}
        >
          <Building className="w-5 h-5" />
          <span>Logements</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-[10px] font-medium transition-colors ${
            pathname === "/calendar" ? "text-[#000091]" : "text-[#666666] hover:text-[#000091]"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Calendrier</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-[10px] font-medium transition-colors ${
            pathname === "/profile" ? "text-[#000091]" : "text-[#666666] hover:text-[#000091]"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Mon Profil</span>
        </Link>
      </nav>
    )}
  </>
  );
}
