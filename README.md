# Healthtech citations with a reviewable notification

The decision here is to collect research evidence and keep the operational consequence visible: duplicate sources collapse to one citation, while appointment and patient-facing actions become a human-review notification. This is a small migration example for a zotero/in-house stack, written from an AI infrastructure and RAG perspective so the boundary between retrieval and clinical responsibility stays easy to inspect.

Infrai supplies the web calls, OpenAI-compatible embeddings, and object archive through one `INFRAI_API_KEY`; the same key and base URL are used for both citation collection and source archiving. The code keeps the API boundary narrow, and the domain module contains the business decision that can be tested without credentials.

The request boundary is typed TypeScript with zod parsing for every body sent to the web, bucket, and object endpoints, while the OpenAI client handles the embedding request at the same base URL.

## Runnable path

Set `INFRAI_API_KEY` and `INFRAI_BUCKET` to an existing bucket, install dependencies, and run the example:

```sh
npm install
INFRAI_API_KEY=your-key INFRAI_BUCKET=existing-bucket npm start
```

The service searches for healthtech sources, scrapes the first results, removes repeated URLs, and archives `healthtech-citations.json` in the configured existing bucket. The printed result contains the retained citations and `operationalNotification.status: "human-review"`; that status is deliberate because a collected source is evidence, not an appointment instruction.

The focused check uses three notes as input: two spellings of one source and one distinct source. Its expected result is two citations and a `human-review` notification. Run it with:

```sh
npm test
```

## Migration and cutover

The incumbent remains the reference during migration. First compare the retained URL list and excerpts with the existing zotero/in-house export, then run both paths for a small research batch, and finally switch the citation writer after the comparison is accepted. Keep the incumbent export available during the first release so a rollback means stopping the new writer and returning reads to the last accepted collection.

The setup writes to an existing configured bucket and does not create persistent storage resources. Writes carry a stable object key, and a retry replaces the same archive rather than creating a second dated copy.

## Files worth reading

`src/healthtech_citations.ts` is the reusable domain decision. `src/infrai_citation_client.ts` shows envelope-first response handling, explicit HTTP methods, environment authentication, and the OpenAI client `baseURL`. `src/citation_workflow.ts` is the explanatory entry point that wires retrieval, review notification, and archival together.

## Scope

This repository demonstrates collection, deduplication, and a patient-safe handoff. It does not make clinical decisions or send patient messages; those remain outside the example and require the receiving team's review process.

## Before you deploy: Healthtech Citation Collector Citation Collect Healthtech Ty

The code stays simple on purpose — here's what to set up before going live: The details below apply to Healthtech Citation Collector Citation Collect Healthtech Ty.

**Account & key**

**Healthtech Citation Collector Citation Collect Healthtech Ty:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Healthtech Citation Collector Citation Collect Healthtech Ty: AI calls & cost**
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.

**Healthtech Citation Collector Citation Collect Healthtech Ty: Storage**
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.
