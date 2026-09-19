# HACKER.AI — เวอร์ชันไฟล์ HTML ล้วน (ไม่ต้อง build, ขึ้น GitHub Pages ได้เลย)

เวอร์ชันนี้ทำงานแบบเดียวกับไฟล์ single-file HTML ที่คุณคุ้นเคย — แค่ 2 ไฟล์
`dashboard.html` และ `bio.html` เปิดในเบราว์เซอร์ได้ตรงๆ ไม่ต้อง `npm install` ไม่ต้อง Next.js/Vercel
ต่างจากเดิมตรงที่มัน**ต่อฐานข้อมูลจริง** (Supabase) และ**เรียก AI จริง**ได้

## สิ่งที่ต้องทำครั้งเดียว (ประมาณ 10 นาที)

### 1) สร้างโปรเจกต์ Supabase (ฟรี — เป็นทั้งฐานข้อมูลและระบบล็อกอิน)
1. ไปที่ [supabase.com](https://supabase.com) → New Project
2. เปิด **SQL Editor** → วางเนื้อหาในไฟล์ `supabase/schema.sql` → กด Run
3. ไปที่ **Project Settings → API** → คัดลอก `Project URL` และ `anon public key`
4. เปิดไฟล์ `dashboard.html` และ `bio.html` ด้วยโปรแกรมแก้ไขข้อความ แก้บรรทัด:
   ```js
   const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
   ```
   ใส่ค่าจริงที่คัดลอกมา (แก้ทั้ง 2 ไฟล์)

### 2) เปิดใช้ AI จริง (ทางเลือก — ถ้าไม่ทำ ปุ่ม RUN ในหน้า dashboard จะ error เฉยๆ ส่วนอื่นใช้ได้ปกติ)
Static HTML เก็บ API key ไว้ไม่ได้ (ใครเปิดดูโค้ดก็เห็น) เลยต้องมีจุดเดียวที่รันบนเซิร์ฟเวอร์
คือ **Supabase Edge Function** — เล็กมาก ไม่ใช่ทั้งเว็บเซิร์ฟเวอร์ แค่ฟังก์ชันเดียว

1. ติดตั้ง Supabase CLI (ครั้งเดียว): `npm install -g supabase`
2. ล็อกอิน: `npx supabase login`
3. เชื่อมกับโปรเจกต์: `npx supabase link --project-ref YOUR-PROJECT-REF` (ดู ref ได้จาก URL โปรเจกต์)
4. Deploy ฟังก์ชัน: `npx supabase functions deploy ai`
5. ตั้งค่า API key (สร้างที่ [console.anthropic.com](https://console.anthropic.com)):
   `npx supabase secrets set ANTHROPIC_API_KEY=your-key`
6. คัดลอก URL ของฟังก์ชัน (รูปแบบ `https://YOUR-PROJECT.functions.supabase.co/ai`)
   ไปแก้บรรทัดนี้ใน `dashboard.html`:
   ```js
   const EDGE_FUNCTION_URL = 'https://YOUR-PROJECT.functions.supabase.co/ai';
   ```

### 3) อัปขึ้น GitHub Pages (แบบเดียวกับที่คุณทำเป็นประจำ)
1. สร้าง repo ใหม่ใน GitHub → อัป `dashboard.html` และ `bio.html` ขึ้นไป (root ของ repo)
2. Settings → Pages → เลือก branch `main` → Save
3. จะได้ URL แบบ `https://yourname.github.io/repo/dashboard.html`

## วิธีใช้งาน
- เปิด `dashboard.html` → สมัครสมาชิก/ล็อกอิน → กรอก username, bio, ลิงก์ → บันทึก
- หน้า bio สาธารณะจะอยู่ที่ `bio.html?u=ยูสเซอร์เนมที่ตั้งไว้`
  (เอาไปแปะใน bio ของ Facebook/Instagram ได้เลย เช่น `https://yourname.github.io/repo/bio.html?u=neo`)
- ในหน้า dashboard พิมพ์คำสั่งในช่อง AI ได้ เช่น "ช่วยร่าง bio ให้ดูเป็นนักพัฒนาสายแฮก" — ถ้า deploy Edge Function แล้วจะได้คำตอบจริงจาก Claude

## หมายเหตุ
- `SUPABASE_ANON_KEY` เปิดเผยในโค้ดฝั่งหน้าเว็บได้ตามปกติ (ไม่ใช่ความลับ) เพราะข้อมูลถูกป้องกันด้วย Row Level Security ในไฟล์ `schema.sql` แล้ว — คนอื่นจะบันทึก/แก้ข้อมูลของคุณไม่ได้
- ต้องเก็บเฉพาะ `ANTHROPIC_API_KEY` ไว้ในฝั่งเซิร์ฟเวอร์เท่านั้น (ผ่าน Edge Function) ห้ามใส่ในไฟล์ HTML เด็ดขาด
- ทั้ง `dashboard.html` และ `bio.html` มี matrix rain แบบ canvas จริง ไม่ใช่แค่พื้นหลัง grid
