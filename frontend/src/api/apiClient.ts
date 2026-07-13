import {isTokenExpired} from "../utils/jwt";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

const MAX_PUBLIC_ERROR_LENGTH = 300;

function extractPublicErrorMessage(
  responseText: string,
  contentType: string | null,
  status: number,
  statusText: string,
) {
  const fallback = `Error ${status}${statusText ? `: ${statusText}` : ""}`;
  let candidate = "";

  if (contentType?.includes("json")) {
    try {
      const body = JSON.parse(responseText) as Record<string, unknown>;
      candidate = [body.detail, body.message, body.error]
        .find((value): value is string => typeof value === "string") ?? "";
    } catch {
      return fallback;
    }
  } else if (contentType?.startsWith("text/plain")) {
    candidate = responseText;
  }

  const normalized = candidate.replace(/\s+/g, " ").trim();
  const looksSensitive =
    /<\/?[a-z][\s\S]*>/i.test(normalized) ||
    /(?:stacktrace|exception|\bat\s+[\w.$]+\([^)]*:\d+\))/i.test(normalized);

  if (!normalized || normalized.length > MAX_PUBLIC_ERROR_LENGTH || looksSensitive) {
    return fallback;
  }

  return normalized;
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export async function apiClient<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {method = "GET", body, token} = options;

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");

    window.location.href = "/login";

    throw new Error("Token expirado.");
  }

  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");
  const responseText = await response.text();
  const publicErrorMessage = extractPublicErrorMessage(
    responseText,
    contentType,
    response.status,
    response.statusText,
  );

  if (response.status === 401 || response.status === 403) {
    if (token) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");

      window.location.href = "/login";

      throw new Error("Sesión expirada o no autorizada.");
    }

    throw new Error(publicErrorMessage || "Credenciales incorrectas.");
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      url,
      contentType,
      responseText,
    });

    throw new Error(publicErrorMessage);
  }

  if (!responseText) {
    return null as T;
  }

  if (!contentType?.includes("application/json")) {
    console.error("La respuesta no es JSON:", {
      url,
      contentType,
      responseText,
    });

    throw new Error("La respuesta del servidor no es JSON.");
  }

  return JSON.parse(responseText) as T;
}
