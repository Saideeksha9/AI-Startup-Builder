// import { useState, type FormEvent } from "react";
// import { loginWithPassword, registerWithPassword } from "@/const";

// type AccountAccessProps = {
//   mode: "sign-in" | "register";
// };

// export function AccountAccess({ mode }: AccountAccessProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const isRegister = mode === "register";

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     const result = isRegister
//       ? await registerWithPassword(email, password, name)
//       : await loginWithPassword(email, password);

//     if (!result.success) {
//       setError(result.error || "Something went wrong");
//       setLoading(false);
//       return;
//     }
//     window.location.href = "/";
//   }

//   return (
//     <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
//       <a href="/" style={{ display: "inline-block", marginBottom: 16, color: "#334155", textDecoration: "none", fontSize: 14 }}> ← Back to Home </a>
//       <h1 style={{ fontSize: 24, marginBottom: 16 }}>
//         {isRegister ? "Create your account" : "Sign in"}
//       </h1>
//       <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//         {isRegister && (
//           <div>
//             <label htmlFor="name">Name</label>
//             <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 8 }} />
//           </div>
//         )}
//         <div>
//           <label htmlFor="email">Email</label>
//           <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 8 }} />
//         </div>
//         <div>
//           <label htmlFor="password">Password</label>
//           <input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 8 }} />
//         </div>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         <button type="submit" disabled={loading} style={{ padding: 10, cursor: "pointer" }}>
//           {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
//         </button>
//       </form>
//       <p style={{ marginTop: 16 }}>
//         {isRegister ? <>Already have an account? <a href="/sign-in">Sign in</a></> : <>Need an account? <a href="/register">Create one</a></>}
//       </p>
//     </div>
//   );
// }

// export function SignInPage() {
//   return <AccountAccess mode="sign-in" />;
// }

// export function RegisterPage() {
//   return <AccountAccess mode="register" />;
// }







import { useState, type FormEvent } from "react";
import { loginWithPassword, registerWithPassword } from "@/const";
import { useLocation } from "wouter";

type AccountAccessProps = {
  mode: "sign-in" | "register";
};

export function AccountAccess({ mode }: AccountAccessProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = isRegister
      ? await registerWithPassword(email, password, name)
      : await loginWithPassword(email, password);

    if (!result.success) {
      setError(result.error || "Something went wrong");
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #fdf2f8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button
          type="button"
          onClick={() => setLocation("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
            background: "none",
            border: "none",
            color: "#475569",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back to Home
        </button>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 32,
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 70px rgba(15, 23, 42, 0.1)",
            padding: "40px 32px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <span style={{ color: "white", fontSize: 20 }}>✨</span>
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#2563eb",
              margin: "0 0 8px 0",
            }}
          >
            {isRegister ? "New here?" : "Welcome back"}
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#0f172a",
              margin: "0 0 8px 0",
            }}
          >
            {isRegister ? "Create your account" : "Sign in"}
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px 0", lineHeight: 1.5 }}>
            {isRegister
              ? "Keep your startup blueprints, workspaces, and advisor conversations private to you."
              : "Continue working on your private startup ideas and venture plans."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {isRegister && (
              <div>
                <label htmlFor="name" style={labelStyle}>Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? "#334155" : "#0f172a",
                color: "white",
                border: "none",
                borderRadius: 999,
                padding: "14px 20px",
                fontSize: 14,
                fontWeight: 800,
                cursor: loading ? "default" : "pointer",
                transition: "background 0.15s ease",
              }}
            >
              {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: "#64748b", textAlign: "center" }}>
            {isRegister ? (
              <>Already have an account? <a href="/sign-in" style={linkStyle}>Sign in</a></>
            ) : (
              <>Need an account? <a href="/register" style={linkStyle}>Create one</a></>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  fontWeight: 700,
  textDecoration: "none",
};

export function SignInPage() {
  return <AccountAccess mode="sign-in" />;
}

export function RegisterPage() {
  return <AccountAccess mode="register" />;
}