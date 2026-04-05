import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth.ts";

export type SignOutInput = Parameters<typeof authClient.signOut>[0];

export const signOutFn = async (params?: SignOutInput, headers?: Headers) => {
	const res = await authClient.signOut({
		...(params ?? {}),
		fetchOptions: {
			...(params?.fetchOptions ?? {}),
			headers,
		},
	});

	if (res.error) {
		throw res.error;
	}

	return res.data;
};

export const signOutServerFn = createIsomorphicFn()
	.client((params?: SignOutInput) => signOutFn(params))
	.server((params?: SignOutInput) => signOutFn(params, getRequestHeaders()));
