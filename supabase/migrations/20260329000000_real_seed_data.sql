-- ============================================================
-- REALISTIC SEED DATA FOR RESTIQA
-- Includes high-quality Properties and Tours in Bangladesh
-- ============================================================

DO $$
DECLARE
  v_host_id UUID;
BEGIN
  -- Pick the first admin user; fall back to any user
  SELECT id INTO v_host_id FROM public.users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;
  IF v_host_id IS NULL THEN SELECT id INTO v_host_id FROM public.users ORDER BY created_at ASC LIMIT 1; END IF;

  IF v_host_id IS NULL THEN
    RAISE NOTICE 'No users found. Please create a user account first.';
    RETURN;
  END IF;

  -- 1. LUXURY VILLA IN SYLHET (Property)
  INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug)
  VALUES (
    '00000000-0000-0000-0000-000000000101',
    v_host_id,
    'Garden Mist Luxury Villa — Tea Estate View',
    'Experience the serene beauty of Sreemangal from this private luxury villa. Nestled right on the edge of a lush tea garden, this 4-bedroom estate offers panoramic views, a private swimming pool, and dedicated staff for your comfort. Perfect for family retreats and nature lovers.',
    35000,
    'Sreemangal, Sylhet 3210',
    'Sylhet',
    'Bangladesh',
    24.3065,
    91.7295,
    'villa',
    4,
    4,
    10,
    ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Private Pool', 'Parking', 'Chef Service', 'Garden'],
    ARRAY[
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80'
    ],
    TRUE,
    'approved',
    'garden-mist-luxury-villa-sylhet'
  ) ON CONFLICT (id) DO UPDATE SET status = 'approved';

  -- 2. BEACHFRONT PENTHOUSE IN COX''S BAZAR (Property)
  INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug)
  VALUES (
    '00000000-0000-0000-0000-000000000102',
    v_host_id,
    'Ocean Sapphire Penthouse — Beachfront',
    'Wake up to the sound of the ocean in this sleek 3-bedroom penthouse. Located on the top floor of a premium beachfront building, it features floor-to-ceiling windows and a massive private balcony overlooking the Bay of Bengal. Steps away from the sandy beach.',
    18500,
    'Marine Drive, Cox''s Bazar 4700',
    'Cox''s Bazar',
    'Bangladesh',
    21.4272,
    91.9701,
    'apartment',
    3,
    3,
    6,
    ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Balcony', 'Gym', 'Security', 'Beach Access'],
    ARRAY[
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      'https://images.unsplash.com/photo-1544161515-4ae6b91839d0?w=1200&q=80'
    ],
    TRUE,
    'approved',
    'ocean-sapphire-penthouse-cox-bazar'
  ) ON CONFLICT (id) DO UPDATE SET status = 'approved';

  -- 3. HISTORIC MANOR IN OLD DHAKA (Property)
  INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug)
  VALUES (
    '00000000-0000-0000-0000-000000000103',
    v_host_id,
    'Heritage Zamindar Court — Old Dhaka Manor',
    'Step back in time in this beautifully restored 19th-century manor. Located in the heart of historic Old Dhaka, this property offers a unique blend of colonial architecture and modern luxury. Features high ceilings, antique furniture, and a private courtyard.',
    12000,
    'Farashganj, Old Dhaka 1100',
    'Dhaka',
    'Bangladesh',
    23.7081,
    90.4132,
    'house',
    2,
    2,
    4,
    ARRAY['WiFi', 'Breakfast Included', 'Private Courtyard', 'Antique Decor', 'Guided Tour Option'],
    ARRAY[
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80'
    ],
    TRUE,
    'approved',
    'heritage-zamindar-court-old-dhaka'
  ) ON CONFLICT (id) DO UPDATE SET status = 'approved';

  -- 4. SUNDARBANS WILDLIFE EXPEDITION (Tour)
  INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug, duration)
  VALUES (
    '00000000-0000-0000-0000-000000000201',
    v_host_id,
    '3-Day Deep Forest Sundarbans Expedition',
    'A journey into the world''s largest mangrove forest. This all-inclusive 3-day tour takes you deep into the Sundarbans on a private vessel. Activities include early morning canal cruising, trekking to Kotka beach, and spotting wildlife like the Royal Bengal Tiger, Spotted Deer, and Crocodiles.',
    22000,
    'Mongla Port, Bagerhat',
    'Khulna',
    'Bangladesh',
    22.4834,
    89.5960,
    'tour',
    1,
    1,
    15,
    ARRAY['All Meals', 'Forest Guide', 'Private Cabin', 'Permits Included', 'Wildlife Trek'],
    ARRAY[
      'https://images.unsplash.com/photo-1581067720543-547784391276?w=1200&q=80',
      'https://images.unsplash.com/photo-1588613146330-316279f1933f?w=1200&q=80'
    ],
    TRUE,
    'approved',
    '3-day-deep-forest-sundarbans-expedition',
    3
  ) ON CONFLICT (id) DO UPDATE SET status = 'approved';

  -- 5. SYLHET HIGHLANDS TEA TREK (Tour)
  INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug, duration)
  VALUES (
    '00000000-0000-0000-0000-000000000202',
    v_host_id,
    '2-Day Sylhet Tea Highlands & Waterfall Trek',
    'Discover the hidden gems of Sylhet''s hill tracts. This 2-day adventure includes trekking through private tea estates, visiting the Madhabkunda waterfall, and lunch with a local ethnic community. Ideal for hikers and photography enthusiasts.',
    9500,
    'Sreemangal, Sylhet',
    'Sylhet',
    'Bangladesh',
    24.4754,
    92.2173,
    'tour',
    0,
    0,
    10,
    ARRAY['Local Guide', 'Transportation', 'Lunch', 'Nature Photography', 'Cultural Exchange'],
    ARRAY[
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
      'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=1200&q=80'
    ],
    TRUE,
    'approved',
    '2-day-sylhet-highlands-trek',
    2
  ) ON CONFLICT (id) DO UPDATE SET status = 'approved';

END $$;
