import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lalpxtoxziyjibifibsx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY'
);

const playgrounds = [
  { id: 'launchpad-trampoline', name: 'Launchpad Trampoline Park', slug: 'launchpad-trampoline-park', address: '6141 Currents Dr NW, Edmonton, AB', city: 'edmonton', phone: '(780) 760-5867', website: 'https://launchpadtrampoline.ca', rating: 4.5, category: 'trampoline-park', tags: ['trampoline','birthday-parties'], age_range: 'All ages', lat: 53.4269, lng: -113.6224 },
  { id: 'edmonton-funderdome', name: 'Edmonton Funderdome', slug: 'edmonton-funderdome', address: '10325 51 Ave NW, Edmonton, AB', city: 'edmonton', phone: '(780) 436-3833', website: 'https://edmontonfunderdome.ca', rating: 4.3, category: 'indoor-playground', tags: ['indoor-playground','climbing','slides'], age_range: '0-12 years', lat: 53.4878, lng: -113.4965 },
  { id: 'edmonton-treehouse', name: 'The Edmonton Treehouse', slug: 'edmonton-treehouse', address: '10104 103 Ave NW, Edmonton, AB', city: 'edmonton', phone: '(780) 990-8733', website: 'https://edmontontreehouse.ca', rating: 4.6, category: 'indoor-playground', tags: ['indoor-playground','toddler-zone','cafe'], age_range: '0-10 years', lat: 53.5452, lng: -113.4938 },
  { id: 'lollipop-playland', name: 'Lollipop Playland', slug: 'lollipop-playland', address: '700 St Albert Trail, St Albert, AB', city: 'st-albert', phone: '(780) 459-8687', website: 'https://lollipopplayland.com', rating: 4.4, category: 'indoor-playground', tags: ['indoor-playground','toddler-friendly'], age_range: '0-8 years', lat: 53.6532, lng: -113.6242 },
  { id: 'shakers-fun-centre', name: 'Shakers Fun Centre', slug: 'shakers-fun-centre', address: '1725 99 St NW, Edmonton, AB', city: 'edmonton', phone: '(780) 466-4626', website: 'https://shakersfuncentre.com', rating: 4.2, category: 'family-fun-centre', tags: ['arcade','laser-tag','go-karts'], age_range: 'All ages', lat: 53.4456, lng: -113.4723 },
  { id: 'hide-n-seek', name: 'Hide N Seek Trampoline Park', slug: 'hide-n-seek', address: '49 Aero Dr NE, Calgary, AB', city: 'calgary', phone: '(403) 457-5333', website: 'https://hidenseekcalgary.com', rating: 4.6, category: 'trampoline-park', tags: ['trampoline','ninja','climbing'], age_range: 'All ages', lat: 51.0954, lng: -114.0356 },
  { id: 'calgary-funderdome', name: 'Calgary Funderdome', slug: 'calgary-funderdome', address: '3838 10 St NE, Calgary, AB', city: 'calgary', phone: '(403) 777-0123', website: 'https://calgaryfunderdome.ca', rating: 4.4, category: 'indoor-playground', tags: ['indoor-playground','obstacle-course'], age_range: '0-12 years', lat: 51.0872, lng: -114.0423 }
];

async function seed() {
  const { error } = await supabase.from('playgrounds').insert(playgrounds);
  console.log(error ? 'Error: ' + error.message : 'Inserted ' + playgrounds.length + ' playgrounds');
}

seed();
