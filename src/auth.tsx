import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, AlertCircle, Loader2, Package, ChevronRight } from "lucide-react";

// ── Auth Context ─────────────────────────────────────────────

interface AuthUser {
  id_user: number;
  username: string;
  nama_lengkap: string;
  role: string;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("lab_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.error || "Login gagal";
      setUser(data.user);
      sessionStorage.setItem("lab_user", JSON.stringify(data.user));
      return null;
    } catch {
      return "Tidak dapat terhubung ke server";
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("lab_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

// ── Login Page ───────────────────────────────────────────────

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(username, password);
    setLoading(false);
    if (err) setError(err);
    else navigate("/", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 70% 50%, #0a2040 0%, #050e1f 60%, #020810 100%)" }}
    >
      {/* ── Radar / concentric rings ── */}
      <div className="absolute pointer-events-none" style={{ right: "8%", top: "50%", transform: "translateY(-50%)" }}>
        {[340, 280, 220, 160, 110, 70, 36].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size * 2,
              height: size * 2,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderColor: `rgba(0, 200, 255, ${0.06 + i * 0.015})`,
            }}
          />
        ))}
        <div style={{ width: 340, height: 340, position: "relative" }}>
          <div className="absolute rounded-full" style={{ inset: "30%", background: "radial-gradient(circle, rgba(0,180,255,0.28) 0%, transparent 70%)", filter: "blur(22px)" }} />
        </div>
      </div>

      {/* ── Light rays ── */}
      {[15, 45, 75, 110, 148].map((deg, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            right: "28%",
            top: "50%",
            width: "120vw",
            height: "1px",
            background: `linear-gradient(90deg, transparent 0%, rgba(0,180,255,${0.04 + i * 0.012}) 60%, transparent 100%)`,
            transform: `rotate(${deg}deg)`,
            transformOrigin: "right center",
          }}
        />
      ))}

      {/* ── Pixel grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Binary text strips ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.06]">
        {["10110100 01001011 11010010", "01001101 10100110 01011010", "11010010 00101101 10110100"].map((t, i) => (
          <div
            key={i}
            className="font-mono text-[10px] text-cyan-400 absolute whitespace-nowrap"
            style={{ top: `${15 + i * 28}%`, letterSpacing: "0.22em" }}
          >
            {Array(7).fill(t).join("   ·   ")}
          </div>
        ))}
      </div>

      {/* ── Auth card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full px-4"
        style={{ maxWidth: 340 }}
      >
        {/* Corner bracket — top-right */}
        <div className="absolute -top-3 -right-1 w-7 h-7 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[2px]" style={{ background: "rgba(0,220,255,0.75)" }} />
          <div className="absolute top-0 right-0 w-[2px] h-full" style={{ background: "rgba(0,220,255,0.75)" }} />
        </div>
        {/* Corner bracket — bottom-left */}
        <div className="absolute -bottom-3 -left-1 w-7 h-7 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ background: "rgba(0,220,255,0.75)" }} />
          <div className="absolute bottom-0 left-0 w-[2px] h-full" style={{ background: "rgba(0,220,255,0.75)" }} />
        </div>

        {/* Card body */}
        <div
          className="px-8 py-8"
          style={{
            background: "rgba(4, 16, 36, 0.85)",
            border: "1px solid rgba(0, 200, 255, 0.2)",
            backdropFilter: "blur(18px)",
          }}
        >
          {/* ── Title ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-[6px]">
              <Package size={22} className="text-cyan-400" />
              <h1
                className="font-display text-[28px] font-extrabold uppercase tracking-[0.18em]"
                style={{ color: "#e8f8ff" }}
              >
                AUTH
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[3px] h-4 block" style={{ background: "#00d4ff" }} />
              <span
                className="font-mono text-[10px] uppercase"
                style={{ color: "rgba(0,212,255,0.7)", letterSpacing: "0.22em" }}
              >
                Lab Inventory System
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {/* Operator ID */}
            <div className="flex flex-col gap-[6px]">
              <label
                className="font-mono text-[10px] uppercase"
                style={{ color: "#00d4ff", letterSpacing: "0.2em" }}
              >
                Operator ID
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-transparent border-0 border-b font-mono text-sm py-[6px] pr-7 outline-none"
                  style={{
                    borderColor: "rgba(0,200,255,0.28)",
                    color: "#cceeff",
                    caretColor: "#00d4ff",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,220,255,0.75)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,200,255,0.28)")}
                />
                <User size={14} className="absolute right-0" style={{ color: "rgba(0,200,255,0.4)" }} />
              </div>
            </div>

            {/* Passcode */}
            <div className="flex flex-col gap-[6px]">
              <label
                className="font-mono text-[10px] uppercase"
                style={{ color: "#00d4ff", letterSpacing: "0.2em" }}
              >
                Passcode
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b font-mono text-sm py-[6px] pr-7 outline-none"
                  style={{
                    borderColor: "rgba(0,200,255,0.28)",
                    color: "#cceeff",
                    caretColor: "#00d4ff",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,220,255,0.75)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(0,200,255,0.28)")}
                />
                <Lock size={14} className="absolute right-0" style={{ color: "rgba(0,200,255,0.4)" }} />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 font-mono text-[11px]"
                  style={{ color: "#ff8080" }}
                >
                  <AlertCircle size={13} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 font-mono text-[11px] uppercase py-[11px] transition-all disabled:opacity-50"
              style={{
                background: "rgba(0,160,230,0.09)",
                border: "1px solid rgba(0,200,255,0.48)",
                color: "#9aeeff",
                letterSpacing: "0.22em",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,180,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,160,230,0.09)")}
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Authenticating...</>
              ) : (
                <><span>Initialize Session</span><ChevronRight size={15} /></>
              )}
            </button>
          </form>

          {/* ── Footer status ── */}
          <div className="mt-6 flex items-center justify-between">
            <span
              className="flex items-center gap-[6px] font-mono text-[10px] uppercase"
              style={{ color: "rgba(0,210,255,0.55)", letterSpacing: "0.18em" }}
            >
              <span className="w-[7px] h-[7px] rounded-full bg-green-400 block animate-pulse" />
              System Online
            </span>
            <span
              className="font-mono text-[10px] uppercase"
              style={{ color: "rgba(0,200,255,0.32)", letterSpacing: "0.18em" }}
            >
              Secure Connection
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Route Guard ──────────────────────────────────────────────

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;
  return <>{children}</>;
}
