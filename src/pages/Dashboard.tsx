import { useState, useEffect } from "react";
import { User, Observation, Teacher, mapScoreToLevel } from "../types";
import { db_ops } from "../lib/db";
import { Users, ClipboardCheck, GraduationCap, TrendingUp, Calendar as CalendarIcon, Package, Clock } from "lucide-react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from "date-fns";
import { th } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalObservations: 0,
    avgScore: 0,
  });
  const [recentObservations, setRecentObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [teachers, observations] = await Promise.all([
        db_ops.list<Teacher>("teachers"),
        db_ops.list<Observation>("observations"),
      ]);

      setStats({
        totalTeachers: teachers.length,
        totalObservations: observations.length,
        avgScore: observations.length > 0 
          ? observations.reduce((acc, obj) => acc + obj.averageScore, 0) / observations.length 
          : 0,
      });

      setRecentObservations(observations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลดข้อมูล...</div>;
  }

  const chartData = {
    labels: ['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.'],
    datasets: [
      {
        label: 'จำนวนการนิเทศ',
        data: [4, 8, 5, 12, 7, 9],
        borderColor: '#003366',
        backgroundColor: 'rgba(0, 51, 102, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const scoreData = {
    labels: ['ดีเยี่ยม', 'ดีมาก', 'ดี', 'พอใช้', 'ปรับปรุง'],
    datasets: [
      {
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          '#FFD700',
          '#003366',
          '#004080',
          '#64748b',
          '#cbd5e1',
        ],
      },
    ],
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-dark-base text-text-primary">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard</h1>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px] mt-1">
            <span className="text-gov-gold">โรงเรียนบ้านหนองหว้า</span> • ภาพรวมระบบนิเทศ ปีการศึกษา 2567
          </p>
        </div>
        <div className="flex items-center gap-3 bg-dark-surface px-5 py-2.5 rounded-2xl shadow-lg border border-dark-border">
          <CalendarIcon className="w-4 h-4 text-gov-gold" />
          <span className="text-xs font-black text-white uppercase tracking-wider">{format(new Date(), "d MMMM yyyy", { locale: th })}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={GraduationCap} 
          label="จำนวนครูทั้งหมด" 
          value={stats.totalTeachers} 
          unit="ท่าน" 
          accent="gold"
          trend="เพิ่มขึ้น 2 จากปีที่แล้ว"
        />
        <StatCard 
          icon={ClipboardCheck} 
          label="จำนวนครั้งที่นิเทศ" 
          value={stats.totalObservations} 
          unit="ครั้ง" 
          accent="gold"
          trend="เป้าหมาย 180 ครั้ง"
        />
        <StatCard 
          icon={TrendingUp} 
          label="ค่าเฉลี่ยคะแนน" 
          value={stats.avgScore.toFixed(2)} 
          unit="" 
          accent="gold"
          trend="คุณภาพ: ดีเยี่ยม"
        />
         <StatCard 
          icon={Clock} 
          label="รอรับการประเมิน" 
          value={14} 
          unit="ราย" 
          accent="red"
          trend="เร่งด่วน 3 รายการ"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-dark-surface p-8 rounded-[2rem] shadow-xl border border-dark-border flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gov-gold rounded-full"></span>
              <h3 className="font-black text-xs text-white uppercase tracking-widest">กราฟพัฒนาการและสถิติรายเดือน</h3>
            </div>
            <select className="bg-dark-base border border-dark-border rounded-xl text-[10px] font-black uppercase tracking-widest py-1.5 px-3 text-text-secondary outline-none focus:ring-1 focus:ring-gov-gold">
              <YearSelect />
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <Line 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                  x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-dark-surface p-8 rounded-[2rem] shadow-xl border border-dark-border">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-gov-gold rounded-full"></span>
            <h3 className="font-black text-xs text-white uppercase tracking-widest">สัดส่วนคุณภาพการสอน</h3>
          </div>
          <div className="h-[250px] flex items-center justify-center">
            <Doughnut 
              data={scoreData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' }, padding: 20, usePointStyle: true }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent List */}
      <div className="bg-dark-surface rounded-[2rem] shadow-xl border border-dark-border overflow-hidden">
        <div className="p-8 border-b border-dark-border flex items-center justify-between bg-dark-elevated/50">
          <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-gov-gold rounded-full"></div>
             <h3 className="font-black text-xs text-white uppercase tracking-widest">รายการนิเทศล่าสุด</h3>
          </div>
          <button className="text-gov-gold font-black text-[10px] uppercase tracking-widest hover:underline px-4 py-2 bg-gov-gold/5 rounded-full border border-gov-gold/10">ดูทั้งหมด</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-text-muted text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">ครูผู้สอน</th>
                <th className="px-8 py-5">รายวิชา</th>
                <th className="px-8 py-5">วันที่</th>
                <th className="px-8 py-5">คะแนนผลการประเมิน</th>
                <th className="px-8 py-5 text-right">ระดับคุณภาพ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-sm">
              {recentObservations.map((obs) => (
                <tr key={obs.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-dark-base border border-dark-border flex items-center justify-center text-xs font-black text-text-secondary group-hover:border-gov-gold group-hover:text-gov-gold transition-colors">
                        {obs.teacherName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-gov-gold transition-colors">{obs.teacherName}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">สังกัดกลุ่มสาระ</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-text-secondary font-medium">
                    <div className="flex flex-col">
                       <span>{obs.subject}</span>
                       <span className="text-[10px] text-text-muted font-bold">ห้องเรียน: P{obs.gradeLevel}/{obs.classRoom}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-text-muted font-bold text-xs">{format(new Date(obs.date), "dd/MM/yyyy")}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className="font-black text-gov-gold text-lg">{obs.averageScore.toFixed(2)}</span>
                       <div className="w-24 h-1.5 bg-dark-base rounded-full overflow-hidden border border-dark-border">
                          <div className="bg-gov-gold h-full" style={{ width: `${(obs.averageScore / 5) * 100}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      obs.evaluationLevel === 'ดีเยี่ยม' ? 'bg-gov-gold/10 text-gov-gold border-gov-gold/30' : 
                      obs.evaluationLevel === 'ดีมาก' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-dark-base text-text-muted border-dark-border'
                    }`}>
                      {obs.evaluationLevel}
                    </span>
                  </td>
                </tr>
              ))}
              {recentObservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-text-muted italic font-bold uppercase tracking-widest text-[10px]">
                    ยังไม่มีข้อมูลการบันทึกการนิเทศในฐานข้อมูล
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

function StatCard({ icon: Icon, label, value, unit, accent, trend }: any) {
  const isRed = accent === 'red';
  return (
    <div className="bg-dark-surface p-6 rounded-[2rem] shadow-xl border border-dark-border hover:border-gov-gold/30 transition-all group overflow-hidden relative">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg ${
        isRed ? 'bg-red-500/10 text-red-500' : 'bg-gov-gold/10 text-gov-gold'
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      
      <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">{label}</p>
      
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-xs text-text-muted font-bold uppercase">{unit}</span>
      </div>

      <div className={`mt-3 flex items-center gap-1 text-[10px] font-bold relative z-10 ${
        isRed ? 'text-red-400' : 'text-emerald-400'
      }`}>
         {isRed ? (
            <Clock className="w-3 h-3" />
         ) : (
            <TrendingUp className="w-3 h-3" />
         )}
         <span>{trend}</span>
      </div>

      {/* Background Glow */}
      <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${
        isRed ? 'bg-red-500' : 'bg-gov-gold'
      }`}></div>
    </div>
  );
}

function YearSelect() {
  return (
    <>
      <option value="2567">ปีการศึกษา 2567</option>
      <option value="2566">ปีการศึกษา 2566</option>
    </>
  );
}
