CREATE TYPE transporter_type_enum AS ENUM (
    'continental',
    'inter_transporter',
    'intra_transporter'
);
CREATE TYPE transporter_category_enum AS ENUM ('company', 'individual');
-- Drop enum if needed (only do this if no table depends on it)
-- DROP TYPE IF EXISTS merge_status_enum;
CREATE TYPE merge_status_enum AS ENUM (
    'nill',
    'pending',
    'paid_by_user',
    'paid_by_transporter',
    'completed',
    'cancelled'
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    password TEXT NOT NULL,
    image TEXT DEFAULT NULL,
    -- Optional user image
    subscription_status BOOLEAN DEFAULT FALSE,
    subscription_expiry DATE DEFAULT NULL,
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE transporters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image TEXT DEFAULT NULL,
    -- Required transporter image
    contact_email VARCHAR(100),
    transporter_category transporter_category_enum NOT NULL DEFAULT 'individual',
    license_number TEXT DEFAULT NULL,
    vehicle_number TEXT DEFAULT NULL,
    contact_phone VARCHAR(20),
    port_location TEXT,
    transporter_type transporter_type_enum DEFAULT 'continental',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE transporter_admins (
    id SERIAL PRIMARY KEY,
    transporter_id INT REFERENCES transporters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    image TEXT DEFAULT NULL,
    -- Optional image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    image TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE merges (
    id SERIAL PRIMARY KEY,
    transporter_id INT REFERENCES transporters(id) ON DELETE
    SET NULL,
        delivery_method VARCHAR(50) NOT NULL,
        export_type VARCHAR(50) NOT NULL,
        destination TEXT NOT NULL,
        merge_status merge_enum DEFAULT 'Nill',
        merge_receipt_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE merge_participants (
    id SERIAL PRIMARY KEY,
    merge_id INT REFERENCES merges(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    payment_status BOOLEAN DEFAULT FALSE,
    amount_contributed NUMERIC(10, 2),
    -- Optional: if you want to track per-user contribution
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE receivers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    delivery_method VARCHAR(50) NOT NULL
);
CREATE TABLE shipping_schedule (
    id SERIAL PRIMARY KEY,
    transporter_id INT REFERENCES transporters(id) ON DELETE CASCADE,
    port TEXT NOT NULL,
    departure_date TIMESTAMP NOT NULL,
    arrival_date TIMESTAMP NOT NULL,
    cargo_rules TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE merge_invitations (
    id SERIAL PRIMARY KEY,
    merge_id INT REFERENCES merges(id) ON DELETE CASCADE,
    sender_id INT,
    -- Could be user or transporter
    receiver_id INT,
    -- Could be user or transporter
    role VARCHAR(20),
    -- 'user' or 'transporter'
    status VARCHAR(20) DEFAULT 'pending',
    token TEXT UNIQUE,
    type VARCHAR(20),
    -- 'invite' or 'request'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
-- ALTER TABLE users DROP COLUMN created_at,
--     ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();