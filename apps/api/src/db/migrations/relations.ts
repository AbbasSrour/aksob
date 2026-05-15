import { relations } from "drizzle-orm/relations";
import { user, account, session, conversationParticipant, conversation, message, story, opportunity, research, newsCategory, news, eventMember, eventAttendee, event, eventOrganizer, eventReminder, eventSurvey } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	conversationParticipants: many(conversationParticipant),
	messages: many(message),
	stories_reviewedBy: many(story, {
		relationName: "story_reviewedBy_user_id"
	}),
	stories_authorId: many(story, {
		relationName: "story_authorId_user_id"
	}),
	opportunities_reviewedBy: many(opportunity, {
		relationName: "opportunity_reviewedBy_user_id"
	}),
	opportunities_authorId: many(opportunity, {
		relationName: "opportunity_authorId_user_id"
	}),
	research_reviewedBy: many(research, {
		relationName: "research_reviewedBy_user_id"
	}),
	research_authorId: many(research, {
		relationName: "research_authorId_user_id"
	}),
	news: many(news),
	eventMembers: many(eventMember),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const conversationParticipantRelations = relations(conversationParticipant, ({one}) => ({
	user: one(user, {
		fields: [conversationParticipant.userId],
		references: [user.id]
	}),
	conversation: one(conversation, {
		fields: [conversationParticipant.conversationId],
		references: [conversation.id]
	}),
}));

export const conversationRelations = relations(conversation, ({many}) => ({
	conversationParticipants: many(conversationParticipant),
	messages: many(message),
}));

export const messageRelations = relations(message, ({one}) => ({
	user: one(user, {
		fields: [message.senderId],
		references: [user.id]
	}),
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id]
	}),
}));

export const storyRelations = relations(story, ({one}) => ({
	user_reviewedBy: one(user, {
		fields: [story.reviewedBy],
		references: [user.id],
		relationName: "story_reviewedBy_user_id"
	}),
	user_authorId: one(user, {
		fields: [story.authorId],
		references: [user.id],
		relationName: "story_authorId_user_id"
	}),
}));

export const opportunityRelations = relations(opportunity, ({one}) => ({
	user_reviewedBy: one(user, {
		fields: [opportunity.reviewedBy],
		references: [user.id],
		relationName: "opportunity_reviewedBy_user_id"
	}),
	user_authorId: one(user, {
		fields: [opportunity.authorId],
		references: [user.id],
		relationName: "opportunity_authorId_user_id"
	}),
}));

export const researchRelations = relations(research, ({one}) => ({
	user_reviewedBy: one(user, {
		fields: [research.reviewedBy],
		references: [user.id],
		relationName: "research_reviewedBy_user_id"
	}),
	user_authorId: one(user, {
		fields: [research.authorId],
		references: [user.id],
		relationName: "research_authorId_user_id"
	}),
}));

export const newsRelations = relations(news, ({one}) => ({
	newsCategory: one(newsCategory, {
		fields: [news.categoryId],
		references: [newsCategory.id]
	}),
	user: one(user, {
		fields: [news.authorId],
		references: [user.id]
	}),
}));

export const newsCategoryRelations = relations(newsCategory, ({many}) => ({
	news: many(news),
}));

export const eventAttendeeRelations = relations(eventAttendee, ({one}) => ({
	eventMember: one(eventMember, {
		fields: [eventAttendee.memberId],
		references: [eventMember.id]
	}),
}));

export const eventMemberRelations = relations(eventMember, ({one, many}) => ({
	eventAttendees: many(eventAttendee),
	user: one(user, {
		fields: [eventMember.userId],
		references: [user.id]
	}),
	event: one(event, {
		fields: [eventMember.eventId],
		references: [event.id]
	}),
	eventOrganizers: many(eventOrganizer),
}));

export const eventRelations = relations(event, ({many}) => ({
	eventMembers: many(eventMember),
	eventReminders: many(eventReminder),
	eventSurveys: many(eventSurvey),
}));

export const eventOrganizerRelations = relations(eventOrganizer, ({one}) => ({
	eventMember: one(eventMember, {
		fields: [eventOrganizer.memberId],
		references: [eventMember.id]
	}),
}));

export const eventReminderRelations = relations(eventReminder, ({one}) => ({
	event: one(event, {
		fields: [eventReminder.eventId],
		references: [event.id]
	}),
}));

export const eventSurveyRelations = relations(eventSurvey, ({one}) => ({
	event: one(event, {
		fields: [eventSurvey.eventId],
		references: [event.id]
	}),
}));