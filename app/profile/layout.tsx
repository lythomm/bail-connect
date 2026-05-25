"use client";

import EmailVerificationGuard from "@/components/EmailVerificationGuard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmailVerificationGuard>{children}</EmailVerificationGuard>;
}
