import { digest } from './audit';

export interface PromptRevealStage {
  id: 'pre-season-commit' | 'post-match-audit' | 'challenge-access' | 'public-lagged-reveal';
  timing: string;
  audience: string;
  material: string;
  purpose: string;
}

export interface PromptRevealPolicy {
  schema: 'airlock.prompt_reveal_policy.stage1.preview.v1';
  seasonId: string;
  policy: {
    commitmentRequired: true;
    publicRevealLagSeasons: 2;
    livePromptPublication: 'forbidden';
    auditAccess: 'tee-or-escrowed-auditor-only';
    challengeAccess: 'auditor-mediated';
  };
  stages: PromptRevealStage[];
  protectedAuthorMoat: {
    privatePromptCapCharacters: 4000;
    publicPersonalityCard: 'always-public';
    publicMatchHistory: 'always-public';
    privatePromptReuseWindow: 'current-and-next-season';
  };
  promptRevealHash: string;
}

export function buildPromptRevealPolicy(seasonId = 'stage1-preview.001'): PromptRevealPolicy {
  const policyCore = {
    schema: 'airlock.prompt_reveal_policy.stage1.preview.v1',
    seasonId,
    policy: {
      commitmentRequired: true,
      publicRevealLagSeasons: 2,
      livePromptPublication: 'forbidden',
      auditAccess: 'tee-or-escrowed-auditor-only',
      challengeAccess: 'auditor-mediated',
    },
    stages: [
      {
        id: 'pre-season-commit',
        timing: 'before season lock',
        audience: 'public',
        material: 'prompt commitment hash only',
        purpose: 'Freeze authored strategy before any match entropy or ladder results exist.',
      },
      {
        id: 'post-match-audit',
        timing: 'after each match finalizes',
        audience: 'TEE verifier or escrowed auditor set',
        material: 'full private prompt and committed match inputs',
        purpose: 'Allow fairness review without publishing live strategy prompts.',
      },
      {
        id: 'challenge-access',
        timing: 'during optimistic challenge window',
        audience: 'auditor-mediated challenge process',
        material: 'minimum prompt material needed to adjudicate the challenged output',
        purpose: 'Support bounties while preventing prompt scraping through frivolous challenges.',
      },
      {
        id: 'public-lagged-reveal',
        timing: 'two completed seasons after use',
        audience: 'public archive',
        material: 'full prompt text and matching commitment hash',
        purpose: 'Turn old metas into study material after live author moats expire.',
      },
    ],
    protectedAuthorMoat: {
      privatePromptCapCharacters: 4000,
      publicPersonalityCard: 'always-public',
      publicMatchHistory: 'always-public',
      privatePromptReuseWindow: 'current-and-next-season',
    },
  } satisfies Omit<PromptRevealPolicy, 'promptRevealHash'>;

  return {
    ...policyCore,
    promptRevealHash: digest(policyCore),
  };
}
