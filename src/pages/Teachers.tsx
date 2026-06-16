import { useState, useEffect } from "react";
import { Teacher, UserRole } from "../types";
import { api_ops } from "../lib/api";
import { Users, Plus, Search, Mail, BookOpen, Trash2, Edit2 } from "lucide-react";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await api_ops.list<Teacher>("teachers");
      setTeachers(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subjectGroup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-dark-base text-text-primary">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">จัดการข้อมูลครู</h1>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-1">Management of teacher profiles and academic staff</p>
        </div>
        <button
          className="flex items-center gap-3 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-gov-gold/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          เพิ่มข้อมูลครูใหม่
        </button>
      </header>

      <div className="bg-dark-surface p-6 rounded-[2rem] shadow-xl border border-dark-border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="ค้นหาชื่อครู หรือ กลุ่มสาระ..."
            className="w-full pl-12 pr-6 py-4 bg-dark-base border border-dark-border rounded-2xl text-sm focus:ring-1 focus:ring-gov-gold outline-none text-text-primary transition-all placeholder:text-text-muted/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-text-muted font-black uppercase tracking-widest text-[10px]">
            Loading Teachers...
          </div>
        ) : filtered.map((teacher) => (
          <div key={teacher.id} className="bg-dark-surface p-8 rounded-[2rem] border border-dark-border hover:border-gov-gold/30 transition-all group relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gov-gold/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-dark-base border border-dark-border flex items-center justify-center p-2 group-hover:border-gov-gold transition-colors overflow-hidden">
                <div className="w-full h-full rounded-xl bg-dark-elevated flex items-center justify-center text-xl font-black text-gov-gold uppercase">
                   {teacher.name[0]}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-dark-base border border-dark-border text-text-muted hover:text-gov-gold transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-dark-base border border-dark-border text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-gov-gold transition-colors leading-tight">
                  {teacher.name}
                </h3>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">
                   {teacher.position || 'Professional Teacher'}
                </p>
              </div>

              <div className="pt-4 border-t border-dark-border space-y-3">
                <div className="flex items-center gap-3 text-text-secondary">
                  <BookOpen className="w-4 h-4 text-gov-gold" />
                  <span className="text-xs font-bold uppercase tracking-wide">{teacher.subjectGroup}</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary">
                  <Mail className="w-4 h-4 text-gov-gold" />
                  <span className="text-xs font-medium truncate">{teacher.email || 'nongwa.staff@school.ac.th'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 relative z-10">
               <div className="flex-1 bg-dark-base rounded-xl p-3 text-center border border-dark-border">
                  <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1">Observations</p>
                  <p className="text-sm font-black text-white">12</p>
               </div>
               <div className="flex-1 bg-dark-base rounded-xl p-3 text-center border border-dark-border">
                  <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1">Avg Score</p>
                  <p className="text-sm font-black text-gov-gold">4.32</p>
               </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Users className="w-16 h-16 text-dark-border mx-auto mb-4" />
            <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">ไม่พบข้อมูลครูที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
