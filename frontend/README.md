# ZimBet Frontend

ZimBet is a mobile-first betting platform built for Zimbabwe. This is the frontend application built with React, Vite, and Tailwind CSS.

## Features
- Mobile-first, low-data design
- Real-time odds and live betting
- Support for EcoCash, InnBucks, and bank transfers
- Progressive Web App (PWA) support

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Icons**: Lucide React
- **PWA**: `vite-plugin-pwa`

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Deployment

### Deploying to Vercel

This project is configured for easy deployment to Vercel.

1.  **Environment Variables**: Ensure you set the following environment variable in your Vercel project settings:
    - `VITE_API_URL`: The URL of your ZimBet backend API (e.g., `https://api.zimbet.co.zw/api/v1`).

2.  **Configuration**:
    - The `vercel.json` file handles SPA routing by rewriting all requests to `index.html`.
    - Build Command: `npm run build`
    - Output Directory: `dist`

3.  **Automatic Deployment**:
    - Connect your GitHub repository to Vercel for automatic deployments on push.
