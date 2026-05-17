import { embed } from "ai";
import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";

import { db, schema } from "@/db";
import { aiClient } from "@/lib/ai/client";
import { buildProfileText } from "@/lib/ai/profile";
import { logger } from "@/utils/logger";

const AI_MATCH_TIMEOUT_MS = 8000;

export function cosineSimilarity(a: number[], b: number[]): number {
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function generateAndStoreEmbedding(userId: string): Promise<void> {
	if (!aiClient.isEmbeddingConfigured) {
		logger.info("AI not configured, skipping embedding generation", { userId });
		return;
	}

	const model = aiClient.embeddingModel;
	if (!model) return;

	try {
		const profileText = await buildProfileText(userId);
		if (!profileText.trim()) return;

		const abort = new AbortController();
		const timeout = setTimeout(() => abort.abort(), AI_MATCH_TIMEOUT_MS);

		const { embedding } = await embed({
			model,
			value: profileText,
			abortSignal: abort.signal,
		});

		clearTimeout(timeout);

		await db
			.insert(schema.userSettings)
			.values({ userId, embedding: JSON.stringify(embedding) })
			.onConflictDoUpdate({
				target: schema.userSettings.userId,
				set: { embedding: JSON.stringify(embedding) },
			});
	} catch (error) {
		logger.error("Failed to generate embedding", {
			userId,
			error: error instanceof Error ? error.message : error,
		});
	}
}

export async function findTopCandidates(
	requesterId: string,
	candidateIds: string[],
	topK: number,
): Promise<Array<{ userId: string; similarity: number }>> {
	if (!aiClient.isEmbeddingConfigured) return [];

	const [requesterSettings] = await db
		.select({ embedding: schema.userSettings.embedding })
		.from(schema.userSettings)
		.where(eq(schema.userSettings.userId, requesterId));

	if (!requesterSettings?.embedding) return [];

	const requesterVector: number[] = JSON.parse(requesterSettings.embedding);

	const candidates = await db
		.select({
			userId: schema.userSettings.userId,
			embedding: schema.userSettings.embedding,
		})
		.from(schema.userSettings)
		.where(
			and(
				isNotNull(schema.userSettings.embedding),
				ne(schema.userSettings.userId, requesterId),
				inArray(schema.userSettings.userId, candidateIds),
			),
		);

	const scored = candidates
		.map((c) => ({
			userId: c.userId,
			similarity: cosineSimilarity(requesterVector, JSON.parse(c.embedding!)),
		}))
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, topK);

	return scored;
}
