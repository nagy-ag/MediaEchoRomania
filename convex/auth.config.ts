import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://cool-salmon-44.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
