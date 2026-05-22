"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated } = useConvexAuth();

  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldSignOut, setShouldSignOut] = useState(false);

  useEffect(() => {
    if (shouldSignOut && pathname === "/") {
      setShouldSignOut(false);
      signOut();
    }
  }, [shouldSignOut, pathname, signOut]);

  const excludedPaths = ["/signin", "/cgu", "/cgv", "/confidentialite", "/mentions-legales"];
  if (
    excludedPaths.includes(pathname) || 
    pathname?.startsWith("/apply/") || 
    pathname?.startsWith("/calendar/book")
  ) {
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
            href="/#dossier-facile" 
            onClick={(e) => handleScroll(e, "dossier-facile")}
            className="text-sm font-medium text-[#3A3A3A] hover:text-[#000091] px-4 py-2 transition-colors"
          >
            DossierFacile
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
            Mes rendez-vous
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
          <Link href="/signin" className="btn-primary text-sm h-9 flex items-center">
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
