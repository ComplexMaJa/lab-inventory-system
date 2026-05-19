import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, LogOut, Settings, Bell, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, Hammer, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider, LoginPage, RequireAuth, useAuth } from "./auth";

// --- Types ---
interface Inventaris {
  id_barang: number;
  nama_barang: string;
  kode_aset: string;
  kondisi: 'Baik' | 'Rusak' | 'Perbaikan';
  stok: number;
  tgl_update: string;
}

interface Stats {
  total: number;
  baik: number;
  rusak: number;
  perbaikan: number;
}

// --- Components ---

const SideNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Data Inventaris", path: "/inventory", icon: <Package size={20} /> },
    { name: "Tambah Barang", path: "/add", icon: <PlusCircle size={20} /> },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col z-50 bg-surface-container-lowest/80 w-64 skew-x-[-2deg] origin-top-left -ml-[10px] border-r border-primary-fixed-dim/30 backdrop-blur-xl shadow-[10px_0px_30px_-15px_rgba(71,214,255,0.3)]">
      <div className="skew-x-[2deg] px-6 mb-12 flex flex-col items-center pt-10">
        <div className="w-16 h-16 rounded-full bg-surface-variant border-2 border-primary-fixed-dim p-1 mb-4 relative overflow-hidden">
           <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
           <div className="absolute bottom-0 right-0 w-4 h-4 bg-secondary-fixed border-2 border-surface-container-lowest rounded-full"></div>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-primary-fixed-dim italic tracking-tighter text-center leading-none">Lab Inventory</h1>
        <span className="text-on-surface-variant font-mono text-[10px] mt-2 uppercase tracking-widest">V.2.0.4-SYS</span>
      </div>

      <div className="flex flex-col gap-2 mt-4 skew-x-[2deg] pr-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-4 transition-all hover:translate-x-2 duration-200 ${
              location.pathname === item.path
                ? "bg-primary-container text-on-primary-container font-bold translate-x-4 skew-x-[5deg] border-l-4 border-secondary-fixed shadow-[0_0_15px_rgba(36,255,205,0.5)]"
                : "text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-surface-variant/40"
            }`}
          >
            <span className={location.pathname === item.path ? "skew-x-[-5deg]" : ""}>{item.icon}</span>
            <span className={location.pathname === item.path ? "skew-x-[-5deg]" : ""}>{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto skew-x-[2deg] pr-4 mb-10">
        <LogoutButton />
      </div>
    </nav>
  );
};

const LogoutButton = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <div className="flex flex-col gap-2">
      {user && (
        <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest px-4">
          {user.nama_lengkap}
        </span>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 text-error font-mono opacity-70 hover:opacity-100 p-4 transition-all hover:bg-surface-variant/40 hover:translate-x-2 duration-200"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

const TopAppBar = ({ title }: { title: string }) => {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-gradient-to-b from-surface-container-highest/50 to-transparent flex justify-between items-center px-10 z-40 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-outline font-mono text-[12px]">
        <span className="uppercase tracking-widest text-primary/70">SYS.OP &gt; INVENTORY &gt; {title.toUpperCase()}</span>
        <span className="w-12 h-[1px] bg-primary-fixed-dim/30"></span>
        <span className="flex items-center gap-1 text-secondary-fixed">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span> ONLINE
        </span>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-secondary-fixed transition-colors"><Bell size={20} /></button>
        <button className="text-on-surface-variant hover:text-secondary-fixed transition-colors"><Settings size={20} /></button>
        <Link to="/add" className="bg-primary/10 border border-primary/30 text-primary px-6 py-2 skew-x-[-10deg] hover:bg-primary hover:text-on-primary font-bold text-sm transition-all flex items-center gap-2 group">
          <span className="skew-x-[10deg] block">+ Tambah Barang</span>
        </Link>
      </div>
    </header>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, baik: 0, rusak: 0, perbaikan: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Stats fetch error:", err);
        setLoading(false);
      });
  }, []);

  const cards = [
    { title: "Total Assets", value: stats.total, label: "Total Barang", icon: <Package className="text-primary-fixed-dim" />, color: "primary-fixed-dim", progress: 100 },
    { title: "Optimal", value: stats.baik, label: "Barang Baik", icon: <CheckCircle2 className="text-secondary-fixed" />, color: "secondary-fixed", progress: stats.total > 0 ? (stats.baik / stats.total) * 100 : 0 },
    { title: "Critical", value: stats.rusak, label: "Barang Rusak", icon: <AlertTriangle className="text-error" />, color: "error", progress: stats.total > 0 ? (stats.rusak / stats.total) * 100 : 0 },
    { title: "Maintenance", value: stats.perbaikan, label: "Dalam Perbaikan", icon: <Hammer className="text-tertiary-fixed" />, color: "tertiary-fixed", progress: stats.total > 0 ? (stats.perbaikan / stats.total) * 100 : 0 },
  ];

  return (
    <div className="pt-24 px-10 pb-10">
      <div className="mb-12 border-b border-primary-fixed-dim/20 pb-4 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-primary-fixed-dim hud-glow"></div>
        <h2 className="font-display text-4xl text-primary tracking-widest uppercase flex items-center gap-3">
          <LayoutDashboard size={36} className="text-secondary-fixed" />
          System Overview
        </h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl">Real-time telemetry and status readouts for all laboratory assets and operational nodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-${card.color}/10 blur-md translate-y-2 translate-x-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="angled-cut card-bg-gradient border border-outline-variant/50 relative overflow-hidden p-6 h-full transition-transform hover:-translate-y-1">
              <div className="scanline-overlay absolute inset-0 opacity-5"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-surface-container-high border border-primary-fixed-dim/30 skew-x-[-10deg]">
                  <div className="skew-x-[10deg]">{card.icon}</div>
                </div>
                <span className={`font-mono text-[10px] text-${card.color} uppercase tracking-widest bg-${card.color}/10 px-2 py-1`}>{card.title}</span>
              </div>
              <div className="font-display text-5xl text-secondary mb-1">{card.value}</div>
              <div className="font-bold text-sm text-on-surface-variant uppercase tracking-tighter">{card.label}</div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${card.progress}%` }}
                   className={`h-full bg-${card.color}`} 
                 />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-bg-gradient border border-outline-variant/30 p-6 angled-cut relative h-80 flex flex-col justify-center items-center text-outline/50">
          <div className="scanline-overlay absolute inset-0 opacity-5"></div>
          <p className="font-mono text-sm">[ VISUAL TELEMETRY MODULE OFFLINE ]</p>
        </div>
        <div className="card-bg-gradient border border-outline-variant/30 p-6 angled-cut relative">
           <h3 className="font-display text-xl text-on-surface flex items-center gap-2 mb-6 border-b border-surface-variant pb-2">
             <span className="w-1 h-6 bg-secondary-fixed block skew-x-[-15deg]"></span>
             Activity Feed
           </h3>
           <div className="flex flex-col gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="relative pl-6 border-l border-surface-variant group">
                 <div className="absolute -left-[5px] top-1 w-2 h-2 bg-surface border border-secondary-fixed rotate-45 group-hover:bg-secondary-fixed transition-colors"></div>
                 <div className="font-mono text-[10px] text-on-surface-variant mb-1">SYSTEM_LOG_{i}402</div>
                 <div className="text-sm text-on-surface">Data record sequence {i}00 validated.</div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const InventoryTable = () => {
  const [items, setItems] = useState<Inventaris[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    fetch("/api/inventaris")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Inventory fetch error:", err);
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(fetchData, []);

  const handleDelete = async () => {
    if (deleteId) {
      await fetch(`/api/inventaris/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchData();
    }
  };

  return (
    <div className="pt-24 px-10 pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-5xl text-on-surface mb-2 glow-text">Data Inventaris</h2>
          <p className="text-on-surface-variant">Manage and monitor all registered hardware assets across facilities.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative bg-surface-container/50 border-b border-primary-fixed-dim/30 flex items-center px-4 py-2">
             <Search size={18} className="text-outline" />
             <input type="text" placeholder="Search ID..." className="bg-transparent border-none focus:ring-0 text-sm w-48" />
           </div>
        </div>
      </div>

      <div className="card-bg-gradient border border-outline-variant/30 angled-cut overflow-hidden relative">
        <div className="scanline-overlay absolute inset-0 opacity-5"></div>
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container-high/50 border-b border-primary-fixed-dim/20">
              <th className="py-4 px-6 font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Nama Barang</th>
              <th className="py-4 px-6 font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Kode Aset</th>
              <th className="py-4 px-6 font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Kondisi</th>
              <th className="py-4 px-6 font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Stok</th>
              <th className="py-4 px-6 font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
             {Array.isArray(items) && items.length > 0 ? (
               items.map((item) => (
                 <tr key={item.id_barang} className="border-b border-surface-variant/50 hover:bg-surface-variant/30 transition-colors group">
                   <td className="py-4 px-6 text-on-surface font-medium group-hover:text-primary-fixed-dim transition-colors">{item.nama_barang}</td>
                   <td className="py-4 px-6 text-outline font-mono">{item.kode_aset}</td>
                   <td className="py-4 px-6">
                      <span className={`inline-block transform skew-x-[-15deg] px-3 py-1 text-[10px] font-mono border ${
                        item.kondisi === 'Baik' ? 'bg-secondary-container/10 border-secondary-container text-secondary-container' :
                        item.kondisi === 'Rusak' ? 'bg-error/10 border-error text-error' : 'bg-tertiary-container/10 border-tertiary-container text-tertiary-container'
                      }`}>
                        <span className="inline-block transform skew-x-[15deg]">{item.kondisi.toUpperCase()}</span>
                      </span>
                   </td>
                   <td className="py-4 px-6 text-on-surface-variant font-mono">{item.stok} Unit</td>
                   <td className="py-4 px-6 text-right space-x-4">
                      <button onClick={() => navigate(`/edit/${item.id_barang}`, { state: item })} className="text-outline hover:text-primary-fixed-dim transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteId(item.id_barang)} className="text-outline hover:text-error transition-colors"><Trash2 size={16} /></button>
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan={5} className="py-20 text-center text-outline font-mono uppercase tracking-[0.2em] opacity-50">
                    {loading ? "Decrypting database sequence..." : "[ No Data Records Found ]"}
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md px-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-surface/90 border border-error/50 skew-x-[-2deg] relative p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,180,171,0.2)]"
             >
                <div className="flex items-center gap-4 border-b border-error/20 pb-4 mb-6">
                  <div className="p-3 bg-error/10 border border-error text-error skew-x-[-5deg]"><Trash2 size={24} /></div>
                  <h2 className="font-display text-2xl text-error uppercase tracking-wider">Hapus Data?</h2>
                </div>
                <p className="text-on-surface-variant mb-8 pl-4 border-l-2 border-error/30">Konfirmasi penghapusan aset record. Tindakan ini permanen.</p>
                <div className="flex justify-end gap-4">
                  <button onClick={() => setDeleteId(null)} className="px-6 py-2 border border-outline-variant text-on-surface font-bold skew-x-[-5deg] hover:bg-surface-variant/40 transition-all uppercase text-xs tracking-widest">Batal</button>
                  <button onClick={handleDelete} className="px-6 py-2 bg-error text-on-error font-bold skew-x-[-5deg] hover:brightness-110 transition-all uppercase text-xs tracking-widest">Ya, Hapus</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InventoryForm = ({ mode }: { mode: 'add' | 'edit' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const itemToEdit = location.state as Inventaris | undefined;

  const [formData, setFormData] = useState({
    nama_barang: itemToEdit?.nama_barang || "",
    kode_aset: itemToEdit?.kode_aset || "",
    kondisi: itemToEdit?.kondisi || "Baik",
    stok: itemToEdit?.stok || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = mode === 'add' ? "/api/inventaris" : `/api/inventaris/${itemToEdit?.id_barang}`;
    const method = mode === 'add' ? "POST" : "PUT";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) navigate("/inventory");
  };

  return (
    <div className="pt-32 max-w-2xl mx-auto px-6">
      <div className="mb-10 relative">
        <div className="absolute -left-6 top-1 w-2 h-10 bg-primary-fixed-dim skew-x-[-15deg] hud-glow"></div>
        <h2 className="font-display text-4xl text-on-background uppercase tracking-wider">{mode === 'add' ? 'Tambah Barang Baru' : 'Edit Data Aset'}</h2>
        <p className="font-mono text-xs text-outline mt-2 tracking-widest uppercase">Initializing asset sequence...</p>
      </div>

      <div className="bg-surface-container-high/60 backdrop-blur-xl border border-primary-fixed-dim/40 p-8 md:p-10 skew-x-[-1deg] relative overflow-hidden">
        <div className="scanline-overlay absolute inset-0 opacity-5"></div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 skew-x-[1deg]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2 group">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Nama Barang</label>
              <input 
                required 
                value={formData.nama_barang} 
                onChange={e => setFormData({...formData, nama_barang: e.target.value})}
                className="bg-surface-lowest/50 border-0 border-b border-outline-variant focus:border-primary-fixed-dim focus:ring-0 text-on-surface p-2 transition-all" 
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Kode Aset</label>
              <input 
                required 
                value={formData.kode_aset} 
                onChange={e => setFormData({...formData, kode_aset: e.target.value})}
                className="bg-surface-lowest/50 border-0 border-b border-outline-variant focus:border-primary-fixed-dim focus:ring-0 text-on-surface p-2 transition-all font-mono" 
              />
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Kondisi</label>
              <select 
                value={formData.kondisi} 
                onChange={e => setFormData({...formData, kondisi: e.target.value as any})}
                className="bg-surface-lowest/50 border-0 border-b border-outline-variant focus:border-primary-fixed-dim focus:ring-0 text-on-surface p-2 cursor-pointer"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak">Rusak</option>
                <option value="Perbaikan">Perbaikan</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 group">
              <label className="font-mono text-[11px] text-primary-fixed-dim uppercase tracking-widest">Jumlah Stok</label>
              <input 
                type="number" 
                min="0"
                value={formData.stok} 
                onChange={e => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
                className="bg-surface-lowest/50 border-0 border-b border-outline-variant focus:border-primary-fixed-dim focus:ring-0 text-on-surface p-2" 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-4">
             <button type="button" onClick={() => navigate(-1)} className="px-8 py-2 border border-outline-variant text-on-surface font-bold skew-x-[-10deg] uppercase text-xs">Batal</button>
             <button type="submit" className="px-8 py-2 bg-primary-container text-on-primary-container font-bold skew-x-[-10deg] uppercase text-xs flex items-center gap-2 group">
               <Save size={16} />
               <span>Simpan Data</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function ProtectedLayout() {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed-dim/5 via-background to-background" />
        </div>
        <SideNavBar />
        <main className="pl-64 min-h-screen relative z-10 transition-all">
          <Routes>
            <Route path="/" element={<><TopAppBar title="Dashboard" /><Dashboard /></>} />
            <Route path="/inventory" element={<><TopAppBar title="Data Inventaris" /><InventoryTable /></>} />
            <Route path="/add" element={<><TopAppBar title="Tambah Barang" /><InventoryForm mode="add" /></>} />
            <Route path="/edit/:id" element={<><TopAppBar title="Edit Barang" /><InventoryForm mode="edit" /></>} />
          </Routes>
        </main>
      </div>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
