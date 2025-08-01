CREATE TYPE merge_enum AS ENUM (
    'Nill' 'pending',
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
    contact_phone VARCHAR(20),
    port_location TEXT,
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
CREATE TABLE merged (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT REFERENCES users(id) ON DELETE CASCADE,
    transporter_id INT REFERENCES transporters(id),
    delivery_method VARCHAR(50) NOT NULL,
    export_type VARCHAR(50) NOT NULL,
    destination TEXT NOT NULL,
    user1_payment_status BOOLEAN DEFAULT FALSE,
    user2_payment_status BOOLEAN DEFAULT FALSE,
    merge_status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'approved', 'rejected', 'completed'
    merge_receipt_url TEXT DEFAULT NULL,
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
-- ALTER TABLE users DROP COLUMN created_at,
--     ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();