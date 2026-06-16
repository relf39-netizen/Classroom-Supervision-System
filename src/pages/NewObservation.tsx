import { useState, useEffect } from "react";
import { User, Teacher, EvaluationItem, Observation, mapScoreToLevel, EVALUATION_CATEGORIES } from "../types";
import { db_ops } from "../lib/db";
import { ClipboardCheck, Save, ArrowLeft, ArrowRight, Camera, User as UserIcon, BookOpen } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface NewObservationProps {
  user: User;
  onBack: () => void;
}

export default function NewObservation({ user, onBack }: NewObservationProps) {
  const [step, setStep] = useState(1);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [evalItems, setEvalItems] = useState<EvaluationItem[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Partial<Observation>>({
    date: new Date().toISOString().split('T')[0],
    subject: "",
    gradeLevel: "",
    classRoom: "",
    studentCount: 0,
    academicYear: "2567",
    semester: "1",
    strengths: "",
    suggestions: "",
    developmentPlan: "",
    photos: []
  });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      const [tList, iList] = await Promise.all([
        db_ops.list<Teacher>("teachers"),
        db_ops.list<EvaluationItem>("evaluationItems", []),
      ]);
      setTeachers(tList);
      setEvalItems(iList.sort((a,b) => a.itemId.localeCompare(b.itemId, undefined, {numeric: true})));
    };
    loadMeta();
  }, []);

  const handleScoreChange = (itemId: string, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const calculateResults = () => {
    const scoresArray = Object.values(scores) as number[];
    const total = scoresArray.reduce((acc, curr) => acc + curr, 0);
    const itemCount = evalItems.length;
    const avg = itemCount > 0 ? (total / (itemCount * 5)) * 5 : 0;
    const totalNormalized = itemCount > 0 ? (total / (itemCount * 5)) * 100 : 0;
    return { total: totalNormalized, avg, level: mapScoreToLevel(avg) };
  };

  const handleSave = async () => {
    if (!selectedTeacher) return alert("กรุณาเลือกครูผู้สอน");
    setIsSaving(true);
    const { total, avg, level } = calculateResults();
    
    const observationId = await db_ops.create("observations", {
      ...form,
      teacherId: selectedTeacher.teacherId,
      teacherName: selectedTeacher.name,
      teacherUserId: selectedTeacher.userId || "",
      observerId: user.userId,
      observerName: user.fullname,
      totalScore: total,
      averageScore: avg,
      evaluationLevel: level,
    });

    if (observationId) {
      for (const item of evalItems) {
        await db_ops.create(`observations/${observationId}/scores`, {
          observationId,
          itemId: item.itemId,
          score: scores[item.itemId] || 0,
          remark: ""
        });
      }
      onBack();
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 bg-dark-base text-text-primary">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-text-muted font-black uppercase text-[10px] tracking-widest hover:text-gov-gold transition-colors group">
          <div className="p-2 rounded-full border border-dark-border group-hover:border-gov-gold">
            <ArrowLeft className="w-4 h-4" />
          </div>
          ย้อนกลับ
        </button>
        <div className="flex items-center gap-3">
           {[1,2,3,4].map(s => (
             <div key={s} className={`h-1.5 transition-all rounded-full ${step >= s ? "w-8 bg-gov-gold" : "w-3 bg-dark-border"}`} />
           ))}
        </div>
      </div>

      <div className="bg-dark-surface rounded-[2.5rem] shadow-2xl border border-dark-border overflow-hidden">
        <div className="thai-gov-gradient p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ClipboardCheck className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <ClipboardCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight uppercase">บันทึกผลการนิเทศชั้นเรียน</h2>
            </div>
            <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Education Supervision System • Step {step} of 4</p>
          </div>
        </div>

        <div className="p-12">
          {step === 1 && (
            <div className="space-y-10">
              <div className="flex items-center gap-3 border-b border-dark-border pb-6">
                 <UserIcon className="w-5 h-5 text-gov-gold" /> 
                 <h3 className="font-black text-xs text-white uppercase tracking-widest">ข้อมูลพื้นฐานการนิเทศ</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">ครูผู้สอน <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4 px-5 focus:ring-1 focus:ring-gov-gold outline-none transition-all font-bold"
                    value={selectedTeacher?.teacherId || ""}
                    onChange={(e) => setSelectedTeacher(teachers.find(t => t.teacherId === e.target.value) || null)}
                  >
                    <option value="">เลือกครูผู้สอน</option>
                    {teachers.map(t => <option key={t.teacherId} value={t.teacherId} className="bg-dark-surface">{t.name} ({t.subjectGroup})</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">วันที่นิเทศ</label>
                  <input 
                    type="date" 
                    className="w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4 px-5 focus:ring-1 focus:ring-gov-gold outline-none transition-all font-bold"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">วิชาที่นิเทศ</label>
                   <input 
                    type="text" placeholder="เช่น ภาษาไทย"
                    className="w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4 px-5 focus:ring-1 focus:ring-gov-gold outline-none transition-all font-bold placeholder:text-text-muted/30"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">ระดับชั้น / ห้อง</label>
                   <div className="grid grid-cols-2 gap-4">
                     <input 
                      type="text" placeholder="ป.6"
                      className="w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4 px-5 focus:ring-1 focus:ring-gov-gold outline-none transition-all font-bold placeholder:text-text-muted/30"
                      value={form.gradeLevel}
                      onChange={(e) => setForm({...form, gradeLevel: e.target.value})}
                    />
                     <input 
                      type="text" placeholder="ห้อง 1"
                      className="w-full bg-dark-base border border-dark-border text-white rounded-2xl py-4 px-5 focus:ring-1 focus:ring-gov-gold outline-none transition-all font-bold placeholder:text-text-muted/30"
                      value={form.classRoom}
                      onChange={(e) => setForm({...form, classRoom: e.target.value})}
                    />
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 max-h-[600px] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-transparent">
               <div className="flex items-center gap-3 border-b border-dark-border pb-6 sticky top-0 bg-dark-surface z-10">
                 <ClipboardCheck className="w-5 h-5 text-gov-gold" /> 
                 <h3 className="font-black text-xs text-white uppercase tracking-widest">การประเมินรายหมวด (5 = ดีมาก, 1 = แก้ไข)</h3>
              </div>
              
              {EVALUATION_CATEGORIES.map(category => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-1 bg-gov-gold rounded-full"></div>
                    <h4 className="font-black text-[10px] text-gov-gold uppercase tracking-[0.2em]">{category}</h4>
                  </div>
                  <div className="space-y-4">
                    {evalItems.filter(i => i.category === category).map(item => (
                      <div key={item.itemId} className="p-6 bg-dark-base rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-dark-border hover:border-gov-gold/30 transition-all group">
                        <span className="text-sm font-bold text-text-secondary leading-relaxed group-hover:text-white transition-colors">{item.itemName}</span>
                        <div className="flex items-center gap-2">
                          {[5,4,3,2,1].map(v => (
                            <button
                              key={v}
                              onClick={() => handleScoreChange(item.itemId, v)}
                              className={`w-11 h-11 rounded-xl font-black text-sm transition-all border ${
                                scores[item.itemId] === v 
                                ? "bg-gov-gold text-white border-gov-gold shadow-lg shadow-gov-gold/20 scale-110" 
                                : "bg-dark-surface text-text-muted border-dark-border hover:border-text-muted/50 hover:text-text-secondary"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
               <div className="flex items-center gap-3 border-b border-dark-border pb-6">
                 <BookOpen className="w-5 h-5 text-gov-gold" /> 
                 <h3 className="font-black text-xs text-white uppercase tracking-widest">ข้อเสนอเเนะเเละจุดเด่น</h3>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">1. จุดเด่นของการจัดกิจกรรม</label>
                <div className="mb-12 bg-dark-base rounded-2xl overflow-hidden border border-dark-border focus-within:border-gov-gold transition-colors">
                   <ReactQuill theme="snow" value={form.strengths} onChange={(v) => setForm({...form, strengths: v})} className="h-48 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block">2. ข้อเสนอแนะเพื่อการพัฒนา</label>
                <div className="mb-12 bg-dark-base rounded-2xl overflow-hidden border border-dark-border focus-within:border-gov-gold transition-colors">
                   <ReactQuill theme="snow" value={form.suggestions} onChange={(v) => setForm({...form, suggestions: v})} className="h-48 text-white" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10">
               <div className="flex items-center gap-3 border-b border-dark-border pb-6">
                 <Camera className="w-5 h-5 text-gov-gold" /> 
                 <h3 className="font-black text-xs text-white uppercase tracking-widest">หลักฐานภาพถ่าย (สูงสุด 10 ภาพ)</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <button className="aspect-square border-2 border-dashed border-dark-border rounded-3xl flex flex-col items-center justify-center text-text-muted hover:border-gov-gold hover:text-gov-gold transition-all bg-dark-base group shadow-inner">
                  <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-center">อัปโหลดภาพ</span>
                </button>
                {/* Mock placeholders */}
                {[1,2].map(i => (
                   <div key={i} className="aspect-square bg-dark-base rounded-3xl overflow-hidden relative group border border-dark-border">
                      <img src={`https://picsum.photos/seed/school${i}/400/400`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-red-500 text-white font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full">ลบภาพ</button>
                      </div>
                   </div>
                ))}
              </div>

               <div className="mt-16 p-10 bg-dark-base rounded-[2rem] border border-dark-border relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gov-gold blur-[100px] opacity-10"></div>
                <h4 className="font-black text-xs text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gov-gold rounded-full"></span>
                  สรุปผลการประเมินเบื้องต้น
                </h4>
                <div className="flex items-center gap-16">
                   <div className="space-y-1">
                     <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">คะแนนรวม</p>
                     <p className="text-4xl font-black text-white tracking-widest">{calculateResults().total.toFixed(0)}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">ระดับคุณภาพ</p>
                     <p className="text-4xl font-black text-gov-gold tracking-tighter uppercase">{calculateResults().level}</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-dark-border flex items-center justify-between">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-muted hover:bg-white/5 disabled:opacity-0 transition-all font-bold"
            >
              ย้อนกลับ
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-3 bg-gradient-to-r from-gov-gold to-gov-gold-dark text-white px-10 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-gov-gold/10 active:scale-95"
              >
                ถัดไป
                <ArrowRight className="w-5 h-5 text-white/50" />
              </button>
            ) : (
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-12 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all shadow-xl shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-5 h-5 text-white/50" />
                {isSaving ? "Saving..." : "Confirm & Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
