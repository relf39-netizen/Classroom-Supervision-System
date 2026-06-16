import { useState, useEffect } from "react";
import { Observation, ObservationScore, EvaluationItem, EVALUATION_CATEGORIES, User } from "../../types";
import { api_ops } from "../../lib/api";
import { ArrowLeft, Download, Printer, User as UserIcon, Calendar, BookOpen, Star, Camera, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ObservationDetailProps {
  observation: Observation;
  onBack: () => void;
  user: User;
}

export default function ObservationDetail({ observation, onBack, user }: ObservationDetailProps) {
  const [scores, setScores] = useState<ObservationScore[]>([]);
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [sList, iList] = await Promise.all([
        api_ops.list<ObservationScore>("scores", { observationId: observation.id }),
        api_ops.list<EvaluationItem>("evaluationItems", {})
      ]);
      setScores(sList);
      setItems(iList.sort((a,b) => a.itemId.localeCompare(b.itemId, undefined, {numeric: true})));
      setLoading(false);
    };
    loadData();
  }, [observation.id]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("รายงานผลการนิเทศการจัดการเรียนรู้", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("โรงเรียนบ้านหนองหว้า", 105, 30, { align: "center" });

    // Details info
    doc.setFontSize(10);
    doc.text(`ครูผู้สอน: ${observation.teacherName}`, 20, 45);
    doc.text(`ผู้นิเทศ: ${observation.observerName}`, 20, 52);
    doc.text(`วันที่: ${format(new Date(observation.date), "d MMMM yyyy", { locale: th })}`, 20, 59);
    doc.text(`วิชา: ${observation.subject}`, 120, 45);
    doc.text(`ระดับชั้น: ${observation.gradeLevel}/${observation.classRoom}`, 120, 52);
    doc.text(`ปีการศึกษา: ${observation.academicYear}/${observation.semester}`, 120, 59);

    // Table
    const tableData = items.map(item => [
      item.itemName,
      scores.find(s => s.itemId === item.itemId)?.score || "-"
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['รายการประเมิน', 'คะแนน (5)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: '#003366', textColor: [255, 255, 255] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    
    doc.setFontSize(12);
    doc.text(`คะแนนเฉลี่ย: ${observation.averageScore.toFixed(2)}`, 20, finalY + 10);
    doc.text(`ระดับคุณภาพ: ${observation.evaluationLevel}`, 20, finalY + 20);

    doc.save(`รายงานนิเทศ_${observation.teacherName}_${observation.date}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 bg-dark-base text-text-primary">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted font-bold hover:text-gov-gold transition-colors uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-5 h-5" />
          กลับสู่รายการ
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-dark-surface border border-dark-border text-text-primary px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-dark-elevated transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-gov-gold" />
            PDF Export
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all shadow-xl shadow-gov-gold/10 active:scale-95">
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      <div className="bg-dark-surface rounded-[2.5rem] shadow-2xl border border-dark-border overflow-hidden">
        <div className="thai-gov-gradient p-12 text-white flex flex-col md:flex-row justify-between gap-10 items-start relative">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <FileCheck className="w-40 h-40" />
           </div>
           
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-dark-base rounded-[2rem] flex items-center justify-center p-3 border border-dark-border shadow-2xl">
                   <img src="/src/assets/images/school_logo_1781579037134.jpg" alt="Logo" className="w-full h-full object-contain grayscale brightness-125" referrerPolicy="no-referrer" />
                </div>
                <div>
                   <h2 className="text-4xl font-black tracking-tight uppercase">ผลการนิเทศการสอน</h2>
                   <p className="text-gov-gold-light font-black uppercase tracking-[0.3em] text-xs mt-1">โรงเรียนบ้านหนองหว้า • 2567</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-white/10">
                 <InfoItem icon={UserIcon} label="ครูผู้สอน" value={observation.teacherName} />
                 <InfoItem icon={Calendar} label="วันที่นิเทศ" value={format(new Date(observation.date), "dd MMMM yyyy", { locale: th })} />
                 <InfoItem icon={FileCheck} label="ระดับโครงการ" value={`ปีการศึกษา ${observation.academicYear}/${observation.semester}`} />
              </div>
           </div>
           
           <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/20 text-center min-w-[240px] shadow-2xl relative z-10 group overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-gov-gold/20 transition-colors"></div>
              <p className="text-[10px] font-black uppercase text-gov-gold mb-3 tracking-[0.2em]">Evaluation Result</p>
              <h3 className="text-5xl font-black mb-2 tracking-tighter drop-shadow-lg">{observation.evaluationLevel}</h3>
              <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full">
                 <p className="text-xl font-black text-white/90">{observation.averageScore.toFixed(2)} <span className="text-xs text-white/40">/ 5.00</span></p>
              </div>
           </div>
        </div>

        <div className="p-12 space-y-16">
           {/* Info Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <DetailStat label="รายวิชา" value={observation.subject} />
              <DetailStat label="ระดับชั้น" value={`ชั้น ป.${observation.gradeLevel}/${observation.classRoom}`} />
              <DetailStat label="จำนวนนักเรียน" value={`${observation.studentCount} คน`} />
              <DetailStat label="ผู้นิเทศ" value={observation.observerName} />
           </div>

           {/* Scores Table */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-6 bg-gov-gold rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                 <h4 className="font-black text-lg text-white uppercase tracking-widest">คะแนนการประเมินแยกตามหมวด</h4>
              </div>
              
              <div className="space-y-10">
                 {EVALUATION_CATEGORIES.map(category => (
                   <div key={category} className="space-y-4">
                      <h5 className="font-black text-[10px] text-gov-gold uppercase tracking-[0.2em] ml-2">{category}</h5>
                      <div className="grid grid-cols-1 gap-4">
                         {items.filter(i => i.category === category).map(item => (
                           <div key={item.itemId} className="flex items-center justify-between p-6 bg-dark-base border border-dark-border rounded-3xl group hover:border-gov-gold transition-all shadow-inner">
                              <span className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors">{item.itemName}</span>
                              <div className="flex items-center gap-4">
                                 <div className="flex gap-1">
                                    {[1,2,3,4,5].map(star => (
                                      <Star key={star} className={`w-4 h-4 ${((scores.find(s => s.itemId === item.itemId)?.score || 0) >= star) ? "text-gov-gold fill-gov-gold shadow-gold" : "text-dark-border fill-dark-border/20"}`} />
                                    ))}
                                 </div>
                                 <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center font-black text-gov-gold text-sm shadow-xl">
                                   {scores.find(s => s.itemId === item.itemId)?.score || "0"}
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Comments */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-dark-border pt-16">
              <div className="space-y-6">
                 <h5 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="p-2 bg-gov-gold/10 rounded-lg">
                       <Star className="w-4 h-4 text-gov-gold fill-gov-gold" />
                    </div>
                    จุดเด่นของการจัดกิจกรรม
                 </h5>
                 <div className="p-8 bg-dark-base rounded-[2.5rem] border border-dark-border text-text-secondary leading-loose text-sm prose prose-invert max-w-none shadow-inner" dangerouslySetInnerHTML={{ __html: observation.strengths || "<i>ไม่มีข้อมูล</i>" }} />
              </div>
              <div className="space-y-6">
                 <h5 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="p-2 bg-gov-gold/10 rounded-lg">
                       <BookOpen className="w-4 h-4 text-gov-gold" />
                    </div>
                    ข้อเสนอแนะและแนวทางพัฒนา
                 </h5>
                 <div className="p-8 bg-dark-base rounded-[2.5rem] border border-dark-border text-text-secondary leading-loose text-sm prose prose-invert max-w-none shadow-inner" dangerouslySetInnerHTML={{ __html: observation.suggestions || "<i>ไม่มีข้อมูล</i>" }} />
              </div>
           </div>

           {/* Photos */}
           <div className="space-y-6 pt-16 border-t border-dark-border">
              <h5 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-3">
                 <div className="p-2 bg-gov-gold/10 rounded-lg">
                    <Camera className="w-4 h-4 text-gov-gold" />
                 </div>
                 หลักฐานการนิเทศ (Observation Gallery)
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-video bg-dark-base rounded-3xl overflow-hidden border border-dark-border group relative">
                       <img src={`https://picsum.photos/seed/nongwa_obs_${i}/800/450`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Evidence {i}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
          <Icon className="w-5 h-5 text-gov-gold" />
       </div>
       <div>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-0.5">{label}</p>
          <p className="font-black text-sm text-white tracking-tight">{value}</p>
       </div>
    </div>
  );
}

function DetailStat({ label, value }: any) {
  return (
    <div className="p-8 bg-dark-base rounded-[2rem] border border-dark-border group hover:border-gov-gold transition-all relative overflow-hidden shadow-inner">
       <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-gov-gold/5 rounded-full blur-xl group-hover:bg-gov-gold/10 transition-colors"></div>
       <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1.5">{label}</p>
       <p className="font-black text-white text-lg tracking-tight">{value || "-"}</p>
    </div>
  );
}
