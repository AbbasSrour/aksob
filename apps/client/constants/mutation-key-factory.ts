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

	stories: {
		entity: ["stories"] as const,
		create: () =>
			[
				...mutationKeyFactory.stories.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.stories.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.stories.entity,
				...mutationKeyFactory.delete(),
			] as const,
		approve: () =>
			[...mutationKeyFactory.stories.entity, "approve"] as const,
		reject: () =>
			[...mutationKeyFactory.stories.entity, "reject"] as const,
	},

	opportunities: {
		entity: ["opportunities"] as const,
		create: () =>
			[
				...mutationKeyFactory.opportunities.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.opportunities.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.opportunities.entity,
				...mutationKeyFactory.delete(),
			] as const,
		approve: () =>
			[...mutationKeyFactory.opportunities.entity, "approve"] as const,
		reject: () =>
			[...mutationKeyFactory.opportunities.entity, "reject"] as const,
	},

	members: {
		entity: ["members"] as const,
		create: () =>
			[
				...mutationKeyFactory.members.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.members.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.members.entity,
				...mutationKeyFactory.delete(),
			] as const,
		sendVerification: () =>
			[...mutationKeyFactory.members.entity, "sendVerification"] as const,
	},

	majors: {
		entity: ["majors"] as const,
		create: () =>
			[
				...mutationKeyFactory.majors.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.majors.entity,
				...mutationKeyFactory.update(),
			] as const,
	},

	research: {
		entity: ["research"] as const,
		create: () =>
			[
				...mutationKeyFactory.research.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.research.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.research.entity,
				...mutationKeyFactory.delete(),
			] as const,
		approve: () =>
			[...mutationKeyFactory.research.entity, "approve"] as const,
		reject: () =>
			[...mutationKeyFactory.research.entity, "reject"] as const,
	},
} as const;
