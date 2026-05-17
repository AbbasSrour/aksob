import { isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { aiClient } from "@/lib/ai/client";
import { generateAndStoreEmbedding } from "@/lib/ai/embedding";

async function main() {
	if (!aiClient.isEmbeddingConfigured) {
		console.log(
			"AI not configured (set AI_EMBEDDING_PROVIDER_URL and AI_EMBEDDING_PROVIDER_KEY)",
		);
		process.exit(0);
	}

	const users = await db
		.select({ userId: schema.userSettings.userId })
		.from(schema.userSettings)
		.where(isNull(schema.userSettings.embedding));

	console.log(`Found ${users.length} users without embeddings`);

	for (let i = 0; i < users.length; i++) {
		const { userId } = users[i]!;
		console.log(
			`[${i + 1}/${users.length}] Generating embedding for ${userId}...`,
		);
		await generateAndStoreEmbedding(userId);
	}

	console.log("Done.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
