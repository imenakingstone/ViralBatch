export type IntegrationProvider = "openai" | "pindo" | "tiktok" | "instagram" | "youtube";
export type IntegrationCapability = "content.generate" | "media.transcribe.rw" | "social.publish.tiktok" | "social.publish.instagram" | "social.publish.youtube";

export const integrationCatalog: Array<{
  id: IntegrationProvider;
  name: string;
  description: string;
  env: string[];
  capabilities: IntegrationCapability[];
  setup: "server_key" | "oauth";
}> = [
  { id: "openai", name: "OpenAI", description: "Generate hooks, captions and content variations.", env: ["OPENAI_API_KEY"], capabilities: ["content.generate"], setup: "server_key" },
  { id: "pindo", name: "Pindo", description: "Transcribe Kinyarwanda audio and video.", env: ["PINDO_API_TOKEN"], capabilities: ["media.transcribe.rw"], setup: "server_key" },
  { id: "tiktok", name: "TikTok", description: "Connect creator accounts and publish videos.", env: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"], capabilities: ["social.publish.tiktok"], setup: "oauth" },
  { id: "instagram", name: "Instagram", description: "Connect Instagram professional accounts and publish Reels.", env: ["META_APP_ID", "META_APP_SECRET"], capabilities: ["social.publish.instagram"], setup: "oauth" },
  { id: "youtube", name: "YouTube", description: "Connect YouTube channels and publish Shorts.", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], capabilities: ["social.publish.youtube"], setup: "oauth" }
];

export function getIntegrationStatus() {
  return integrationCatalog.map(item => {
    const missing = item.env.filter(key => !process.env[key]);
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      setup: item.setup,
      capabilities: item.capabilities,
      connected: missing.length === 0,
      missing
    };
  });
}

export type WorkspaceRole = "admin" | "creator" | "agency";
export const roleCapabilities: Record<WorkspaceRole, string[]> = {
  admin: ["content.generate", "media.upload", "media.transcribe.rw", "integrations.manage", "members.manage", "workspace.manage"],
  creator: ["content.generate", "media.upload", "media.transcribe.rw"],
  agency: ["content.generate", "media.upload", "media.transcribe.rw", "brands.manage", "team.manage", "client.reports"]
};

export function getRoleCapabilities(role: string) {
  return roleCapabilities[(role in roleCapabilities ? role : "creator") as WorkspaceRole];
}
