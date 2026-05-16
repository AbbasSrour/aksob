import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { aiEnv } from "@/modules/ai/ai-env";

function getEmbeddingProvider() {
	if (!aiEnv.isConfigured) return null;
	return createOpenAICompatible({
		name: "embedding",
		baseURL: aiEnv.embeddingUrl!,
		apiKey: aiEnv.embeddingKey,
	});
}

function getLlmProvider() {
	if (!aiEnv.isConfigured) return null;
	return createOpenAICompatible({
		name: "llm",
		baseURL: aiEnv.llmUrl!,
		apiKey: aiEnv.llmKey,
	});
}

export function getEmbeddingModel(provider: ReturnType<typeof getEmbeddingProvider>) {
	if (!provider) return null;
	return provider.embeddingModel(aiEnv.embeddingModel);
}

export function getLlmModel(provider: ReturnType<typeof getLlmProvider>) {
	if (!provider) return null;
	return provider(aiEnv.llmModel);
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
	get isConfigured() {
		return aiEnv.isConfigured;
	},
} as const;
