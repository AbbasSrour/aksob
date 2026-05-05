import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/config/env.ts";

const getApiBase = () =>
	env.API_URL ??
	(typeof process !== "undefined" ? process.env.API_URL : undefined) ??
	"http://localhost:4000";

async function proxyOpportunitiesApi(request: Request) {
	const url = new URL(request.url);
	const backendUrl = `${getApiBase()}${url.pathname}${url.search}`;

	const forwardHeaders: Record<string, string> = {
		"content-type": request.headers.get("content-type") || "application/json",
	};

	const cookie = request.headers.get("cookie");
	if (cookie) {
		forwardHeaders.cookie = cookie;
	}

	const origin = request.headers.get("origin");
	if (origin) {
		forwardHeaders.origin = origin;
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

export const Route = createFileRoute("/api/opportunities/$")({
	ssr: true,
	server: {
		handlers: {
			GET: ({ request }) => proxyOpportunitiesApi(request),
			POST: ({ request }) => proxyOpportunitiesApi(request),
			PUT: ({ request }) => proxyOpportunitiesApi(request),
			DELETE: ({ request }) => proxyOpportunitiesApi(request),
		},
	},
});
