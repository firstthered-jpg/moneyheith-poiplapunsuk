export const EXPENSE_CATEGORIES = [
  { name: 'ต้นทุนสินค้า', icon: '📦', color: '#ef4444' },
  { name: 'ค่าจัดส่ง', icon: '🚚', color: '#f97316' },
  { name: 'ค่าธรรมเนียมแพลตฟอร์ม', icon: '💳', color: '#f59e0b' },
  { name: 'ค่าโฆษณา', icon: '📢', color: '#ec4899' },
  { name: 'เงินเดือนพนักงาน', icon: '💼', color: '#8b5cf6' },
  { name: 'ค่าเช่า', icon: '🏠', color: '#6366f1' },
  { name: 'ค่าสาธารณูปโภค', icon: '💡', color: '#14b8a6' },
  { name: 'ค่าน้ำมัน', icon: '⛽', color: '#0ea5e9' },
  { name: 'อื่นๆ', icon: '📌', color: '#64748b' },
]

export const INCOME_CATEGORIES = [
  { name: 'หน้าร้าน', icon: '🏪', color: '#22c55e' },
  { name: 'ออนไลน์', icon: '💻', color: '#10b981' },
  { name: 'เดลิเวอรี่', icon: '🛵', color: '#84cc16' },
  { name: 'ฝากขาย', icon: '🤝', color: '#06b6d4' },
  { name: 'อื่นๆ', icon: '💵', color: '#3b82f6' },
]

export const CHART_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#ec4899',
  '#8b5cf6', '#6366f1', '#14b8a6', '#0ea5e9', '#64748b',
]

const todayDate = () => new Date()
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000)

export const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'income' as const,
    amount: 8500,
    category: 'หน้าร้าน',
    description: 'ยอดขายหน้าร้าน',
    date: todayDate(),
  },
  {
    id: '2',
    type: 'income' as const,
    amount: 3200,
    category: 'ออนไลน์',
    description: 'ยอดขายออนไลน์',
    date: todayDate(),
  },
  {
    id: '3',
    type: 'expense' as const,
    amount: 3500,
    category: 'ต้นทุนสินค้า',
    description: 'ของสด-ของแห้ง',
    date: todayDate(),
  },
  {
    id: '4',
    type: 'expense' as const,
    amount: 250,
    category: 'ค่าจัดส่ง',
    description: 'ค่าส่งของลูกค้า',
    date: todayDate(),
  },
  {
    id: '5',
    type: 'income' as const,
    amount: 6200,
    category: 'หน้าร้าน',
    description: 'ยอดขายหน้าร้าน',
    date: daysAgo(1),
  },
  {
    id: '6',
    type: 'expense' as const,
    amount: 2800,
    category: 'ต้นทุนสินค้า',
    description: 'สต๊อกสินค้า',
    date: daysAgo(1),
  },
  {
    id: '7',
    type: 'expense' as const,
    amount: 500,
    category: 'ค่าโฆษณา',
    description: 'โฆษณา Facebook',
    date: daysAgo(2),
  },
  {
    id: '8',
    type: 'income' as const,
    amount: 4800,
    category: 'ออนไลน์',
    description: 'ยอดขาย Shopee',
    date: daysAgo(2),
  },
  {
    id: '9',
    type: 'expense' as const,
    amount: 12000,
    category: 'ค่าเช่า',
    description: 'ค่าเช่าร้าน',
    date: daysAgo(5),
  },
  {
    id: '10',
    type: 'income' as const,
    amount: 9800,
    category: 'หน้าร้าน',
    description: 'ยอดขายหน้าร้าน',
    date: daysAgo(7),
  },
]
