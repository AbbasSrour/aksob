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
		approve: () => [...mutationKeyFactory.stories.entity, "approve"] as const,
		reject: () => [...mutationKeyFactory.stories.entity, "reject"] as const,
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

	programs: {
		entity: ["programs"] as const,
		create: () =>
			[
				...mutationKeyFactory.programs.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.programs.entity,
				...mutationKeyFactory.update(),
			] as const,
	},

	news: {
		entity: ["news"] as const,
		create: () =>
			[
				...mutationKeyFactory.news.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.news.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.news.entity,
				...mutationKeyFactory.delete(),
			] as const,
		publish: () => [...mutationKeyFactory.news.entity, "publish"] as const,
		unpublish: () => [...mutationKeyFactory.news.entity, "unpublish"] as const,
		createCategory: () =>
			[...mutationKeyFactory.news.entity, "createCategory"] as const,
		deleteCategory: () =>
			[...mutationKeyFactory.news.entity, "deleteCategory"] as const,
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
		approve: () => [...mutationKeyFactory.research.entity, "approve"] as const,
		reject: () => [...mutationKeyFactory.research.entity, "reject"] as const,
	},

	events: {
		entity: ["events"] as const,
		create: () =>
			[
				...mutationKeyFactory.events.entity,
				...mutationKeyFactory.create(),
			] as const,
		update: () =>
			[
				...mutationKeyFactory.events.entity,
				...mutationKeyFactory.update(),
			] as const,
		delete: () =>
			[
				...mutationKeyFactory.events.entity,
				...mutationKeyFactory.delete(),
			] as const,
		submit: () => [...mutationKeyFactory.events.entity, "submit"] as const,
		approve: () => [...mutationKeyFactory.events.entity, "approve"] as const,
		reject: () => [...mutationKeyFactory.events.entity, "reject"] as const,
		cancel: () => [...mutationKeyFactory.events.entity, "cancel"] as const,
		closeRegistration: () =>
			[...mutationKeyFactory.events.entity, "closeRegistration"] as const,
		updateAttendee: () =>
			[...mutationKeyFactory.events.entity, "updateAttendee"] as const,
	},
} as const;
