"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailVerificationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && user !== null && !user.emailVerificationTime) {
      router.replace("/verify-email");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <span className="text-sm text-[#666666]">Chargement de votre profil...</span>
      </div>
    );
  }

  // If not logged in or not verified, render nothing while redirecting (or not logged in will be handled by middleware)
  if (user === null || !user.emailVerificationTime) {
    return null;
  }

  return <>{children}</>;
}
