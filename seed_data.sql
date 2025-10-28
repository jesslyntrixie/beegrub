-- BeeGrub Seed Data
-- Realistic test data for development and testing
-- Run this AFTER database_schema.sql

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Note: In production, auth_user_id will come from Supabase Auth
-- For now, we'll create mock UUIDs for testing

-- Admin User
INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@beegrub.com', 'hashed_password_admin', 'admin', 'active', true);

INSERT INTO admins (id, name) VALUES
('a0000000-0000-0000-0000-000000000001', 'Admin BeeGrub');

-- Student Users
INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
('10000000-0000-0000-0000-000000000001', 'budi.santoso@binus.ac.id', 'hashed_password_budi', 'student', 'active', true),
('20000000-0000-0000-0000-000000000002', 'ani.wijaya@binus.ac.id', 'hashed_password_ani', 'student', 'active', true),
('30000000-0000-0000-0000-000000000003', 'charlie.tan@binus.ac.id', 'hashed_password_charlie', 'student', 'active', true);

INSERT INTO students (id, student_id, full_name, phone) VALUES
('10000000-0000-0000-0000-000000000001', '2501234567', 'Budi Santoso', '081234567890'),
('20000000-0000-0000-0000-000000000002', '2501234568', 'Ani Wijaya', '081234567891'),
('30000000-0000-0000-0000-000000000003', '2501234569', 'Charlie Tan', '081234567892');

-- Vendor Users
INSERT INTO users (id, email, password_hash, role, status, email_verified) VALUES
('b0000000-0000-0000-0000-000000000001', 'canteen.a@beegrub.com', 'hashed_password_cantA', 'vendor', 'active', true),
('b0000000-0000-0000-0000-000000000002', 'canteen.b@beegrub.com', 'hashed_password_cantB', 'vendor', 'active', true),
('b0000000-0000-0000-0000-000000000003', 'warung.sari@beegrub.com', 'hashed_password_sari', 'vendor', 'active', true);

INSERT INTO vendors (id, business_name, contact_phone, location, description, status, approved_by, approved_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'Canteen A - Nasi Padang', '081234560001', 'Ground Floor, Building A', 'Authentic Padang cuisine with various lauk pauk', 'approved', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
('b0000000-0000-0000-0000-000000000002', 'Canteen B - Mie Ayam & Bakso', '081234560002', 'Ground Floor, Building B', 'Fresh noodles and meatballs made daily', 'approved', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '25 days'),
('b0000000-0000-0000-0000-000000000003', 'Warung Bu Sari', '081234560003', '2nd Floor, Student Center', 'Home-cooked Indonesian favorites', 'approved', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days');

-- =====================================================
-- MENU ITEMS
-- =====================================================

-- Canteen A - Nasi Padang (12 items)
INSERT INTO menu_items (vendor_id, name, description, price, is_available) VALUES
-- Rice & Main Dishes
('b0000000-0000-0000-0000-000000000001', 'Nasi Padang Rendang', 'Steamed rice with beef rendang, vegetables, and sambal', 25000, true),
('b0000000-0000-0000-0000-000000000001', 'Nasi Padang Ayam Pop', 'Rice with fried chicken Padang style, vegetables', 22000, true),
('b0000000-0000-0000-0000-000000000001', 'Nasi Padang Ikan Gulai', 'Rice with fish in spicy coconut curry', 23000, true),
('b0000000-0000-0000-0000-000000000001', 'Nasi Padang Telur Balado', 'Rice with eggs in spicy chili sauce', 18000, true),

-- Side Dishes (Lauk Pauk)
('b0000000-0000-0000-0000-000000000001', 'Rendang Sapi (Portion)', 'Beef rendang only', 15000, true),
('b0000000-0000-0000-0000-000000000001', 'Sambal Ijo', 'Green chili sambal', 5000, true),
('b0000000-0000-0000-0000-000000000001', 'Perkedel Kentang', 'Potato fritters (2 pcs)', 8000, true),

-- Beverages
('b0000000-0000-0000-0000-000000000001', 'Es Teh Manis', 'Sweet iced tea', 5000, true),
('b0000000-0000-0000-0000-000000000001', 'Es Jeruk', 'Fresh orange juice', 8000, true),
('b0000000-0000-0000-0000-000000000001', 'Teh Panas', 'Hot tea', 3000, true);

-- Canteen B - Mie Ayam & Bakso (10 items)
INSERT INTO menu_items (vendor_id, name, description, price, is_available) VALUES
-- Noodles
('b0000000-0000-0000-0000-000000000002', 'Mie Ayam Bakso', 'Chicken noodles with meatballs', 18000, true),
('b0000000-0000-0000-0000-000000000002', 'Mie Ayam Jamur', 'Chicken noodles with mushrooms', 17000, true),
('b0000000-0000-0000-0000-000000000002', 'Mie Ayam Spesial', 'Special chicken noodles with extra toppings', 22000, true),
('b0000000-0000-0000-0000-000000000002', 'Mie Goreng Ayam', 'Fried chicken noodles', 20000, true),

-- Bakso (Meatballs)
('b0000000-0000-0000-0000-000000000002', 'Bakso Sapi Original', 'Beef meatball soup', 16000, true),
('b0000000-0000-0000-0000-000000000002', 'Bakso Urat', 'Tendon meatball soup', 18000, true),
('b0000000-0000-0000-0000-000000000002', 'Bakso Tahu', 'Meatball with tofu', 15000, true),

-- Beverages
('b0000000-0000-0000-0000-000000000002', 'Es Teh Manis', 'Sweet iced tea', 5000, true),
('b0000000-0000-0000-0000-000000000002', 'Es Jeruk', 'Orange juice', 8000, true),
('b0000000-0000-0000-0000-000000000002', 'Teh Hangat', 'Hot tea', 3000, true);

-- Warung Bu Sari - Indonesian Home Cooking (12 items)
INSERT INTO menu_items (vendor_id, name, description, price, is_available) VALUES
-- Rice Dishes
('b0000000-0000-0000-0000-000000000003', 'Nasi Goreng Ayam', 'Chicken fried rice with egg', 20000, true),
('b0000000-0000-0000-0000-000000000003', 'Nasi Goreng Seafood', 'Seafood fried rice', 25000, true),
('b0000000-0000-0000-0000-000000000003', 'Nasi Ayam Geprek', 'Smashed fried chicken with rice', 22000, true),
('b0000000-0000-0000-0000-000000000003', 'Nasi Uduk Komplit', 'Coconut rice with complete sides', 24000, true),

-- Main Dishes
('b0000000-0000-0000-0000-000000000003', 'Ayam Bakar Madu', 'Honey grilled chicken', 18000, true),
('b0000000-0000-0000-0000-000000000003', 'Tempe Goreng', 'Fried tempeh (4 pcs)', 6000, true),
('b0000000-0000-0000-0000-000000000003', 'Tahu Goreng', 'Fried tofu (4 pcs)', 6000, true),
('b0000000-0000-0000-0000-000000000003', 'Sayur Asem', 'Tamarind vegetable soup', 8000, true),

-- Beverages
('b0000000-0000-0000-0000-000000000003', 'Es Teh Manis', 'Sweet iced tea', 5000, true),
('b0000000-0000-0000-0000-000000000003', 'Es Jeruk Peras', 'Fresh squeezed orange juice', 10000, true),
('b0000000-0000-0000-0000-000000000003', 'Kopi Susu', 'Coffee with milk', 8000, true),
('b0000000-0000-0000-0000-000000000003', 'Air Mineral', 'Mineral water', 3000, true);

-- =====================================================
-- SAMPLE ORDERS (For Testing Order Flow)
-- =====================================================

-- PRE-ORDER Example 1: Budi orders from Canteen A for lunch
INSERT INTO orders (
  id, student_id, vendor_id, pickup_location_id, order_type,
  subtotal, service_fee, total, status, 
  scheduled_pickup_time, time_slot, advance_order_hours,
  special_instructions
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  (SELECT id FROM pickup_locations WHERE name = 'Library Main Entrance' LIMIT 1),
  'pre_order',
  30000, -- subtotal (Nasi Padang Rendang 25k + Es Teh 5k)
  3000,  -- service fee
  33000, -- total
  'confirmed',
  (CURRENT_DATE + INTERVAL '13 hours')::timestamp with time zone, -- 1:00 PM today
  '13:00-13:20',
  2,
  'Extra sambal please!'
);

-- Order items for Budi's order
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000001',
  id,
  1,
  25000,
  25000
FROM menu_items 
WHERE name = 'Nasi Padang Rendang' LIMIT 1;

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000001',
  id,
  1,
  5000,
  5000
FROM menu_items 
WHERE name = 'Es Teh Manis' AND vendor_id = 'b0000000-0000-0000-0000-000000000001' LIMIT 1;

-- Payment for Budi's order
INSERT INTO payments (order_id, amount, payment_method, status, paid_at)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  33000,
  'qris',
  'completed',
  NOW() - INTERVAL '2 hours'
);

-- PRE-ORDER Example 2: Ani orders from Canteen B for morning rush
INSERT INTO orders (
  id, student_id, vendor_id, pickup_location_id, order_type,
  subtotal, service_fee, total, status,
  scheduled_pickup_time, time_slot, advance_order_hours
) VALUES (
  'c0000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  (SELECT id FROM pickup_locations WHERE name = 'Building B Cafeteria' LIMIT 1),
  'pre_order',
  23000, -- Mie Ayam Bakso 18k + Es Jeruk 8k - 3k service fee
  3000,
  26000,
  'ready',
  (CURRENT_DATE + INTERVAL '9 hours + 10 minutes')::timestamp with time zone, -- 9:10 AM today
  '09:00-09:20',
  3
);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000002',
  id,
  1,
  18000,
  18000
FROM menu_items 
WHERE name = 'Mie Ayam Bakso' LIMIT 1;

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000002',
  id,
  1,
  8000,
  8000
FROM menu_items 
WHERE name = 'Es Jeruk' AND vendor_id = 'b0000000-0000-0000-0000-000000000002' LIMIT 1;

INSERT INTO payments (order_id, amount, payment_method, status, paid_at)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  26000,
  'qris',
  'completed',
  NOW() - INTERVAL '3 hours'
);

-- LIVE ORDER Example 3: Charlie orders from Warung Bu Sari (no scheduled time)
INSERT INTO orders (
  id, student_id, vendor_id, pickup_location_id, order_type,
  subtotal, service_fee, total, status,
  scheduled_pickup_time
) VALUES (
  'c0000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  (SELECT id FROM pickup_locations WHERE name = 'Student Center' LIMIT 1),
  'live_order',
  42000, -- Nasi Goreng Seafood 25k + Ayam Bakar 18k - 1k = 42k
  3000,
  45000,
  'preparing',
  NULL -- Live order, no scheduled pickup time
);

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000003',
  id,
  1,
  25000,
  25000
FROM menu_items 
WHERE name = 'Nasi Goreng Seafood' LIMIT 1;

INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
SELECT 
  'c0000000-0000-0000-0000-000000000003',
  id,
  1,
  18000,
  18000
FROM menu_items 
WHERE name = 'Ayam Bakar Madu' LIMIT 1;

INSERT INTO payments (order_id, amount, payment_method, status, paid_at)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  45000,
  'qris',
  'completed',
  NOW()
);

-- =====================================================
-- SAMPLE NOTIFICATIONS
-- =====================================================

-- Notification for Budi (order confirmed)
INSERT INTO notifications (user_id, order_id, type, title, message, is_read)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'order_confirmed',
  'Order Confirmed!',
  'Your order from Canteen A has been confirmed. Pickup at 1:00 PM at Library Main Entrance.',
  false
);

-- Notification for Ani (order ready)
INSERT INTO notifications (user_id, order_id, type, title, message, is_read)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'order_ready',
  'Order Ready for Pickup!',
  'Your Mie Ayam Bakso is ready! Please pickup at Building B Cafeteria.',
  false
);

-- Notification for Charlie (order preparing)
INSERT INTO notifications (user_id, order_id, type, title, message, is_read)
VALUES (
  '30000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000003',
  'order_preparing',
  'Order is Being Prepared',
  'Warung Bu Sari is preparing your order. It will be ready soon!',
  false
);

-- Notification for vendor (new order)
INSERT INTO notifications (user_id, order_id, type, title, message, is_read)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'new_order',
  'New Order Received',
  'New pre-order for 1:00 PM pickup. Order #BG-20251022-001',
  true
);

-- =====================================================
-- SUMMARY
-- =====================================================

/*
SEED DATA SUMMARY:

✅ 1 Admin user (admin@beegrub.com)
✅ 3 Student users (Budi, Ani, Charlie with @binus.ac.id emails)
✅ 3 Vendor accounts (Canteen A, Canteen B, Warung Bu Sari)
✅ 32 Menu items total:
   - Canteen A: 10 Padang dishes + drinks
   - Canteen B: 10 noodle & meatball items
   - Warung Bu Sari: 12 Indonesian home cooking items
✅ 3 Sample orders:
   - 2 PRE-ORDERS (with scheduled pickup times)
   - 1 LIVE ORDER (immediate order)
✅ 3 Payments (all completed via QRIS)
✅ 4 Notifications (order status updates)
✅ 4 Pickup locations (from schema)
✅ 5 Time slots (from schema)

REALISTIC PRICING (IDR):
- Main dishes: 15,000 - 25,000
- Side dishes: 5,000 - 10,000
- Beverages: 3,000 - 10,000
- Service fee: 3,000 per order

TEST CREDENTIALS:
Students:
- budi.santoso@binus.ac.id (ID: 2501234567)
- ani.wijaya@binus.ac.id (ID: 2501234568)
- charlie.tan@binus.ac.id (ID: 2501234569)

Vendors:
- canteen.a@beegrub.com (Nasi Padang)
- canteen.b@beegrub.com (Mie Ayam & Bakso)
- warung.sari@beegrub.com (Indonesian Food)

Admin:
- admin@beegrub.com

Ready for testing! 🚀
*/
