/**
 * Convex Auth Configuration
 *
 * This file configures the authentication providers for JWT verification.
 * Required for OAuth flows to work correctly.
 */

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
}
