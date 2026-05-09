import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type ErrorObject = {
	message: string;
	error: string;
	code: string;
};

const resolveErrorMessage = (
	payload: Partial<ErrorObject> | Error | undefined,
	errorMessages?: Record<string, string>,
): string | undefined => {
	const errorPayload = payload as Record<string, unknown>;
	const candidates = [
		errorPayload,
		errorPayload?.data,
		errorPayload?.body,
		errorPayload?.error,
		errorPayload?.response?.data,
		errorPayload?.response,
		errorPayload?.cause,
	];

	let code: string | undefined;
	let message: string | undefined;
	let error: string | undefined;

	for (const candidate of candidates) {
		if (!candidate) continue;
		if (typeof candidate === "string") {
			message = message || candidate;
			error = error || candidate;
			continue;
		}
		const c = candidate as Record<string, unknown>;
		code = code || (c.code as string);
		message = message || (c.message as string);
		error = error || (c.error as string);
	}

	return (
		(code && errorMessages?.[code]) ||
		error ||
		message ||
		code
	);
};

const queryCache = new QueryCache({
	onError: (error) => {
		if (typeof window !== "undefined") {
			const err = error as Error;
			toast.error(`Something went wrong: ${err.message}`);
		}
	},
});

const mutationCache = new MutationCache({
	onMutate: (_, mutation) => {
		if (
			mutation.meta &&
			mutation.options.mutationKey &&
			mutation.meta.showToast !== false
		) {
			toast.loading(
				(mutation.meta.loadingMessage as string) || "Loading...",
				{
					id: mutation.options.mutationKey.join("-"),
				},
			);
		}
	},
	onSuccess: (_, __, ___, mutation) => {
		if (
			mutation.meta &&
			mutation.options.mutationKey &&
			mutation.meta.showToast !== false
		) {
			toast.success(
				(mutation.meta.successMessage as string) || "Done!",
				{
					id: mutation.options.mutationKey.join("-"),
				},
			);
		}
	},
	onError: (err, _variables, _context, mutation) => {
		if (
			mutation.meta &&
			mutation.options.mutationKey &&
			mutation.meta.showToast !== false
		) {
			const fallback =
				(mutation.meta.errorMessages as Record<string, string> | undefined)
					?.default ?? "Something went wrong...";
			const resolved = resolveErrorMessage(
				err as Error,
				mutation.meta.errorMessages as Record<string, string> | undefined,
			);
			toast.error(resolved ?? fallback, {
				id: mutation.options.mutationKey.join("-"),
			});
		}
	},
});

export function createQueryClient() {
	return new QueryClient({
		queryCache,
		mutationCache,
		defaultOptions: {
			queries: {
				staleTime: 6000,
				retry: 1,
				refetchOnWindowFocus: false,
			},
			mutations: {
				meta: {
					showToast: true,
				},
			},
		},
	});
}
