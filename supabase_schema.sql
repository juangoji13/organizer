-- ==============================================================================
-- ORGANIZER DATABASE SCHEMA & SEED DATA
-- Database: PostgreSQL 17 / Self-Hosted Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop old tables if exist
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS personal_items CASCADE;

-- 1. Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    university TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT,
    subject TEXT NOT NULL,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    rate NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'delivered', 'paid', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Deliverables
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Assignment',
    is_completed BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Personal Items / Goals
CREATE TABLE personal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('university', 'programming', 'study_goal', 'savings', 'study', 'dev')),
    title TEXT NOT NULL,
    description TEXT,
    progress INT DEFAULT 0,
    target INT DEFAULT 100,
    unit TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_due_date ON jobs(due_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_deliverables_job_id ON deliverables(job_id);
CREATE INDEX idx_personal_items_type ON personal_items(type);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS & Permissions
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to clients for anon" ON clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to clients for authenticated" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to clients for service_role" ON clients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to jobs for anon" ON jobs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to jobs for authenticated" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to jobs for service_role" ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to deliverables for anon" ON deliverables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deliverables for authenticated" ON deliverables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deliverables for service_role" ON deliverables FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to personal_items for anon" ON personal_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to personal_items for authenticated" ON personal_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to personal_items for service_role" ON personal_items FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Clients
INSERT INTO clients (id, name, phone, university) VALUES
('c0000000-0000-0000-0000-000000000001', 'Carlos Mendoza', '573001234567', 'Universidad del Norte'),
('c0000000-0000-0000-0000-000000000002', 'Andrés Felipe', '573109876543', 'Universidad de Antioquia'),
('c0000000-0000-0000-0000-000000000003', 'Mariana Silva', '573155554433', 'Universidad de los Andes'),
('c0000000-0000-0000-0000-000000000004', 'Camilo Torres', '573204443322', 'Universidad Nacional'),
('c0000000-0000-0000-0000-000000000005', 'David R.', '573017778899', 'Universidad Javeriana');

-- Jobs
INSERT INTO jobs (id, client_id, title, subject, platform, username, password, rate, amount_paid, due_date, status, notes) VALUES
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte 2 - Actividades y Tests', 'Inglés Connect', 'McGraw-Hill Connect', 'carlos.m@uninorte.edu.co', 'Connect2024!', 60000, 30000, '2026-11-08 23:59:00+00', 'in_progress', 'Urgente hoy. Finalizar antes de medianoche.'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Taller 3: Integración por Partes', 'Cálculo Integral', 'Teams / Aula Virtual', 'afelipe_9', 'UdeA2024*', 45000, 45000, '2026-11-08 18:00:00+00', 'in_progress', 'Entregar con procedimiento paso a paso en PDF.'),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Taller de Equilibrio de Mercado y Monopolio', 'Microeconomía', 'Moodle Institucional', 'msilva', 'Eco2024#', 50000, 25000, '2026-11-11 16:00:00+00', 'in_progress', 'Incluir gráficas detalladas.'),
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Informe de Laboratorio: Conservación de Energía', 'Física Mecánica', 'Google Classroom', 'c_torres', 'Mecanica99', 40000, 40000, '2026-11-13 22:00:00+00', 'in_progress', 'Formato estándar IEEE.');

-- Deliverables
INSERT INTO deliverables (job_id, title, category, is_completed, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'Assignment 1 (Vocabulary Unit 4)', 'Assignment', true, 1),
('b0000000-0000-0000-0000-000000000001', 'Assignment 2 (Grammar Practice)', 'Assignment', true, 2),
('b0000000-0000-0000-0000-000000000001', 'Assignment 3 (Reading Comprehension)', 'Assignment', true, 3),
('b0000000-0000-0000-0000-000000000001', 'Assignment 4 (Listening Section)', 'Assignment', true, 4),
('b0000000-0000-0000-0000-000000000001', 'Assignment 5 (Speaking Prompt)', 'Assignment', false, 5),
('b0000000-0000-0000-0000-000000000001', 'Test Unit 4', 'Test', false, 6),
('b0000000-0000-0000-0000-000000000001', 'Progress Check Test', 'Test', false, 7),
('b0000000-0000-0000-0000-000000000002', 'Ejercicios 1 a 5 (Método tabular)', 'Assignment', true, 1),
('b0000000-0000-0000-0000-000000000002', 'Ejercicios 6 a 10 (Funciones trigonométricas)', 'Assignment', true, 2),
('b0000000-0000-0000-0000-000000000002', 'Problema de aplicación física', 'Assignment', false, 3),
('b0000000-0000-0000-0000-000000000003', 'Curvas de oferta y demanda', 'Assignment', true, 1),
('b0000000-0000-0000-0000-000000000003', 'Elasticidad precio de la demanda', 'Assignment', false, 2),
('b0000000-0000-0000-0000-000000000003', 'Monopolio natural y fijación de precios', 'Assignment', false, 3),
('b0000000-0000-0000-0000-000000000004', 'Tablas de datos experimentales', 'Assignment', true, 1),
('b0000000-0000-0000-0000-000000000004', 'Gráficas en Excel y cálculo de errores', 'Assignment', true, 2),
('b0000000-0000-0000-0000-000000000004', 'Análisis de resultados', 'Assignment', true, 3),
('b0000000-0000-0000-0000-000000000004', 'Conclusiones y bibliografía IEEE', 'Assignment', false, 4);

-- Personal Items
INSERT INTO personal_items (type, title, description, progress, target, unit, deadline, status) VALUES
('study_goal', 'Preparación Examen Final de Algoritmos', 'Repasar árboles binarios y programación dinámica', 40, 100, '%', '2026-11-20', 'active'),
('university', 'Entrega Proyecto de Bases de Datos', 'Normalización 3FN y diagramas relacionales en Supabase', 100, 100, '%', '2026-11-05', 'completed'),
('programming', 'Refactorizar API de facturación personal', 'Migrar endpoints a Next.js Server Actions y Turbopack', 30, 100, '%', '2026-11-25', 'active'),
('savings', 'Fondo de Ahorro: Nueva Laptop M3', 'Ahorro para actualización de equipo de trabajo', 1800000, 4500000, 'COP', '2026-12-31', 'active'),
('savings', 'Colchón de Emergencias Semestral', 'Fondo de reserva ante imprevistos', 850000, 1500000, 'COP', '2026-12-31', 'active');
