"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifySession = useAction(api.stripe.verifySession);

  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("Identifiant de session manquant.");
      return;
    }

    // Prevent double invocation in React StrictMode
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    const performVerification = async () => {
      try {
        const result = await verifySession({ sessionId });
        if (result.success) {
          setStatus("success");
          // Redirect to the annonces page after 2 seconds
          setTimeout(() => {
            router.push("/annonces");
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Le paiement n'a pas pu être vérifié.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Une erreur est survenue lors de la vérification.");
      }
    };

    performVerification();
  }, [sessionId, verifySession, router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F6F6F6] px-6">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] shadow-xl rounded-2xl p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4 py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#000091] animate-spin" />
            <h1 className="text-xl font-bold text-[#161616]">Vérification du paiement...</h1>
            <p className="text-sm text-[#666666] max-w-xs">
              Veuillez patienter quelques instants pendant que nous validons votre transaction avec Stripe.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-8 flex flex-col items-center animate-scale-in">
            <div className="w-16 h-16 bg-[#E6F3EA] rounded-full flex items-center justify-center border border-[#B9DFC5]">
              <CheckCircle2 className="w-10 h-10 text-[#18753C]" />
            </div>
            <h1 className="text-xl font-bold text-[#18753C]">Paiement validé !</h1>
            <p className="text-sm text-[#666666] max-w-xs">
              Votre annonce premium a été créée avec succès. Vous allez être redirigé...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-8 flex flex-col items-center animate-scale-in">
            <div className="w-16 h-16 bg-[#FCE8E6] rounded-full flex items-center justify-center border border-[#F8C0BC]">
              <AlertTriangle className="w-10 h-10 text-[#CE0500]" />
            </div>
            <h1 className="text-xl font-bold text-[#CE0500]">Échec de la validation</h1>
            <p className="text-sm text-[#666666] max-w-xs">
              {errorMessage || "Impossible de valider votre paiement."}
            </p>
            <div className="pt-4 flex gap-4 w-full">
              <Link
                href="/dashboard"
                className="btn-secondary flex-1 text-center justify-center text-xs py-2.5 rounded-xl"
              >
                Tableau de bord
              </Link>
              <Link
                href="/dashboard/campaigns/new"
                className="btn-primary flex-1 text-center justify-center text-xs py-2.5 rounded-xl"
              >
                Réessayer
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
