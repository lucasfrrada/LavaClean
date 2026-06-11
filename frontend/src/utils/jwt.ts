import {jwtDecode} from "jwt-decode";

type JwtPayload = {
  sub?: string;
  exp?: number;
  iat?: number;
  rol?: string;
  role?: string;
};

export function isTokenExpired(token: string | null) {
  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true;

    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export function getTokenPayload(token: string | null) {
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}
