// // import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

// export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// // Start the Manus OAuth login. Call this from an event handler or effect at the
// // moment you want to navigate, e.g. `onClick={() => startLogin()}`.
// //
// // It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// // cookie, and navigates immediately — so the cookie nonce always matches the
// // `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// // `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// // call would desync it from an in-flight login and the callback would reject it
// // with "invalid oauth state". It returns void by design, so there is no URL to
// // stash across renders.
// export const startLogin = () => {
//   const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
//   const appId = import.meta.env.VITE_APP_ID;
//   const redirectUri = `${window.location.origin}/api/oauth/callback`;

//   const nonce = crypto.randomUUID();
//   document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
//   const state = encodeOAuthState({ redirectUri, nonce });

//   const url = new URL(`${oauthPortalUrl}/app-auth`);
//   url.searchParams.set("appId", appId);
//   url.searchParams.set("redirectUri", redirectUri);
//   url.searchParams.set("state", state);
//   url.searchParams.set("type", "signIn");

//   window.location.href = url.toString();
// };

// // The secure provider portal supports account creation from the same verified
// // entry point. Keep a semantic wrapper so the UI can offer a distinct Register
// // page without relying on undocumented OAuth query values.
// export const startRegistration = () => startLogin();

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const startLogin = () => {
  window.location.href = "/sign-in";
};

export const startRegistration = () => {
  window.location.href = "/register";
};

export async function loginWithPassword(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || "Login failed" };
  return { success: true };
}

export async function registerWithPassword(email: string, password: string, name?: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error || "Registration failed" };
  return { success: true };
}
