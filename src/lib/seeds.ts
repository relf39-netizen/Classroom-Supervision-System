import { db_ops } from "./db";
import { EvaluationItem, AcademicYear } from "../types";
import { where } from "firebase/firestore";

const EVALUATION_ITEMS_SEED: Partial<EvaluationItem>[] = [
  // Category 1
  { category: "หมวดที่ 1 สภาพห้องเรียน", itemName: "1. มีป้ายนิเทศเพื่อเผยแพร่ข่าวสารและความรู้ต่าง ๆ", maxScore: 5 },
  { category: "หมวดที่ 1 สภาพห้องเรียน", itemName: "2. มีป้ายแสดงข้อมูลสถิติของห้องเรียนที่เป็นปัจจุบัน", maxScore: 5 },
  { category: "หมวดที่ 1 สภาพห้องเรียน", itemName: "3. มีสัญลักษณ์ชาติ ศาสนา พระมหากษัตริย์", maxScore: 5 },
  { category: "หมวดที่ 1 สภาพห้องเรียน", itemName: "4. มีการแสดงผลงานนักเรียน", maxScore: 5 },
  { category: "หมวดที่ 1 สภาพห้องเรียน", itemName: "5. บรรยากาศในห้องเรียนเอื้อต่อการเรียนรู้", maxScore: 5 },
  // Category 2
  { category: "หมวดที่ 2 การบริหารจัดการห้องเรียน", itemName: "6. ใช้การเสริมแรงเชิงบวก", maxScore: 5 },
  { category: "หมวดที่ 2 การบริหารจัดการห้องเรียน", itemName: "7. ใช้วิธีการทำงานเป็นกลุ่ม", maxScore: 5 },
  { category: "หมวดที่ 2 การบริหารจัดการห้องเรียน", itemName: "8. นักเรียนทุกคนมีส่วนร่วมในการจัดการเรียนรู้", maxScore: 5 },
  // Category 3
  { category: "หมวดที่ 3 ครูผู้สอน", itemName: "9. มีการจัดทำแผนการจัดการเรียนรู้", maxScore: 5 },
  { category: "หมวดที่ 3 ครูผู้สอน", itemName: "10. จัดกิจกรรมการเรียนรู้เน้นผู้เรียนเป็นสำคัญ", maxScore: 5 },
  { category: "หมวดที่ 3 ครูผู้สอน", itemName: "11. ใช้สื่อเทคโนโลยีในการจัดการเรียนรู้", maxScore: 5 },
  { category: "หมวดที่ 3 ครูผู้สอน", itemName: "12. มีข้อมูลนักเรียนเป็นรายบุคคล", maxScore: 5 },
  // Category 4
  { category: "หมวดที่ 4 การปฏิบัติตนของครู", itemName: "13. มีวินัยในชั้นเรียนเพื่อการพัฒนาการเรียนรู้", maxScore: 5 },
  { category: "หมวดที่ 4 การปฏิบัติตนของครู", itemName: "14. ดูแลเอาใจใส่นักเรียนอย่างทั่วถึง", maxScore: 5 },
  { category: "หมวดที่ 4 การปฏิบัติตนของครู", itemName: "15. แต่งกายเหมาะสมกับความเป็นครู", maxScore: 5 },
  // Category 5
  { category: "หมวดที่ 5 นักเรียน", itemName: "16. ตั้งใจปฏิบัติกิจกรรมการเรียนที่ได้รับมอบหมาย", maxScore: 5 },
  { category: "หมวดที่ 5 นักเรียน", itemName: "17. นักเรียนบรรลุจุดมุ่งหมายการเรียนรู้", maxScore: 5 },
  { category: "หมวดที่ 5 นักเรียน", itemName: "18. นักเรียนกระตือรือร้นและกล้าซักถามครู", maxScore: 5 },
  { category: "หมวดที่ 5 นักเรียน", itemName: "19. นักเรียนมีระเบียบวินัย", maxScore: 5 },
  { category: "หมวดที่ 5 นักเรียน", itemName: "20. นักเรียนแต่งกายสะอาดถูกต้องตามระเบียบ", maxScore: 5 },
];

export const seedDatabase = async () => {
  // Check if evaluation items exist
  const items = await db_ops.list<EvaluationItem>("evaluationItems");
  if (items.length === 0) {
    console.log("Seeding evaluation items...");
    for (const item of EVALUATION_ITEMS_SEED) {
      const itemId = `item_${EVALUATION_ITEMS_SEED.indexOf(item) + 1}`;
      await db_ops.create("evaluationItems", { ...item, itemId }, itemId);
    }
  }

  // Check if current academic year exists
  const years = await db_ops.list<AcademicYear>("academicYears", [where("year", "==", "2567")]);
  if (years.length === 0) {
    console.log("Seeding academic year...");
    await db_ops.create("academicYears", { year: "2567", semester: "1" });
    await db_ops.create("academicYears", { year: "2567", semester: "2" });
  }

  // Create default Admin
  const admins = await db_ops.list("users", [where("username", "==", "admin")]);
  if (admins.length === 0) {
    console.log("Seeding admin account...");
    await db_ops.create("users", {
      username: "admin",
      password: "password123",
      fullname: "Administrator",
      role: "admin", // Administrator role
      userId: "admin_001"
    }, "admin_001");
  }
};
