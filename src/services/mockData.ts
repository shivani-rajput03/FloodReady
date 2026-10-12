import { ShelterFacility, SafetyGuideSection } from '../types';

export const SAMPLE_SHELTERS: ShelterFacility[] = [
  {
    id: 'shelter-01',
    name: 'Government Multi-Purpose Cyclone & Flood Shelter',
    category: 'shelter',
    address: 'Sector 8 Community Complex, Near State Highway Ring Road',
    latitude: 26.1820,
    longitude: 91.7580,
    contactPhone: '+91 361 2237001',
    capacity: {
      total: 650,
      available: 240
    },
    status: 'open',
    isVerified: true,
    verifiedBy: 'State Disaster Management Authority (SDMA) Field Team',
    lastVerificationTime: '2026-10-10T19:30:00Z',
    accessibilityFeatures: [
      'Wheelchair ramp access',
      'Dedicated female & infant quarters',
      'On-site paramedic booth',
      'Auxiliary diesel power backup'
    ],
    servicesProvided: [
      'Safe drinking water (RO purified)',
      'Community kitchen (cooked hot meals)',
      'Clean bedding & tarpaulin',
      'Mobile charging hub'
    ],
    notes: 'Elevated plinth above 100-year flood line. Elevated cattle shelter adjacent.'
  },
  {
    id: 'hospital-01',
    name: 'District Civil Hospital (Emergency Trauma Wing)',
    category: 'hospital',
    address: 'Hospital Road, Civil Lines',
    latitude: 26.1950,
    longitude: 91.7450,
    contactPhone: '+91 108',
    capacity: {
      total: 350,
      available: 48
    },
    status: 'open',
    isVerified: true,
    verifiedBy: 'National Health Mission & District Magistrate Office',
    lastVerificationTime: '2026-10-10T21:15:00Z',
    accessibilityFeatures: [
      'Full ADA / Wheelchair accessibility',
      '24/7 ICU & Neonatal Unit',
      'Anti-venom & Waterborne disease prophylactic stock',
      'Oxygen generation on premises'
    ],
    servicesProvided: [
      '24/7 Emergency triage',
      'Ambulance boat & amphibious dispatch',
      'Maternal & emergency surgical care'
    ],
    notes: 'Operating normally. Backup generator positioned on 1st floor.'
  },
  {
    id: 'relief-01',
    name: 'Red Cross Flood Relief & Water Distribution Camp',
    category: 'relief_camp',
    address: 'Railway Higher Secondary School Grounds',
    latitude: 26.1700,
    longitude: 91.7700,
    contactPhone: '+91 94350 11223',
    capacity: {
      total: 400,
      available: 110
    },
    status: 'open',
    isVerified: true,
    verifiedBy: 'Indian Red Cross Society & Civil Defense',
    lastVerificationTime: '2026-10-10T18:00:00Z',
    accessibilityFeatures: [
      'Level ground entrance',
      'Sign language volunteer on site'
    ],
    servicesProvided: [
      'Water purification tablets (Chlorine/Halazone)',
      'Dry ration packets & baby food',
      'Sanitary hygiene kits'
    ],
    notes: 'Distributing clean 20L water carboys daily between 07:00 and 19:00.'
  },
  {
    id: 'sandbag-01',
    name: 'Municipal Engineering Yard - Sandbags & De-Watering Pumps',
    category: 'sandbags',
    address: 'Municipal Corporation Depot, Drain Canal Gate 3',
    latitude: 26.1620,
    longitude: 91.7350,
    contactPhone: '+91 361 2456789',
    capacity: {
      total: 5000,
      available: 1850
    },
    status: 'open',
    isVerified: true,
    verifiedBy: 'Public Works Dept (PWD) Emergency Division',
    lastVerificationTime: '2026-10-10T20:45:00Z',
    accessibilityFeatures: [
      'Drive-through truck/pickup loading'
    ],
    servicesProvided: [
      'Pre-filled polywoven sandbags (Max 25 per household)',
      'Portable petrol pump checkout for submerged basements',
      'Geo-textile fabric sheets'
    ],
    notes: 'Bring proof of residence for bulk emergency barrier allocation.'
  },
  {
    id: 'pharmacy-01',
    name: 'Jan Aushadhi 24/7 Essential Medicine Hub',
    category: 'pharmacy',
    address: 'Main Market Square, High Plinth Commercial Building',
    latitude: 26.1880,
    longitude: 91.7610,
    contactPhone: '+91 98640 44321',
    status: 'open',
    isVerified: true,
    verifiedBy: 'State Pharmacy Council',
    lastVerificationTime: '2026-10-10T17:30:00Z',
    accessibilityFeatures: [
      'Step-free ramp entry'
    ],
    servicesProvided: [
      'Insulin cold-chain preservation',
      'ORS (Oral Rehydration Salts)',
      'Waterproof medicine pouching'
    ],
    notes: 'Refrigerated medicine storage operating on solar inverter backup.'
  }
];

export const SAFETY_GUIDES: SafetyGuideSection[] = [
  {
    id: 'prep-before',
    title: 'Before a Flood: Household Preparation & Go-Bag',
    stage: 'before',
    source: 'NDMA Sachet disaster preparedness guidance; verify local instructions',
    reviewedDate: 'October 2026 (content review)',
    offlineAvailable: true,
    priorityActions: [
      'Assemble a grab-and-go waterproof emergency kit for at least 72 hours.',
      'Elevate essential appliances, electrical switchboards, and boilers above the flood line.',
      'Digitize and seal legal deeds, passports, IDs, and insurance papers in a watertight bag.',
      'Clear perimeter storm gutters and inspect non-return backflow valves on sewage lines.'
    ],
    detailedInstructions: [
      'Go-Bag Checklist: 3 liters drinking water per person per day, high-calorie non-perishable food, multi-tool, waterproof torch, whistle, power bank, first-aid kit, and 7-day supply of personal medications.',
      'Family Communications: Designate an out-of-district contact whom everyone can text if local cellular voice lines get congested.',
      'Pet Protection: Prepare carriers, leashes, collar IDs, and at least 3 days of pet food. Not all general relief centers admit pets, so verify animal-friendly shelters ahead of time.'
    ]
  },
  {
    id: 'during-response',
    title: 'During a Flood: Urgent Life-Safety Rules',
    stage: 'during',
    source: 'NDMA Sachet flood/cyclone guidance and Ready.gov flood safety guidance',
    reviewedDate: 'October 2026 (content review)',
    offlineAvailable: true,
    priorityActions: [
      'TURN AROUND, DON\'T DROWN: Never walk, swim, or drive through moving water.',
      'Fast-moving water can knock a person down; around 1 foot (30 cm) of moving water can sweep many vehicles away. Depth can be difficult to judge—never enter or drive through floodwater.',
      'Do not touch wet electrical equipment or stand in water while near electrical systems. Turn off utilities only if you can do so safely without entering floodwater or delaying evacuation; otherwise leave and contact responders.',
      'If trapped in a building, move to the highest level. DO NOT climb into an enclosed attic without an exterior roof exit.'
    ],
    detailedInstructions: [
      'Hidden Hazards: Floodwater contains hidden submerged sharp debris, open manholes, high electrical leakage (snapped wires), oil, and biological sewage contamination.',
      'If floodwater traps your vehicle: Do not drive through floodwater. If rapidly moving water traps the vehicle, general flood guidance advises staying inside; if water rises inside, move to the roof and signal for help if you can do so safely. Follow emergency responders’ instructions. Do not enter moving water to escape unless staying in the vehicle presents an immediate greater danger.',
      'Do not consume tap water or open well water until the municipality issues an official potability all-clear.'
    ]
  },
  {
    id: 'evac-decision',
    title: 'Evacuation & Sheltering Protocols',
    stage: 'evacuation',
    source: 'NDMA Sachet disaster preparedness guidance; follow district/state authority directions',
    reviewedDate: 'October 2026 (content review)',
    offlineAvailable: true,
    priorityActions: [
      'Leave immediately when official evacuation orders are issued by local authorities.',
      'Follow officially designated evacuation corridors; shortcuts may have washed-out culverts.',
      'Inform a designated relative or check-in via the FloodReady emergency check-in tool before moving.'
    ],
    detailedInstructions: [
      'Lock exterior windows and doors before leaving if time safely permits.',
      'Wear sturdy closed-toe shoes and waterproof outer gear.',
      'Carry your identification, prescriptions, phone charger, and emergency cash.'
    ]
  },
  {
    id: 'health-sanitation',
    title: 'Sanitation, Water Purification & Medical Health',
    stage: 'health_sanitation',
    source: 'CDC emergency water guidance and local public-health advisories',
    reviewedDate: 'October 2026 (content review)',
    offlineAvailable: true,
    priorityActions: [
      'During a boil-water advisory, use bottled water if available. Otherwise bring clear water to a rolling boil for 1 minute (3 minutes above 6,500 ft / about 2,000 m), let it cool, and store it in a clean covered container. Follow local health advice; boiling does not remove fuel or toxic chemicals.',
      'Never allow open cuts or sores to make contact with flood water to prevent Leptospirosis and bacterial infections.',
      'Discard any food, spices, or opened medicines that came into contact with floodwaters.'
    ],
    detailedInstructions: [
      'Water Treatment: If water is cloudy, let it settle and filter it through a clean cloth before boiling. Use water-treatment tablets only exactly as their label and local health authorities instruct. Boiling or disinfection cannot make water containing fuel or toxic chemicals safe.',
      'Mosquito & Vector Control: Wear long sleeves, sleep under treated nets, and drain stagnant indoor pooling where mosquitoes breed.',
      'Snake & Insect Caution: In flood conditions, reptiles seek higher dry ground in attics, furniture, and verandahs. Use a stick to probe dark corners.'
    ]
  },
  {
    id: 'recovery-after',
    title: 'After the Flood: Safe Return & Recovery Documentation',
    stage: 'after',
    source: 'NDMA disaster preparedness guidance; local authority and qualified electrician instructions',
    reviewedDate: 'October 2026 (content review)',
    offlineAvailable: true,
    priorityActions: [
      'Return home ONLY when local civil authorities officially declare the area safe.',
      'Do not switch on or touch electrical systems that have been wet or damaged. Have them inspected by a qualified electrician before power is restored.',
      'Take clear photos and video of all structural watermarks, damaged belongings, and receipts for insurance and government relief claims.'
    ],
    detailedInstructions: [
      'Gas Leaks: If you smell gas or hear a hissing noise, exit the building immediately and alert emergency response from a safe distance.',
      'Mold and cleanup: Start safe drying and cleanup as soon as conditions allow, ideally within 24–48 hours. Wear appropriate protective gear, avoid damaged buildings and contaminated floodwater, and seek professional help for extensive damage.',
      'Disposal: Bag spoiled perishables separately. Place water-damaged heavy furniture on curbs according to municipality sanitation pickup schedules.'
    ]
  }
];

export const OFFICIAL_EMERGENCY_NUMBERS = [
  { name: 'National Emergency Helpline (All-in-One)', number: '112', description: 'Police, Fire, Medical, Disaster dispatch' },
  { name: 'NDRF Disaster Response Headquarters', number: '1078', description: 'National Disaster Response Force Rescue' },
  { name: 'Disaster Management Helpline (State)', number: '1070', description: 'State Emergency Operations Center' },
  { name: 'Ambulance & Medical Emergency', number: '108', description: 'Government emergency ambulance service' },
  { name: 'Fire Emergency Service', number: '101', description: 'Firefighting and water rescue' },
  { name: 'Women & Child Helpline', number: '1091', description: 'Dedicated women protection services' }
];
