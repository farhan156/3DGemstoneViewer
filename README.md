# Gemstone 360° Generator Platform

A premium, highly unique Next.js application for creating and managing interactive 360° gemstone models with certification management.

## 🎨 Design Features

- **Luxury Design**: Deep charcoal & obsidian black with metallic silver accents
- **No AI-typical patterns**: Handcrafted, precision-focused design language
- **Premium Typography**: Inter for UI, Cormorant Garamond for headers
- **Smooth Animations**: Subtle fade-ins, gem rotations, floating effects
- **Responsive Layout**: Optimized for desktop and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: Zustand
- **Animations**: Framer Motion
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx             # Home page (redirects to dashboard)
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard
│   └── view/[id]/
│       └── page.tsx         # Public gemstone viewer
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   ├── DashboardHome.tsx # Dashboard home page
│   │   ├── UploadGemstone.tsx # Upload interface
│   │   ├── GenerateModel.tsx # 360° model generator
│   │   ├── Certificates.tsx # Certificate management
│   │   └── Gallery.tsx      # Gemstone gallery
│   └── viewer/
│       └── PublicViewer.tsx # Public shareable viewer
├── store/
│   └── gemstoneStore.ts     # Zustand state management
├── types/
│   └── gemstone.ts          # TypeScript interfaces
└── lib/
    └── utils.ts             # Utility functions
```

## 🎯 Features

### Dashboard (Admin)
- **Quick Actions**: Upload gemstones, certificates, generate models, share links
- **Statistics Cards**: Track gems, models, certificates, and views
- **Recent Gemstones Table**: View and manage recent uploads
- **Upload Interface**: Drag & drop 360° rotation frames (36-72 frames)
- **Certificate Management**: Upload and link certification documents
- **360° Model Preview**: Interactive gemstone viewer with controls
- **Gallery**: Grid view of all gemstones with filtering

### Public Viewer
- **Immersive Display**: Full-screen luxury product viewer
- **Interactive 360°**: Drag to rotate, scroll to zoom
- **Gemstone Details**: Weight, cut, clarity, color grade, origin
- **Certificate View**: Integrated certification display
- **Premium Aesthetics**: Luxury jewelry store experience

## 🎨 Design System

### Colors
```css
--obsidian-black: #111111
--deep-charcoal: #0f0f0f
--carbon: #1a1a1a
--graphite: #242424
--metallic-silver: #d0d0d0
--gemstone-ruby: #9b1c31
--gemstone-sapphire: #0f4c81
--gemstone-emerald: #196844
```

### Typography
- **UI Text**: Inter (300, 400, 500, 600)
- **Headers**: Cormorant Garamond (300, 400, 500, 600)

### Spacing
- Consistent spacing scale: 0.5rem to 4rem
- Large breathing space between sections
- Minimal clutter approach

## 🔧 Customization

### Adding New Gemstone Types

Edit `src/types/gemstone.ts`:
```typescript
export interface Gemstone {
  type: 'ruby' | 'sapphire' | 'emerald' | 'diamond' | 'topaz'; // Add new type
  // ...
}
```

Update colors in `tailwind.config.ts`:
```typescript
gemstone: {
  topaz: '#ff9933', // Add new color
}
```

### Integrating 360° Viewer

The original `threesixty.js` can be integrated in:
- `src/components/dashboard/GenerateModel.tsx`
- `src/components/viewer/PublicViewer.tsx`

Example integration:
```typescript
'use client';

import { useEffect, useRef } from 'react';

export default function Gemstone360Viewer({ frames }: { frames: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current && frames.length > 0) {
      // Initialize your threesixty.js here
      // Example: new ThreeSixty(containerRef.current, { frames });
    }
  }, [frames]);
  
  return <div ref={containerRef} className="w-full h-full" />;
}
```

## 📊 State Management

The app uses Zustand for state management with the following structure:

```typescript
interface GemstoneStore {
  gemstones: Gemstone[];
  certificates: Certificate[];
  selectedGemstone: Gemstone | null;
  
  addGemstone: (gemstone: Gemstone) => void;
  updateGemstone: (id: string, data: Partial<Gemstone>) => void;
  deleteGemstone: (id: string) => void;
  selectGemstone: (gemstone: Gemstone | null) => void;
  addCertificate: (certificate: Certificate) => void;
  getCertificateByGemstoneId: (gemstoneId: string) => Certificate | undefined;
}
```

## 🚀 Performance Optimizations

1. **Next.js Image Optimization**: Uses `next/image` for automatic image optimization
2. **Code Splitting**: Automatic route-based code splitting
3. **Tree Shaking**: Unused code elimination in production
4. **CSS Optimization**: Tailwind CSS purging removes unused styles
5. **React Server Components**: Static rendering where possible
6. **Font Optimization**: Next.js font optimization with variable fonts

## 🎯 Next Steps

1. **API Integration**: Create API routes in `src/app/api/`
2. **Database**: Add Prisma or similar ORM for data persistence
3. **Authentication**: Implement NextAuth.js for admin access
4. **Image Storage**: Integrate with AWS S3 or Cloudinary
5. **360° Library**: Integrate threesixty.js or similar library
6. **Testing**: Add Jest and React Testing Library
7. **Analytics**: Add tracking for viewer engagement

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## 🤝 Contributing

This is a custom application. For modifications:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🎨 Design Credits

- **Design Language**: Premium, handcrafted, luxury product display
- **Inspiration**: Precision craftsmanship, mineral textures, high-end jewelry
- **Typography**: Google Fonts (Inter, Cormorant Garamond)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
