-- Encrypted, immutable Sandbox report snapshots; never publicly addressable files.
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
