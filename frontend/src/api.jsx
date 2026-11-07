export async function request(url, method, body) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = token;
  }

  const res = await fetch(url, {
    method: method || "GET",
    headers: headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data.message || "Request failed (" + res.status + ")");
  }
  return data;
}