import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: frontendRoot,
  },
  transpilePackages: [
    "@ux/alert",
    "@ux/box",
    "@ux/button",
    "@ux/card",
    "@ux/checkbox",
    "@ux/chip",
    "@ux/circular-progress",
    "@ux/dialog",
    "@ux/icon",
    "@ux/message-overlay",
    "@ux/modal",
    "@ux/progress-bar",
    "@ux/progress-steps",
    "@ux/radio",
    "@ux/select",
    "@ux/spinner",
    "@ux/tabs",
    "@ux/tag",
    "@ux/text",
    "@ux/text-lockup",
    "@ux/toggle",
  ],
};

export default nextConfig;
