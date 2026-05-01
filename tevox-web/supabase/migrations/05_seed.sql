-- ── Products ────────────────────────────────────────────────────────────────

insert into products (sku, name_th, name_en, description_th, car_model, category, price_thb, status, preorder_closes_at, fitment_notes_th, install_notes_th, specs, sort_order) values
(
  'TVX-IM6-FL-001',
  'ชุดแต่งกันชนหน้า MG IM6',
  'MG IM6 Front Lip',
  'กันชนหน้าแบบสปอร์ต ออกแบบมาสำหรับ MG IM6 โดยเฉพาะ ผ่านการทดสอบการติดตั้งจริงโดยผู้ก่อตั้ง ใส่แล้วดูดีและแน่นหนา',
  'MG IM6',
  'front_lip',
  4900.00,
  'preorder',
  now() + interval '14 days',
  'รองรับ MG IM6 ทุกรุ่นย่อยปี 2024–2025 ไม่ต้องเจาะหรือดัดแปลงตัวถัง ใช้จุดยึดเดิม',
  'ติดตั้งได้เองด้วยไขควง 30 นาที มีคู่มือภาพถ่ายให้ครบ',
  '{"material": "ABS + Carbon Fiber Look", "weight_kg": 2.3, "color_options": ["Gloss Black", "Matte Black"]}',
  1
),
(
  'TVX-IM6-RD-001',
  'ชุดแต่งกันชนหลัง Diffuser MG IM6',
  'MG IM6 Rear Diffuser',
  'Diffuser กันชนหลัง เพิ่มความ aggressive ให้รถ EV โดยไม่ต้องแลกประสิทธิภาพ ดีไซน์เรียบหรู ไม่ดูถูกรถ',
  'MG IM6',
  'rear_diffuser',
  5200.00,
  'preorder',
  now() + interval '14 days',
  'รองรับ MG IM6 ปี 2024 ขึ้นไป ติดตั้งโดยใช้จุดยึดเดิมของรถ ไม่ต้องดัดแปลง',
  'แนะนำให้ติดตั้งที่ศูนย์บริการหรือช่างที่เชี่ยวชาญ ใช้เวลาประมาณ 1 ชั่วโมง',
  '{"material": "ABS", "weight_kg": 1.8, "color_options": ["Gloss Black"]}',
  2
),
(
  'TVX-IM6-SS-001',
  'สปอยเลอร์ฝากระโปรงหลัง MG IM6',
  'MG IM6 Trunk Spoiler',
  'สปอยเลอร์ฝากระโปรงหลังทรงสปอร์ต เพิ่มดีไซน์และ downforce เล็กน้อย เข้าได้กับสีรถทุกสี',
  'MG IM6',
  'spoiler',
  3800.00,
  'available',
  null,
  'รองรับ MG IM6 ทุกรุ่นปี 2024–2025 ใช้กาว 3M VHB และ clip ยึด ไม่เจาะตัวถัง',
  'ทำความสะอาดพื้นผิวก่อนติด รอ 24 ชั่วโมงให้กาวแห้งสนิทก่อนใช้งาน',
  '{"material": "ABS", "weight_kg": 1.1, "color_options": ["Gloss Black", "Carbon Look", "Body Color (ต้องพ่นสี)"]}',
  3
),
(
  'TVX-IM6-SK-001',
  'ชุด Side Skirt MG IM6',
  'MG IM6 Side Skirts',
  'Side Skirt ทั้งซ้าย-ขวา เพิ่มความยาวและสัดส่วนที่ดูดีขึ้น เข้าชุดกับ Front Lip และ Rear Diffuser',
  'MG IM6',
  'side_skirt',
  6500.00,
  'preorder',
  now() + interval '21 days',
  'รองรับ MG IM6 ปี 2024–2025 มาเป็นคู่ซ้าย-ขวา',
  'ติดตั้งพร้อมกับ Front Lip จะได้ผลลัพธ์ที่ดีที่สุด แนะนำให้ใช้ช่าง',
  '{"material": "ABS", "weight_kg": 3.2, "color_options": ["Gloss Black", "Matte Black"]}',
  4
),
(
  'TVX-IM6-GR-001',
  'กระจัง Front Grille แต่ง MG IM6',
  'MG IM6 Front Grille',
  'กระจังหน้าลาย Honeycomb ดีไซน์ใหม่ เปลี่ยนหน้ารถให้ดูสปอร์ตขึ้นในคืนเดียว',
  'MG IM6',
  'grille',
  2900.00,
  'available',
  null,
  'ใส่แทนกระจังเดิม ไม่ต้องดัดแปลง ใช้จุดยึดเดิมทั้งหมด',
  'ถอดกระจังเดิมออกด้วย clip tool ใส่ชิ้นใหม่กดเข้าที่ ใช้เวลา 15 นาที',
  '{"material": "ABS", "weight_kg": 0.6, "color_options": ["Gloss Black", "Matte Black", "Carbon Look"]}',
  5
),
(
  'TVX-IM6-WL-001',
  'ล้อแม็ก 19" Sport Series MG IM6',
  'MG IM6 19" Sport Wheels',
  'ล้อแม็กอลูมิเนียม 19 นิ้ว ทรง 5 ก้าน ออกแบบมาสำหรับ EV โดยเฉพาะ น้ำหนักเบา ลด unsprung mass',
  'MG IM6',
  'wheels',
  28000.00,
  'coming_soon',
  null,
  'PCD 5x114.3 ET40 ศูนย์กลาง 67.1 รองรับ MG IM6 ทุกรุ่น',
  'แนะนำให้ติดตั้งที่ร้านล้อและถ่วงยางใหม่พร้อมกัน',
  '{"material": "Aluminum Alloy 6061", "weight_kg": 8.5, "size": "19x8.5J", "pcd": "5x114.3", "color_options": ["Gloss Black", "Gun Metal", "Silver"]}',
  6
);

-- ── Installs (gallery) ───────────────────────────────────────────────────────

insert into installs (customer_name, car_model, product_id, image_key, caption_th, is_approved) values
(
  'คุณต้น',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-FL-001'),
  null,
  'ติดตั้ง Front Lip เสร็จแล้ว ดูดีกว่าที่คิดมาก ติดง่ายมากด้วย ใช้เวลาแค่ครึ่งชั่วโมง',
  true
),
(
  'คุณปลา',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-RD-001'),
  null,
  'Rear Diffuser ใส่ง่ายมาก ไม่ต้องดัดแปลงอะไร หน้ารถดูดุขึ้นเยอะเลย',
  true
),
(
  'คุณแบงค์',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-SS-001'),
  null,
  'Spoiler มาถึงเร็วมาก แพ็คดี ติดตั้งง่ายตามคู่มือ ตอนนี้รถดูสวยขึ้นมากเลย',
  true
),
(
  'คุณนิค',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-GR-001'),
  null,
  'เปลี่ยนกระจังใหม่ หน้ารถเปลี่ยนไปเลย ดูสปอร์ตขึ้นมาก แนะนำเลยครับ',
  true
),
(
  'คุณมาย',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-FL-001'),
  null,
  'ใส่ Front Lip มาได้สักพักแล้ว ยังแน่นหนาดีเลย ขับทางด่วนทุกวันไม่มีปัญหา',
  true
),
(
  'คุณเจมส์',
  'MG IM6',
  (select id from products where sku = 'TVX-IM6-SK-001'),
  null,
  'รอ Side Skirt อยู่นะครับ แต่ขอฝากรูปรถก่อนใส่ไว้ก่อนเลย ตื่นเต้นมาก',
  true
);
