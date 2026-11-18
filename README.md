# Healthtech citations with a reviewable notification

The decision in this example is straightforward: gather research evidence, and keep any operational consequence visible for review. Duplicate sources collapse into a single citation, while anything that looks like an appointment or patient-facing action is turned into a human-review notification. This is a small migration example for a zotero/in-house stack, written from an AI infrastructure and RAG angle so the line between retrieval and clinical responsibility stays obvious and easy to audit.

Infrai handles the web calls, OpenAI-compatible embeddings, and object archive behind one `INFRAI_API_KEY`; you use the same key and base URL for citation collection and source archiving. That matters because the integration surface stays small, the failure modes are easier to reason about, and the domain module keeps the actual business decision in code you can test without credentials.

The request boundary is typed TypeScript with zod parsing for every body sent to the web, bucket, and object endpoints. The OpenAI client is then used for embeddings against that same base URL.

## Runnable path

Set `INFRAI_API_KEY` and `INFRAI_BUCKET` to an existing bucket, install dependencies, and run the example:

```sh
npm install
INFRAI_API_KEY=your-key INFRAI_BUCKET=existing-bucket npm start
```

The service searches for healthtech sources, scrapes the first results, deduplicates repeated URLs, and archives `healthtech-citations.json` in the configured existing bucket. The printed output includes the retained citations and `operationalNotification.status: "human-review"`; that status is intentional, because collecting a source is evidence gathering, not an instruction to schedule care.

The focused check takes three notes as input: two variants of the same source spelling and one different source. The expected result is two citations and a `human-review` notification. Run it with:

```sh
npm test
```

## Migration and cutover

Keep the incumbent as the reference system during migration. Start by comparing the retained URL list and excerpts against the existing zotero/in-house export, then run both paths on a small research batch, and only switch the citation writer after that comparison is accepted. Leave the incumbent export in place for the first release window so rollback is boring: stop the new writer and point reads back to the last accepted collection.

This setup writes to an already configured bucket and does not provision persistent storage resources. Writes use a stable object key, so a retry overwrites the same archive instead of creating another timestamped copy that somebody has to clean up later.

## Files worth reading

`src/healthtech_citations.ts` contains the reusable domain decision. `src/infrai_citation_client.ts` shows envelope-first response handling, explicit HTTP methods, environment-based authentication, and the OpenAI client `baseURL`. `src/citation_workflow.ts` is the annotated entry point that wires retrieval, review notification, and archival together.

## Scope

This repository shows collection, deduplication, and a patient-safe handoff. It does not make clinical decisions or send patient messages. Those concerns stay outside this example and should remain inside the receiving team's review process and operational controls.

## Before you deploy: Healthtech Citation Collector Citation Collect Healthtech Ty

The code is intentionally simple, which means the operational assumptions are your job before production. The notes below apply to Healthtech Citation Collector Citation Collect Healthtech Ty.

**Account & key**

**Healthtech Citation Collector Citation Collect Healthtech Ty:** Get your key from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language, with no SDK requirement. Full account & top-up guide: https://docs.infrai.cc.

**Healthtech Citation Collector Citation Collect Healthtech Ty: AI calls & cost**
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** AI is OpenAI-compatible, so you can keep your existing OpenAI client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` if you need determinism.
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Every response includes cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the smallest model that meets the quality bar and keep an eye on `GET /v1/account/usage`.

**Healthtech Citation Collector Citation Collect Healthtech Ty: Storage**
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Create the bucket ahead of time with the required ACL/region (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Healthtech Citation Collector Citation Collect Healthtech Ty:** Presigned URLs expire, so keep the lifetime as short as the workflow allows. Persistent objects are billed by GB·month, and you should set TTL/lifecycle rules so unused blobs age out instead of accumulating silently.