import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { db } from "./db";
import { sendMagicLinkEmail } from "./email";

// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment by Better Auth.

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : undefined;

export type SocialProvider = "google";
export type EnabledProviders = Record<SocialProvider, boolean>;

export const enabledProviders: EnabledProviders = {
  google: Boolean(google),
};

export const auth = betterAuth({
  appName: "Hello World App",
  database: db,
  socialProviders: {
    ...(google && { google }),
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
    nextCookies(),
  ],
});
