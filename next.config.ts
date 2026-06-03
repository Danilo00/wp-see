import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Includi chat/media nel bundle serverless Vercel
  outputFileTracingIncludes: {
    "/api/chats": ["./chats/**/*"],
    "/api/chats/[id]": ["./chats/**/*"],
    "/api/chats/[id]/messages": ["./chats/**/*"],
    "/api/chats/[id]/media/[filename]": ["./chats/**/*"],
  },
  outputFileTracingRoot: path.join(__dirname),
  // ngrok e tunnel dev: permetti host esterni in `next dev`
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
    "*.ngrok.dev",
  ],
};

export default nextConfig;
