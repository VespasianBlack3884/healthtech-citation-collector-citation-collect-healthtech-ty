import { InfraiCitationClient } from "./infrai_citation_client.ts";
import { dedupeCitations, type ResearchNote } from "./healthtech_citations.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");

const client = new InfraiCitationClient(key);
const bucket = process.env.INFRAI_BUCKET;
if (!bucket) throw new Error("Set INFRAI_BUCKET to an existing bucket before running the example.");
const query = "healthtech citation collector api";
const results = await client.search(query);
const notes: ResearchNote[] = [];
for (const result of results.slice(0, 3)) {
  if (!result.url) continue;
  const page = await client.scrape(result.url);
  notes.push({ title: result.title ?? result.url, query, url: result.url, excerpt: page.text ?? result.snippet ?? "" });
}
const decision = dedupeCitations(notes);
await client.archive(bucket, "healthtech-citations.json", JSON.stringify(decision, null, 2));
console.log(JSON.stringify(decision, null, 2));
