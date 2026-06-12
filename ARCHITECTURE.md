# Lincon Bet Zim — Technical Architecture & API Research

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Mobile Money API Research](#2-mobile-money-api-research)
3. [Platform Architecture](#3-platform-architecture)
4. [Real-Time Odds Integration Strategy](#4-real-time-odds-integration-strategy)
5. [Security Measures for Transactions](#5-security-measures-for-transactions)
6. [Deployment & Infrastructure](#6-deployment--infrastructure)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Executive Summary

This document outlines the complete technical architecture for **Lincon Bet Zim**, a mobile-first sports betting platform optimized for the Zimbabwe market. The platform's core differentiator is deep integration with local mobile money services — **EcoCash** (Econet Wireless) and **OneMoney** (NetOne) — enabling seamless deposits and withdrawals for Zimbabwean users who predominantly transact via mobile money.

**Key Design Principles:**
- **Mobile-first:** All interfaces designed for mobile browsers and USSD fallback
- **Offline resilience:** Graceful degradation on Zimbabwe's variable mobile networks
- **Local-first payments:** Instant deposits/withdrawals via EcoCash and OneMoney
- **Regulatory compliance:** Adherence to Zimbabwean gambling and financial regulations
- **Horizontal scalability:** Microservices architecture allowing independent scaling of payment, odds, and user services

---

## 2. Mobile Money API Research

### 2.1 EcoCash API (Cassava Fintech / Econet Wireless)

**Provider:** Cassava Fintech (subsidiary of Econet Wireless Zimbabwe)
**Website:** https://www.ecocash.co.zw/
**Developer Portal:** Previously at `developer.ecocash.co.zw` (currently limited public access — direct partnership required)

#### API Overview

EcoCash offers a RESTful API for merchant integration with the following key characteristics:

| Feature | Details |
|---------|---------|
| **API Style** | RESTful (JSON over HTTPS) |
| **Authentication** | OAuth 1.0a / API Key + Secret |
| **Base URL (Sandbox)** | `https://sandbox.ecocash.co.zw/api/v1/` |
| **Base URL (Production)** | `https://api.ecocash.co.zw/api/v1/` |
| **Webhook Support** | Yes — transaction status notifications |
| **Idempotency** | Supported via `Idempotency-Key` header |
| **Rate Limiting** | Typically 10-30 requests/second per merchant |

#### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payment/request` | POST | Initiate a C2B payment — sends USSD push to customer's phone |
| `/payment/status` | GET | Check payment status by transaction reference |
| `/payment/refund` | POST | Issue a refund to a customer |
| `/disbursement/send` | POST | Send money from merchant to customer (B2C) |
| `/disbursement/status` | GET | Check disbursement status |
| `/balance/inquiry` | GET | Check merchant wallet balance |
| `/transaction/verify` | GET | Verify a transaction |
| `/webhook/register` | POST | Register a webhook URL for callbacks |

#### Transaction Flow (C2B — Customer to Business)

```
User selects EcoCash deposit on betting platform
  → Platform calls POST /payment/request
    → EcoCash sends USSD push to customer's phone
    → Customer enters PIN on their phone to authorize
    → EcoCash processes payment
    → EcoCash sends webhook callback to /webhook/ecocash endpoint
    → Platform credits user's betting wallet
    → Platform notifies user via in-app notification / SMS
```

#### Integration Requirements (for Merchant Application)

1. **Business Registration:** Must be a registered business in Zimbabwe
2. **Merchant Application:** Submit EcoCash merchant application form
3. **Due Diligence:** KYC documentation, business proof, tax clearance
4. **Contract:** Sign EcoCash merchant service agreement
5. **Technical Onboarding:** API credentials provisioned, sandbox access granted
6. **Go-Live:** Production credentials after successful sandbox testing

#### Transaction Limits & Charges

- **Min Transaction:** ZWL $1 or USD $0.50
- **Max Transaction (per day):** Varies by merchant tier (typically ZWL $50,000 - $500,000)
- **Merchant Discount Rate (MDR):** Typically 2-5% per transaction
- **Settlement:** T+1 (next business day) to merchant bank account

#### Known Limitations

- No public self-service developer portal — direct partnership required
- Limited sandbox availability (request-based access)
- Webhook delivery is best-effort (no guaranteed delivery SLA)
- No official OpenAPI/Swagger specification publicly available
- Changes to API require coordination with EcoCash technical team
- USSD push dependent on Econet network connectivity

---

### 2.2 OneMoney API (NetOne)

**Provider:** NetOne Cellular (Pvt) Ltd — State-owned mobile network operator
**Website:** https://www.onemoney.co.zw/
**Developer Portal:** No public developer portal — direct partnership/application required

#### API Overview

OneMoney is NetOne's mobile money platform. The merchant API follows similar patterns to other mobile money APIs in Africa:

| Feature | Details |
|---------|---------|
| **API Style** | RESTful (JSON/XML over HTTPS) |
| **Authentication** | API Key + Secret / Mutual TLS |
| **Base URL (Sandbox)** | Provided on request after partnership agreement |
| **Base URL (Production)** | Provided on request after partnership agreement |
| **Webhook Support** | Yes — IPN (Instant Payment Notification) |
| **Idempotency** | Supported via unique transaction reference |
| **Rate Limiting** | Typically 5-15 requests/second per merchant |

#### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/c2b/payment` | POST | Initiate customer-to-business payment |
| `/c2b/status` | GET | Check C2B payment status |
| `/b2c/payment` | POST | Business-to-customer payout (withdrawals) |
| `/b2c/status` | GET | Check B2C payout status |
| `/b2b/transfer` | POST | Business-to-business transfers |
| `/balance` | GET | Check wallet balance |
| `/transaction/query` | GET | Query transaction details by ref |
| `/reversal` | POST | Reverse a transaction |
| `/statement` | GET | Download wallet statement |

#### Transaction Flow (C2B — Deposit)

```
User selects OneMoney deposit on betting platform
  → Platform calls POST /c2b/payment
    → OneMoney validates merchant + transaction
    → OneMoney sends USSD/STK push to customer's phone
    → Customer enters PIN to authorize payment
    → OneMoney processes debit from customer wallet
    → OneMoney sends IPN callback to /webhook/onemoney endpoint
    → Platform credits user's betting wallet
    → Platform notifies user
```

#### Transaction Flow (B2C — Withdrawal)

```
User requests withdrawal to OneMoney
  → Platform validates withdrawal eligibility
  → Platform calls POST /b2c/payment
    → OneMoney validates merchant balance
    → OneMoney credits customer wallet
    → OneMoney sends IPN callback to /webhook/onemoney endpoint
    → Platform marks withdrawal as completed
    → Platform notifies user
```

#### Integration Requirements

1. **Business Registration:** Must be registered in Zimbabwe
2. **NetOne Merchant Account:** Apply through NetOne's merchant program
3. **KYC:** Director(s) documentation, business registration, tax clearance
4. **Technical Assessment:** NetOne reviews integration architecture
5. **Contract:** Sign OneMoney merchant services agreement
6. **Test Credentials:** Sandbox API credentials provisioned
7. **Certification:** Pass integration certification tests
8. **Go-Live:** Production credentials issued

#### Transaction Limits & Charges

- **Min Transaction:** ZWL $1
- **Max Transaction (per day):** Varies by merchant tier
- **Merchant Discount Rate (MDR):** Typically 2-4% per transaction
- **Settlement:** T+1 to T+2 to merchant bank account

#### Known Limitations

- No public API documentation — direct engagement required
- Sandbox access is manual/gated
- Less mature API compared to EcoCash (fewer integrations in market)
- IPN callbacks may be delayed during high-traffic periods
- Limited to NetOne subscriber base (smaller market share than Econet)
- No webhook retry mechanism — caller must implement polling fallback

---

### 2.3 Comparative Analysis: EcoCash vs OneMoney

| Aspect | EcoCash | OneMoney |
|--------|---------|----------|
| **Market Share (ZW)** | ~80% of mobile money | ~15-20% of mobile money |
| **Network** | Econet | NetOne |
| **API Maturity** | More mature, more integrations | Less mature, fewer integrations |
| **Documentation** | Limited but exists | Very limited, bespoke |
| **Onboarding Time** | 4-8 weeks | 6-12 weeks |
| **MDR** | 2-5% | 2-4% |
| **Settlement** | T+1 | T+1 to T+2 |
| **Webhook Reliability** | Moderate | Lower (polling fallback needed) |
| **Cross-network** | Can receive from other networks | NetOne only |

**Strategic Recommendation:** Prioritize EcoCash integration first (higher user base), then add OneMoney for broader coverage.

---

## 3. Platform Architecture

### 3.1 High-Level Architecture

The platform follows a **modular monolith** architecture with clear service boundaries that can be extracted into microservices as the platform scales. This approach balances development speed (critical for MVP) with future scalability.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ React SPA   │  │  Mobile Web  │  │  USSD      │  │ PWA       │  │
│  │ (Desktop)   │  │ (Mobile Opt)│  │  (*Future) │  │ Offline   │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘  │
│         │                │                 │               │        │
├─────────┼────────────────┼─────────────────┼───────────────┼────────┤
│         │                │                 │               │        │
│    ┌────▼────────────────▼─────────────────▼───────────────▼────┐   │
│    │                    CDN / Load Balancer                      │   │
│    │                    (Cloudflare / AWS CloudFront)            │   │
│    └────────────────────────────┬────────────────────────────────┘   │
│                                 │                                    │
│    ┌────────────────────────────▼────────────────────────────────┐   │
│    │                   API Gateway (Kong / Traefik)               │   │
│    │       Auth │ Rate Limiting │ Request Validation │ Logging    │   │
│    └──┬─────────────┬──────────────┬─────────────┬───────────────┘   │
│       │             │              │             │                   │
│  ┌────▼────┐  ┌─────▼──────┐  ┌───▼──────┐  ┌───▼──────────┐       │
│  │ User     │  │ Betting    │  │ Payment   │  │ Odds         │       │
│  │ Service  │  │ Engine     │  │ Service   │  │ Ingestion    │       │
│  └────┬────┘  └─────┬──────┘  └───┬──────┘  └───┬──────────┘       │
│       │             │              │             │                   │
│  ┌────▼────┐  ┌─────▼──────┐  ┌───▼──────┐  ┌───▼──────────┐       │
│  │ Auth    │  │ Bet Slip   │  │ EcoCash   │  │ Provider     │       │
│  │ Service │  │ Processor  │  │ Adapter   │  │ Adapter      │       │
│  └─────────┘  └────────────┘  └───┬──────┘  │ (Odds API)   │       │
│                                   │          └──────────────┘       │
│                              ┌────▼────┐                            │
│                              │ OneMoney │                            │
│                              │ Adapter  │                            │
│                              └─────────┘                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Message Queue (Redis / RabbitMQ)            │   │
│  │    ─ Webhook events │ ─ Bet settlement │ ─ Notification jobs  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Data Layer                                  │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ Postgres │  │ Redis      │  │ Timescale│  │ S3/Minio │    │   │
│  │  │ (Primary)│  │ (Cache)    │  │ (Analytics)│ (Media)    │    │   │
│  │  └──────────┘  └────────────┘  └──────────┘  └──────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Backend Stack Recommendation

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **API Framework** | Node.js (Express/Fastify) or Python (FastAPI) | Strong async support, good for I/O-bound payment flows. FastAPI is memory-light; Node.js has vast package ecosystem |
| **Language** | TypeScript (Node) or Python 3.11+ | TypeScript: type safety + shared types with frontend. Python: better ML/analytics ecosystem |
| **Database** | PostgreSQL 15+ | ACID compliance critical for financial transactions. JSONB for flexible schema where needed |
| **Cache** | Redis 7+ | Session store, rate limiting, real-time score feeds, bet slip cache |
| **Message Queue** | Redis Streams or RabbitMQ | Webhook event processing, bet settlement, async notifications |
| **Analytics DB** | TimescaleDB (PostgreSQL extension) | Time-series data for odds history, user activity, betting patterns |
| **Search** | Meilisearch or PostgreSQL FTS | For sports/team/market search |
| **Background Jobs** | BullMQ (Node) or Celery (Python) | Scheduled odds updates, payout processing, report generation |
| **API Gateway** | Traefik or Kong | Routing, rate limiting, auth, observability |
| **Container Runtime** | Docker + Docker Compose (dev) / Kubernetes (prod) | Consistent deployments, horizontal scaling |

**Recommendation:** Start with **Python FastAPI + PostgreSQL + Redis**. FastAPI is memory-light (important for sandbox constraints), has excellent async support via asyncio, and Python's ecosystem is strong for financial calculations.

### 3.3 Frontend Stack Recommendation

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | React 18+ with Vite | Vite is memory-light compared to Next.js. Huge ecosystem |
| **Mobile Optimization** | Tailwind CSS + custom responsive patterns | Mobile-first by default |
| **State Management** | React Query (TanStack Query) + Context | Excellent for server-state (betting data), minimal boilerplate |
| **Real-time Updates** | Server-Sent Events (SSE) or WebSockets | Odds updates, live scores, bet settlement notifications |
| **PWA Support** | Vite PWA plugin | Offline bet slip, push notifications, install prompt |
| **API Client** | Axios + React Query | Type-safe API calls with caching |

**Recommendation:** Use React + Vite (avoid Next.js to conserve memory in sandbox). Use SSE for real-time data (simpler than WebSockets and sufficient for odds updates).

### 3.4 Database Schema Design

#### Core Tables

```sql
-- Users & Accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    kyc_level INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    balance_zwl DECIMAL(12,2) DEFAULT 0.00,
    balance_usd DECIMAL(12,2) DEFAULT 0.00,
    locked_balance DECIMAL(12,2) DEFAULT 0.00,
    version INTEGER DEFAULT 1,  -- Optimistic locking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'bet', 'payout'
    payment_method VARCHAR(20) NOT NULL, -- 'ecocash', 'onemoney'
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZWL',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed', 'reversed'
    external_ref VARCHAR(100), -- Reference from mobile money API
    platform_ref VARCHAR(100) UNIQUE NOT NULL, -- Our reference
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports & Betting
CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'football', 'basketball', 'tennis', 'rugby', etc.
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES sports(id) NOT NULL,
    name VARCHAR(200) NOT NULL, -- 'English Premier League', 'UEFA Champions League'
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) NOT NULL,
    home_team VARCHAR(200) NOT NULL,
    away_team VARCHAR(200) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'live', 'finished', 'cancelled'
    home_score INTEGER,
    away_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) NOT NULL,
    name VARCHAR(200) NOT NULL, -- 'Match Result', 'Over/Under 2.5', 'Both Teams to Score'
    type VARCHAR(50) NOT NULL, -- '1X2', 'over_under', 'btts', 'correct_score'
    is_active BOOLEAN DEFAULT TRUE,
    is_settled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE odds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id) NOT NULL,
    selection_name VARCHAR(200) NOT NULL, -- 'Home Win', 'Away Win', 'Draw'
    decimal_odds DECIMAL(8,4) NOT NULL,  -- e.g., 1.5000
    probability DECIMAL(5,4), -- Implied probability
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'settled', 'void'
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Betting
CREATE TABLE bet_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    total_stake DECIMAL(12,2) NOT NULL,
    total_odds DECIMAL(12,4),
    potential_payout DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'won', 'lost', 'cashed_out', 'void'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE bet_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bet_slip_id UUID REFERENCES bet_slips(id) NOT NULL,
    odds_id UUID REFERENCES odds(id) NOT NULL,
    selection_name VARCHAR(200) NOT NULL,
    odds_at_placement DECIMAL(8,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'won', 'lost', 'void'
    settled_at TIMESTAMPTZ
);
```

**Key Design Decisions:**
- **Optimistic locking** on wallets to prevent race conditions
- **UUID primary keys** for distributed ID generation without DB sequences
- **JSONB columns** for flexible metadata (payment provider-specific data)
- **Separate `bet_legs` table** for multi-bet (accumulator) support
- **Denormalized `odds_at_placement`** to capture historical odds when bet was placed
- **TIMESTAMPTZ** for timezone-aware timestamps

---

## 4. Real-Time Odds Integration Strategy

### 4.1 Odds Data Provider Options

| Provider | Coverage | API Type | Pricing | Reliability |
|----------|----------|----------|---------|-------------|
| **The Odds API** | 200+ bookmakers, 50+ sports | REST + WebSocket | Free tier (500/day), Paid from $99/mo | High |
| **Sportmonks** | Football-centric, 1000+ leagues | REST + WebSocket | $99-499/mo | High |
| **RapidAPI Sports Odds** | Multiple providers | REST | Pay-per-use | Moderate-High |
| **Proprietary Data** | Self-calculated | N/A | N/A | Requires resource |
| **Web Scraping** | Various sources | Scraping | Free but fragile | Low (legal risk) |

**Recommendation:** Start with **The Odds API** (best balance of coverage, cost, and reliability for MVP). As scale grows, contract directly with Sportradar or Genius Sports.

### 4.2 Odds Ingestion Architecture

```
                      ┌────────────────┐
                      │  Odds Provider  │
                      │    (API)        │
                      └───────┬────────┘
                              │ HTTP/WebSocket
                      ┌───────▼────────┐
                      │  Odds Ingestion │
                      │  Worker Service │
                      │  - Polls every  │
                      │    5-30 seconds │
                      │  - Normalizes   │
                      │    data format  │
                      └───────┬────────┘
                              │
                      ┌───────▼────────┐
                      │   Redis Cache   │
                      │  (Active Odds)  │
                      │  TTL: 60-300s   │
                      └───────┬────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
        ┌──────▼─────┐  ┌────▼─────┐  ┌─────▼──────┐
        │ PostgreSQL  │  │ SSE Push │  │  Odds      │
        │ (Persist)   │  │ to Users │  │  History   │
        │             │  │          │  │  (Timescale)│
        └─────────────┘  └──────────┘  └────────────┘
```

### 4.3 Odds Update Strategy

**Polling vs WebSocket:**
- **Primary:** HTTP polling every 10-30 seconds (simpler, more reliable)
- **Future:** WebSocket connection for live in-play odds (lower latency)

**Data Flow:**
1. Ingestion worker polls provider API every 10s during active events
2. Odds updates are written to Redis (hot cache) and PostgreSQL (persistence)
3. SSE pushes odds changes to connected clients in real-time
4. Historical odds tracked in TimescaleDB for analysis

**Odds Normalization & Vig Calculation:**
```
For a market with odds: Home 2.10, Draw 3.40, Away 3.80

Implied probabilities:
  Home: 1/2.10 = 47.62%
  Draw: 1/3.40 = 29.41%
  Away: 1/3.80 = 26.32%
  Total: 103.35%

Vig (Overround): 3.35%

Fair probabilities (removing vig):
  Home: 47.62/103.35 = 46.08%
  Draw: 29.41/103.35 = 28.46%
  Away: 26.32/103.35 = 25.46%
```

**Price Sensitivity:** The platform will adjust odds based on:
- Movement from upstream provider
- Position limits (large bets on one side trigger odds adjustment)
- Time to event (dynamic adjustments as match approaches)

### 4.4 Bet Settlement Strategy

| Settlement Type | Trigger | Flow |
|----------------|---------|------|
| **Auto-Settlement** | Final score from provider API | Worker checks provider API → updates market status → settles all bets on that market |
| **Manual Override** | Admin panel | Admin can force-settle markets in case of API failure |
| **Void/Cancelled** | Match abandoned | Full refund of stakes |
| **Cash Out** | User-initiated | Dynamic valuation based on current odds × stake |

### 4.5 Live Betting Considerations

- In-play odds update frequency: Every 1-5 seconds
- Market suspension window (goal/scoring event): ~5 seconds
- Streaming: Not in MVP (high bandwidth cost in Zimbabwe). Use text-based live updates.
- Live data source: Same provider (The Odds API offers live coverage for major leagues)

---

## 5. Security Measures for Transactions

### 5.1 Payment Security Architecture

```
User Device                    Platform                     Mobile Money API
     │                            │                              │
     │  1. Initiate Deposit       │                              │
     │──────────────────────────►│                              │
     │                            │  2. Generate unique ref      │
     │                            │  3. Create pending tx        │
     │                            │─────────────────────────────►│
     │                            │  4. USSD Push to User       │
     │◄─────────────────────────────────────                     │
     │  5. User enters PIN        │                              │
     │  (on phone - EcoCash/OM)   │                              │
     │                            │◄─────────────────────────────│
     │                            │  6. Webhook callback         │
     │                            │     (signed with HMAC)       │
     │                            │  7. Verify webhook signature │
     │                            │  8. Check idempotency        │
     │                            │  9. Update wallet (atomic)   │
     │  10. Confirmation          │                              │
     │◄──────────────────────────│                              │
```

### 5.2 Security Controls

| Layer | Measure | Implementation |
|-------|---------|---------------|
| **Transport** | TLS 1.3 | All communications encrypted. Certificates from Let's Encrypt or commercial CA |
| **API Auth** | JWT (access + refresh) + OTP | Short-lived access tokens (15 min), refresh tokens (7 days), SMS OTP for sensitive actions |
| **Payment Auth** | HMAC signing | All webhooks from EcoCash/OneMoney verified via HMAC-SHA256 signature |
| **Idempotency** | Idempotency-Key | Each payment request has unique idempotency key to prevent double-processing |
| **Rate Limiting** | Per-user + per-IP | 10 requests/sec per user, 100 requests/sec per IP on payment endpoints |
| **Wallet Operations** | Optimistic locking | Version field incremented on each wallet update. Concurrent updates rejected |
| **Audit Trail** | Immutable transaction log | All financial transactions logged to append-only audit table |
| **Secrets Management** | Vault / encrypted env | API keys stored encrypted at rest. Never logged or exposed |
| **Webhook Security** | IP allowlist + signature | Webhook endpoints accept only from known IP ranges. Payload signed |
| **DDoS Protection** | Cloudflare / similar | Rate limiting at edge, WAF rules |
| **SQL Injection** | Parameterized queries | All database queries use prepared statements (ORM or raw) |
| **XSS** | CSP headers + input sanitization | Content-Security-Policy headers, DOMPurify for user input |
| **CSRF** | SameSite cookies + tokens | Strict SameSite attribute, CSRF tokens for state-changing requests |
| **CORS** | Restricted origins | Only allow known domains (api.linconbet.co.zw, app.linconbet.co.zw) |

### 5.3 Critical Transaction Flows

#### Deposit Flow (C2B)

```
1. User initiates deposit on platform
2. Platform creates payment_transaction (status: pending)
3. Platform calls mobile money API with merchant credentials
4. Mobile money API sends USSD/STK push to user's phone
5. User authorizes on their phone (PIN entry)
6. Mobile money API sends webhook to platform's /webhook endpoint
7. Platform verifies:
   a. Webhook HMAC signature matches expected value
   b. IP source is in allowlist
   c. external_ref matches our platform_ref
   d. amount matches expected amount
   e. Idempotency check (no double processing)
8. Platform updates wallet balance in atomic transaction:
   BEGIN TX
     SELECT version FROM wallets WHERE user_id = ? FOR UPDATE
     UPDATE wallets SET balance = balance + amount, version = version + 1
     WHERE user_id = ? AND version = ?
     UPDATE payment_transactions SET status = 'success' WHERE id = ?
   COMMIT
9. Platform sends confirmation to user
```

#### Withdrawal Flow (B2C)

```
1. User initiates withdrawal (amount, mobile money method)
2. Platform validates:
   a. Sufficient balance (available balance, not locked)
   b. Within daily limits
   c. KYC level meets withdrawal threshold
3. Platform locks the amount: UPDATE wallets SET locked_balance = locked_balance + amount
4. Platform calls mobile money B2C API
5. Mobile money processes and sends IPN callback
6. Platform verifies webhook (same checks as deposit)
7. Platform updates: debit balance, clear locked balance
8. Platform sends confirmation to user
```

### 5.4 Fraud Prevention

| Fraud Type | Detection | Prevention |
|------------|-----------|------------|
| **Double Deposit** | Check idempotency key, transaction ref uniqueness | Idempotency guarantee before wallet credit |
| **Odds Arbitrage** | Monitor bet patterns, limit stakes on correlated markets | Position limits, market suspension rules |
| **Syndicate Betting** | Pattern analysis on IP, device, payment method | Flag accounts sharing same IP/device |
| **Bonus Abuse** | Track bonus redemption patterns | Stake-through requirements, max bonus limits |
| **Chargeback Fraud** | Mobile money has no chargebacks (unlike cards) | N/A — mobile money is irreversible |
| **Account Takeover** | 2FA for withdrawals, device fingerprinting | OTP verification for sensitive actions |
| **Self-exclusion bypass** | Identity verification at registration | KYC cross-check against exclusion list |

### 5.5 Regulatory Compliance (Zimbabwe)

| Regulation | Requirement | Implementation |
|------------|-------------|---------------|
| **Lotteries and Gambling Act [Chapter 10:26]** | License from Zimbabwe Lotteries and Gambling Board | Obtain operating license before launch |
| **Bank Use Promotion Act** | Compliance with financial services regulations | Partner with registered financial institution |
| **Data Protection Act** | User data privacy, consent, breach notification | Privacy policy, data encryption, breach response plan |
| **AML/CFT** | Anti-money laundering checks, transaction monitoring | KYC levels, transaction limits, suspicious activity reporting |
| **Responsible Gambling** | Self-exclusion, deposit limits, age verification | Self-exclusion tool, daily deposit limits, age 18+ verification |
| **Taxation** | 10% withholding tax on winnings (if applicable) | Automated tax calculation and reporting |

### 5.6 Data Privacy & Protection

- **Encryption at rest:** All PII encrypted using AES-256
- **Encryption in transit:** TLS 1.3 for all external and internal communications
- **Data minimization:** Only collect data necessary for operations
- **Retention policy:** Transaction data: 7 years (regulatory), User data: until account closure + 90 days
- **Access control:** Role-based access (RBAC) for admin panel
- **Breach response:** 72-hour notification to users and regulators per Data Protection Act

---

## 6. Deployment & Infrastructure

### 6.1 Hosting Strategy

| Environment | Infrastructure | Purpose |
|-------------|---------------|---------|
| **Development** | Docker Compose on single VM | Local development, feature testing |
| **Staging** | Lightweight cloud VM (2-4 vCPU, 8GB RAM) | Integration testing, QA, UAT |
| **Production (MVP)** | 2-3 cloud VMs behind load balancer | Live platform serving initial users |
| **Production (Scale)** | Kubernetes cluster | Auto-scaling, high availability |

**Recommended Cloud Providers (for Zimbabwe traffic):**
- **Primary:** AWS Africa (Cape Town) or AWS Europe (Frankfurt — better peering)
- **CDN:** Cloudflare (global edge, DDoS protection)
- **Alternative:** Hetzner (South Africa) — cost-effective with good African latency

### 6.2 CI/CD Pipeline

```
Git Push → GitHub/GitLab → CI Runner → Build → Test → Lint → Security Scan
                               ↓
                    Deploy to Staging → E2E Tests
                               ↓
              Manual Approval for Production
                               ↓
                      Deploy to Production
                               ↓
                     Smoke Tests / Monitoring
```

**Tooling:** GitHub Actions or GitLab CI
**Container Registry:** Docker Hub or GitHub Container Registry
**Deployment Strategy:** Blue-green deployment (zero downtime)

### 6.3 Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking and performance monitoring |
| **Prometheus + Grafana** | Metrics collection, dashboards, alerts |
| **Loki** | Log aggregation |
| **Uptime Robot / Better Uptime** | External uptime monitoring |
| **Custom Alerts** | Slack/Telegram alerts for payment failures, high error rates, fraud detection |

**Key Metrics to Monitor:**
- Payment success rate (target: >95% EcoCash, >90% OneMoney)
- Webhook processing latency (target: <2s from receipt to wallet credit)
- Odds update latency (target: <15s from provider to user display)
- Bet placement success rate (target: >99.5%)
- API response times (target: p95 <500ms)
- User registration conversion (target: >60% from signup to first deposit)

### 6.4 Disaster Recovery & Business Continuity

| Scenario | RTO | RPO | Strategy |
|----------|-----|-----|----------|
| **Single instance failure** | <5 min | N/A | Auto-restart via Docker/systemd |
| **Database failure** | <30 min | <5 min | PostgreSQL streaming replica |
| **Region/AZ failure** | <4 hours | <1 hour | Cross-region backup + restore |
| **Payment provider outage** | N/A | N/A | Graceful degradation — suspend deposits, show status message |
| **Odds provider outage** | N/A | N/A | Fallback to pre-fetched odds, display "delayed" notice |

### 6.5 Cost Optimization

| Area | Strategy | Estimated Monthly Cost (MVP) |
|------|----------|------------------------------|
| **Compute** | 2x small VMs (2-4 vCPU, 8GB RAM) | $50-100 |
| **Database** | Managed PostgreSQL (2GB RAM tier) | $15-30 |
| **Cache** | Redis (256MB - 1GB) | $10-15 |
| **CDN** | Cloudflare Free/Pro tier | $0-20 |
| **Odds API** | The Odds API Free/Starter | $0-99 |
| **SMS (OTP)** | Twilio or Africa's Talking | $20-50 |
| **Sentry** | Free tier (5k events) | $0 |
| **Monitoring** | Self-hosted Prometheus + Grafana | $0 (on same VMs) |
| **Total** | | **$95-314/month** |

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 1 | Project setup, architecture finalization | Repository, CI/CD, Docker setup, architecture doc finalized |
| 2 | User authentication system | Registration (phone + OTP), login, JWT auth, session management |
| 3 | Database schema + core ORM models | All tables created, migrations setup, connection pooling |
| 4 | Admin dashboard (MVP) | Sport/league/event management, user management, basic reporting |

### Phase 2: Betting Engine (Weeks 5-8)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 5 | Sports odds ingestion | Odds provider integration, data normalization, Redis caching |
| 6 | Bet placement engine | Single bets, accumulator bets, bet slip management |
| 7 | Real-time odds UI | SSE integration, live odds updates, mobile-optimized bet slip |
| 8 | Bet settlement engine | Auto-settlement, manual override, payout processing |

### Phase 3: Payments (Weeks 9-12)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 9 | EcoCash integration | Merchant onboarding, sandbox testing, C2B deposit flow |
| 10 | EcoCash production go-live | Production credentials, webhook handling, wallet integration |
| 11 | OneMoney integration | Merchant onboarding, C2B deposit + B2C withdrawal |
| 12 | Payment reconciliation | Automated reconciliation, reporting, error handling |

### Phase 4: Polish & Launch (Weeks 13-16)

| Week | Milestone | Deliverables |
|------|-----------|-------------|
| 13 | Withdrawal system | User-initiated withdrawals, KYC verification, AML checks |
| 14 | Security audit + penetration testing | Third-party security review, vulnerability fixes |
| 15 | Beta testing (invite-only) | User feedback, bug fixes, performance tuning |
| 16 | Public launch | Marketing, support setup, monitoring, go-live |

### Phase 5: Post-Launch (Months 5-8)

| Milestone | Description |
|-----------|-------------|
| **Promotions & Bonuses** | Welcome bonus, free bets, accumulator boosts |
| **Cash Out Feature** | Real-time cash out valuation and execution |
| **Live Betting** | In-play odds, live scores, fast market suspension |
| **Mobile App** | Native Android/iOS apps (or PWA with push notifications) |
| **USSD Betting** | USSD interface for feature phones (low-end devices) |
| **Agent Network** | Physical agent network for cash-in/cash-out |

---

## Appendix A: Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith over Microservices

**Status:** Accepted

**Context:** MVP needs rapid delivery with 1-2 developers. Microservices overhead (service discovery, distributed tracing, multiple deploys) would slow development.

**Decision:** Start with modular monolith with well-defined service boundaries. Extract to microservices when the team grows or specific services need independent scaling.

**Consequences:**
- +: Faster development, simpler deployment
- +: Single database for atomic transactions
- -: Need to enforce module boundaries through code reviews
- -: Vertical scaling only until extraction

### ADR-002: PostgreSQL over NoSQL

**Status:** Accepted

**Context:** Financial application requiring ACID compliance. Complex relational queries (bet slips with join across sports, markets, odds).

**Decision:** PostgreSQL as primary database. JSONB for flexible metadata.

**Consequences:**
- +: ACID compliance for financial transactions
- +: Rich query capabilities for reporting
- -: Schema migrations required for structural changes

### ADR-003: React + Vite over Next.js

**Status:** Accepted

**Context:** Sandbox has limited memory (4GB). Next.js is memory-heavy. Simple SPA is sufficient for MVP.

**Decision:** React + Vite for frontend. Static hosting on CDN. API requests to separate backend.

**Consequences:**
- +: Lower memory usage
- +: Faster builds, simpler deployment
- -: No SSR (acceptable for sports betting SPA)
- -: Separate SEO strategy needed

---

## Appendix B: Key Third-Party Services

| Service | Purpose | Cost (MVP) | Notes |
|---------|---------|------------|-------|
| **The Odds API** | Sports odds data | $0-99/mo | Free tier: 500 requests/day |
| **Twilio / Africa's Talking** | SMS OTP delivery | $20-50/mo | Africa's Talking has better African coverage |
| **Cloudflare** | CDN, DDoS protection, SSL | $0-20/mo | Free plan sufficient for MVP |
| **Sentry** | Error monitoring | $0/mo | 5k events/month free |
| **GitHub / GitLab** | Source control, CI/CD | $0/mo | Free tier for small teams |
| **Docker Hub / GHCR** | Container registry | $0/mo | Free tier sufficient |

---

## Appendix C: Zimbabwe-Specific Considerations

### Mobile Network Coverage
- Econet: ~80% market share, best rural coverage
- NetOne: ~15% market share, government-owned
- Telecel: ~5% market share (not targeted for MVP)

### Currency
- Platform should support dual currency (ZWL + USD)
- EcoCash supports both wallets
- Consider mobile money settlement in USD for larger bets

### Data Costs in Zimbabwe
- 1GB mobile data: ~$5-10 USD
- Optimize for minimal data usage (compressed assets, lazy loading)
- PWA for offline access to bet slip
- Text-based UI over rich graphics where possible

### Regulatory Environment
- Zimbabwe Lotteries and Gambling Board issues licenses
- Online gambling is legal but regulated
- Tax on winnings may apply
- Need a local registered entity (cannot operate as foreign company)