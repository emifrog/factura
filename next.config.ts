import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Inclut les assets Factur-X (police + profil ICC) dans le bundle serverless
  // pour toute route qui importe le service de génération.
  outputFileTracingIncludes: {
    "/**": ["src/lib/invoices/assets/**"],
  },
};

// On n'active le plugin Sentry (upload de source maps au build) que si l'org et
// le projet sont configurés — évite tout bruit de build en dev / sans config.
const sentryEnabled = Boolean(
  process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : nextConfig;
