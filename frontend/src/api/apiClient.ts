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

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error en la solicitud");
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
