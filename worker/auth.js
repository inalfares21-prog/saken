import { betterAuth } from 'better-auth';

/**
 * Better Auth configuration for the Saken Worker.
 *
 * Sessions, users and password hashes live in the Worker's own D1 database
 * (`database: env.DB` is Better Auth's native D1 binding), so sign-in has no
 * third-party dependency.
 *
 * The secret is read from the environment: `.dev.vars` locally and
 * `wrangler secret put BETTER_AUTH_SECRET` in the deployed Worker. It is never
 * written into a source file.
 */
export function authOptions(env) {
  return {
    appName: 'Saken',
    baseURL: env.APP_ORIGIN,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    database: env.DB,
    trustedOrigins: [env.APP_ORIGIN],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      // No mail transport is configured yet, so an unverified address must not
      // block sign-in. Flip this once transactional email exists.
      requireEmailVerification: false,
      autoSignIn: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      ipAddress: {
        // Workers put the caller's address in CF-Connecting-IP; X-Forwarded-For
        // is kept for `wrangler dev` and the Vite proxy.
        ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
      },
    },
  };
}

/**
 * One instance per isolate: it caches the password hasher and session config.
 * D1 is stateless between requests, so there is no connection to leak.
 */
let instance;

export function getAuth(env) {
  instance ??= betterAuth(authOptions(env));
  return instance;
}
