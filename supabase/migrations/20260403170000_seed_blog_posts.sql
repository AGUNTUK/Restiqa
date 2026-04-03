-- 1. Add Category Support to Blogs
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Guides';

-- 2. Seed Realistic Blog Content
DO $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Pick the first admin or any user as author
  SELECT id INTO v_author_id FROM public.users WHERE role = 'admin' LIMIT 1;
  IF v_author_id IS NULL THEN
    SELECT id INTO v_author_id FROM public.users LIMIT 1;
  END IF;

  IF v_author_id IS NOT NULL THEN
    -- Post 1: Seafood Guide (Cox's Bazar)
    INSERT INTO public.blogs (slug, title, excerpt, category, content, cover_image, author_id)
    VALUES (
      'ultimate-coxs-bazar-seafood-guide',
      'The Ultimate Cox’s Bazar Seafood Guide: From Rupchanda to Loitta Fry',
      'Craving the freshest catch? Discover the hidden gems of Cox’s Bazar seafood scene—from iconic beachfront stalls to local favorites.',
      'Food',
      E'# The Ultimate Cox’s Bazar Seafood Guide\n\n'
      'Cox’s Bazar isn’t just about the world’s longest sea beach—it’s a paradise for seafood lovers. If you haven’t tried the local "Loitta Fry" or the succulent "Rupchanda," your trip is incomplete.\n\n'
      '## Iconic Must-Try Dishes\n'
      '* **Loitta Fry:** Deep-fried lizardfish that’s soft on the inside and crispy on the outside.\n'
      '* **Rupchanda (Pomfret):** Grilled or fried with a special spicy masala.\n'
      '* **Dry Fish (Shutki) Bhuna:** A spicy, aromatic delicacy for those who love bold flavors.\n\n'
      '## Top Seafood Spots in 2026\n'
      '### 1. Poushee Restaurant\n'
      'Known for its traditional Bengali meals and an incredible variety of seafood bhunas. It’s always crowded, and for good reason!\n\n'
      '### 2. Jhaobon Restaurant\n'
      'Another legendary spot offering authentic local tastes. Their mixed seafood platter is highly recommended.\n\n'
      '### 3. Sugandha Beach Stalls\n'
      'For a more casual experience, head to the beach at night. You can pick your fresh fish and have it grilled right in front of you.\n\n'
      '---\n\n'
      '### [Plan Your Stay in Cox’s Bazar →](/coxs-bazar)\n\n'
      '## Pro Tips for Seafood Lovers\n'
      '1. **Ask for Freshness:** Always ask when the fish was caught. In most places, it’s same-day fresh.\n'
      '2. **Spice Level:** Bengali seafood is famously spicy. If you prefer it mild, make sure to let the waiter know "Alpo Jhal" (Less spicy).\n'
      '3. **Wash it Down:** Try the local green coconut water after a heavy seafood meal—it’s the perfect palate cleanser.',
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=1200&q=80',
      v_author_id
    ) ON CONFLICT (slug) DO UPDATE SET category = EXCLUDED.category;

    -- Post 2: Sreemangal Itinerary (Sylhet)
    INSERT INTO public.blogs (slug, title, excerpt, category, content, cover_image, author_id)
    VALUES (
      '48-hours-in-sreemangal-itinerary',
      '48 Hours in Sreemangal: A Perfect Itinerary for the Tea Capital',
      'Experience the lush green tea gardens, rainforest treks, and the legendary seven-layer tea in this ultimate 2-day guide to Sreemangal.',
      'Guides',
      E'# 48 Hours in Sreemangal: The Tea Capital\n\n'
      'Sreemangal is the tea capital of Bangladesh. It’s a place where the air smells of fresh leaves and the hills are painted in shades of emerald.\n\n'
      '## Day 1: Tea Gardens & Seven-Layer Magic\n'
      '### Morning: Finlay Tea Estate\n'
      'Start your journey with a walk through the Finlay Tea Estate. The morning mist over the rolling hills is a photographer’s dream.\n\n'
      '### Afternoon: The Famous Seven-Layer Tea\n'
      'You can’t leave Sreemangal without trying the original 7-layer tea at Nilkantha Tea Cabin. Each layer has a distinct flavor and secret spice blend.\n\n'
      '## Day 2: Lawachara National Park\n'
      '### Morning: Trekking for Hoolock Gibbons\n'
      'Get an early start at Lawachara. It’s one of the best places to spot the rare Western Hoolock Gibbon. The tall trees and silence of the forest are rejuvenating.\n\n'
      '### Afternoon: Madhabpur Lake\n'
      'A serene lake surrounded by low hills where you’ll see thousands of pink water lilies in full bloom during the season.\n\n'
      '---\n\n'
      '### [Explore Stays in Sreemangal →](/sylhet)\n\n'
      '## Essential Packing List\n'
      '* **Comfortable Walking Shoes:** For those long walks through tea gardens.\n'
      '* **Umbrella/Raincoat:** It rains frequently and unpredictably in this region.\n'
      '* **Mosquito Repellent:** Essential for Lawachara adventures.',
      'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=1200&q=80',
      v_author_id
    ) ON CONFLICT (slug) DO UPDATE SET category = EXCLUDED.category;

    -- Post 3: Bandarban Waterfalls (Adventure)
    INSERT INTO public.blogs (slug, title, excerpt, category, content, cover_image, author_id)
    VALUES (
      'hidden-waterfalls-of-bandarban',
      '5 Hidden Waterfalls of Bandarban for Adventure Seekers',
      'Trek through the hill tracts to discover the breathtaking beauty of Amiakhum, Nafakhum, and other secret waterfalls deep in Bandarban.',
      'Adventure',
      E'# 5 Breathtaking Waterfalls of Bandarban\n\n'
      'Bandarban is the adventure capital of Bangladesh. Its rugged terrain hides some of the most spectacular waterfalls in South Asia.\n\n'
      '## 1. Nafakhum\n'
      'Known as the "Niagara of Bangladesh," this powerful waterfall requires a boat journey from Thanchi and a trek through the Remakri canal.\n\n'
      '## 2. Amiakhum\n'
      'Often cited as the most beautiful waterfall in the country. Reaching it is a challenge involving steep hill climbs, but the view is reward enough.\n\n'
      '## 3. Jadipai Waterfall\n'
      'A massive waterfall near the Keokradong peak. Its wide flow and the surrounding greenery create a magical atmosphere.\n\n'
      '---\n\n'
      '### Looking for a Tour Guide?\n'
      'Many of these falls require a local guide for safety. Check our [Adventure Tours section](/listings?type=tour) for guided group trips.\n\n'
      '## Safety Precautions\n'
      '* **Check the Weather:** Avoid trekking during heavy monsoons as flash floods are common.\n'
      '* **Proper Gear:** Wear high-grip sandals or trekking shoes.\n'
      '* **Stay Hydrated:** Carry enough water and glucose for the strenuous treks.',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
      v_author_id
    ) ON CONFLICT (slug) DO UPDATE SET category = EXCLUDED.category;

    -- Post 4: Old Dhaka Rickshaw Art (Culture)
    INSERT INTO public.blogs (slug, title, excerpt, category, content, cover_image, author_id)
    VALUES (
      'rickshaw-art-guide-old-dhaka',
      'Living History: A Guide to Rickshaw Art in Old Dhaka',
      'Uncover the vibrant colors and stories behind the world-famous rickshaw art of Bangladesh. A journey through the streets of Old Dhaka.',
      'Culture',
      E'# The Vibrant World of Rickshaw Art\n\n'
      'Ricksha-art is a unique global phenomenon, recently recognized by UNESCO as Intangible Cultural Heritage. The best place to experience it? The narrow lanes of Old Dhaka.\n\n'
      '## Why Rickshaw Art Matters\n'
      'It’s more than just decoration—it’s a storytelling medium. From movie stars and mythical animals to rural landscapes, every rickshaw is a moving gallery.\n\n'
      '## Exploring Old Dhaka\n'
      'Take a slow rickshaw ride through **Shankhari Bazar** or **Lalbagh**. Notice the hand-painted backboards and the intricate plastic Appliqué work on the hoods.\n\n'
      '## Meet the Artists\n'
      'There are workshops in **Nazirabazar** where you can see artists painting these masterpieces by hand without any stencils or digital aids.\n\n'
      '---\n\n'
      '### [Stay Near the History in Dhaka →](/dhaka)\n\n'
      '## How to Support the Art\n'
      '1. **Buy Miniatures:** You can find painted tin plates and miniature rickshaws to take home.\n'
      '2. **Photography:** Most rickshaw wallahs are happy for you to photograph their vehicles, but always ask politely first!',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
      v_author_id
    ) ON CONFLICT (slug) DO UPDATE SET category = EXCLUDED.category;

  END IF;
END $$;
