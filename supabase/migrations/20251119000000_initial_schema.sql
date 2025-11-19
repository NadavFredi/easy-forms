-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields table
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'text', 'number', 'email', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'file', 'date', 'time', 'datetime', 'header', 'paragraph', 'link'
  label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB, -- For select, multiselect, radio options
  validation JSONB, -- For min, max, pattern, etc.
  order_index INTEGER NOT NULL,
  width TEXT DEFAULT 'full', -- 'full', 'half', 'third', 'quarter'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Store all submission data
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  secret TEXT, -- Optional webhook secret
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_webhooks_form_id ON webhooks(form_id);

-- Enable Row Level Security
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Users can view their own forms" ON forms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms" ON forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" ON forms
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for form_fields
CREATE POLICY "Users can view fields of their forms" ON form_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create fields for their forms" ON form_fields
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fields of their forms" ON form_fields
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fields of their forms" ON form_fields
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for submissions
-- Form owners can view submissions
CREATE POLICY "Users can view submissions of their forms" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = submissions.form_id AND forms.user_id = auth.uid()
    )
  );

-- Anyone can submit to published forms (no auth required for submissions)
CREATE POLICY "Anyone can submit to published forms" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = submissions.form_id AND forms.is_published = true
    )
  );

-- RLS Policies for webhooks
CREATE POLICY "Users can manage webhooks for their forms" ON webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = webhooks.form_id AND forms.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

