-- Private administrator quality notes, separate from order and customer records.
CREATE TABLE IF NOT EXISTS fate_quality_reviews (
  pdf_id text NOT NULL,
  product_id text NOT NULL,
  profile_id text NOT NULL,
  question_id text NOT NULL,
  score integer CHECK (score IS NULL OR (score BETWEEN 0 AND 100)),
  deduction_sentence text NOT NULL DEFAULT '',
  deduction_reason text NOT NULL DEFAULT '',
  revision_note text NOT NULL DEFAULT '',
  revised_answer text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'VERIFY' CHECK (status IN ('PASS', 'FIX', 'VERIFY')),
  reviewer text NOT NULL DEFAULT '',
  evaluated_at timestamptz,
  github_sha text NOT NULL DEFAULT '',
  pdf_version text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pdf_id, question_id)
);
