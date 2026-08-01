# ERM

Next.js application built with TypeScript and Tailwind CSS.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [ESLint](https://eslint.org) + [Prettier](https://prettier.io)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the development server      |
| `npm run build`        | Build the app for production      |
| `npm run start`        | Start the production server       |
| `npm run lint`         | Run ESLint                        |
| `npm run format`       | Format the codebase with Prettier |
| `npm run format:check` | Check formatting without writing  |

## Project Structure

```
src/
├── app/                # Routes, layouts, and pages (App Router)
├── components/
│   ├── layout/          # Header, Footer, page structure components
│   └── ui/              # Reusable, presentational UI components
├── config/              # App-wide configuration (site metadata, etc.)
├── constants/           # Shared constant values
├── hooks/                # Reusable React hooks
├── lib/                  # Utilities and helper functions
└── types/                # Shared TypeScript types
```

## Environment Variables

Copy `.env.example` to `.env.local` and adjust values as needed:

```bash
cp .env.example .env.local
```
