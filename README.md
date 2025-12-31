# Tesla Valuation Simulator

A comprehensive valuation tool for Tesla (TSLA) using Discounted Cash Flow (DCF) and Monte Carlo simulation principles.

## Features

- **3-Year Forecast**: Detailed projections for 2025-2027.
- **Segment Breakdown**:
  - Existing Business: Auto, Energy, Services.
  - New Business: Robotaxi, Optimus (Humanoid Robot).
- **Monte Carlo Simulation**: Run thousands of iterations to see the distribution of potential outcomes based on parameter volatility.
- **Adjustable Parameters**:
  - Growth rates, margins, and revenue bases.
  - Launch years and probabilities for new businesses.
  - Elon Musk's compensation package dilution effect.
- **Dark Mode**: Sleek UI built with Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. Adjust the parameters in the left sidebar.
2. View the real-time DCF valuation in the KPI cards.
3. Click "Run Monte Carlo" to simulate 2000 scenarios and see the risk/reward distribution.
