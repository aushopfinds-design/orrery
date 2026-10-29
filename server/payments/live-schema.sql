-- Run only in a new dedicated LIVE database. Never apply to the Sandbox database.
CREATE TABLE IF NOT EXISTS fate_payment_orders (
  id uuid PRIMARY KEY,
  request_key_hash text NOT NULL UNIQUE,
  input_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('complete','year','compatibility','career','love','business','wellbeing','bundle')),
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency = 'usd'),
  livemode boolean NOT NULL DEFAULT true CHECK (livemode = true),
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

-- Encrypted, immutable purchase report snapshots; never publicly addressable files.
CREATE TABLE IF NOT EXISTS fate_order_artifacts (
  order_id uuid PRIMARY KEY REFERENCES fate_payment_orders(id),
  payload_encrypted text NOT NULL,
  content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON fate_order_artifacts FROM PUBLIC;
CREATE TABLE IF NOT EXISTS fate_payment_settings (
  key text PRIMARY KEY,
  value_encrypted text NOT NULL
);
REVOKE ALL ON fate_payment_settings FROM PUBLIC;

CREATE TABLE IF NOT EXISTS fate_checkout_quota (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON fate_checkout_quota FROM PUBLIC;
INSERT INTO fate_payment_settings(key,value_encrypted) VALUES ('live-schema-version','1') ON CONFLICT DO NOTHING;
-- Operational cleanup: DELETE FROM fate_checkout_quota WHERE created_at < now() - interval '2 days';

-- Contact records are separate from encrypted birth-chart inputs.
CREATE TABLE IF NOT EXISTS fate_customer_contacts (
  id text PRIMARY KEY CHECK (length(id)=64),
  email_encrypted text NOT NULL,
  marketing_status text NOT NULL DEFAULT 'not_requested' CHECK (marketing_status IN ('not_requested','pending','subscribed','unsubscribed')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (marketing_status <> 'subscribed' OR verified_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS fate_customer_purchases (
  order_id uuid PRIMARY KEY REFERENCES fate_payment_orders(id),
  contact_id text NOT NULL REFERENCES fate_customer_contacts(id),
  consent_requested boolean NOT NULL,
  consent_version text NOT NULL,
  consent_text text NOT NULL,
  consent_captured_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fate_customer_purchases_contact ON fate_customer_purchases(contact_id);
CREATE TABLE IF NOT EXISTS fate_customer_consent_events (
  contact_id text NOT NULL REFERENCES fate_customer_contacts(id),
  event text NOT NULL CHECK (event IN ('confirmed','unsubscribed')),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON fate_customer_contacts, fate_customer_purchases, fate_customer_consent_events FROM PUBLIC;

INSERT INTO fate_payment_settings(key,value_encrypted) VALUES ('customer-records-schema-version','1') ON CONFLICT DO NOTHING;
