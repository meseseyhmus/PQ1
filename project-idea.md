# Property & Parcel Management Platform
## Inspired by Parselsorgu, Eraslan Software, and Nashi-app

## Project Overview
A modern web application for land parcel search, zoning information, and property management - combining the best elements from three reference projects:

- **Parselsorgu**: Land parcel search, zoning regulations (ÇDP), e-Plan, land announcement history
- **Eraslan Software**: Beautiful, industry-specific web design (health, real estate, beauty, veterinarian)
- **Nashi-app**: File conversion/editing workflows, media handling, smooth interactions

## Features
- 🔍 **Parcel Search** - Search by block/parcel number, view detailed information
- 📋 **Zoning & Regulations** - ÇDP, e-Plan, sit status display
- 📊 **Price Comparison** - Compare similar properties in the area
- 🗺️ **3D View** - Interactive plot viewing
- 📁 **File Management** - Upload, convert, and export parcel documents
- 📱 **Responsive** - Mobile-first design working seamlessly across devices
- 🎨 **Beautiful UI** - Inspired by Eraslan Software's clean, industry-specific designs

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion (animations)
- Leaflet/Mapbox (map integration)
- SWR (data fetching)
- React Hook Form

## Page Structure
1. **Home** - Parcel search hero with interactive map
2. **Search Results** - List with key metrics and quick actions
3. **Parcel Detail** - Detailed view with zoning, regulations, price data
4. **File Tools** - Conversion and editing workflow (Nashi-inspired)
5. **Comparison** - Side-by-side property comparison
6. **Profile** - User's saved parcels and history

## Design Inspiration
- **Color palette**: Clean neutros with accent colors per industry vertical
- **Typography**: System fonts with careful hierarchy
- **Components**: Glassmorphism cards, subtle micro-interactions
- **Transitions**: Framer Motion page transitions, hover animations

## Quick Setup
```bash
npm install
npm run dev
```

Open http://localhost:3000 to start the parcel search experience.

## Target Completion (3 hours)
MVP with:
- ✅ Parcel search input
- ✅ Basic map integration
- ✅ Detail page with zoning info
- ✅ File upload component
- ✅ Responsive design
- ✅ Beautiful UI throughout