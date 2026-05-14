# Moneyheith PoiplaPunsuk - Premium Finance Dashboard

A modern, premium fintech SaaS dashboard for income & expense management built with Next.js, React, Tailwind CSS, and Framer Motion.

## 🎨 Design Inspiration

Inspired by premium fintech apps like Apple, Stripe, and Linear with a clean, minimal aesthetic featuring:
- White/light gray backgrounds
- Electric blue (#0066FF) primary accent
- Lime green (#84E946) secondary accent
- Rounded cards (20-28px radius)
- Soft shadows and smooth animations
- Spacious, user-friendly layout

## ✨ Features

### ✅ Implemented
- **Dashboard**: Beautiful overview with balance, income, expense, and cashflow charts
- **Analytics**: Revenue, expenses, distributions, daily performance, and growth summary
- **Income Recording**: Add income with automatic deduction calculations
- **Component Library**: Reusable components (Card, Button, StatCard, Charts, etc.)
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Animations**: Smooth page transitions and micro interactions with Framer Motion
- **State Management**: Zustand for global state with persistence

### 🚀 Coming Soon
- **Expense Management**: Add and categorize expenses
- **Reports**: Daily, monthly, yearly reports with export (PDF, Excel, CSV)
- **Excel Import**: Drag-drop Excel/CSV import with auto-detection
- **Transaction History**: Search, filter, and tag transactions
- **Settings/Profile**: User profile and app settings
- **Premium Features**: Unlockable advanced features

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS 3.4+
- **State**: Zustand 4.4+
- **Animations**: Framer Motion 10.16+
- **Charts**: Recharts 2.10+
- **Icons**: Lucide React 0.292+
- **Database**: Supabase (optional, currently using local storage)
- **UI Components**: Radix UI for accessible dialogs
- **Utilities**: date-fns, clsx, tailwind-merge

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
# or
yarn install
```

2. **Create environment file** (optional for Supabase)
```bash
cp .env.example .env.local
```

3. **Run development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard (home)
│   ├── globals.css          # Global styles
│   ├── analytics/
│   │   └── page.tsx         # Analytics page
│   ├── income/
│   │   └── page.tsx         # Income recording
│   ├── expense/
│   │   └── page.tsx         # Expense management
│   ├── history/
│   │   └── page.tsx         # Transaction history
│   ├── reports/
│   │   └── page.tsx         # Reports and exports
│   ├── import/
│   │   └── page.tsx         # Excel import
│   └── settings/
│       └── page.tsx         # Settings page
├── components/              # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── StatCard.tsx
│   ├── Header.tsx
│   ├── CashflowChart.tsx
│   ├── TransactionTable.tsx
│   └── GoalsWidget.tsx
├── lib/
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript types
│   ├── constants.ts        # Constants and mock data
│   └── utils.ts            # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🚀 Usage

## 🏪 About Moneyheith PoiplaPunsuk

Moneyheith PoiplaPunsuk is a comprehensive financial management system designed for small business owners and entrepreneurs to track income, expenses, and profitability with ease.

### Dashboard
The main dashboard (`/`) shows your financial overview including:
- Total balance with visibility toggle
- Income and expense stats
- Net profit calculation
- Monthly cashflow chart
- Personal goals tracker
- Recent transactions
- Action buttons (Add Money, Send Money, Request Money)

### Record Income (`/income`)
Add daily income with automatic deduction system:
1. Enter gross amount
2. Select income category
3. Add description and date
4. Add deductions (delivery fees, product costs, platform fees, etc.)
5. System automatically calculates net profit
6. Submit to record

### Analytics (`/analytics`)
View comprehensive financial insights:
- Revenue vs Expense trends
- Expense distribution pie charts
- Daily performance
- Top expenses breakdown
- Growth summary

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color palette:
```ts
colors: {
  primary: { ... },
  success: { ... },
  danger: { ... },
  // Add your custom colors
}
```

### Fonts
Change fonts in `app/layout.tsx`:
```tsx
const inter = Inter({ subsets: ['latin'] })
```

### Animations
Modify animation timing in `lib/constants.ts`:
```ts
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
}
```

## 📊 Data Management

### Local Storage
Currently uses browser localStorage via Zustand's persist middleware. Data persists across sessions.

### Supabase Integration (Optional)
To connect Supabase:

1. **Install Supabase client**
```bash
npm install @supabase/supabase-js
```

2. **Add env variables** to `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

3. **Update store** to use Supabase queries instead of localStorage

## 🔐 Security

- ✅ Input validation and sanitization
- ✅ XSS protection with React's built-in escaping
- ✅ CSRF protection with SameSite cookies
- ✅ Environment variables for sensitive data
- ⚠️ TODO: Add authentication (Supabase Auth)
- ⚠️ TODO: Role-based access control

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Visit [vercel.com](https://vercel.com)
- Click "New Project"
- Import your repository
- Add environment variables
- Deploy

### Deploy to Other Platforms

The app is compatible with any Node.js hosting:
- Netlify
- Railway
- Render
- DigitalOcean
- AWS Amplify

## 📱 Responsive Design

The app is fully responsive and tested on:
- **Desktop**: 1920px and up
- **Laptop**: 1024px and up
- **Tablet**: 768px to 1024px
- **Mobile**: 320px to 768px

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast compliance
- ⚠️ TODO: Full WCAG 2.1 AA audit

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Dark mode not working
```bash
# Check if dark class is applied to html element
# Ensure localStorage is enabled in browser
```

## 📝 Development Roadmap

- [ ] Expense management
- [ ] Excel/CSV import with preview
- [ ] PDF report export
- [ ] Email reports
- [ ] Budget alerts
- [ ] Recurring expenses
- [ ] Multi-currency support
- [ ] API integration
- [ ] Mobile app (React Native)
- [ ] AI expense categorization
- [ ] Budget forecasting
- [ ] Team collaboration
- [ ] Webhook support

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

Created as a premium fintech dashboard template inspired by modern SaaS design principles.

## 💡 Tips

- Use the floating action button for quick income entry
- Click balance to toggle visibility
- Dark mode auto-saves preference
- Transactions persist in localStorage
- Charts are interactive - hover for details

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review the component examples

---

**Happy tracking! 💰📊**
