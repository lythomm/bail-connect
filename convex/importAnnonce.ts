"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const annonceSchema = z.object({
  titre: z.string().describe("Le titre de l'annonce immobilière"),
  description: z.string().describe("La description complète et détaillée du bien immobilier"),
  prixLoyer: z.number().describe("Le prix du loyer charges comprises (CC) si indiqué, ou le prix de vente"),
  charges: z.number().optional().describe("Le montant mensuel des charges si spécifié séparément"),
  surface: z.number().describe("La surface habitable en mètres carrés (m²)"),
  pieces: z.number().describe("Le nombre de pièces principales"),
  ville: z.string().describe("La ville où est situé le bien immobilier"),
  codePostal: z.string().describe("Le code postal de la ville à 5 chiffres"),
});

const firecrawlSchema = {
  type: "object",
  properties: {
    titre: { type: "string", description: "Le titre de l'annonce immobilière" },
    description: { type: "string", description: "La description complète et détaillée du bien" },
    prixLoyer: { type: "number", description: "Le loyer mensuel charges comprises (CC) si indiqué, ou le prix de vente" },
    charges: { type: "number", description: "Le montant mensuel des charges si spécifié séparément" },
    surface: { type: "number", description: "La surface habitable en m²" },
    pieces: { type: "number", description: "Le nombre de pièces principales" },
    ville: { type: "string", description: "La ville où est situé le bien" },
    codePostal: { type: "string", description: "Le code postal à 5 chiffres" }
  },
  required: ["titre", "description", "prixLoyer", "surface", "pieces", "ville", "codePostal"]
};

export const scrape = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authentification
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Non autorisé");
    }

    // Vérification de l'abonnement PRO et rate limiting
    await ctx.runMutation(api.users.checkAndRecordScrape);

    // Validation et nettoyage de l'URL (protection SSRF, longueur max, regex et protocoles autorisés)
    if (args.url.length > 2048) {
      throw new Error("L'URL est trop longue (maximum 2048 caractères).");
    }

    const urlRegex = /^https?:\/\/(?!localhost|127\.|192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[0-1]))[^\s/$.?#].[^\s]*$/i;
    if (!urlRegex.test(args.url)) {
      throw new Error("Format d'URL invalide ou adresse non autorisée.");
    }

    try {
      const parsedUrl = new URL(args.url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Seuls les protocoles HTTP et HTTPS sont autorisés.");
      }
    } catch (e) {
      throw new Error("L'URL fournie est invalide.");
    }

    // 2. Récupération de la clé API
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("Clé API Firecrawl manquante sur le serveur Convex");
    }

    // 3. Appel Firecrawl (V2 scrape avec format json et prompt)
    const app = new FirecrawlApp({ apiKey });
    const response = await app.scrape(args.url, {
      formats: [
        {
          type: "json",
          schema: firecrawlSchema,
          prompt: "Extraire les informations de l'annonce immobilière.",
        }
      ],
      proxy: "enhanced",
      maxAge: 0,
      storeInCache: false,
      waitFor: 2000,
    });

    console.log("Firecrawl raw response:", JSON.stringify(response));

    const extractedData = response.json;
    if (!extractedData) {
      throw new Error("Aucune donnée n'a pu être extraite");
    }

    // 4. Validation Zod
    const validatedData = annonceSchema.safeParse(extractedData);
    if (!validatedData.success) {
      throw new Error("Les données extraites ne respectent pas le schéma attendu");
    }

    return validatedData.data;
  },
});
