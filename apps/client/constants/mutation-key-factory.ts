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

	users: {
		entity: ["users"] as const,
		create: () =>
			[
				...mutationKeyFactory.users.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.users.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.users.entity,
				...mutationKeyFactory.delete(),
			] as const,
		sendVerification: () =>
			[...mutationKeyFactory.users.entity, "sendVerification"] as const,
	},
} as const;
