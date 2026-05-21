import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-white text-center px-6 py-12">
      <div className="inline-flex items-center justify-center h-12 w-12 bg-[#000091] text-white font-bold text-xl mb-6 select-none">
        BC
      </div>
      <h1 className="text-3xl font-bold text-[#161616] mb-4">404 - Page non trouvée</h1>
      <p className="text-sm text-[#666666] max-w-md mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée. Si vous tentiez d'accéder à un formulaire de candidature, veuillez vérifier le lien fourni par le propriétaire.
      </p>
      <Link href="/" className="btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
}
