export const mutationKeyFactory = {
	create: () => ["create"] as const,

	auth: {
		entity: ["auth"] as const,
		signUp: () =>
			[
				...mutationKeyFactory.auth.entity,
				...mutationKeyFactory.create(),
			] as const,
	},
} as const;
