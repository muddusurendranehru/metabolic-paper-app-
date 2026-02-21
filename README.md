This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Achievements (Setup Complete)

### 1. Next.js App Created
- **Stack:** Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4, ESLint 9
- **Router:** App Router
- **Template:** app-tw
- Git repository initialized

### 2. Dependencies Installed (Working)
| Package | Version | Purpose |
|---------|---------|---------|
| pdfjs-dist | ^5.x | PDF text extraction (LLM path); digital PDFs |
| pdf-parse | ^2.4.5 | PDF text extraction |
| shadcn-ui | ^0.9.5 | UI components |
| lucide-react | ^0.564.0 | Icons |
| chart.js | ^4.5.1 | Charts |
| react-chartjs-2 | ^5.3.1 | React bindings for Chart.js |
| xlsx | ^0.18.5 | Excel read/write |
| papaparse | ^5.5.3 | CSV parsing |
| clsx | ^2.1.1 | Conditional class names |
| tailwind-merge | ^3.4.1 | Tailwind class merging |
| @tanstack/react-table | ^8.21.3 | Data tables |

**Do not reinstall or overwrite these—setup is stable.**

### LLM extraction (optional)
- Step 1 has an **"Extract with LLM (fallback)"** button. It uses `OPENAI_API_KEY` to extract lab fields from a PDF via GPT. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` if you want this. If unset, OCR and manual add still work.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
