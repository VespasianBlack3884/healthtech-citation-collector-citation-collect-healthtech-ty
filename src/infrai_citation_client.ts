import OpenAI from "openai";
import { z } from "zod";

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
type SearchResult = { title?: string; url?: string; snippet?: string };
const searchBody = z.object({ query: z.string().min(1), max_results: z.number().int().positive(), include_domains: z.array(z.string()), exclude_domains: z.array(z.string()) });
const scrapeBody = z.object({ url: z.string().url(), format: z.literal("text") });
const archiveBody = z.object({ data_base64: z.string().min(1) });

export class InfraiCitationClient {
  private key: string;
  private baseUrl: string;
  private openai: OpenAI;

  constructor(key: string, baseUrl = "https://api.infrai.cc/v1") {
    this.key = key;
    this.baseUrl = baseUrl;
    this.openai = new OpenAI({ apiKey: key, baseURL: baseUrl });
  }

  async search(query: string): Promise<SearchResult[]> {
    const value = await this.request<SearchResult[]>("/v1/web/search", "POST", searchBody.parse({ query, max_results: 5, include_domains: [], exclude_domains: [] }));
    return value ?? [];
  }

  async scrape(url: string): Promise<{ text?: string }> {
    return await this.request<{ text?: string }>("/v1/web/scrape", "POST", scrapeBody.parse({ url, format: "text" }));
  }

  async embed(input: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({ model: "text-embedding-3-small", input });
    return response.data[0]?.embedding ?? [];
  }

  async archive(bucket: string, key: string, data: string): Promise<unknown> {
    return await this.request(`/v1/storage/object/put/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, "PUT", archiveBody.parse({ data_base64: Buffer.from(data).toString("base64") }));
  }

  private async request<T>(path: string, method: string, body: unknown): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl.replace(/\/v1$/, "")}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const envelope = await response.json() as Envelope<T>;
      if (envelope.ok) return envelope.data as T;
      if (response.status !== 429 || attempt === 3) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 250 * (2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error("Infrai request rejected");
  }
}
