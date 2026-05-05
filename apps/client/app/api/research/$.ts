import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/config/env.ts";

const getApiBase = () =>
	env.API_URL ??
	(typeof process !== "undefined" ? process.env.API_URL : undefined) ??
	"http://localhost:4000";

async function proxyResearchApi(request: Request) {
	const url = new URL(request.url);
	const backendUrl = `${getApiBase()}${url.pathname}${url.search}`;

	const forwardHeaders = new Headers();
	for (const [key, value] of request.headers) {
		if (key.toLowerCase() === "host") continue;
		forwardHeaders.set(key, value);
	}

	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers: forwardHeaders,
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		init.duplex = "half";
	}

	const response = await fetch(backendUrl, init);

	const responseHeaders = new Headers(response.headers);
	responseHeaders.delete("content-encoding");
	responseHeaders.delete("content-length");

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

export const Route = createFileRoute("/api/research/$")({
	ssr: true,
	server: {
		handlers: {
			GET: ({ request }) => proxyResearchApi(request),
			POST: ({ request }) => proxyResearchApi(request),
			PUT: ({ request }) => proxyResearchApi(request),
			DELETE: ({ request }) => proxyResearchApi(request),
		},
	},
});
