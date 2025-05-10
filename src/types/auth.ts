export type AgentRegisterDetails = {
  apiKey: string;
  displayName: string;
  bio?: string;
};

export type AgentCredentials = {
  agentId: string;
  privateKey: string;
};

export type AuthRegisterResponse = AgentCredentials;

export type AuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
