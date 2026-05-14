# การเข้าถึง Moneed ผ่าน LAN (วงเนตภายใน)

## วิธีการ

### เครื่องหลัก (ที่รัน server):

1. เปิด Command Prompt
2. เข้าโฟลเดอร์ moneyheith:
```bash
cd C:\Users\g\Desktop\moneyheith
```

3. เริ่ม server:
```bash
npm run dev
```

4. ดู Console ให้เห็นข้อความ:
```
App running at: http://192.168.x.x:3000
Other devices on same network can access: http://192.168.x.x:3000
```

### เครื่องอื่นๆในเน็ตเดียวกัน:

1. เปิด Browser ใดก็ได้
2. เข้า URL ที่ console แสดง เช่น:
```
http://192.168.1.5:3000
```

## ตัวอย่าง

```
├── เครื่องหลัก: 192.168.1.5
│   └── npm run dev
│
├── Laptop ในเน็ต: http://192.168.1.5:3000 ✓ สามารถเข้าได้
├── Phone ในเน็ต: http://192.168.1.5:3000 ✓ สามารถเข้าได้
└── เครื่องอื่น: ต้องเป็นเน็ต WiFi เดียวกัน
```

## ข้อควรสังเกต

- ✅ ข้อมูลเก็บใน SQLite บนเครื่องหลัก
- ❌ แต่ละเครื่องจะมี Database แยก (ไม่ sync)
- ⚠️ ถ้าหลายคนแก้ข้อมูลพร้อมกัน อาจมี conflict

## หากต้องการ Sync ข้อมูลทุกคน

ต้องเพิ่ม Supabase เพื่อ Sync database แบบ real-time

## ปัญหาเข้าไม่ได้?

1. ตรวจสอบว่า **เน็ต WiFi เดียวกัน**
2. ปิด Firewall ชั่วคราว
3. ตรวจสอบ IP address:
```bash
ipconfig
```
หา `IPv4 Address` ที่ขึ้นต้นด้วย `192.168.` หรือ `10.`
