"use client";

import EmailVerificationGuard from "@/components/EmailVerificationGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmailVerificationGuard>{children}</EmailVerificationGuard>;
}
