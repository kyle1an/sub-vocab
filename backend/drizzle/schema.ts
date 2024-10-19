import { pgTable, pgSchema, index, uniqueIndex, foreignKey, unique, uuid, text, timestamp, jsonb, check, bigserial, varchar, boolean, json, serial, integer, smallint, inet, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");
export const aalLevelInAuth = auth.enum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", ['s256', 'plain'])
export const factorStatusInAuth = auth.enum("factor_status", ['unverified', 'verified'])
export const factorTypeInAuth = auth.enum("factor_type", ['totp', 'webauthn', 'phone'])
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])



export const mfaFactorsInAuth = auth.table("mfa_factors", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	friendlyName: text("friendly_name"),
	factorType: factorTypeInAuth("factor_type").notNull(),
	status: factorStatusInAuth().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	secret: text(),
	phone: text(),
	lastChallengedAt: timestamp("last_challenged_at", { withTimezone: true, mode: 'string' }),
	webAuthnCredential: jsonb("web_authn_credential"),
	webAuthnAaguid: uuid("web_authn_aaguid"),
},
(table) => {
	return {
		factorIdCreatedAtIdx: index("factor_id_created_at_idx").using("btree", table.userId.asc().nullsLast(), table.createdAt.asc().nullsLast()),
		userFriendlyNameUnique: uniqueIndex("mfa_factors_user_friendly_name_unique").using("btree", table.friendlyName.asc().nullsLast(), table.userId.asc().nullsLast()).where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
		userIdIdx: index("mfa_factors_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		uniquePhoneFactorPerUser: uniqueIndex("unique_phone_factor_per_user").using("btree", table.userId.asc().nullsLast(), table.phone.asc().nullsLast()),
		mfaFactorsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "mfa_factors_user_id_fkey"
		}).onDelete("cascade"),
		mfaFactorsLastChallengedAtKey: unique("mfa_factors_last_challenged_at_key").on(table.lastChallengedAt),
	}
});

export const identitiesInAuth = auth.table("identities", {
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	identityData: jsonb("identity_data").notNull(),
	provider: text().notNull(),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	email: text().generatedAlwaysAs(sql`lower((identity_data ->> 'email'::text))`),
	id: uuid().defaultRandom().primaryKey().notNull(),
},
(table) => {
	return {
		emailIdx: index("identities_email_idx").using("btree", table.email.asc().nullsLast()),
		userIdIdx: index("identities_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		identitiesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "identities_user_id_fkey"
		}).onDelete("cascade"),
		identitiesProviderIdProviderUnique: unique("identities_provider_id_provider_unique").on(table.providerId, table.provider),
	}
});

export const oneTimeTokensInAuth = auth.table("one_time_tokens", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
	tokenHash: text("token_hash").notNull(),
	relatesTo: text("relates_to").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		relatesToHashIdx: index("one_time_tokens_relates_to_hash_idx").using("hash", table.relatesTo.asc().nullsLast()),
		tokenHashHashIdx: index("one_time_tokens_token_hash_hash_idx").using("hash", table.tokenHash.asc().nullsLast()),
		userIdTokenTypeKey: uniqueIndex("one_time_tokens_user_id_token_type_key").using("btree", table.userId.asc().nullsLast(), table.tokenType.asc().nullsLast()),
		oneTimeTokensUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "one_time_tokens_user_id_fkey"
		}).onDelete("cascade"),
		oneTimeTokensTokenHashCheck: check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
	}
});

export const refreshTokensInAuth = auth.table("refresh_tokens", {
	instanceId: uuid("instance_id"),
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	token: varchar({ length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	revoked: boolean(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	parent: varchar({ length: 255 }),
	sessionId: uuid("session_id"),
},
(table) => {
	return {
		instanceIdIdx: index("refresh_tokens_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
		instanceIdUserIdIdx: index("refresh_tokens_instance_id_user_id_idx").using("btree", table.instanceId.asc().nullsLast(), table.userId.asc().nullsLast()),
		parentIdx: index("refresh_tokens_parent_idx").using("btree", table.parent.asc().nullsLast()),
		sessionIdRevokedIdx: index("refresh_tokens_session_id_revoked_idx").using("btree", table.sessionId.asc().nullsLast(), table.revoked.asc().nullsLast()),
		updatedAtIdx: index("refresh_tokens_updated_at_idx").using("btree", table.updatedAt.desc().nullsFirst()),
		refreshTokensSessionIdFkey: foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "refresh_tokens_session_id_fkey"
		}).onDelete("cascade"),
		refreshTokensTokenUnique: unique("refresh_tokens_token_unique").on(table.token),
	}
});

export const instancesInAuth = auth.table("instances", {
	id: uuid().primaryKey().notNull(),
	uuid: uuid(),
	rawBaseConfig: text("raw_base_config"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const mfaAmrClaimsInAuth = auth.table("mfa_amr_claims", {
	sessionId: uuid("session_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	authenticationMethod: text("authentication_method").notNull(),
	id: uuid().primaryKey().notNull(),
},
(table) => {
	return {
		mfaAmrClaimsSessionIdFkey: foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "mfa_amr_claims_session_id_fkey"
		}).onDelete("cascade"),
		mfaAmrClaimsSessionIdAuthenticationMethodPkey: unique("mfa_amr_claims_session_id_authentication_method_pkey").on(table.sessionId, table.authenticationMethod),
	}
});

export const auditLogEntriesInAuth = auth.table("audit_log_entries", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey().notNull(),
	payload: json(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	ipAddress: varchar("ip_address", { length: 64 }).default('').notNull(),
},
(table) => {
	return {
		auditLogsInstanceIdIdx: index("audit_logs_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
	}
});

export const vocabularyList = pgTable("vocabulary_list", {
	id: serial().primaryKey().notNull(),
	word: varchar({ length: 32 }).notNull(),
	original: boolean().default(true),
	share: boolean().default(false),
	timeModified: timestamp("time_modified", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	isUser: boolean("is_user").default(true),
	wordRank: integer("word_rank"),
},
(table) => {
	return {
		vocabularyListWordUindex: unique("vocabulary_list_word_uindex").on(table.word),
	}
});

export const usersInAuth = auth.table("users", {
	instanceId: uuid("instance_id"),
	id: uuid().primaryKey().notNull(),
	aud: varchar({ length: 255 }),
	role: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	encryptedPassword: varchar("encrypted_password", { length: 255 }),
	emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true, mode: 'string' }),
	invitedAt: timestamp("invited_at", { withTimezone: true, mode: 'string' }),
	confirmationToken: varchar("confirmation_token", { length: 255 }),
	confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true, mode: 'string' }),
	recoveryToken: varchar("recovery_token", { length: 255 }),
	recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true, mode: 'string' }),
	emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
	emailChange: varchar("email_change", { length: 255 }),
	emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true, mode: 'string' }),
	lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: 'string' }),
	rawAppMetaData: jsonb("raw_app_meta_data"),
	rawUserMetaData: jsonb("raw_user_meta_data"),
	isSuperAdmin: boolean("is_super_admin"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	phone: text().default(sql`NULL`),
	phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true, mode: 'string' }),
	phoneChange: text("phone_change").default(''),
	phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(''),
	phoneChangeSentAt: timestamp("phone_change_sent_at", { withTimezone: true, mode: 'string' }),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: 'string' }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
	emailChangeTokenCurrent: varchar("email_change_token_current", { length: 255 }).default(''),
	emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
	bannedUntil: timestamp("banned_until", { withTimezone: true, mode: 'string' }),
	reauthenticationToken: varchar("reauthentication_token", { length: 255 }).default(''),
	reauthenticationSentAt: timestamp("reauthentication_sent_at", { withTimezone: true, mode: 'string' }),
	isSsoUser: boolean("is_sso_user").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
},
(table) => {
	return {
		confirmationTokenIdx: uniqueIndex("confirmation_token_idx").using("btree", table.confirmationToken.asc().nullsLast()).where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
		emailChangeTokenCurrentIdx: uniqueIndex("email_change_token_current_idx").using("btree", table.emailChangeTokenCurrent.asc().nullsLast()).where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
		emailChangeTokenNewIdx: uniqueIndex("email_change_token_new_idx").using("btree", table.emailChangeTokenNew.asc().nullsLast()).where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
		reauthenticationTokenIdx: uniqueIndex("reauthentication_token_idx").using("btree", table.reauthenticationToken.asc().nullsLast()).where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
		recoveryTokenIdx: uniqueIndex("recovery_token_idx").using("btree", table.recoveryToken.asc().nullsLast()).where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
		emailPartialKey: uniqueIndex("users_email_partial_key").using("btree", table.email.asc().nullsLast()).where(sql`(is_sso_user = false)`),
		instanceIdEmailIdx: index("users_instance_id_email_idx").using("btree", sql`instance_id`, sql`null`),
		instanceIdIdx: index("users_instance_id_idx").using("btree", table.instanceId.asc().nullsLast()),
		isAnonymousIdx: index("users_is_anonymous_idx").using("btree", table.isAnonymous.asc().nullsLast()),
		usersPhoneKey: unique("users_phone_key").on(table.phone),
		usersEmailChangeConfirmStatusCheck: check("users_email_change_confirm_status_check", sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`),
	}
});

export const ssoProvidersInAuth = auth.table("sso_providers", {
	id: uuid().primaryKey().notNull(),
	resourceId: text("resource_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		resourceIdIdx: uniqueIndex("sso_providers_resource_id_idx").using("btree", sql`lower(resource_id)`),
		resourceIdNotEmpty: check("resource_id not empty", sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`),
	}
});

export const userVocabRecord = pgTable("user_vocab_record", {
	userId: uuid("user_id").notNull(),
	vocabulary: varchar({ length: 32 }).notNull(),
	acquainted: boolean(),
	timeCreated: timestamp("time_created", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	timeModified: timestamp("time_modified", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "user_vocab_record_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
},
(table) => {
	return {
		userVocabRecordUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "user_vocab_record_user_id_fkey"
		}),
		userVocabRecordUserIdVocabularyKey: unique("user_vocab_record_user_id_vocabulary_key").on(table.userId, table.vocabulary),
	}
});

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	username: text(),
},
(table) => {
	return {
		profilesIdFkey: foreignKey({
			columns: [table.id],
			foreignColumns: [usersInAuth.id],
			name: "profiles_id_fkey"
		}).onDelete("cascade"),
		profilesUsernameKey: unique("profiles_username_key").on(table.username),
	}
});

export const sessionsInAuth = auth.table("sessions", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	factorId: uuid("factor_id"),
	aal: aalLevelInAuth(),
	notAfter: timestamp("not_after", { withTimezone: true, mode: 'string' }),
	refreshedAt: timestamp("refreshed_at", { mode: 'string' }),
	userAgent: text("user_agent"),
	ip: inet(),
	tag: text(),
},
(table) => {
	return {
		notAfterIdx: index("sessions_not_after_idx").using("btree", table.notAfter.desc().nullsFirst()),
		userIdIdx: index("sessions_user_id_idx").using("btree", table.userId.asc().nullsLast()),
		userIdCreatedAtIdx: index("user_id_created_at_idx").using("btree", table.userId.asc().nullsLast(), table.createdAt.asc().nullsLast()),
		sessionsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const schemaMigrationsInAuth = auth.table("schema_migrations", {
	version: varchar({ length: 255 }).primaryKey().notNull(),
});

export const flowStateInAuth = auth.table("flow_state", {
	id: uuid().primaryKey().notNull(),
	userId: uuid("user_id"),
	authCode: text("auth_code").notNull(),
	codeChallengeMethod: codeChallengeMethodInAuth("code_challenge_method").notNull(),
	codeChallenge: text("code_challenge").notNull(),
	providerType: text("provider_type").notNull(),
	providerAccessToken: text("provider_access_token"),
	providerRefreshToken: text("provider_refresh_token"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	authenticationMethod: text("authentication_method").notNull(),
	authCodeIssuedAt: timestamp("auth_code_issued_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		createdAtIdx: index("flow_state_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
		idxAuthCode: index("idx_auth_code").using("btree", table.authCode.asc().nullsLast()),
		idxUserIdAuthMethod: index("idx_user_id_auth_method").using("btree", table.userId.asc().nullsLast(), table.authenticationMethod.asc().nullsLast()),
	}
});

export const samlProvidersInAuth = auth.table("saml_providers", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	entityId: text("entity_id").notNull(),
	metadataXml: text("metadata_xml").notNull(),
	metadataUrl: text("metadata_url"),
	attributeMapping: jsonb("attribute_mapping"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	nameIdFormat: text("name_id_format"),
},
(table) => {
	return {
		ssoProviderIdIdx: index("saml_providers_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
		samlProvidersSsoProviderIdFkey: foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_providers_sso_provider_id_fkey"
		}).onDelete("cascade"),
		samlProvidersEntityIdKey: unique("saml_providers_entity_id_key").on(table.entityId),
		entityIdNotEmpty: check("entity_id not empty", sql`char_length(entity_id) > 0`),
		metadataUrlNotEmpty: check("metadata_url not empty", sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`),
		metadataXmlNotEmpty: check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
	}
});

export const samlRelayStatesInAuth = auth.table("saml_relay_states", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	requestId: text("request_id").notNull(),
	forEmail: text("for_email"),
	redirectTo: text("redirect_to"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	flowStateId: uuid("flow_state_id"),
},
(table) => {
	return {
		createdAtIdx: index("saml_relay_states_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
		forEmailIdx: index("saml_relay_states_for_email_idx").using("btree", table.forEmail.asc().nullsLast()),
		ssoProviderIdIdx: index("saml_relay_states_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
		samlRelayStatesFlowStateIdFkey: foreignKey({
			columns: [table.flowStateId],
			foreignColumns: [flowStateInAuth.id],
			name: "saml_relay_states_flow_state_id_fkey"
		}).onDelete("cascade"),
		samlRelayStatesSsoProviderIdFkey: foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_relay_states_sso_provider_id_fkey"
		}).onDelete("cascade"),
		requestIdNotEmpty: check("request_id not empty", sql`char_length(request_id) > 0`),
	}
});

export const ssoDomainsInAuth = auth.table("sso_domains", {
	id: uuid().primaryKey().notNull(),
	ssoProviderId: uuid("sso_provider_id").notNull(),
	domain: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		domainIdx: uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
		ssoProviderIdIdx: index("sso_domains_sso_provider_id_idx").using("btree", table.ssoProviderId.asc().nullsLast()),
		ssoDomainsSsoProviderIdFkey: foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "sso_domains_sso_provider_id_fkey"
		}).onDelete("cascade"),
		domainNotEmpty: check("domain not empty", sql`char_length(domain) > 0`),
	}
});

export const mfaChallengesInAuth = auth.table("mfa_challenges", {
	id: uuid().primaryKey().notNull(),
	factorId: uuid("factor_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	ipAddress: inet("ip_address").notNull(),
	otpCode: text("otp_code"),
	webAuthnSessionData: jsonb("web_authn_session_data"),
},
(table) => {
	return {
		mfaChallengeCreatedAtIdx: index("mfa_challenge_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
		mfaChallengesAuthFactorIdFkey: foreignKey({
			columns: [table.factorId],
			foreignColumns: [mfaFactorsInAuth.id],
			name: "mfa_challenges_auth_factor_id_fkey"
		}).onDelete("cascade"),
	}
});

export const derivation = pgTable("derivation", {
	derivedWord: varchar("derived_word", { length: 32 }).notNull(),
	stemWord: varchar("stem_word", { length: 32 }).notNull(),
	isValid: boolean("is_valid"),
},
(table) => {
	return {
		derivationPkey: primaryKey({ columns: [table.derivedWord, table.stemWord], name: "derivation_pkey"}),
	}
});
