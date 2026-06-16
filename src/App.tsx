/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User, UserRole } from "./types";
import { LogIn, Loader2 } from "lucide-react";
import Shell from "./components/layout/Shell";
import Dashboard from "./pages/Dashboard";
import Observations from "./pages/Observations";
import NewObservation from "./pages/NewObservation";
import ObservationDetail from "./components/observation/ObservationDetail";
import Teachers from "./pages/Teachers";
import { seedDatabase } from "./lib/seeds";
import { Observation as ObservationType } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState("dashboard");
  const [selectedObs, setSelectedObs] = useState<ObservationType | null>(null);

  useEffect(() => {
    seedDatabase();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // New user - default to TEACHER for safety, Admin must upgrade
            const newUser: User = {
              userId: fbUser.uid,
              username: fbUser.email || fbUser.displayName || "Unknown",
              fullname: fbUser.displayName || "Unknown",
              role: UserRole.TEACHER,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, "users", fbUser.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
            });
            setUser(newUser);
          }
        } catch (err) {
          console.error("Auth error:", err);
          setAuthError("Failed to load user profile.");
        }
      } else {
        setUser(null);
        setView("dashboard");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthError(err.message);
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-gov-blue" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-base px-4 font-sans">
        <div className="w-full max-w-md bg-dark-surface rounded-[2rem] shadow-2xl border border-dark-border overflow-hidden text-left">
          <div className="thai-gov-gradient p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center p-2 shadow-2xl">
                 <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">
                ระบบนิเทศชั้นเรียนออนไลน์
              </h1>
              <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px]">โรงเรียนบ้านหนองหว้า</p>
            </div>
          </div>
          
          <div className="p-10 bg-dark-surface">
            {authError && (
              <div className="mb-8 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold border border-red-500/20 uppercase tracking-widest">
                {authError}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-4 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white font-black py-4.5 px-6 rounded-2xl transition-all shadow-xl shadow-gov-gold/10 hover:brightness-110 active:scale-[0.98] uppercase tracking-wider text-sm"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
            
            <div className="mt-12 text-center text-text-muted text-[10px] font-bold uppercase tracking-widest opacity-50">
              <p>© 2026 Nong Wa School • Education System</p>
            </div>
          </div>
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
