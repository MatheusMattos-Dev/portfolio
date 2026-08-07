import "server-only";
import { createClient, type ClientConfig, type QueryParams } from "next-sanity";
import {
  projectId,
  dataset,
  apiVersion,
  token,
  mode,
  sanityEnabled,
} from "@/lib/env.api";

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: mode === "development" ? true : false,
  ignoreBrowserTokenWarning: true,
  token,
  perspective: "published",
};

// createClient lança se projectId for vazio, então só instancia quando há credenciais
const client = sanityEnabled ? createClient(config) : null;

/**
 * Consulta o Sanity. Com o CMS desligado devolve `fallback` em vez de
 * quebrar a página — passe `[]` em queries de lista e deixe o padrão
 * (`null`) nas de documento único.
 */
export async function sanityFetch<QueryResponse>({
  query,
  qParams = {},
  tags,
  fallback = null as QueryResponse,
}: {
  query: string;
  qParams?: QueryParams;
  tags: string[];
  fallback?: QueryResponse;
}): Promise<QueryResponse> {
  if (!client) return fallback;

  try {
    return await client.fetch<QueryResponse>(query, qParams, {
      cache: mode === "development" ? "no-store" : "force-cache",
      next: { tags },
    });
  } catch (error) {
    console.error("Sanity fetch falhou:", error);
    return fallback;
  }
}
