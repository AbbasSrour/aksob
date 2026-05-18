const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		const text = await response.text();
		let message = text || `Request failed with status ${response.status}`;
		try {
			const body = JSON.parse(text) as { error?: string; message?: string };
			message = body.error ?? body.message ?? message;
		} catch {
			// Keep the original response text when it is not JSON.
		}
		const err = new Error(message) as Error & { status: number };
		err.status = response.status;
		throw err;
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
