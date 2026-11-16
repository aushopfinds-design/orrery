-- Retain report inputs and generated deliverables for five years, then redact them.
-- Payment facts remain available for tax, accounting, refunds, and disputes.
ALTER TABLE fate_payment_orders ADD COLUMN IF NOT EXISTS personal_data_deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS fate_payment_orders_personal_data_retention
  ON fate_payment_orders (COALESCE(paid_at, created_at))
  WHERE personal_data_deleted_at IS NULL;
INSERT INTO fate_payment_settings(key,value_encrypted)
  VALUES ('personal-data-retention-version','1') ON CONFLICT DO NOTHING;
