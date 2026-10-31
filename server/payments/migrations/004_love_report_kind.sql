ALTER TABLE fate_payment_orders DROP CONSTRAINT fate_payment_orders_kind_check;
ALTER TABLE fate_payment_orders ADD CONSTRAINT fate_payment_orders_kind_check
  CHECK (kind IN ('complete','year','compatibility','career','love','business','wellbeing','bundle'));
