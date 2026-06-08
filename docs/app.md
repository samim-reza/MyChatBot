# AutoKitchen

AutoKitchen is a multi-tenant SaaS platform for restaurant AI phone receptionists. Restaurants buy the service, get their own Twilio number and restaurant login, then manage their dashboard, kitchen flow, CRM, menu, promotions, AI behavior, integrations, and reporting from their own portal. Platform admins manage every restaurant from a central admin panel.

The repo includes a FastAPI backend, PostgreSQL data model, Redis cache/pub-sub/queues, Chroma-backed RAG, Twilio Media Streams, OpenAI Realtime voice handling, and a Next.js frontend.

## What Is Included

- Multi-restaurant tenant model with admin and restaurant logins.
- AI phone agent over Twilio Voice and Twilio Media Streams.
- OpenAI Realtime bridge with streaming audio, interruption handling, transcripts, and tool calling.
- Tenant-specific AI greetings, behavior, business rules, transfer settings, model settings, menus, and promotions.
- Deterministic order validation: restaurant ownership, availability, fulfillment rules, delivery requirements, and quantity limits.
- Prompt-injection filtering for caller transcripts and tool arguments.
- Redis for menu caching, WebSocket pub/sub fanout, and queue primitives.
- POS abstraction layer for Toast, Square, and Clover with retry, circuit breaker, and fallback behavior.
- Stripe payment-link workflow with mock fallback, plus Twilio SMS delivery.
- Configurable upsell rules and recommendation workflow.
- Operational metrics, AI performance logs, model usage logs, scenario evaluations, and benchmark runs.
- Transfer workflow for low-confidence or failed conversations.
- SaaS onboarding, subscriptions, usage events, invoices, deployment records, rollback plans, and multi-location reporting.
- API key authentication for external integrations.

## Architecture

```text
Caller
  -> Twilio number assigned to a restaurant
  -> POST /twilio/voice
  -> TwiML Connect Stream
  -> WS /twilio/media
  -> FastAPI Realtime bridge
  -> OpenAI Realtime API
  -> Tool layer: menu, CRM, orders, payment, RAG, transfer, recommendations
  -> PostgreSQL + Redis + ChromaDB
  -> Redis pub/sub + FastAPI WebSockets
  -> Restaurant dashboard, kitchen, CRM, menu, logs
```

## Main Roles

- Platform admin: logs in at `/admin`, manages all restaurants, numbers, credentials, orders, reports, billing, onboarding, integrations, API keys, and deployment records.
- Restaurant user: logs in at `/login`, sees only that restaurant’s data and manages operations.
- External API client: uses `X-API-Key` against `/api/external/*` endpoints with scoped permissions.

Seeded credentials:

```text
Admin: admin / admin@1234
```

Restaurant logins are tenant records, not global defaults. Create one from the admin panel or with `backend/scripts/bootstrap_restaurant.py`.

## Runtime Workflow

1. Admin creates a restaurant service and assigns a Twilio number, username, and password.
2. Customer calls that restaurant’s Twilio number.
3. `/twilio/voice` maps the Twilio `To` number to the restaurant.
4. The Realtime bridge loads that restaurant’s greeting, AI behavior, business rules, promotions, and transfer settings.
5. AI validates menu items and totals through backend tools.
6. AI may recommend configured upsells.
7. Low-confidence or failed conversations create a transfer request.
8. Confirmed orders are stored, pushed to POS integrations when configured, given a payment link, and broadcast live.
9. Restaurant dashboards update through WebSockets and Redis pub/sub.

## AI Tools

The Realtime agent can call:

- `get_menu`
- `search_menu_item`
- `add_to_order`
- `remove_from_order`
- `update_modifier`
- `add_order_note`
- `set_order_details`
- `calculate_total`
- `check_availability`
- `get_customer_history`
- `save_customer`
- `create_order`
- `send_payment_link`
- `get_recommendations`
- `request_transfer`
- `get_restaurant_info`
- `answer_restaurant_question`

## Data Stores

- PostgreSQL: tenants, restaurants, menus, customers, orders, transcripts, integrations, billing, onboarding, deployments, reports, usage, evaluations, and logs.
- Redis: menu cache, model cache, WebSocket pub/sub, order/sync queues.
- ChromaDB: embedded knowledge documents for restaurant RAG.

## Environment

Important `.env` values:

```bash
API_BASE_URL=https://your-ngrok-domain.ngrok-free.app
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=
NEXT_BACKEND_URL=http://localhost:8000

DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/autokitchen
DATABASE_SSL=false
DATABASE_POOLER=false
REDIS_URL=redis://localhost:6379/0
CHROMA_PATH=.chroma

OPENAI_API_KEY=sk-your-key
OPENAI_REALTIME_MODEL=gpt-realtime-2
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_VOICE=marin,cedar
OPENAI_NOISE_REDUCTION=far_field
OPENAI_VAD_TYPE=server_vad
OPENAI_VAD_THRESHOLD=0.78
OPENAI_VAD_PREFIX_PADDING_MS=300
OPENAI_VAD_SILENCE_DURATION_MS=550
OPENAI_VAD_IDLE_TIMEOUT_MS=
OPENAI_SEMANTIC_VAD_EAGERNESS=auto
OPENAI_SPEECH_START_MIN_RMS=450
OPENAI_BARGE_IN_MIN_RMS=750

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
ENFORCE_WEBHOOK_SIGNATURES=false

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=https://pay.autokitchen.demo/success
STRIPE_CANCEL_URL=https://pay.autokitchen.demo/cancel

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@1234
ADMIN_TOKEN_SECRET=change-me-in-production
API_KEY_SALT=change-me-api-key-salt
ENCRYPTION_SECRET=change-me-encryption-secret

# Human transfer number is managed per restaurant in transfer_settings from the restaurant portal.
MODEL_DEFAULT=gpt-4o-mini
MODEL_COMPLEX=gpt-4o
MODEL_CACHE_TTL_SECONDS=300
```

`OPENAI_VOICE` can be a single voice such as `cedar`, or a comma-separated list such as `marin,cedar`. When multiple voices are provided, the backend chooses one randomly for each call. `dynamic`, `random`, or `auto` also choose randomly from `marin` and `cedar`.

For Docker Compose, the backend uses internal hostnames:

```bash
BACKEND_DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/autokitchen
REDIS_URL=redis://redis:6379/0
```

## Supabase Postgres

AutoKitchen can use Supabase Postgres as the primary relational database. PostgreSQL remains the source of truth; Supabase simply hosts it.

Use one of the Supabase connection strings from your Supabase project settings.

Direct connection:

```bash
DATABASE_URL=supabase
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_DB_PASSWORD=<database-password>
DATABASE_SSL=true
DATABASE_SSL_VERIFY=false
DATABASE_POOLER=false
```

Transaction pooler connection:

```bash
DATABASE_URL=supabase
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_DB_PASSWORD=<database-password>
SUPABASE_POOLER_HOST=aws-0-<region>.pooler.supabase.com
DATABASE_SSL=true
DATABASE_SSL_VERIFY=false
DATABASE_POOLER=true
```

If you run the app through Docker Compose and want the backend container to use Supabase, set:

```bash
BACKEND_DATABASE_URL=supabase
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_DB_PASSWORD=<database-password>
SUPABASE_POOLER_HOST=aws-0-<region>.pooler.supabase.com
DATABASE_SSL=true
DATABASE_SSL_VERIFY=false
DATABASE_POOLER=true
```

Notes:

- You can use `DATABASE_URL=supabase` to keep the database password separate from the connection URL.
- You can still paste either `postgresql://...` or `postgresql+asyncpg://...`; the backend normalizes it for SQLAlchemy asyncpg.
- If you paste a full URL manually and your password contains special characters, URL-encode it.
- `DATABASE_SSL=true` is recommended for Supabase.
- `DATABASE_SSL_VERIFY=false` behaves like Postgres `sslmode=require`; set it to `true` only when your local CA chain verifies the Supabase certificate successfully.
- `DATABASE_POOLER=true` disables asyncpg statement caching and uses `NullPool`, which is safer with Supabase’s transaction pooler.
- Keep Redis separate; Supabase is for PostgreSQL, while Redis is still used for caching, pub/sub, and queues.

Supabase API keys can also live in `.env`:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret-key>
```

Only expose the publishable key to browser code. Keep the secret key server-side.

## Quick Start With Docker

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- Restaurant login: `http://localhost:3000/login`
- Backend health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

Services:

- `postgres`
- `redis`
- `backend`
- `frontend`

The backend creates tables on startup.

Demo seeding is disabled by default for real tenant testing:

```bash
AUTO_SEED_DEMO_DATA=false
SYNC_RAG_ON_STARTUP=false
```

Set `AUTO_SEED_DEMO_DATA=true` only when you want the old Tony's Pizza sample data.

## Local Development

Backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
WATCHFILES_FORCE_POLLING=true uvicorn app.main:app --reload --reload-dir app
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Database Utility Scripts

Run these from the `backend` directory. They use the active `.env` database settings, including Supabase.

```bash
python scripts/reset_database.py --yes
python scripts/bootstrap_restaurant.py
python scripts/inspect_database.py
python scripts/seed_menu_items.py
```

- `reset_database.py --yes`: drops and recreates AutoKitchen app tables.
- `bootstrap_restaurant.py`: creates a clean restaurant tenant with login credentials and no dummy orders/customers/menu.
- `inspect_database.py`: prints table row counts and restaurant login identifiers.
- `seed_menu_items.py`: adds a starter menu to a target restaurant.

Redis locally:

```bash
redis-server
```

Postgres must also be running locally unless you use Docker Compose.

## Frontend Pages

- `/`: public homepage.
- `/admin`: platform admin panel for restaurants, orders, data, integrations, billing, reporting, benchmarks, API keys, and deployments.
- `/login`: restaurant login.
- `/dashboard`: restaurant operations dashboard.
- `/kitchen`: live kitchen orders and order status updates.
- `/crm`: restaurant-scoped customer profiles, order history, preferences, and conversations.
- `/menu`: menu availability, AI greeting, promotions, and version info.
- `/logs`: caller list, per-caller transcripts, tool calls, and RAG inspection.

## Admin Capabilities

Admin APIs are under `/api/admin`.

Highlights:

- Restaurant CRUD and credentials.
- Restaurant configuration, AI behavior, transfer settings, business rules.
- Orders with restaurant/date/status filters.
- Customers, menu, transcripts, tool calls.
- POS integrations and sync.
- Upsell rules and recommendations.
- Metrics, AI performance summary, model usage.
- Scenario evaluations and benchmarks.
- Transfers and provider health.
- API keys.
- Onboarding workflows.
- Subscriptions, usage, invoices.
- Deployment records and rollback plans.
- Multi-location groups and group reports.

## Restaurant Capabilities

Restaurant APIs are under `/api/restaurant` and require restaurant login.

Highlights:

- Own analytics, orders, kitchen updates, customers, menu, logs.
- Own config, greeting, promotions, AI behavior, business rules.
- Own POS integrations, upsell rules, recommendations.
- Own metrics, evaluations, transfers, provider health, model usage.
- Own onboarding, subscription, usage, invoices, and API keys.

## External API

API-key endpoints are under `/api/external`.

Current endpoints:

- `GET /api/external/orders`
- `POST /api/external/orders`

Send:

```text
X-API-Key: ak_...
```

Scopes are checked, for example:

- `orders:read`
- `orders:write`
- `*`

## Twilio Setup

Expose the backend with HTTPS:

```bash
ngrok http 8000
```

Set:

```bash
API_BASE_URL=https://your-ngrok-domain.ngrok-free.app
```

Configure each restaurant’s Twilio number:

```text
POST https://your-ngrok-domain.ngrok-free.app/twilio/voice
```

The voice webhook is enough for calling. Outbound order-confirmation SMS does not need a separate Twilio webhook because the backend sends it directly with the Twilio REST API. Only configure a Messaging webhook if you want to receive inbound customer texts or handle SMS replies.

Optional secure webhook validation:

```bash
ENFORCE_WEBHOOK_SIGNATURES=true
```

Transfer endpoint:

```text
POST /twilio/transfer
```

## Payments

`create_order` creates a payment URL.

- If the caller chooses cash on delivery, the order is saved with `payment_status=pending` and no payment link is sent.
- If the caller chooses card/online/payment link, the backend creates a single-use Stripe payment link when `STRIPE_SECRET_KEY` is set.
- `STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are safe browser-facing keys for Stripe UI flows.
- Set Stripe webhook endpoint to `POST https://your-domain.com/api/payments/stripe/webhook` and save the endpoint secret in `STRIPE_WEBHOOK_SECRET`.
- Stripe `checkout.session.completed` / `payment_intent.succeeded` events mark the matching order as `paid` using `order_id` metadata or `client_reference_id`.
- If Stripe is not configured, it falls back to the configured mock payment base URL.
- `send_payment_link` sends SMS through Twilio when credentials are present, otherwise returns a mock SMS result.
- After a successful order, the backend also attempts to send an order-confirmation SMS and logs `order_confirmation_sms_result` or `order_confirmation_sms_failed`.

## POS Integrations

The app includes provider abstractions for:

- Toast
- Square
- Clover

Provider calls go through retry and circuit-breaker logic. If a provider is down, the app records fallback results instead of breaking order creation.

POS credentials are not global `.env` values. Restaurants link Toast, Square, or Clover from their own portal under Menu Management. Access tokens are saved in the restaurant integration config and encrypted before being stored in PostgreSQL. If no token is provided, the integration stays in mock mode for local testing.

## Security Secrets

These values must be random and private:

- `ADMIN_TOKEN_SECRET`: signs admin and restaurant login tokens.
- `API_KEY_SALT`: hashes external API keys before storing them.
- `ENCRYPTION_SECRET`: encrypts sensitive integration config values such as POS access tokens.
- `ENFORCE_WEBHOOK_SIGNATURES`: when `true`, Twilio webhooks must include a valid `X-Twilio-Signature`.

For local development, `ENFORCE_WEBHOOK_SIGNATURES=false` is easier. In production, set it to `true` after `API_BASE_URL` and the Twilio webhook URL are stable.

## Redis

Redis is used for:

- Menu cache by restaurant/category.
- Model response cache.
- WebSocket pub/sub fanout for multi-worker deployments.
- Queue primitives:
  - `queue:orders`
  - `queue:sync`

## Security

Implemented:

- Admin token authentication.
- Restaurant token authentication.
- API key authentication and scopes.
- Prompt-injection detection and sanitization.
- Tenant isolation checks in menu, order, availability, totals, and dashboard APIs.
- Optional Twilio webhook signature validation.
- App-level encrypt/decrypt helpers for sensitive values.

For production, replace all default secrets.

## Operational Reporting

Available reports include:

- Operations summary: orders, open orders, completed orders, transfers, revenue.
- Business intelligence report: average ticket and daily revenue/order rollups.
- Provider health and circuit-breaker state.
- AI performance logs and latency.
- Model usage logs and cache status.
- Scenario evaluation results.
- Multi-location group report across restaurant locations.

## Deployment And Rollback

Deployment records support:

- `staging`
- `production`
- version
- status
- rollback version
- automation metadata
- notes

Rollback plan endpoint:

```text
GET /api/admin/deployments/{environment}/rollback-plan
```

The rollback plan includes a verification checklist and optional automation command metadata.

## Demo Order

```bash
curl -X POST http://localhost:8000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "restaurant_id": "autokitchen-restaurant",
    "customer_name": "Sarah Miller",
    "phone_number": "+15551230001",
    "fulfillment_type": "delivery",
    "delivery_address": "42 Oak Street, Springfield",
    "items": [
      {"menu_item_id": "ak_pepperoni_pizza", "quantity": 1, "modifiers": {"size": "large", "extra_cheese": true}},
      {"menu_item_id": "ak_iced_tea", "quantity": 1, "modifiers": {"size": "medium", "sugar_level": "less sugar"}}
    ]
  }'
```

The order appears live in the restaurant dashboard and kitchen view.

## Troubleshooting

**Admin endpoints return 401**

- Clear browser local storage or log out and back in.
- Admin tokens changed during development, so stale tokens may fail.

**Restaurant pages redirect to login**

- Log in at `/login`.
- Restaurant credentials are whatever you created for that tenant through admin or `bootstrap_restaurant.py`.

**Call is answered but silent**

- Confirm `OPENAI_REALTIME_MODEL` is available to your OpenAI project.
- Confirm the API key has billing/quota for Realtime.
- Restart FastAPI after changing `.env`; settings are cached in-process.
- Watch backend logs for `openai_realtime_error` and `realtime_call_bridge_error`.

**Noisy street calls feel stuck**

- Keep `OPENAI_NOISE_REDUCTION=far_field` for restaurant phone calls with room noise, kitchen noise, or speakerphone audio.
- For normal restaurant calls, start with `OPENAI_VAD_THRESHOLD=0.78`, `OPENAI_VAD_PREFIX_PADDING_MS=300`, and `OPENAI_VAD_SILENCE_DURATION_MS=550` so short answers like "yes" or "medium" do not feel ignored.
- Increase `OPENAI_VAD_THRESHOLD` slightly, for example `0.86`, if background noise keeps triggering false speech.
- Increase `OPENAI_VAD_SILENCE_DURATION_MS`, for example `1000`, if callers pause naturally and get cut off.
- Increase `OPENAI_SPEECH_START_MIN_RMS` if background voices keep resetting the call while the assistant is waiting.
- Increase `OPENAI_BARGE_IN_MIN_RMS` if background noise keeps interrupting the assistant while it is speaking.
- Try `OPENAI_VAD_TYPE=semantic_vad` with `OPENAI_SEMANTIC_VAD_EAGERNESS=low` if the AI interrupts while the caller is still finishing a phrase.
- Decrease them slightly only if the AI becomes too slow to notice real speech.

**Caller says something unusual and the call feels brittle**

- The bridge now avoids treating accented or non-Latin short speech as automatically unclear.
- Menu lookups, recent-order checks, and order placement now play a short typing/search cue while tools run.
- Realtime bridge failures now redirect the live Twilio call to the fallback route instead of dropping cold when credentials are available.

**Twilio drops after a few seconds**

- Confirm ngrok is running and `API_BASE_URL` matches the current ngrok domain.
- Confirm Twilio voice webhook is `POST https://<ngrok>/twilio/voice`.
- Confirm `curl https://<ngrok>/health` returns OK.

**AI answers but cannot place orders**

- Confirm the called Twilio number is assigned to an active restaurant in the database.
- Confirm that restaurant has menu items.
- Watch backend logs for `business_rule_violation`, `twilio_call_context_resolved`, and `order_confirmation_sms_result`.
- If you recently reset the database, recreate the restaurant and seed menu items before testing calls again.

**SMS confirmation does not arrive**

- Confirm the Twilio number is SMS-capable.
- Confirm `TWILIO_FROM_NUMBER` matches that number.
- For Twilio trial accounts, verify the destination number first.
- For US local Twilio numbers sending to US recipients, complete A2P 10DLC registration for production delivery.

**Redis errors**

- Confirm Redis is running.
- Confirm `REDIS_URL`.
- `/health` includes Redis status.

**Postgres password authentication failed**

Update:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:your-password@localhost:5432/autokitchen
```

**Frontend says Backend API offline**

- Confirm FastAPI is running on `http://localhost:8000`.
- For ngrok/device testing, keep `NEXT_PUBLIC_API_URL=` empty so the browser calls the frontend origin and Next proxies `/api/*`.
- Confirm `NEXT_BACKEND_URL=http://localhost:8000` when running frontend and backend on the same machine.
- Restart `npm run dev` after changing frontend environment variables.
