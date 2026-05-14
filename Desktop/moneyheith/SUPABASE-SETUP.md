# การตั้งค่า Supabase

## ขั้นตอนการติดตั้ง

### 1. สมัครสมาชิก Supabase
- เข้า https://supabase.com
- Click "Start Your Project"
- สมัครด้วย Email หรือ GitHub
- สร้าง Organization ใหม่

### 2. สร้าง Project
- ชื่อ: `moneed`
- Database Password: ตั้งรหัสที่ยาวพอ
- Region: Southeast Asia (Singapore) หรือ ใกล้ที่สุด
- รอ 2-3 นาที

### 3. Copy Credentials
ไปที่ Settings → API

ค้นหา:
```
Project URL: https://xxxxx.supabase.co
anon public: eyJ0eXAi...
```

### 4. สร้างไฟล์ `.env.local`
ที่ `C:\Users\g\Desktop\moneyheith\.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAi...
```

**อย่าบอกใคร key นี้!**

### 5. สร้าง Database Tables
ใน Supabase Dashboard:
1. ไปที่ **SQL Editor**
2. Click **New Query**
3. Copy-paste SQL นี้:

```sql
-- Transactions Table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount FLOAT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'completed',
  receipt_url TEXT,
  tags JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  deductions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Goals Table
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount FLOAT NOT NULL,
  current_amount FLOAT DEFAULT 0,
  category TEXT,
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create Policies (allow all for now - later add authentication)
CREATE POLICY "Enable all for authenticated users" ON transactions
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON goals
  FOR ALL USING (true);
```

4. Click **Run**

### 6. Update ไฟล์ที่ใช้ Store
แทนที่:
```typescript
import { useFinanceStore } from '@/lib/store'
```

ด้วย:
```typescript
import { useFinanceStore } from '@/lib/store-supabase'
```

ในไฟล์เหล่านี้:
- `app/page.tsx`
- `app/income/page.tsx`
- `app/expense/page.tsx`
- `app/history/page.tsx`
- `app/reports/page.tsx`

### 7. ติดตั้ง Supabase Client
```bash
npm install @supabase/supabase-js
```

### 8. ลองใช้
```bash
npm run dev
```

---

## ตรวจสอบ

1. เข้า Dashboard ของคุณ
2. ลองเพิ่ม Income
3. ไปที่ Supabase Dashboard → **Table Editor** → transactions
4. ควรเห็นข้อมูลที่เพิ่มเข้ามา ✅

---

## สิ่งที่ได้รับ

✅ Data sync ทั้ง devices ในเน็ต  
✅ Backup cloud  
✅ Real-time updates  
✅ ใช้งาน offline ได้ (ต้อง sync ต่อไป)

---

## Troubleshooting

**Q: ข้อมูลไม่ปรากฏใน Supabase**
A: ตรวจสอบ:
1. API Key ถูกต้องไหม?
2. ENV variables อ่านได้ไหม? (restart `npm run dev`)
3. Policies ถูก enable ไหม?

**Q: Error "PGRST116"**
A: ต้องเพิ่ม RLS Policies
```sql
CREATE POLICY "public_read" ON transactions FOR SELECT USING (true);
CREATE POLICY "public_write" ON transactions FOR INSERT USING (true);
```

**Q: ต้องการ Authentication?**
A: เพิ่มได้ด้วย Supabase Auth (ขั้นตอนเพิ่มเติม)

---

## Next Steps

1. ✅ Set up Supabase
2. ✅ Create tables
3. ✅ Add credentials
4. ⏳ Update imports
5. ⏳ Test
6. (Optional) Add Supabase Authentication
7. (Optional) Real-time subscriptions
