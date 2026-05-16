const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
		...init,
	});

	if (!response.ok) {
		const message = await response.text();
		const err = new Error(message || `Request failed with status ${response.status}`) as Error & { status: number };
		err.status = response.status;
		throw err;
	}

	return response.json() as Promise<T>;
}
