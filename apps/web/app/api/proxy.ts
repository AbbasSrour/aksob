const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function proxyApiRequest(request: Request) {
	const url = new URL(request.url);
	const backendUrl = `${API_BASE_URL}${url.pathname}${url.search}`;
	const headers = new Headers(request.headers);

	headers.delete("host");
	headers.delete("content-length");
	headers.delete("connection");

	const response = await fetch(backendUrl, {
		method: request.method,
		headers,
		body: request.method === "GET" || request.method === "HEAD"
			? undefined
			: await request.arrayBuffer(),
	});

	const responseHeaders = new Headers(response.headers);
	responseHeaders.delete("content-encoding");
	responseHeaders.delete("content-length");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}
