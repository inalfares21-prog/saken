-- Schema Better Auth creates for its own tables (user, session, account, verification).
-- Captured from the Worker's local D1 after its migrations ran, so the hosted
-- database can be provisioned before the first request. The Worker also
-- migrates itself on startup; this file exists to make that deterministic.

CREATE TABLE "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null);

CREATE TABLE "session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);

CREATE TABLE "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null);

CREATE TABLE "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date not null, "updatedAt" date not null);

CREATE INDEX "session_userId_idx" on "session" ("userId");

CREATE INDEX "account_userId_idx" on "account" ("userId");

CREATE INDEX "verification_identifier_idx" on "verification" ("identifier");
