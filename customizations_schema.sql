-- ==========================================
-- QCONNECT CUSTOMIZATION SYSTEM SCHEMA V2
-- ==========================================

-- 1. Create ENUMs for strict validation
DO $$ BEGIN
    CREATE TYPE selection_type_enum AS ENUM ('radio', 'checkbox', 'dropdown', 'quantity', 'toggle', 'text');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE price_type_enum AS ENUM ('free', 'fixed', 'percentage');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- TEMPLATE TABLES (Reusable Library)
-- ==========================================

CREATE TABLE IF NOT EXISTS customization_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Pizza Template"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES customization_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    selection_type selection_type_enum NOT NULL,
    is_required BOOLEAN DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS template_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES template_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_type price_type_enum DEFAULT 'fixed',
    price_value DECIMAL(10, 2) DEFAULT 0.00,
    max_quantity INTEGER DEFAULT 1,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    -- For Nested Customizations
    child_template_group_id UUID REFERENCES template_groups(id) ON DELETE SET NULL 
);

-- ==========================================
-- ITEM OVERRIDE TABLES (Attached to specific items)
-- ==========================================

CREATE TABLE IF NOT EXISTS item_customization_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    selection_type selection_type_enum NOT NULL,
    is_required BOOLEAN DEFAULT false,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS item_customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES item_customization_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_type price_type_enum DEFAULT 'fixed',
    price_value DECIMAL(10, 2) DEFAULT 0.00,
    max_quantity INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    -- For Nested Customizations
    child_item_group_id UUID REFERENCES item_customization_groups(id) ON DELETE SET NULL 
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE customization_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_customization_options ENABLE ROW LEVEL SECURITY;

-- 1. Customization Templates: Owners manage, nobody else reads (only used in dashboard)
CREATE POLICY "Owners can manage templates" ON customization_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM shops WHERE id = customization_templates.shop_id AND user_id = auth.uid())
);

CREATE POLICY "Owners can manage template_groups" ON template_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM customization_templates t 
    JOIN shops s ON t.shop_id = s.id 
    WHERE t.id = template_groups.template_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can manage template_options" ON template_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM template_groups g
    JOIN customization_templates t ON g.template_id = t.id
    JOIN shops s ON t.shop_id = s.id
    WHERE g.id = template_options.group_id AND s.user_id = auth.uid()
  )
);

-- 2. Item Customizations: Public can read, Owners can manage
CREATE POLICY "Public can view item_customization_groups" ON item_customization_groups FOR SELECT USING (true);

CREATE POLICY "Owners can manage item_customization_groups" ON item_customization_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM items i
    JOIN categories c ON i.category_id = c.id
    JOIN shops s ON c.shop_id = s.id
    WHERE i.id = item_customization_groups.item_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view item_customization_options" ON item_customization_options FOR SELECT USING (true);

CREATE POLICY "Owners can manage item_customization_options" ON item_customization_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM item_customization_groups g
    JOIN items i ON g.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    JOIN shops s ON c.shop_id = s.id
    WHERE g.id = item_customization_options.group_id AND s.user_id = auth.uid()
  )
);
