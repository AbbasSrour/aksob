export const aiEnv = {
	get embeddingUrl() {
		return Bun.env.AI_EMBEDDING_PROVIDER_URL;
	},
	get embeddingKey() {
		return Bun.env.AI_EMBEDDING_PROVIDER_KEY;
	},
	get embeddingModel() {
		return Bun.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small";
	},
	get llmUrl() {
		return Bun.env.AI_LLM_PROVIDER_URL ?? Bun.env.AI_EMBEDDING_PROVIDER_URL;
	},
	get llmKey() {
		return Bun.env.AI_LLM_PROVIDER_KEY ?? Bun.env.AI_EMBEDDING_PROVIDER_KEY;
	},
	get llmModel() {
		return Bun.env.AI_LLM_MODEL ?? "deepseek-chat";
	},
	get matchTimeoutMs() {
		return Number(Bun.env.AI_MATCH_TIMEOUT_MS) || 8000;
	},

	get isConfigured() {
		return Boolean(this.embeddingUrl && this.embeddingKey);
	},
} as const;
