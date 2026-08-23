import {
  Category,
  Brand,
  Product,
  Customer,
  Architect,
  RFQ,
  Quote,
  FollowUp,
  PurchaseOrder,
} from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'LED Lighting',
    slug: 'led-lighting',
    icon: '💡',
    description: 'LED panels, downlights, battens, bulbs, track lights and decorative fixtures',
    subcategories: [
      { id: 'sub-1', name: 'Panels & Downlights', slug: 'panels-downlights', categoryId: 'cat-1' },
      { id: 'sub-2', name: 'Bulbs & Battens', slug: 'bulbs-battens', categoryId: 'cat-1' },
      { id: 'sub-3', name: 'Spot & Track Lights', slug: 'spot-track', categoryId: 'cat-1' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Industrial & Outdoor Lighting',
    slug: 'industrial-outdoor',
    icon: '🏭',
    description: 'High bay, flood lights, street lights and outdoor area lighting',
    subcategories: [
      { id: 'sub-12', name: 'High Bay Lights', slug: 'high-bay', categoryId: 'cat-6' },
      { id: 'sub-13', name: 'Flood & Street Lights', slug: 'flood-street', categoryId: 'cat-6' },
    ],
  },
];

export const brands: Brand[] = [
  { id: 'brand-1', name: 'Philips', slug: 'philips', logo: '/brands/philips.svg', country: 'Netherlands' },
  { id: 'brand-3', name: 'Havells', slug: 'havells', logo: '/brands/havells.svg', country: 'India' },
  { id: 'brand-4', name: 'Wipro', slug: 'wipro', logo: '/brands/wipro.svg', country: 'India' },
  { id: 'brand-6', name: 'Syska', slug: 'syska', logo: '/brands/syska.svg', country: 'India' },
];

export const products: Product[] = [
  {
    id: 'prod-1', name: 'Philips LED Panel Light 36W', sku: 'PHL-PNL-36W', slug: 'philips-led-panel-light-36w',
    brandId: 'brand-1', categoryId: 'cat-1', subcategoryId: 'sub-1',
    description: 'Professional grade recessed LED panel light ideal for offices, retail and commercial spaces. Features uniform light distribution and long lifespan.',
    shortSpec: '36W | 4000K | 3600lm | 600x600mm',
    specifications: [
      { label: 'Wattage', value: '36W' }, { label: 'Color Temperature', value: '4000K (Neutral White)' },
      { label: 'Luminous Flux', value: '3600 lm' }, { label: 'Dimensions', value: '600 x 600 x 10 mm' },
      { label: 'Input Voltage', value: '220-240V AC' }, { label: 'Lifespan', value: '50,000 hours' }, { label: 'IP Rating', value: 'IP44' },
    ],
    features: ['Uniform light distribution', 'Flicker-free', 'Easy recessed installation', 'Energy efficient'],
    tags: ['panel', 'office', 'recessed', 'led'],
    imageUrl: 'https://placehold.co/400x400/6b8375/white?text=Panel+Light',
    images: ['https://placehold.co/400x400/6b8375/white?text=Panel+Light', 'https://placehold.co/400x400/5a6e63/white?text=Panel+Side'],
    isActive: true, variants: ['36W 4000K', '36W 6500K', '48W 4000K'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }, { label: 'Installation Guide', type: 'PDF' }],
  },
  {
    id: 'prod-2', name: 'Philips LED Downlight 12W', sku: 'PHL-DWL-12W', slug: 'philips-led-downlight-12w',
    brandId: 'brand-1', categoryId: 'cat-1', subcategoryId: 'sub-1',
    description: 'Slim recessed LED downlight perfect for residential and commercial ceiling installations with a sleek modern design.',
    shortSpec: '12W | 3000K | 1100lm | O150mm',
    specifications: [
      { label: 'Wattage', value: '12W' }, { label: 'Color Temperature', value: '3000K (Warm White)' },
      { label: 'Luminous Flux', value: '1100 lm' }, { label: 'Cut-out Diameter', value: '125 mm' },
      { label: 'Input Voltage', value: '220-240V AC' }, { label: 'Lifespan', value: '40,000 hours' }, { label: 'IP Rating', value: 'IP44' },
    ],
    features: ['Slim design', 'Wide beam angle 110 deg', 'IC-rated', 'No UV/IR radiation'],
    tags: ['downlight', 'recessed', 'residential', 'led'],
    imageUrl: 'https://placehold.co/400x400/92b29b/white?text=Downlight',
    images: ['https://placehold.co/400x400/92b29b/white?text=Downlight'],
    isActive: true, variants: ['12W 3000K', '12W 4000K', '18W 3000K'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-3', name: 'Philips LED Flood Light 150W', sku: 'PHL-FLD-150W', slug: 'philips-led-flood-light-150w',
    brandId: 'brand-1', categoryId: 'cat-6', subcategoryId: 'sub-13',
    description: 'Heavy-duty outdoor LED flood light for large area illumination. Suitable for stadiums, parking lots and industrial areas.',
    shortSpec: '150W | 5700K | 18000lm | IP66',
    specifications: [
      { label: 'Wattage', value: '150W' }, { label: 'Color Temperature', value: '5700K (Daylight)' },
      { label: 'Luminous Flux', value: '18,000 lm' }, { label: 'Input Voltage', value: '100-277V AC' },
      { label: 'Lifespan', value: '50,000 hours' }, { label: 'IP Rating', value: 'IP66' }, { label: 'IK Rating', value: 'IK08' },
    ],
    features: ['Die-cast aluminium housing', 'Wide voltage range', 'Anti-glare optics', 'Surge protection 10kV'],
    tags: ['flood', 'outdoor', 'industrial', 'led'],
    imageUrl: 'https://placehold.co/400x400/485a50/white?text=Flood+Light',
    images: ['https://placehold.co/400x400/485a50/white?text=Flood+Light'],
    isActive: true, variants: ['100W', '150W', '200W'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }, { label: 'CE Certificate', type: 'PDF' }],
  },
  {
    id: 'prod-8', name: 'Havells LED Batten 22W', sku: 'HAV-BAT-22W', slug: 'havells-led-batten-22w',
    brandId: 'brand-3', categoryId: 'cat-1', subcategoryId: 'sub-2',
    description: 'Surface-mounted LED batten light with high lumen output, ideal for warehouses, corridors and utility spaces.',
    shortSpec: '22W | 6500K | 2200lm | 2ft',
    specifications: [
      { label: 'Wattage', value: '22W' }, { label: 'Color Temperature', value: '6500K (Cool White)' },
      { label: 'Luminous Flux', value: '2200 lm' }, { label: 'Length', value: '2 ft (600mm)' },
      { label: 'Input Voltage', value: '90-270V AC' }, { label: 'Lifespan', value: '25,000 hours' },
    ],
    features: ['Wide voltage range', 'Powder-coated body', 'Quick installation', 'Uniform brightness'],
    tags: ['batten', 'led', 'surface mount', 'corridor'],
    imageUrl: 'https://placehold.co/400x400/6b8375/white?text=LED+Batten',
    images: ['https://placehold.co/400x400/6b8375/white?text=LED+Batten'],
    isActive: true, variants: ['22W 2ft', '36W 4ft', '40W 4ft'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-9', name: 'Wipro LED Street Light 80W', sku: 'WIP-SL-80W', slug: 'wipro-led-street-light-80w',
    brandId: 'brand-4', categoryId: 'cat-6', subcategoryId: 'sub-13',
    description: 'High-performance outdoor LED street light designed for roads, highways and parking areas with superior lumen maintenance.',
    shortSpec: '80W | 5700K | 8800lm | IP65',
    specifications: [
      { label: 'Wattage', value: '80W' }, { label: 'Color Temperature', value: '5700K' },
      { label: 'Luminous Flux', value: '8,800 lm' }, { label: 'Input Voltage', value: '140-270V AC' },
      { label: 'Lifespan', value: '50,000 hours' }, { label: 'IP Rating', value: 'IP65' },
    ],
    features: ['Die-cast aluminium', 'Surge protection 6kV', 'Wide voltage', 'Anti-rust coating'],
    tags: ['street light', 'outdoor', 'road', 'led'],
    imageUrl: 'https://placehold.co/400x400/5a6e63/white?text=Street+Light',
    images: ['https://placehold.co/400x400/5a6e63/white?text=Street+Light'],
    isActive: true, variants: ['40W', '60W', '80W', '100W'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-10', name: 'Syska LED Bulb 9W', sku: 'SYS-BLB-9W', slug: 'syska-led-bulb-9w',
    brandId: 'brand-6', categoryId: 'cat-1', subcategoryId: 'sub-2',
    description: 'Standard B22 LED bulb offering significant energy savings. Suitable for home, office and commercial applications.',
    shortSpec: '9W | 6500K | 850lm | B22',
    specifications: [
      { label: 'Wattage', value: '9W' }, { label: 'Base', value: 'B22' },
      { label: 'Color Temperature', value: '6500K' }, { label: 'Luminous Flux', value: '850 lm' },
      { label: 'Input Voltage', value: '160-270V AC' }, { label: 'Lifespan', value: '20,000 hours' },
    ],
    features: ['360 deg beam angle', 'Mercury-free', 'Instant on', 'Wide voltage range'],
    tags: ['bulb', 'b22', 'led', 'residential'],
    imageUrl: 'https://placehold.co/400x400/92b29b/white?text=LED+Bulb',
    images: ['https://placehold.co/400x400/92b29b/white?text=LED+Bulb'],
    isActive: true, variants: ['7W', '9W', '12W', '15W'],
    documents: [],
  },
  {
    id: 'prod-11', name: 'Philips High Bay LED 200W', sku: 'PHL-HB-200W', slug: 'philips-high-bay-led-200w',
    brandId: 'brand-1', categoryId: 'cat-6', subcategoryId: 'sub-12',
    description: 'Industrial LED high bay luminaire for large spaces such as warehouses, factories and sports halls.',
    shortSpec: '200W | 4000K | 24000lm | IP65',
    specifications: [
      { label: 'Wattage', value: '200W' }, { label: 'Color Temperature', value: '4000K' },
      { label: 'Luminous Flux', value: '24,000 lm' }, { label: 'Beam Angle', value: '90 deg' },
      { label: 'IP Rating', value: 'IP65' }, { label: 'Mounting Height', value: '6-14m' },
    ],
    features: ['UFO design', 'Plug and play', 'Replaceable driver', 'Anti-glare reflector'],
    tags: ['high bay', 'industrial', 'warehouse', 'led'],
    imageUrl: 'https://placehold.co/400x400/6b8375/white?text=High+Bay',
    images: ['https://placehold.co/400x400/6b8375/white?text=High+Bay', 'https://placehold.co/400x400/5a6e63/white?text=High+Bay+2'],
    isActive: true, variants: ['100W', '150W', '200W', '240W'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }, { label: 'IES File', type: 'IES' }],
  },
  {
    id: 'prod-15', name: 'Wipro Garnet LED Panel 45W', sku: 'WIP-PNL-45W', slug: 'wipro-led-panel-45w',
    brandId: 'brand-4', categoryId: 'cat-1', subcategoryId: 'sub-1',
    description: 'Premium Wipro Garnet series LED panel for drop ceilings in offices, hospitals and retail spaces.',
    shortSpec: '45W | 4000K | 4500lm | 600x600mm',
    specifications: [
      { label: 'Wattage', value: '45W' }, { label: 'Color Temperature', value: '4000K' },
      { label: 'Luminous Flux', value: '4500 lm' }, { label: 'Dimensions', value: '600 x 600 mm' }, { label: 'IP Rating', value: 'IP40' },
    ],
    features: ['Edge-lit technology', 'DALI dimmable', 'CRI > 80', 'Flicker-free'],
    tags: ['panel', 'led', 'office', 'wipro'],
    imageUrl: 'https://placehold.co/400x400/92b29b/white?text=Garnet+Panel',
    images: ['https://placehold.co/400x400/92b29b/white?text=Garnet+Panel'],
    isActive: true, variants: ['30W', '36W', '45W'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-16', name: 'Havells LED Track Light 15W', sku: 'HAV-TRK-15W', slug: 'havells-led-track-light-15w',
    brandId: 'brand-3', categoryId: 'cat-1', subcategoryId: 'sub-3',
    description: 'Adjustable LED track light for retail displays, galleries and accent lighting. Fits standard 3-wire track systems.',
    shortSpec: '15W | 3000K | 1350lm | 30 deg beam',
    specifications: [
      { label: 'Wattage', value: '15W' }, { label: 'Color Temperature', value: '3000K (Warm White)' },
      { label: 'Luminous Flux', value: '1350 lm' }, { label: 'Beam Angle', value: '30 deg' },
      { label: 'Input Voltage', value: '220-240V AC' }, { label: 'Lifespan', value: '30,000 hours' }, { label: 'CRI', value: '>90' },
    ],
    features: ['360 deg horizontal rotation', '90 deg vertical tilt', 'High CRI', 'Dimmable compatible'],
    tags: ['track light', 'retail', 'accent', 'led'],
    imageUrl: 'https://placehold.co/400x400/6b8375/white?text=Track+Light',
    images: ['https://placehold.co/400x400/6b8375/white?text=Track+Light'],
    isActive: true, variants: ['10W 3000K', '15W 3000K', '20W 4000K'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-17', name: 'Syska LED Spotlight 7W', sku: 'SYS-SPT-7W', slug: 'syska-led-spotlight-7w',
    brandId: 'brand-6', categoryId: 'cat-1', subcategoryId: 'sub-3',
    description: 'Compact GU10 LED spotlight ideal for highlighting features in homes, hotels and boutique retail environments.',
    shortSpec: '7W | 2700K | 600lm | GU10',
    specifications: [
      { label: 'Wattage', value: '7W' }, { label: 'Base', value: 'GU10' },
      { label: 'Color Temperature', value: '2700K (Extra Warm)' }, { label: 'Luminous Flux', value: '600 lm' },
      { label: 'Beam Angle', value: '36 deg' }, { label: 'Lifespan', value: '25,000 hours' },
    ],
    features: ['Directional beam', 'Dimmable', 'Mercury-free', 'Instant on'],
    tags: ['spotlight', 'gu10', 'hotel', 'led'],
    imageUrl: 'https://placehold.co/400x400/b2c8a2/6b8375?text=Spotlight',
    images: ['https://placehold.co/400x400/b2c8a2/6b8375?text=Spotlight'],
    isActive: true, variants: ['5W 2700K', '7W 2700K', '7W 4000K'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-18', name: 'Wipro LED Pendant Light 30W', sku: 'WIP-PND-30W', slug: 'wipro-led-pendant-light-30w',
    brandId: 'brand-4', categoryId: 'cat-1', subcategoryId: 'sub-1',
    description: 'Elegant suspended LED pendant luminaire for lobbies, dining areas and open office spaces. Adjustable suspension cord.',
    shortSpec: '30W | 3000K | 2800lm | O300mm',
    specifications: [
      { label: 'Wattage', value: '30W' }, { label: 'Color Temperature', value: '3000K' },
      { label: 'Luminous Flux', value: '2800 lm' }, { label: 'Diameter', value: '300 mm' },
      { label: 'Suspension', value: 'Adjustable 1-3m cord' }, { label: 'IP Rating', value: 'IP20' },
    ],
    features: ['360 deg ambient light', 'Aluminium diffuser', 'Easy suspension mounting', 'CRI > 85'],
    tags: ['pendant', 'decorative', 'lobby', 'led'],
    imageUrl: 'https://placehold.co/400x400/98b28f/white?text=Pendant+Light',
    images: ['https://placehold.co/400x400/98b28f/white?text=Pendant+Light'],
    isActive: true, variants: ['20W 3000K', '30W 3000K', '30W 4000K'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-19', name: 'Havells LED Slim Batten 40W', sku: 'HAV-SLB-40W', slug: 'havells-led-slim-batten-40w',
    brandId: 'brand-3', categoryId: 'cat-1', subcategoryId: 'sub-2',
    description: 'Ultra-slim surface LED batten for clean architectural installations in offices, showrooms and residential corridors.',
    shortSpec: '40W | 4000K | 4000lm | 4ft',
    specifications: [
      { label: 'Wattage', value: '40W' }, { label: 'Color Temperature', value: '4000K (Neutral White)' },
      { label: 'Luminous Flux', value: '4000 lm' }, { label: 'Length', value: '4 ft (1200mm)' },
      { label: 'Input Voltage', value: '90-270V AC' }, { label: 'Lifespan', value: '30,000 hours' },
    ],
    features: ['Ultra-slim 35mm profile', 'Linkable design', 'Frosted PC cover', 'Quick install clips'],
    tags: ['batten', 'slim', 'led', 'showroom'],
    imageUrl: 'https://placehold.co/400x400/6b8375/white?text=Slim+Batten',
    images: ['https://placehold.co/400x400/6b8375/white?text=Slim+Batten'],
    isActive: true, variants: ['20W 2ft', '36W 4ft', '40W 4ft'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }],
  },
  {
    id: 'prod-20', name: 'Philips Ultinon High Bay 100W', sku: 'PHL-UHB-100W', slug: 'philips-ultinon-high-bay-100w',
    brandId: 'brand-1', categoryId: 'cat-6', subcategoryId: 'sub-12',
    description: 'Next-generation high bay with 150 lm/W efficacy. Ideal for logistics centres, cold storage and large warehouses.',
    shortSpec: '100W | 5000K | 15000lm | IP66',
    specifications: [
      { label: 'Wattage', value: '100W' }, { label: 'Color Temperature', value: '5000K (Daylight)' },
      { label: 'Luminous Flux', value: '15,000 lm' }, { label: 'Efficacy', value: '150 lm/W' },
      { label: 'IP Rating', value: 'IP66' }, { label: 'Mounting Height', value: '4-12m' }, { label: 'Lifespan', value: '60,000 hours' },
    ],
    features: ['150 lm/W efficacy', 'Surge protection 10kV', 'Sensor-ready', 'Wide operating temp -20C to 55C'],
    tags: ['high bay', 'logistics', 'cold storage', 'led'],
    imageUrl: 'https://placehold.co/400x400/485a50/white?text=Ultinon+HB',
    images: ['https://placehold.co/400x400/485a50/white?text=Ultinon+HB'],
    isActive: true, variants: ['65W', '100W', '150W'],
    documents: [{ label: 'Product Datasheet', type: 'PDF' }, { label: 'IES File', type: 'IES' }],
  },
];

export const customers: Customer[] = [
  { id: 'cust-1', name: 'Rajesh Kumar', companyName: 'Kumar Constructions Pvt. Ltd.', mobile: '9876543210', email: 'rajesh@kumarconstructions.com', address: '12, Industrial Area, Phase 1', city: 'Mumbai', gst: '27AABCK1234A1Z5', status: 'Active', createdAt: '2026-01-15' },
  { id: 'cust-2', name: 'Priya Sharma', companyName: 'Sharma Electricals', mobile: '9812345678', email: 'priya@sharmaelec.com', address: '45, MG Road', city: 'Bangalore', gst: '29AAHCS5678B1Z3', status: 'Active', createdAt: '2026-02-03' },
  { id: 'cust-3', name: 'Anand Patel', companyName: 'Patel Projects', mobile: '9988776655', email: 'anand@patelprojects.in', address: '8, Ring Road', city: 'Ahmedabad', gst: '24AAACPP1122C1Z9', status: 'Active', createdAt: '2026-02-20' },
  { id: 'cust-4', name: 'Suresh Menon', companyName: 'Menon Infrastructure', mobile: '9944332211', email: 'suresh@menoninfra.com', address: '33, NH Bypass', city: 'Chennai', gst: '33AABCM9876D1Z1', status: 'Active', createdAt: '2026-03-10' },
  { id: 'cust-5', name: 'Divya Nair', companyName: 'Nair & Associates', mobile: '9833221100', email: 'divya@nairassociates.com', address: '7, Park Street', city: 'Kochi', gst: '32AABCN4455E1Z6', status: 'Active', createdAt: '2026-03-25' },
  { id: 'cust-6', name: 'Kiran Singh', companyName: 'Singh Builders', mobile: '9765432109', email: 'kiran@singhbuilders.com', address: '22, Sector 14', city: 'Delhi', gst: '07AABCS2233F1Z4', status: 'Inactive', createdAt: '2026-04-05' },
  { id: 'cust-7', name: 'Meera Joshi', companyName: 'Joshi Engineering', mobile: '9654321098', email: 'meera@joshieng.com', address: '5, Industrial Estate', city: 'Pune', gst: '27AABCJ7788G1Z2', status: 'Active', createdAt: '2026-04-18' },
  { id: 'cust-8', name: 'Rohit Verma', companyName: 'Verma Electrical Works', mobile: '9543210987', email: 'rohit@vermaelec.com', address: '14, Nehru Nagar', city: 'Hyderabad', gst: '36AABCV3344H1Z8', status: 'Active', createdAt: '2026-05-02' },
];

export const architects: Architect[] = [
  {
    id: 'arch-1', name: 'Amit Desai', firmName: 'Desai Architecture Studio', mobile: '9876501234', whatsapp: '9876501234', email: 'amit@desaistudio.com', address: '101, Art District', city: 'Mumbai', licenseNumber: 'COA/2015/12345', gst: '27AABCA1111A1Z1', website: 'www.desaistudio.com', specialization: 'Commercial & Hospitality',
    status: 'Active', discount: 10, discountEffective: '2026-01-01', discountExpiry: '2026-12-31',
    discountHistory: [{ previous: 8, next: 10, changedBy: 'Admin', date: '2026-01-01' }], createdAt: '2025-11-10',
  },
  {
    id: 'arch-2', name: 'Neha Kapoor', firmName: 'Kapoor Design Labs', mobile: '9712345678', whatsapp: '9712345678', email: 'neha@kapoordesign.com', address: '55, Design Hub', city: 'Bangalore', licenseNumber: 'COA/2018/67890', gst: '29AABCK2222B1Z2', website: 'www.kapoordesign.com', specialization: 'Residential Interior',
    status: 'Active', discount: 8, discountEffective: '2026-03-01', discountExpiry: '2027-03-01',
    discountHistory: [], createdAt: '2026-01-05',
  },
  {
    id: 'arch-3', name: 'Sanjay Mehta', firmName: 'Mehta & Partners', mobile: '9634567890', whatsapp: '9634567890', email: 'sanjay@mehtapartners.com', address: '22, CBD', city: 'Pune', licenseNumber: 'COA/2012/11111', gst: '27AABCM3333C1Z3', website: 'www.mehtapartners.com', specialization: 'Corporate & IT Parks',
    status: 'Approved', discount: 12, discountHistory: [{ previous: 10, next: 12, changedBy: 'Admin', date: '2026-04-15' }], createdAt: '2026-02-12',
  },
  {
    id: 'arch-4', name: 'Ritu Agarwal', firmName: 'Studio Ritu', mobile: '9522345678', whatsapp: '9522345678', email: 'ritu@studioritu.in', address: '8, Heritage Block', city: 'Delhi', licenseNumber: 'COA/2020/22222', gst: '07AABCA4444D1Z4', website: '', specialization: 'Luxury Residential',
    status: 'Pending', discount: undefined, discountHistory: [], createdAt: '2026-06-01',
  },
  {
    id: 'arch-5', name: 'Farhan Qureshi', firmName: 'Q-Design Studio', mobile: '9411234567', whatsapp: '9411234567', email: 'farhan@qdesign.com', address: '3, Tech City', city: 'Hyderabad', licenseNumber: 'COA/2017/33333', gst: '36AABCQ5555E1Z5', website: 'www.qdesign.com', specialization: 'Industrial & Warehouses',
    status: 'Active', discount: 15, discountHistory: [{ previous: 12, next: 15, changedBy: 'Admin', date: '2026-05-10' }], createdAt: '2025-12-20',
  },
];

export const rfqs: RFQ[] = [
  {
    id: 'rfq-1', rfqNumber: 'RFQ-2026-000101', customerId: 'cust-1', customerName: 'Rajesh Kumar', companyName: 'Kumar Constructions Pvt. Ltd.', mobile: '9876543210', whatsapp: '9876543210', email: 'rajesh@kumarconstructions.com', projectName: 'Andheri Office Complex', deliveryLocation: 'Andheri East, Mumbai', requiredDeliveryDate: '2026-09-15', additionalRequirements: 'Need ISI marked products only', remarks: 'Urgent requirement',
    items: [{ productId: 'prod-1', quantity: 50 }, { productId: 'prod-2', quantity: 80 }],
    status: 'Quote Ready', createdAt: '2026-08-01', assignedTo: 'Arjun Sales',
    timeline: [{ date: '2026-08-01', action: 'RFQ Created', by: 'Customer' }, { date: '2026-08-02', action: 'Under Review', by: 'Arjun Sales' }, { date: '2026-08-04', action: 'Quote Created', by: 'Arjun Sales' }],
  },
  {
    id: 'rfq-2', rfqNumber: 'RFQ-2026-000102', customerId: 'cust-2', customerName: 'Priya Sharma', companyName: 'Sharma Electricals', mobile: '9812345678', whatsapp: '9812345678', email: 'priya@sharmaelec.com', projectName: 'Koramangala Retail Store', deliveryLocation: 'Koramangala, Bangalore', requiredDeliveryDate: '2026-09-20', additionalRequirements: '', remarks: '',
    items: [{ productId: 'prod-16', quantity: 40 }, { productId: 'prod-1', quantity: 20 }],
    status: 'Under Review', createdAt: '2026-08-05', assignedTo: 'Preethi CRM',
    timeline: [{ date: '2026-08-05', action: 'RFQ Created', by: 'Customer' }, { date: '2026-08-06', action: 'Under Review', by: 'Preethi CRM' }],
  },
  {
    id: 'rfq-3', rfqNumber: 'RFQ-2026-000103', customerId: 'cust-3', customerName: 'Anand Patel', companyName: 'Patel Projects', mobile: '9988776655', whatsapp: '9988776655', email: 'anand@patelprojects.in', projectName: 'Vastrapur Warehouse', deliveryLocation: 'Vastrapur, Ahmedabad', requiredDeliveryDate: '2026-10-01', additionalRequirements: 'Require installation support', remarks: 'Bulk order',
    items: [{ productId: 'prod-11', quantity: 30 }, { productId: 'prod-9', quantity: 20 }],
    status: 'New', createdAt: '2026-08-10', assignedTo: undefined,
    timeline: [{ date: '2026-08-10', action: 'RFQ Created', by: 'Customer' }],
  },
  {
    id: 'rfq-4', rfqNumber: 'RFQ-2026-000104', customerId: 'cust-4', customerName: 'Suresh Menon', companyName: 'Menon Infrastructure', mobile: '9944332211', whatsapp: '9944332211', email: 'suresh@menoninfra.com', projectName: 'Perambur Industrial Park', deliveryLocation: 'Perambur, Chennai', requiredDeliveryDate: '2026-09-30', additionalRequirements: '', remarks: '',
    items: [{ productId: 'prod-11', quantity: 100 }, { productId: 'prod-9', quantity: 50 }, { productId: 'prod-3', quantity: 25 }],
    status: 'Accepted', createdAt: '2026-07-20', assignedTo: 'Arjun Sales',
    timeline: [{ date: '2026-07-20', action: 'RFQ Created', by: 'Customer' }, { date: '2026-07-21', action: 'Under Review', by: 'Arjun Sales' }, { date: '2026-07-23', action: 'Quote Created', by: 'Arjun Sales' }, { date: '2026-07-25', action: 'Quote Accepted', by: 'Customer' }],
  },
  {
    id: 'rfq-5', rfqNumber: 'RFQ-2026-000105', customerId: 'cust-5', customerName: 'Divya Nair', companyName: 'Nair & Associates', mobile: '9833221100', whatsapp: '9833221100', email: 'divya@nairassociates.com', projectName: 'Marine Drive Apartments', deliveryLocation: 'Marine Drive, Kochi', requiredDeliveryDate: '2026-09-10', additionalRequirements: 'Premium products only', remarks: '',
    items: [{ productId: 'prod-18', quantity: 60 }, { productId: 'prod-2', quantity: 45 }],
    status: 'Follow-Up', createdAt: '2026-08-08', assignedTo: 'Preethi CRM',
    timeline: [{ date: '2026-08-08', action: 'RFQ Created', by: 'Customer' }, { date: '2026-08-09', action: 'Under Review', by: 'Preethi CRM' }, { date: '2026-08-11', action: 'Quote Shared', by: 'Preethi CRM' }],
  },
];

export const quotes: Quote[] = [
  {
    id: 'qte-1', quoteNumber: 'QTE-2026-000201', rfqId: 'rfq-1', rfqNumber: 'RFQ-2026-000101', customerId: 'cust-1', customerName: 'Rajesh Kumar', companyName: 'Kumar Constructions Pvt. Ltd.', projectName: 'Andheri Office Complex',
    lineItems: [
      { productId: 'prod-1', quantity: 50, basePrice: 2800, discount: 5, tax: 18 },
      { productId: 'prod-2', quantity: 80, basePrice: 1200, discount: 5, tax: 18 },
    ],
    deliveryCharges: 5000, terms: 'Payment within 30 days. Delivery 15 working days from SO.', validUntil: '2026-09-04', status: 'Shared', createdAt: '2026-08-04', sharedAt: '2026-08-04', assignedTo: 'Arjun Sales',
  },
  {
    id: 'qte-2', quoteNumber: 'QTE-2026-000202', rfqId: 'rfq-4', rfqNumber: 'RFQ-2026-000104', customerId: 'cust-4', customerName: 'Suresh Menon', companyName: 'Menon Infrastructure', projectName: 'Perambur Industrial Park',
    lineItems: [
      { productId: 'prod-11', quantity: 100, basePrice: 6500, discount: 8, tax: 18 },
      { productId: 'prod-9', quantity: 50, basePrice: 4200, discount: 8, tax: 18 },
      { productId: 'prod-3', quantity: 25, basePrice: 8800, discount: 5, tax: 18 },
    ],
    deliveryCharges: 3000, terms: 'Payment 50% advance, 50% before dispatch.', validUntil: '2026-08-25', status: 'Accepted', createdAt: '2026-07-23', sharedAt: '2026-07-24', assignedTo: 'Arjun Sales',
  },
  {
    id: 'qte-3', quoteNumber: 'QTE-2026-000203', rfqId: 'rfq-5', rfqNumber: 'RFQ-2026-000105', customerId: 'cust-5', customerName: 'Divya Nair', companyName: 'Nair & Associates', projectName: 'Marine Drive Apartments',
    lineItems: [
      { productId: 'prod-18', quantity: 60, basePrice: 3200, discount: 7, tax: 18 },
      { productId: 'prod-2', quantity: 45, basePrice: 1200, discount: 5, tax: 18 },
    ],
    deliveryCharges: 2500, terms: 'Payment within 45 days.', validUntil: '2026-09-11', status: 'Follow-Up', createdAt: '2026-08-11', sharedAt: '2026-08-11', assignedTo: 'Preethi CRM',
  },
];

export const followUps: FollowUp[] = [
  { id: 'fu-1', quoteId: 'qte-1', quoteNumber: 'QTE-2026-000201', customerId: 'cust-1', customerName: 'Rajesh Kumar', contactPerson: 'Rajesh Kumar', method: 'WhatsApp', lastContact: '2026-08-04', nextFollowUp: '2026-08-22', status: 'Scheduled', assignedTo: 'Arjun Sales', notes: 'Customer reviewing the quote. Reminded about expiry.' },
  { id: 'fu-2', quoteId: 'qte-3', quoteNumber: 'QTE-2026-000203', customerId: 'cust-5', customerName: 'Divya Nair', contactPerson: 'Divya Nair', method: 'Phone', lastContact: '2026-08-15', nextFollowUp: '2026-08-22', status: 'Scheduled', assignedTo: 'Preethi CRM', notes: 'Needs approval from project owner.' },
  { id: 'fu-3', quoteId: 'qte-2', quoteNumber: 'QTE-2026-000202', customerId: 'cust-4', customerName: 'Suresh Menon', contactPerson: 'Suresh Menon', method: 'Email', lastContact: '2026-07-28', nextFollowUp: '2026-08-05', status: 'Completed', assignedTo: 'Arjun Sales', notes: 'SO expected. Confirmed by email.' },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1', poNumber: 'SO-2026-000301', soNumber: 'SO-2026-000301', quoteId: 'qte-2', quoteNumber: 'QTE-2026-000202', rfqNumber: 'RFQ-2026-000104', customerId: 'cust-4', customerName: 'Suresh Menon', companyName: 'Menon Infrastructure', billingAddress: '33, NH Bypass, Chennai - 600011', deliveryAddress: 'Perambur Industrial Park, Perambur, Chennai - 600011',
    lineItems: [
      { productId: 'prod-11', quantity: 100, basePrice: 6500, discount: 8, tax: 18 },
      { productId: 'prod-9', quantity: 50, basePrice: 4200, discount: 8, tax: 18 },
      { productId: 'prod-3', quantity: 25, basePrice: 8800, discount: 5, tax: 18 },
    ],
    deliveryCharges: 3000, terms: 'Payment 50% advance, 50% before dispatch.', poDate: '2026-07-27',
    dueDate: '2026-09-15', status: 'Active',
  },
];
