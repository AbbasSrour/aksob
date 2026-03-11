export const mutationKeyFactory = {
	create: () => ["create"] as const,
	update: () => ["update"] as const,
	delete: () => ["delete"] as const,

	auth: {
		entity: ["auth"] as const,
		login: () => [...mutationKeyFactory.auth.entity, "login"] as const,
		logout: () => [...mutationKeyFactory.auth.entity, "logout"] as const,
		verifyEmail: () =>
			[...mutationKeyFactory.auth.entity, "verifyEmail"] as const,
		sendEmailVerification: () =>
			[...mutationKeyFactory.auth.entity, "sendEmailVerification"] as const,
	},
} as const;
