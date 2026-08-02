import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { verifyCertifiedEventFeed } from '../engine';
import type { CertifiedEventFeed } from '../engine/event-feed';

const path = resolve(process.argv[2] ?? './artifacts/airlock-event-feed-airlock-stage-zero-demo.json');
const feed = JSON.parse(readFileSync(path, 'utf8')) as CertifiedEventFeed;
const result = verifyCertifiedEventFeed(feed);

console.log(
  JSON.stringify(
    {
      ok: result.ok,
      path,
      seed: result.seed,
      events: feed.events.length,
      errors: result.errors,
      expectedFeedHash: result.expected.feedHash,
      actualFeedHash: feed.feedHash,
    },
    null,
    2,
  ),
);

if (!result.ok) {
  process.exitCode = 1;
}
