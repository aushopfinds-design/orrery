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
