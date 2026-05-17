import { proxyApiRequest } from "./proxy";

export async function loader({ request }: { request: Request }) {
	return proxyApiRequest(request);
}

export async function action({ request }: { request: Request }) {
	return proxyApiRequest(request);
}
