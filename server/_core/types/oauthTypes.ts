/**
 * Minimal wire contracts used by MIRAGE's OAuth session exchange.
 * Keep these local to the authentication boundary rather than exposing
 * generated platform transport definitions across the project.
 */
export interface ExchangeTokenRequest {
  grantType: string;
  code: string;
  refreshToken?: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export interface ExchangeTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken: string;
}

export interface GetUserInfoResponse {
  openId: string;
  projectId: string;
  name: string;
  email?: string | null;
  platform?: string | null;
  loginMethod?: string | null;
}

export interface GetUserInfoWithJwtRequest {
  jwtToken: string;
  projectId: string;
}

export interface GetUserInfoWithJwtResponse extends GetUserInfoResponse {
  /** Present only for scheduled task contexts. */
  taskUid?: string | null;
}
