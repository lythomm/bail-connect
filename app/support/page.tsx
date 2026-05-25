"use client";

import { useConvexAuth, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Send, Loader2, LifeBuoy, Check } from "lucide-react";
import Toast, { ToastType } from "@/components/Toast";

export default function SupportPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  const sendSupportEmail = useAction(api.emails.sendSupportEmail);

  // States
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const maxSubjectLength = 100;
  const maxMessageLength = 1000;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F6F6F6]">
        <span className="text-sm text-[#666666]">Chargement...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setToast({ message: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    setIsSending(true);
    try {
      await sendSupportEmail({
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject("");
      setMessage("");
      setIsSent(true);
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Une erreur est survenue lors de l'envoi de votre message.",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6F6F6]">
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="gov-badge mb-2">Assistance</span>
          <h1 className="text-2xl font-bold text-[#161616]">Contacter le Support</h1>
          <p className="text-sm text-[#666666] mt-1">
            Une question ou un problème ? Envoyez-nous un message.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-6">
          {isSent ? (
            <div className="text-center py-8 space-y-4 flex flex-col items-center">
              <div className="h-12 w-12 bg-[#E6F4EA] text-[#18753C] rounded-full flex items-center justify-center mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#161616]">Message envoyé !</h2>
              <p className="text-sm text-[#666666] max-w-sm">
                Votre demande a bien été transmise. Notre équipe va traiter votre message dans les plus brefs délais.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary text-xs py-2 px-4 mt-4"
              >
                Retour au tableau de bord
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[#161616] mb-6 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#000091]" /> Formulaire de contact
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-[#3A3A3A] mb-1.5 flex justify-between">
                    <span>Objet de votre demande</span>
                    <span className="font-normal text-[#666666]">
                      {subject.length} / {maxSubjectLength}
                    </span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    maxLength={maxSubjectLength}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Problème avec mon calendrier"
                    className="w-full text-sm border border-[#CCCCCC] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#000091] transition-all"
                    required
                    disabled={isSending}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-[#3A3A3A] mb-1.5 flex justify-between">
                    <span>Votre message</span>
                    <span className="font-normal text-[#666666]">
                      {message.length} / {maxMessageLength}
                    </span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    maxLength={maxMessageLength}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez votre problème ou votre question en détail..."
                    className="w-full text-sm border border-[#CCCCCC] rounded-md p-3 bg-white focus:outline-none focus:border-[#000091] transition-all resize-none"
                    required
                    disabled={isSending}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="btn-primary w-full sm:w-auto text-center justify-center flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer mon message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
