import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "@/config/env";

function isEmbeddingConfigured() {
	return Boolean(
		env.AI_EMBEDDING_PROVIDER_URL && env.AI_EMBEDDING_PROVIDER_KEY,
	);
}

function isLlmConfigured() {
	return Boolean(env.AI_LLM_PROVIDER_URL && env.AI_LLM_PROVIDER_KEY);
}

function getEmbeddingProvider() {
	if (!isEmbeddingConfigured()) return null;
	return createOpenAICompatible({
		name: "embedding",
		baseURL: env.AI_EMBEDDING_PROVIDER_URL!,
		apiKey: env.AI_EMBEDDING_PROVIDER_KEY,
	});
}

function getLlmProvider() {
	if (!isLlmConfigured()) return null;
	return createOpenAICompatible({
		name: "llm",
		baseURL: env.AI_LLM_PROVIDER_URL!,
		apiKey: env.AI_LLM_PROVIDER_KEY,
	});
}

export function getEmbeddingModel(
	provider: ReturnType<typeof getEmbeddingProvider>,
) {
	if (!provider) return null;
	return provider.embeddingModel(env.AI_EMBEDDING_MODEL);
}

export function getLlmModel(provider: ReturnType<typeof getLlmProvider>) {
	if (!provider) return null;
	return provider(env.AI_LLM_MODEL);
}

export const aiClient = {
	get embeddingProvider() {
		return getEmbeddingProvider();
	},
	get llmProvider() {
		return getLlmProvider();
	},
	get embeddingModel() {
		return getEmbeddingModel(this.embeddingProvider);
	},
	get llmModel() {
		return getLlmModel(this.llmProvider);
	},
	get isEmbeddingConfigured() {
		return isEmbeddingConfigured();
	},
	get isLlmConfigured() {
		return isLlmConfigured();
	},
} as const;
