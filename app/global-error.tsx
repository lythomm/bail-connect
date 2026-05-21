"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <html lang="fr">
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "20px",
          color: "#161616"
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
            Une erreur inattendue est survenue
          </h2>
          <p style={{ color: "#666666", fontSize: "14px", marginBottom: "24px" }}>
            Le service a rencontré une anomalie temporaire.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#000091",
              color: "#ffffff",
              padding: "12px 24px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
