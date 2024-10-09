import { relations } from "drizzle-orm/relations";
import { usersInAuth, identitiesInAuth, sessionsInAuth, mfaAmrClaimsInAuth, oneTimeTokensInAuth, mfaFactorsInAuth, refreshTokensInAuth, mfaChallengesInAuth, ssoProvidersInAuth, samlProvidersInAuth, flowStateInAuth, samlRelayStatesInAuth, ssoDomainsInAuth, profiles, userVocabRecord } from "./schema";

export const identitiesInAuthRelations = relations(identitiesInAuth, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [identitiesInAuth.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	identitiesInAuths: many(identitiesInAuth),
	oneTimeTokensInAuths: many(oneTimeTokensInAuth),
	mfaFactorsInAuths: many(mfaFactorsInAuth),
	sessionsInAuths: many(sessionsInAuth),
	profiles: many(profiles),
	userVocabRecords: many(userVocabRecord),
}));

export const mfaAmrClaimsInAuthRelations = relations(mfaAmrClaimsInAuth, ({one}) => ({
	sessionsInAuth: one(sessionsInAuth, {
		fields: [mfaAmrClaimsInAuth.sessionId],
		references: [sessionsInAuth.id]
	}),
}));

export const sessionsInAuthRelations = relations(sessionsInAuth, ({one, many}) => ({
	mfaAmrClaimsInAuths: many(mfaAmrClaimsInAuth),
	refreshTokensInAuths: many(refreshTokensInAuth),
	usersInAuth: one(usersInAuth, {
		fields: [sessionsInAuth.userId],
		references: [usersInAuth.id]
	}),
}));

export const oneTimeTokensInAuthRelations = relations(oneTimeTokensInAuth, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [oneTimeTokensInAuth.userId],
		references: [usersInAuth.id]
	}),
}));

export const mfaFactorsInAuthRelations = relations(mfaFactorsInAuth, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [mfaFactorsInAuth.userId],
		references: [usersInAuth.id]
	}),
	mfaChallengesInAuths: many(mfaChallengesInAuth),
}));

export const refreshTokensInAuthRelations = relations(refreshTokensInAuth, ({one}) => ({
	sessionsInAuth: one(sessionsInAuth, {
		fields: [refreshTokensInAuth.sessionId],
		references: [sessionsInAuth.id]
	}),
}));

export const mfaChallengesInAuthRelations = relations(mfaChallengesInAuth, ({one}) => ({
	mfaFactorsInAuth: one(mfaFactorsInAuth, {
		fields: [mfaChallengesInAuth.factorId],
		references: [mfaFactorsInAuth.id]
	}),
}));

export const samlProvidersInAuthRelations = relations(samlProvidersInAuth, ({one}) => ({
	ssoProvidersInAuth: one(ssoProvidersInAuth, {
		fields: [samlProvidersInAuth.ssoProviderId],
		references: [ssoProvidersInAuth.id]
	}),
}));

export const ssoProvidersInAuthRelations = relations(ssoProvidersInAuth, ({many}) => ({
	samlProvidersInAuths: many(samlProvidersInAuth),
	samlRelayStatesInAuths: many(samlRelayStatesInAuth),
	ssoDomainsInAuths: many(ssoDomainsInAuth),
}));

export const samlRelayStatesInAuthRelations = relations(samlRelayStatesInAuth, ({one}) => ({
	flowStateInAuth: one(flowStateInAuth, {
		fields: [samlRelayStatesInAuth.flowStateId],
		references: [flowStateInAuth.id]
	}),
	ssoProvidersInAuth: one(ssoProvidersInAuth, {
		fields: [samlRelayStatesInAuth.ssoProviderId],
		references: [ssoProvidersInAuth.id]
	}),
}));

export const flowStateInAuthRelations = relations(flowStateInAuth, ({many}) => ({
	samlRelayStatesInAuths: many(samlRelayStatesInAuth),
}));

export const ssoDomainsInAuthRelations = relations(ssoDomainsInAuth, ({one}) => ({
	ssoProvidersInAuth: one(ssoProvidersInAuth, {
		fields: [ssoDomainsInAuth.ssoProviderId],
		references: [ssoProvidersInAuth.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
}));

export const userVocabRecordRelations = relations(userVocabRecord, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [userVocabRecord.userId],
		references: [usersInAuth.id]
	}),
}));