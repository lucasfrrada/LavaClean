import {isTokenExpired} from "../utils/jwt";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

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

  if (response.status === 401 || response.status === 403) {
    if (token) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");

      window.location.href = "/login";

      throw new Error("Sesión expirada o no autorizada.");
    }

    throw new Error(responseText || "Credenciales incorrectas.");
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      url,
      contentType,
      responseText,
    });

    throw new Error(responseText || `Error ${response.status}`);
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
