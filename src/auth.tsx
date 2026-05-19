import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-fixed-dim/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-fixed/5 blur-[120px]" />
        <div className="scanline-overlay absolute inset-0 opacity-[0.03]" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(71,214,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(71,214,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 bg-primary-fixed-dim/20 blur-xl rounded-full" />
            <div className="relative w-20 h-20 border-2 border-primary-fixed-dim/60 skew-x-[-5deg] flex items-center justify-center bg-surface-container-lowest/80">
              <img
                src="https://api.dicebear.com/7.x/pixel-art/svg?seed=AdminLab"
                alt="avatar"
                className="w-12 h-12 skew-x-[5deg]"
              />
            </div>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-primary-fixed-dim italic tracking-tighter leading-none">
            Lab Inventory
          </h1>
          <p className="font-mono text-[11px] text-on-surface-variant/60 mt-2 uppercase tracking-[0.3em]">
            System Access Terminal v2.0
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-surface-container-lowest/80 border border-primary-fixed-dim/30 backdrop-blur-xl p-8 angled-cut overflow-hidden">
          <div className="scanline-overlay absolute inset-0 opacity-[0.04]" />

          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-fixed-dim to-transparent" />

          <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
            <div className="text-center border-b border-surface-variant pb-4 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary-fixed">
                ● Masukkan Kredensial Anda
              </span>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-surface/50 border border-outline-variant/50 focus:border-primary-fixed-dim text-on-surface pl-9 pr-4 py-3 font-mono text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface/50 border border-outline-variant/50 focus:border-primary-fixed-dim text-on-surface pl-9 pr-4 py-3 font-mono text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 bg-error/10 border border-error/40 px-4 py-3 text-error"
                >
                  <AlertCircle size={16} />
                  <span className="font-mono text-xs">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary-container text-on-primary-container font-display font-bold uppercase tracking-widest py-3 skew-x-[-5deg] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="skew-x-[5deg] flex items-center gap-2">
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
                  : <><Lock size={16} /> Masuk ke Sistem</>
                }
              </span>
            </button>

            <p className="text-center font-mono text-[10px] text-outline/50 uppercase tracking-widest">
              Default: admin / admin123
            </p>
          </form>
        </div>

        {/* Bottom label */}
        <p className="text-center font-mono text-[10px] text-outline/30 mt-6 uppercase tracking-widest">
          © Lab Komputer — Unauthorized access prohibited
        </p>
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
