import { useState, useEffect, FormEvent } from "react";
import { User } from "./types";
import { LogIn, Loader2, User as UserIcon, Lock } from "lucide-react";
import Shell from "./components/layout/Shell";
import Dashboard from "./pages/Dashboard";
import Observations from "./pages/Observations";
import NewObservation from "./pages/NewObservation";
import ObservationDetail from "./components/observation/ObservationDetail";
import Teachers from "./pages/Teachers";
import { Observation as ObservationType } from "./types";
import { api_ops } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState("dashboard");
  const [selectedObs, setSelectedObs] = useState<ObservationType | null>(null);
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("supervision_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("supervision_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoggingIn(true);
    setAuthError(null);
    
    try {
      const userData = await api_ops.login(username, password);
      localStorage.setItem("supervision_user", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setAuthError(err.message || "Failed to login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("supervision_user");
    setUser(null);
    setView("dashboard");
  };

  const renderContent = () => {
    if (view === "observations") {
      return (
        <Observations 
          user={user!} 
          onNew={() => setView("new-observation")} 
          onView={(obs) => {
            setSelectedObs(obs);
            setView("detail");
          }} 
        />
      );
    }
    if (view === "new-observation") {
      return <NewObservation user={user!} onBack={() => setView("observations")} />;
    }
    if (view === "detail" && selectedObs) {
      return <ObservationDetail observation={selectedObs} onBack={() => setView("observations")} user={user!} />;
    }
    if (view === "teachers") {
      return <Teachers />;
    }
    return <Dashboard user={user!} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-base">
        <Loader2 className="w-8 h-8 animate-spin text-gov-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-base px-4 font-sans py-20">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-dark-surface rounded-[2.5rem] shadow-2xl border border-dark-border overflow-hidden">
            <div className="thai-gov-gradient p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-black/5"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-dark-base rounded-[2rem] mx-auto mb-8 flex items-center justify-center p-3 border border-white/10 shadow-2xl">
                   <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain grayscale brightness-200" referrerPolicy="no-referrer" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight uppercase">
                  Classroom Supervision
                </h1>
                <p className="text-gov-gold-light font-black uppercase tracking-[0.4em] text-[10px]">ระบบนิเทศออนไลน์ • หนองหว้า</p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="p-12 space-y-8 bg-dark-surface">
              {authError && (
                <div className="p-5 bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-black border border-red-500/20 uppercase tracking-widest text-center shadow-lg">
                  {authError}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gov-gold uppercase tracking-[0.2em] ml-2">Username</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gov-gold transition-colors text-text-muted">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4.5 pl-14 pr-4 focus:ring-1 focus:ring-gov-gold focus:border-gov-gold outline-none transition-all placeholder:text-text-muted/30 font-bold"
                        placeholder="กรอกชื่อผู้ใช้งาน"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gov-gold uppercase tracking-[0.2em] ml-2">Password</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-gov-gold transition-colors text-text-muted">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4.5 pl-14 pr-4 focus:ring-1 focus:ring-gov-gold focus:border-gov-gold outline-none transition-all placeholder:text-text-muted/30 font-bold"
                        placeholder="••••••••"
                      />
                   </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white font-black py-5 px-6 rounded-2xl transition-all shadow-2xl shadow-gov-gold/20 hover:brightness-110 active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:grayscale"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Secure Login
                  </>
                )}
              </button>
              
              <div className="pt-8 text-center border-t border-dark-border">
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                  Authentication Layer v2.0
                </p>
              </div>
            </form>
          </div>
          
          <p className="mt-10 text-center text-text-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-40 leading-loose">
            © 2026 Nong Wa School<br/>
            Education Management System
          </p>
        </div>
      </div>
    );
  }

  return (
    <Shell user={user} onLogout={handleLogout} activeView={view} onNavigate={setView}>
      {renderContent()}
    </Shell>
  );
}
