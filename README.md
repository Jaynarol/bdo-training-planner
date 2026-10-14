# BDO Training Planner

Static web app คำนวณเวลาเก็บเลเวล Black Desert Online ด้วย Black Spirit's Training (หุ่นฟาง) จนถึงเลเวล 75

**🔗 เข้าใช้งานได้ที่ https://jaynarol.com/bdo-training-planner/**

<p align="center">
  <img src="assets/help-exp.png" alt="ตัวละคร Jayzeon (Ascentor) — หน้าต่างข้อมูลส่วนตัวในเกม" width="360" />
</p>

ไม่มี build step ไม่มี dependency — แค่ `index.html`, `style.css`, `app.js` ค่าที่กรอกเก็บใน `localStorage` ของเบราว์เซอร์

## สูตรที่ใช้

- **EXP ต่อ tick** = `(4,126,858 ÷ (100 + 1805)) × (100 + Boost ของคุณ)`
  (Boost +1805% = ได้ EXP 19.05 เท่าของค่าพื้นฐาน; ค่าอ้างอิงแก้ได้ในส่วน "ตั้งค่าอ้างอิง")
- 1 tick ทุก 3 นาที
- ค่า EXP ของเลเวล N ในตาราง = EXP ที่ใช้ขึ้นจาก N → N+1
- ตัวเลือกเลเวลปัจจุบันมีเฉพาะ Lv 55–74 เพราะต้องมีข้อมูลต่อเนื่องถึง 75
  (Lv 15, 49 และ 75 แสดงในตารางอ้างอิงเท่านั้น)
- เวลาแสดงเป็น ปี / เดือน / วัน ตามปฏิทินจริงโดยนับจากวันนี้ (แบบเดียวกับการนับอายุ)

## ฟีเจอร์อื่นๆ

- สลับภาษา ไทย / English ได้ที่มุมขวาบน (จำค่าไว้ใน localStorage)
- ปุ่ม `?` ข้างช่องกรอก แสดงวิธีหาค่าในเกม (ภาพอยู่ใน `assets/`)

## ลิงก์แชร์

ปุ่ม "แชร์" สร้างลิงก์ที่มีค่าที่กรอกไว้ใน URL เช่น
`?lv=65&exp=12.5&unit=pct&boost=1500&h=8`
คนที่เปิดลิงก์จะเห็นผลตามค่านั้นทันที (ค่าจะถูกบันทึกลง localStorage ของเขาด้วย)

## รันในเครื่อง

```bash
npx http-server -p 5173 -c-1 .
```

## Deploy ขึ้น GitHub Pages

```bash
./deploy.sh
```

สคริปต์จะคัดลอกไฟล์เว็บ (`index.html`, `style.css`, `app.js`, `assets/`, `.nojekyll`) ไปไว้ใน repo ชั่วคราว
แล้ว force push ขึ้น branch `gh-pages` ของ `origin` (ถ้ายังไม่มี origin จะใช้ `https://github.com/Jaynarol/bdo-training-planner.git`)
เปลี่ยนปลายทางได้ด้วย `DEPLOY_REMOTE=<url> ./deploy.sh`

ครั้งแรกให้ตั้ง **Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**
เว็บจะอยู่ที่ https://jaynarol.com/bdo-training-planner/

---

สร้างโดย [Jaynarol](https://github.com/Jaynarol) · [GitHub](https://github.com/Jaynarol/bdo-training-planner)
