import { generateText } from "ai";
import { aiClient } from "@/modules/ai/ai-client";
import { buildProfileText } from "@/modules/ai/ai-profile";
import { aiEnv } from "@/modules/ai/ai-env";
import { logger } from "@/utils/logger";

interface RankedCandidate {
	userId: string;
	similarity: number;
}

interface LlmMatchResult {
	matchedUserId: string;
	explanation: string;
}

export async function llmSelectMatch(
	requesterId: string,
	connectionType: string,
	candidates: RankedCandidate[],
): Promise<LlmMatchResult | null> {
	if (!aiClient.isConfigured || candidates.length === 0) return null;

	const model = aiClient.llmModel;
	if (!model) return null;

	try {
		const requesterProfile = await buildProfileText(requesterId);

		const candidateProfiles: string[] = [];
		for (const c of candidates) {
			const profile = await buildProfileText(c.userId);
			candidateProfiles.push(
				`Candidate ID: ${c.userId}\nSimilarity: ${(c.similarity * 100).toFixed(1)}%\nProfile:\n${profile}`,
			);
		}

		const prompt = `You are a matchmaker for a university alumni connection platform. Recommend the best match from a list of candidates.

REQUESTER PROFILE:
${requesterProfile}

The requester is looking for: ${connectionType}

CANDIDATES (top matches by profile similarity):
${candidateProfiles.join("\n\n---\n\n")}

Select the best candidate for this connection type. Consider:
- Shared academic background or program
- Career alignment (for mentorship/career coaching)
- Complementary expertise and skills
- Common interests from bios and hobbies

Return ONLY a JSON object with "matchedUserId" (the candidate ID) and "explanation" (1-2 sentences why).`;

		const abort = new AbortController();
		const timeout = setTimeout(() => abort.abort(), aiEnv.matchTimeoutMs);

		const { text } = await generateText({
			model,
			system:
				"You are a matchmaking assistant. Always respond with valid JSON only.",
			prompt,
			maxOutputTokens: 300,
			temperature: 0.3,
			abortSignal: abort.signal,
		});

		clearTimeout(timeout);

		const cleaned = text
			.trim()
			.replace(/^```(?:json)?\s*/i, "")
			.replace(/\s*```$/, "");

		const result = JSON.parse(cleaned) as {
			matchedUserId?: string;
			explanation?: string;
		};

		if (!result.matchedUserId || !result.explanation) return null;

		const isValidCandidate = candidates.some(
			(c) => c.userId === result.matchedUserId,
		);
		if (!isValidCandidate) {
			logger.warn("LLM returned invalid candidate ID", {
				matchedUserId: result.matchedUserId,
				candidates: candidates.map((c) => c.userId),
			});
			return null;
		}

		return {
			matchedUserId: result.matchedUserId!,
			explanation: result.explanation!,
		};
	} catch (error) {
		logger.error("LLM match selection failed", {
			requesterId,
			error: error instanceof Error ? error.message : error,
		});
		return null;
	}
}
