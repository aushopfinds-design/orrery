-- Sandbox only: real-money orders are explicitly rejected by the schema and application.
CREATE TABLE IF NOT EXISTS fate_payment_orders (
  id uuid PRIMARY KEY,
  request_key_hash text NOT NULL UNIQUE,
  input_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('complete','compatibility','year','career','business','wellbeing','bundle')),
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency = 'usd'),
  livemode boolean NOT NULL DEFAULT false CHECK (livemode = false),
  input_encrypted text NOT NULL,
  checkout_session_id text UNIQUE,
  payment_intent_id text UNIQUE,
  payment_state text NOT NULL DEFAULT 'pending' CHECK (payment_state IN ('pending','paid','failed','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  CHECK ((payment_state = 'paid') = (paid_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS fate_payment_events (
  event_id text PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES fate_payment_orders(id),
  session_id text NOT NULL,
  event_type text NOT NULL,
  outcome text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fate_fulfillment_jobs (
  order_id uuid PRIMARY KEY REFERENCES fate_payment_orders(id),
  state text NOT NULL DEFAULT 'queued' CHECK (state IN ('queued','processing','complete')),
  attempts integer NOT NULL DEFAULT 0,
  lease_id uuid,
  lease_until timestamptz,
  artifact_manifest jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CHECK ((state = 'complete') = (completed_at IS NOT NULL)),
  CHECK (state <> 'complete' OR artifact_manifest IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS fate_fulfillment_pending ON fate_fulfillment_jobs(state, lease_until);
CREATE INDEX IF NOT EXISTS fate_payment_events_order ON fate_payment_events(order_id);
REVOKE ALL ON fate_payment_orders, fate_payment_events, fate_fulfillment_jobs FROM PUBLIC;
