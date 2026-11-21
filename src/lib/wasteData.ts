export type WasteCategory = 'Biodegradable' | 'Recyclable' | 'Hazardous';

export interface WasteItem {
  id: string;
  name: string;
  aliases: string[];
  category: WasteCategory;
  binName: string;
  binColor: string;
  disposalMethod: string;
  instructions: string[];
  tips?: string;
  popular?: boolean;
}

export const WASTE_DATASET: WasteItem[] = [
  // Biodegradable / Organic
  {
    id: 'banana-peel',
    name: 'Banana Peel',
    aliases: ['banana', 'banana skin', 'fruit peel', 'fruit skin', 'fruit waste'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Composting or Organic Waste Collection',
    instructions: [
      'Place directly into the green organic waste bin.',
      'Can be composted at home or added to community compost pits.',
      'Do not mix with plastic wrappers or fruit stickers.'
    ],
    tips: 'Fruit peels enrich soil with potassium and nitrogen when decomposed naturally.',
    popular: true
  },
  {
    id: 'apple-core',
    name: 'Apple Core',
    aliases: ['apple', 'apple scraps', 'fruit core'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Composting or Organic Waste Collection',
    instructions: [
      'Deposit in the green organic compost bin.',
      'Remove any non-biodegradable brand stickers before discarding.'
    ],
    popular: false
  },
  {
    id: 'vegetable-scraps',
    name: 'Vegetable Scraps & Peelings',
    aliases: ['vegetable', 'potato skin', 'carrot peel', 'onion skin', 'veggie scraps', 'kitchen waste', 'food waste'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Home Composting or Wet Waste Collection',
    instructions: [
      'Collect in a compostable or paper-lined kitchen bin.',
      'Keep free from plastic bags, twist ties, and stickers.',
      'Transfer to municipal wet waste bins or compost piles.'
    ],
    tips: 'Ideal for making nutrient-dense compost for home gardens.',
    popular: true
  },
  {
    id: 'coffee-grounds',
    name: 'Coffee Grounds & Tea Leaves',
    aliases: ['coffee', 'tea leaves', 'used tea', 'tea bags', 'coffee filter'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Compost Bin or Garden Soil Enrichment',
    instructions: [
      'Empty grounds and loose tea leaves into the organic bin.',
      'Check tea bags: remove non-biodegradable staple pins and synthetic mesh bags.',
      'Can be spread directly around acid-loving garden plants.'
    ],
    popular: false
  },
  {
    id: 'egg-shells',
    name: 'Eggshells',
    aliases: ['egg shell', 'eggshell', 'egg shells'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Composting or Soil Amendment',
    instructions: [
      'Crush lightly to speed up natural breakdown.',
      'Add to green organic bin or compost tumbler.'
    ],
    popular: false
  },
  {
    id: 'leftover-food',
    name: 'Leftover Cooked Food',
    aliases: ['food scraps', 'leftovers', 'cooked rice', 'bread', 'stale bread', 'curry'],
    category: 'Biodegradable',
    binName: 'Green Bin (Wet / Organic Waste)',
    binColor: '#228B52',
    disposalMethod: 'Wet Waste Processing / Bio-methanation',
    instructions: [
      'Drain excess gravies or liquids if possible.',
      'Place in the wet waste container for municipal bio-gas recovery.',
      'Never discard inside sealed plastic carry bags.'
    ],
    popular: true
  },
  {
    id: 'dry-leaves',
    name: 'Dry Leaves & Garden Clippings',
    aliases: ['leaves', 'grass', 'garden waste', 'prunings', 'twigs', 'flowers'],
    category: 'Biodegradable',
    binName: 'Green Bin (Yard / Garden Waste)',
    binColor: '#228B52',
    disposalMethod: 'Compost Pit or Yard Waste Collection',
    instructions: [
      'Keep separate from building rubble and plastics.',
      'Can be mixed with wet kitchen waste as brown carbon-rich matter for optimal composting.'
    ],
    popular: false
  },

  // Recyclable / Dry
  {
    id: 'plastic-bottle',
    name: 'Plastic Water / Beverage Bottle (PET)',
    aliases: ['plastic bottle', 'water bottle', 'coke bottle', 'soda bottle', 'pet bottle', 'plastic container'],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Curbside Recycling / Plastic Drop-off',
    instructions: [
      'Empty all remaining liquids completely.',
      'Rinse lightly if sticky.',
      'Crush or flatten the bottle to save collection space.',
      'Re-attach the plastic cap to ensure it also gets recycled.'
    ],
    tips: 'PET #1 plastics are high-demand materials for yarn, polyester fabric, and new food-grade containers.',
    popular: true
  },
  {
    id: 'newspaper',
    name: 'Newspaper & Paper Sheets',
    aliases: ['newspaper', 'paper', 'office paper', 'magazines', 'flyers', 'notebook'],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Dry Paper Recycling',
    instructions: [
      'Keep dry and clean; wet or food-soiled paper cannot be recycled.',
      'Remove metal paperclips, spiral binders, or plastic laminates.',
      'Bundle neatly and place into the blue dry recycling bin.'
    ],
    tips: 'Recycling one ton of paper saves up to 17 mature trees and 7,000 gallons of water.',
    popular: true
  },
  {
    id: 'aluminum-can',
    name: 'Aluminum Soda Can / Tin Can',
    aliases: ['aluminum can', 'soda can', 'coke can', 'tin can', 'canned food', 'beverage can'],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Metal Recycling Facility',
    instructions: [
      'Ensure the can is empty and rinsed of sugary or oily contents.',
      'Can be crushed to save bin volume.',
      'Deposit in the dry recycling bin.'
    ],
    tips: 'Aluminum is infinitely recyclable without losing its structural strength.',
    popular: true
  },
  {
    id: 'cardboard-box',
    name: 'Cardboard Box / Packaging Carton',
    aliases: ['cardboard', 'carton', 'shipping box', 'amazon box', 'corrugated box'],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Cardboard & Paper Recycling',
    instructions: [
      'Flatten all boxes completely before disposal.',
      'Remove excess packing tape, styrofoam, and bubble wrap.',
      'Ensure it is free from grease, oil, or food contamination.'
    ],
    popular: true
  },
  {
    id: 'glass-bottle',
    name: 'Glass Bottle / Jar',
    aliases: ['glass bottle', 'glass jar', 'jam jar', 'wine bottle', 'pickle jar', 'glass'],
    category: 'Recyclable',
    binName: 'Blue Bin (Glass & Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Glass Recycling Collection',
    instructions: [
      'Rinse out food residue and dry.',
      'Separate metal or plastic caps and lids.',
      'Do not break the bottle; intact glass is safer and easier to sort at recycling centers.'
    ],
    tips: 'Note: Window panes, ceramics, and mirrors have different melting points and belong in non-recyclable solid waste.',
    popular: true
  },
  {
    id: 'milk-carton',
    name: 'Milk / Juice Carton (Tetra Pak)',
    aliases: ['milk carton', 'tetra pak', 'juice carton', 'tetrapack', 'almond milk carton'],
    category: 'Recyclable',
    binName: 'Blue Bin (Composite Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Aseptic Carton Recycling',
    instructions: [
      'Empty all liquid and rinse thoroughly.',
      'Flatten the carton to conserve space.',
      'Push plastic straw or screw plastic cap on before recycling.'
    ],
    popular: false
  },
  {
    id: 'shampoo-bottle',
    name: 'Shampoo / Detergent Bottle (HDPE)',
    aliases: ['shampoo bottle', 'conditioner bottle', 'detergent bottle', 'lotion bottle', 'hdpe'],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Rigid Plastics Recycling',
    instructions: [
      'Pump out remaining shampoo or soap.',
      'Rinse with water.',
      'Recycle bottle in the blue bin. Discard trigger sprayers containing internal metal springs if not accepted locally.'
    ],
    popular: false
  },

  // Hazardous & Special Waste
  {
    id: 'household-battery',
    name: 'Battery (AA, AAA, Lithium, Button Cell)',
    aliases: ['battery', 'batteries', 'aa battery', 'aaa battery', 'lithium battery', 'phone battery'],
    category: 'Hazardous',
    binName: 'Red Bin / Hazardous E-Waste Drop-off',
    binColor: '#E53935',
    disposalMethod: 'Dedicated Battery Collection Point / E-Waste Drive',
    instructions: [
      'NEVER throw batteries into standard trash or wet waste bins.',
      'Tape the positive (+) and negative (-) terminals with clear scotch tape to prevent short circuits.',
      'Store in a cool, dry plastic container until dropping off at an electronics store or hazardous waste kiosk.'
    ],
    tips: 'Batteries contain heavy metals like cadmium, mercury, and lead which can leach into groundwater if landfilled.',
    popular: true
  },
  {
    id: 'expired-medicine',
    name: 'Expired Medicine & Pharmaceuticals',
    aliases: ['medicine', 'expired medicine', 'pills', 'syrup', 'drugs', 'capsules', 'tablets'],
    category: 'Hazardous',
    binName: 'Red Bin / Pharmacy Take-Back Drop Box',
    binColor: '#E53935',
    disposalMethod: 'Pharmacy Drug Take-Back Program',
    instructions: [
      'Do NOT flush medicines down the toilet or wash them into sinks.',
      'Return unused medications in original blister packs to hospital or pharmacy take-back bins.',
      'Scratch out personal patient details on prescription labels.'
    ],
    tips: 'Flushed medications contaminate aquatic ecosystems and water reservoirs.',
    popular: true
  },
  {
    id: 'paint-chemicals',
    name: 'Paint Cans, Solvents & Thinners',
    aliases: ['paint', 'paint can', 'thinner', 'turpentine', 'varnish', 'chemical', 'bleach'],
    category: 'Hazardous',
    binName: 'Red Bin / Hazardous Waste Depot',
    binColor: '#E53935',
    disposalMethod: 'Municipal Hazardous Waste Facility',
    instructions: [
      'Do not pour down domestic drains or storm sewers.',
      'Keep tightly sealed in original labeled containers.',
      'Take to a designated local household hazardous waste (HHW) drop-off center.'
    ],
    popular: false
  },
  {
    id: 'fluorescent-tube',
    name: 'Fluorescent Bulb & CFL Lamp',
    aliases: ['light bulb', 'cfl', 'fluorescent tube', 'tube light', 'bulb'],
    category: 'Hazardous',
    binName: 'Red Bin / Special Glass & Mercury Collection',
    binColor: '#E53935',
    disposalMethod: 'Hardware Store or Toxic Waste Drop-off',
    instructions: [
      'Wrap carefully in newspaper or bubble wrap to prevent accidental breakage.',
      'Contains small amounts of toxic mercury vapor; handle with extreme care.',
      'Deliver intact to specialized collection centers.'
    ],
    popular: false
  },
  {
    id: 'e-waste',
    name: 'Old Smartphone / Electronic Charger / Cables',
    aliases: ['phone', 'smartphone', 'charger', 'cables', 'broken phone', 'electronics', 'e-waste', 'laptop', 'mouse'],
    category: 'Hazardous',
    binName: 'Dedicated E-Waste Bin',
    binColor: '#E53935',
    disposalMethod: 'Authorized E-Waste Recycler',
    instructions: [
      'Factory reset and wipe personal private data from devices.',
      'Keep separate from municipal household solid waste.',
      'Drop off at certified electronic waste recycling points or brand exchange kiosks.'
    ],
    popular: true
  },
  {
    id: 'pesticide-spray',
    name: 'Insecticide & Pesticide Spray Can',
    aliases: ['pesticide', 'insecticide', 'bug spray', 'fertilizer chemical', 'weed killer'],
    category: 'Hazardous',
    binName: 'Red Bin / Hazardous Chemical Waste',
    binColor: '#E53935',
    disposalMethod: 'Toxic Waste Disposal Depot',
    instructions: [
      'Do not puncture or incinerate spray cans even when empty.',
      'Deliver to hazardous municipal collection sites.'
    ],
    popular: false
  }
];

export interface ClassificationResult {
  found: boolean;
  item?: WasteItem;
  query: string;
  matchedBy?: 'exact' | 'alias' | 'partial';
  suggestions?: WasteItem[];
}

export function classifyWaste(query: string): ClassificationResult {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return { found: false, query };
  }

  // 1. Direct name match
  const exact = WASTE_DATASET.find(item => item.name.toLowerCase() === trimmed);
  if (exact) {
    return { found: true, item: exact, query, matchedBy: 'exact' };
  }

  // 2. Exact alias match
  const aliasMatch = WASTE_DATASET.find(item =>
    item.aliases.some(alias => alias.toLowerCase() === trimmed)
  );
  if (aliasMatch) {
    return { found: true, item: aliasMatch, query, matchedBy: 'alias' };
  }

  // 3. Substring match in name or aliases
  const partial = WASTE_DATASET.find(item =>
    item.name.toLowerCase().includes(trimmed) ||
    item.aliases.some(alias => alias.toLowerCase().includes(trimmed) || trimmed.includes(alias.toLowerCase()))
  );
  if (partial) {
    return { found: true, item: partial, query, matchedBy: 'partial' };
  }

  // 4. Token match (e.g. user typed "plastic drinking bottle")
  const tokens = trimmed.split(/\s+/).filter(t => t.length > 2);
  if (tokens.length > 0) {
    const tokenMatch = WASTE_DATASET.find(item => {
      const allText = `${item.name} ${item.aliases.join(' ')}`.toLowerCase();
      return tokens.some(t => allText.includes(t));
    });
    if (tokenMatch) {
      return { found: true, item: tokenMatch, query, matchedBy: 'partial' };
    }
  }

  // Unsupported item: Return not found and provide sample popular suggestions
  const suggestions = WASTE_DATASET.filter(item => item.popular).slice(0, 4);
  return {
    found: false,
    query,
    suggestions
  };
}
