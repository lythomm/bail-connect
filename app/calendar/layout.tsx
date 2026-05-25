"use client";

import { usePathname } from "next/navigation";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Do not enforce email verification for public booking pages
  if (pathname?.startsWith("/calendar/book")) {
    return <>{children}</>;
  }

  return <EmailVerificationGuard>{children}</EmailVerificationGuard>;
}
