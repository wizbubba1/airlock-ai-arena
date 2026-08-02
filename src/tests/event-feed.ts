import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildCertifiedEventFeed, buildCertifiedEventFeedMarkdown } from '../engine';

const seed = process.argv[2] ?? 'airlock-stage-zero-demo';
const jsonPath = resolve(process.argv[3] ?? `./artifacts/airlock-event-feed-${seed}.json`);
const markdownPath = resolve(process.argv[4] ?? `./artifacts/airlock-event-feed-${seed}.md`);
const feed = buildCertifiedEventFeed(seed);

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(feed, null, 2)}\n`);
writeFileSync(markdownPath, buildCertifiedEventFeedMarkdown(feed));

console.log(
  JSON.stringify(
    {
      ok: true,
      jsonPath,
      markdownPath,
      seed,
      events: feed.events.length,
      winner: feed.terminal.winner,
      feedHash: feed.feedHash,
    },
    null,
    2,
  ),
);
