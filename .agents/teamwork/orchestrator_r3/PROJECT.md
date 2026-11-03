# Project: 4 SaaS Production Applications Suite

## Architecture
The repository consists of 4 independent Next.js 15 App Router applications sharing standard patterns, with a unified QA contract and verification suite:
1. `konvertlab` (Port 3001): 100% client-side file and document conversion tool (PDF, Word, Excel, Images, OCR, Batch ZIP, QR generator).
2. `seoradar` (Port 3002): Comprehensive technical SEO auditor, Core Web Vitals analyzer, security headers validator, and PDF reporting engine with WhatsApp agency inquiry.
3. `terneon` (Port 3003): Editorial digital agency landing page (Eraslan Software benchmark) with Safari+iPhone dual frame showcase, 6 sectors carousel, pricing terminal, and WhatsApp proposal generator.
4. `parselya` (Port 3004): Drone & land cadastral animation platform (parselsorgu.pro benchmark) with sidebar, floating center card, edge lengths, live TKGM Megsis API, and video flight exporter.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Port & Contract Alignment | Align ports to 3001, 3002, 3003, 3004 across all config & QA files | M0 | Survey & PRD |
| 2 | KonvertLab 100% Client-Side Privacy | Forbid any server-side API routes in konvertlab | M1 | Request §3 |
| 3 | KonvertLab 1-Click Sample Files | "Örnek Dosya ile Dene" buttons for all converter tabs | M1 | Request §3 |
| 4 | KonvertLab WebP Savings & Simulator | WebP quality slider with real dimension & savings display | M1 | Request §3 |
| 5 | KonvertLab Turkish OCR | Tesseract.js client OCR with progress % and TXT/PDF/DOCX export | M1 | Request §3 |
| 6 | KonvertLab Batch Pro ZIP | Multi-file queue with animated badges & ZIP download | M1 | Request §3 |
| 7 | KonvertLab QR Generator | Nashi-app style client-side QR generator with presets & export | M1 | Request §3 |
| 8 | SeoRadar 1-Click Demo Sites | Trendyol, Hepsiburada, GitHub demo buttons under search bar | M2 | Request §4 |
| 9 | SeoRadar Google PageSpeed CWV | Radial scorecards for LCP, CLS, FID, INP with threshold bars | M2 | Request §4 |
| 10 | SeoRadar Security Header Snippets | Nginx, Apache, Next.js code snippets with 1-click copy | M2 | Request §4 |
| 11 | SeoRadar Corporate PDF Report | Multi-page PDF report with safe Turkish glyphs & competitor matrix | M2 | Request §4 |
| 12 | SeoRadar Agency WhatsApp Modal | Pre-filled proposal with score metrics and 1-click WhatsApp link | M2 | Request §4 |
| 13 | Terneon Header & Branding | Eraslan Software / Terneon Studio branding, menu items, EN, dark mode, "Teklif al" | M3 | Request §2 |
| 14 | Terneon Hero Left | Exact headline, subheadline, CTAs ("Projeleri incele", "Fiyat hesapla"), trust badges | M3 | Request §2 |
| 15 | Terneon Hero Right Safari + iPhone | macOS Safari window (Saklı Cave House) + overlapping iPhone frame | M3 | Request §2 |
| 16 | Terneon 6-Sector Carousel | 6 sectors with < 01 / 06 > pagination and previous/next arrows | M3 | Request §2 |
| 17 | Terneon Bottom Tags & Cookie Modal | Bottom tags + "Çerez tercihiniz" modal ("Reddet", "Kabul et") | M3 | Request §2 |
| 18 | Terneon Price Terminal & WhatsApp | Interactive pricing terminal and direct WhatsApp quote link | M3 | Request §2 |
| 19 | Parselya Sidebar Top & Search | P icon, ParselSorgu.Pro, Nasıl kullanılır? modal, Giriş button, search bar | M4 | Request §1 |
| 20 | Parselya Quick Ada/Parsel | "174", "1", "Sorgula" button, "👆 ya da haritadan seçin" | M4 | Request §1 |
| 21 | Parselya Selected Parcel Card | Action icons, "174 / 1", "Arsa · 2.443 m²", "Akçatarla, Nusaybin, Mardin" | M4 | Request §1 |
| 22 | Parselya Purpose Pills & Tags | "Bu parsele neden bakıyorsunuz?", tags with red "yeni" badge | M4 | Request §1 |
| 23 | Parselya Tabs & Table | "Özet", "Plan" tabs, Nitelik, Mevkii, Pafta, Alan table | M4 | Request §1 |
| 24 | Parselya Haritada Göster Switch | "Kenar uzunlukları" switch rendering lengths on polygon edges | M4 | Request §1 |
| 25 | Parselya Fixed Bottom Bar | Piyasa modal, Uçuş (3D flight & MP4/video export), Paylaş modal, PDF kadastro föyü | M4 | Request §1 |
| 26 | Parselya Map Area & Center Card | 4-line floating card on parcel centroid, edge badges, compass, GPS, zoom | M4 | Request §1 |
| 27 | Parselya Live TKGM API | ilListe -> ilceListe -> mahalleListe -> parsel/{mahalleId}/{ada}/{parsel} | M4 | Request §1 |
| 28 | Comprehensive QA & Verification | 86 QA contracts, 373 unit tests, 4 production builds, ports 3001-3004 | Final | Request §Final |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Port & Contract Migration | Ports 3001-3004 in scripts, docker, QA, package.json | none | DONE |
| M1 | KonvertLab Verification & Polish | Features 2-7 | M0 | IN_PROGRESS |
| M2 | SeoRadar Verification & Polish | Features 8-12 | M0 | IN_PROGRESS |
| M3 | Terneon Verification & Polish | Features 13-18 | M0 | IN_PROGRESS |
| M4 | Parselya Verification & Polish | Features 19-27 | M0 | IN_PROGRESS |
| Final | Production Gate Verification | Feature 28 (86 QA contracts, 373 tests, 4 Next.js builds) | M1-M4 | IN_PROGRESS |

## Interface Contracts
- KonvertLab: Port 3001, 100% client-side (no app/api).
- SeoRadar: Port 3002, POST /api/analyze, PDF generation.
- Terneon: Port 3003, static Next.js 15 App router.
- Parselya: Port 3004, GET /api/parsel (TKGM proxy/fallback).

## Code Layout
- Root: `package.json`, `scripts/`, `qa/`, `docker-compose.yml`, `rea/`
- `konvertlab/`: `components/`, `lib/`, `app/`, `tests/`
- `seoradar/`: `components/`, `lib/`, `app/`, `tests/`
- `terneon/`: `components/`, `config/`, `app/`, `tests/`
- `parselya/`: `components/`, `lib/`, `app/`, `tests/`
