"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Plus, Home } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <header className="bg-white border-b border-[#DDDDDD] h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-3 select-none group">
          <div className="h-8 w-8 bg-[#000091] text-white flex items-center justify-center font-bold text-sm rounded-[0.25rem] transition-colors group-hover:bg-[#1212ff]">
            BC
          </div>
          <span className="font-bold text-[#161616] text-lg hover:underline decoration-2 decoration-[#000091] underline-offset-4">
            BailConnect
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && user?.name && (
          <span className="text-sm font-medium text-[#3A3A3A] hidden sm:inline mr-2">
            Bonjour, {user.name}
          </span>
        )}

        {pathname === "/dashboard" ? (
          <Link
            href="/dashboard/campaigns/new"
            className="btn-primary text-sm h-9 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau logement</span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="btn-secondary text-sm h-9 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Tableau de bord</span>
          </Link>
        )}

        {isAuthenticated && (
          <button
            onClick={handleSignOut}
            className="btn-secondary text-sm h-9 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        )}
      </div>
    </header>
  );
}
