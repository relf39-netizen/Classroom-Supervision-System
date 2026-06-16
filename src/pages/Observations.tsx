import { useState, useEffect } from "react";
import { Observation, User, UserRole } from "../types";
import { api_ops } from "../lib/api";
import { Search, Plus, FileText, Download, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import * as XLSX from "xlsx";

interface ObservationsProps {
  user: User;
  onNew: () => void;
  onView: (obs: Observation) => void;
}

export default function Observations({ user, onNew, onView }: ObservationsProps) {
  const [list, setList] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("2567");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const filters: any = {};
      if (user.role === UserRole.TEACHER) {
        filters.teacherUserId = user.userId;
      }
      const data = await api_ops.list<Observation>("observations", filters);
      setList(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    };

    loadData();
  }, [user]);

  const filtered = list.filter(o => 
    o.teacherName.toLowerCase().includes(search.toLowerCase()) || 
    o.subject.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(o => ({
      "ครูผู้สอน": o.teacherName,
      "รายวิชา": o.subject,
      "ระดับชั้น": `${o.gradeLevel}/${o.classRoom}`,
      "วันที่": format(new Date(o.date), "yyyy-MM-dd"),
      "คะแนนเฉลี่ย": o.averageScore,
      "ระดับคุณภาพ": o.evaluationLevel,
      "ผู้นิเทศ": o.observerName
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Observations");
    XLSX.writeFile(wb, `Report_Supervision_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-dark-base text-text-primary">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">รายงานการนิเทศ</h1>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-1">Management of supervision results and classroom observations</p>
        </div>
        <div className="flex items-center gap-3">
          {(user.role === UserRole.ADMIN || user.role === UserRole.DIRECTOR) && (
            <>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-3 bg-dark-surface border border-dark-border text-text-primary px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-dark-elevated transition-all shadow-xl active:scale-95"
              >
                <Download className="w-5 h-5 text-gov-gold" />
                Export Excel
              </button>
              <button
                onClick={onNew}
                className="flex items-center gap-3 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-gov-gold/10 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                บันทึกนิเทศใหม่
              </button>
            </>
          )}
        </div>
      </header>

      <div className="bg-dark-surface p-6 rounded-[2rem] shadow-xl border border-dark-border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="ค้นหาชื่อครู หรือ รายวิชา..."
            className="w-full pl-12 pr-6 py-4 bg-dark-base border border-dark-border rounded-2xl text-sm focus:ring-1 focus:ring-gov-gold outline-none text-text-primary transition-all placeholder:text-text-muted/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-dark-base p-2 rounded-2xl flex items-center gap-2 border border-dark-border">
             <Filter className="w-4 h-4 text-gov-gold ml-2" />
             <select 
               className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest py-2 pr-8 outline-none text-text-secondary"
               value={yearFilter}
               onChange={(e) => setYearFilter(e.target.value)}
             >
               <option value="2567" className="bg-dark-surface">ปีการศึกษา 2567</option>
               <option value="2566" className="bg-dark-surface">ปีการศึกษา 2566</option>
             </select>
          </div>
        </div>
      </div>

      <div className="bg-dark-surface rounded-[2rem] shadow-xl border border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-text-muted text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">ข้อมูลการนิเทศ</th>
                <th className="px-8 py-6">วิชา / ระดับชั้น</th>
                <th className="px-8 py-6">คะแนนเฉลี่ย</th>
                <th className="px-8 py-6 text-center">ระดับคุณภาพ</th>
                <th className="px-8 py-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading dataset...</td>
                </tr>
              ) : filtered.map((obs) => (
                <tr key={obs.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-base flex items-center justify-center p-2 border border-dark-border group-hover:border-gov-gold transition-colors overflow-hidden">
                         <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all scale-110" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-gov-gold transition-colors">{obs.teacherName}</p>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                          <FileText className="w-3 h-3 text-gov-gold" /> {format(new Date(obs.date), "d MMM yyyy", { locale: th })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-text-secondary">{obs.subject}</p>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter mt-1">Classroom: P{obs.gradeLevel}/{obs.classRoom}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-xl font-black text-gov-gold">{obs.averageScore.toFixed(2)}</span>
                       <span className="text-[10px] text-text-muted font-black">/ 5.00</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        obs.evaluationLevel === 'ดีเยี่ยม' ? 'bg-gov-gold/10 text-gov-gold border-gov-gold/30' : 
                        obs.evaluationLevel === 'ดีมาก' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-dark-base text-text-muted border-dark-border'
                      }`}>
                        {obs.evaluationLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onView(obs)}
                        className="p-3 rounded-full hover:bg-gov-gold hover:text-white text-text-muted transition-all shadow-sm hover:shadow-gov-gold/20 active:scale-90 border border-dark-border hover:border-gov-gold"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-8 py-24 text-center">
                     <div className="relative inline-block mb-6">
                        <FileText className="w-16 h-16 text-dark-border mx-auto" />
                        <Search className="absolute -bottom-2 -right-2 w-8 h-8 text-gov-gold opacity-30" />
                     </div>
                     <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">ไม่พบข้อมูลการบันทึกการนิเทศในระบบ</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
