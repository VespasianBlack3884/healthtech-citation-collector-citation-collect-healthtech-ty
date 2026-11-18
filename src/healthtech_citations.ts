export type ResearchNote = { title: string; query: string; url: string; excerpt: string };

export type CitationDecision = {
  citations: ResearchNote[];
  operationalNotification: { status: "human-review"; message: string };
};

function sourceKey(url: string): string {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function dedupeCitations(notes: ResearchNote[]): CitationDecision {
  const unique = new Map<string, ResearchNote>();
  for (const note of notes) {
    const key = sourceKey(note.url);
    if (!unique.has(key)) unique.set(key, note);
  }
  return {
    citations: [...unique.values()],
    operationalNotification: {
      status: "human-review",
      message: "Research sources collected; appointment and patient-facing actions require clinical review.",
    },
  };
}
