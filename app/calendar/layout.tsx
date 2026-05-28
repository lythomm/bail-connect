"use client";

import { usePathname } from "next/navigation";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Do not enforce email verification for public booking and withdraw pages
  if (pathname?.startsWith("/calendar/book") || pathname?.startsWith("/calendar/withdraw")) {
    return <>{children}</>;
  }

  return <EmailVerificationGuard>{children}</EmailVerificationGuard>;
}
