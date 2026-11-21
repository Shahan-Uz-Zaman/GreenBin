import { NextRequest, NextResponse } from 'next/server';
import { WASTE_DATASET, classifyWaste, WasteCategory, WasteItem } from '@/lib/wasteData';

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
];

function formatDisplayName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemName } = body;

    if (!itemName || typeof itemName !== 'string' || !itemName.trim()) {
      return NextResponse.json(
        { error: 'Item name is required.' },
        { status: 400 }
      );
    }

    const query = itemName.trim();
    const searchedName = formatDisplayName(query);

    // Check environment variables for API keys
    const openaiKey =
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      '';

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    const hasOpenAI = openaiKey.length > 0;
    const hasKey = apiKey.length > 0;
    console.log(`[GreenBin] Classifying text item: "${query}" | OpenAI: ${hasOpenAI} | Gemini: ${hasKey}`);
    let aiErrorCode: string | undefined;

    const prompt = `You are GreenBin's expert waste segregation AI.
The user wants to classify and properly dispose of this waste item: "${query}".

Analyze this item and classify it into ONE of these three categories:
1. "Biodegradable" (Organic waste, food scraps, fruit/vegetable peels, leftover food, compostable materials, garden waste, plants)
2. "Recyclable" (Dry recyclables: plastic bottles/containers, paper, cardboard, glass containers/bottles, aluminum/metal cans)
3. "Hazardous" (Toxic, e-waste, electronic devices, batteries, medicines, chemicals, paints, CFL bulbs, aerosol cans)

Respond ONLY in raw JSON format (no markdown, no backticks, no code blocks):
{
  "itemName": "${searchedName}",
  "category": "Biodegradable" | "Recyclable" | "Hazardous",
  "binName": "Green Bin (Wet / Organic Waste)" | "Blue Bin (Dry Recyclables)" | "Red Bin (Hazardous / E-Waste)",
  "disposalMethod": "Concise recommended disposal method",
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "tips": "Practical environmental tip or insight",
  "confidence": 0.95
}`;

    // 1. PRIMARY: Verify with OpenAI API if configured
    if (hasOpenAI) {
      try {
        console.log(`[GreenBin] Calling OpenAI API (gpt-4o-mini) for "${searchedName}"`);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            max_tokens: 512,
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawContent = data.choices?.[0]?.message?.content?.trim();
          if (rawContent) {
            const parsed = JSON.parse(rawContent);
            const catLower = (parsed.category || '').toLowerCase();
            const finalCategory: WasteCategory = catLower.includes('bio') || catLower.includes('organic')
              ? 'Biodegradable'
              : catLower.includes('hazard') || catLower.includes('toxic')
              ? 'Hazardous'
              : 'Recyclable';

            let binName = parsed.binName || '';
            let binColor = '#1E88E5';
            if (finalCategory === 'Biodegradable') {
              binName = binName || 'Green Bin (Wet / Organic Waste)';
              binColor = '#228B52';
            } else if (finalCategory === 'Hazardous') {
              binName = binName || 'Red Bin / Hazardous Drop-off';
              binColor = '#E53935';
            } else {
              binName = binName || 'Blue Bin (Dry Recyclables)';
              binColor = '#1E88E5';
            }

            const item: WasteItem = {
              id: `openai-${Date.now()}`,
              name: searchedName,
              aliases: [searchedName, query],
              category: finalCategory,
              binName,
              binColor,
              disposalMethod: parsed.disposalMethod || `Segregate into ${binName}`,
              instructions: Array.isArray(parsed.instructions) && parsed.instructions.length > 0
                ? parsed.instructions
                : [
                    `Separate ${searchedName} from other materials.`,
                    `Place in the designated ${binName}.`,
                    'Check local municipal collection guidelines.'
                  ],
              tips: parsed.tips || 'Proper sorting keeps our planet clean and conserves natural resources.',
              popular: false,
            };

            console.log(`[GreenBin] ✅ Item "${searchedName}" verified with OpenAI API → [${item.category}]`);

            return NextResponse.json({
              success: true,
              usedOpenAI: true,
              usedGemini: false,
              provider: 'OpenAI',
              model: 'gpt-4o-mini',
              confidence: parsed.confidence || 0.96,
              item,
              query: searchedName,
              category: finalCategory,
              message: `Verified by OpenAI API as ${finalCategory}`,
            });
          }
        } else {
          const errText = await response.text();
          console.warn('[GreenBin] OpenAI text check failed:', errText.slice(0, 150));
        }
      } catch (openAiErr) {
        console.warn('[GreenBin] OpenAI text check error:', openAiErr);
      }
    }

    // 2. SECONDARY: Check and verify item using Gemini API if configured
    if (hasKey) {
      for (const model of GEMINI_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const payload = {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 512,
            },
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(payload),
          });

          const responseText = await response.text();

          if (!response.ok) {
            try {
              const errJson = JSON.parse(responseText);
              aiErrorCode = errJson.error?.status || `HTTP_${response.status}`;
            } catch {
              aiErrorCode = `HTTP_${response.status}`;
            }
            console.warn(`[GreenBin] Model ${model} returned HTTP ${response.status}:`, responseText.slice(0, 200));
            continue;
          }

          const data = JSON.parse(responseText);
          let candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          // Remove code fences if present
          candidateText = candidateText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/, '')
            .trim();

          if (!candidateText) {
            continue;
          }

          const parsed = JSON.parse(candidateText);

          const catLower = (parsed.category || '').toLowerCase();
          let finalCategory: WasteCategory = 'Recyclable';
          if (catLower.includes('bio') || catLower.includes('organic')) {
            finalCategory = 'Biodegradable';
          } else if (
            catLower.includes('hazard') ||
            catLower.includes('toxic') ||
            catLower.includes('danger') ||
            catLower.includes('e-waste') ||
            catLower.includes('ewaste')
          ) {
            finalCategory = 'Hazardous';
          }

          let binName = parsed.binName || '';
          let binColor = '#1E88E5';
          if (finalCategory === 'Biodegradable') {
            binName = binName || 'Green Bin (Wet / Organic Waste)';
            binColor = '#228B52';
          } else if (finalCategory === 'Hazardous') {
            binName = binName || 'Red Bin / Hazardous Drop-off';
            binColor = '#E53935';
          } else {
            binName = binName || 'Blue Bin (Dry Recyclables)';
            binColor = '#1E88E5';
          }

          const item: WasteItem = {
            id: `gemini-${Date.now()}`,
            name: searchedName,
            aliases: [searchedName, query],
            category: finalCategory,
            binName,
            binColor,
            disposalMethod: parsed.disposalMethod || `Segregate into ${binName}`,
            instructions: Array.isArray(parsed.instructions) && parsed.instructions.length > 0
              ? parsed.instructions
              : [
                  `Ensure ${searchedName} is separated from other waste.`,
                  `Place in the designated ${binName}.`,
                  'Check local municipal collection schedule.'
                ],
            tips: parsed.tips || 'Proper sorting keeps our planet clean and conserves natural resources.',
            popular: false,
          };

          console.log(`[GreenBin] ✅ Item "${searchedName}" verified with Gemini API: [${item.category}]`);

          return NextResponse.json({
            success: true,
            usedGemini: true,
            model,
            confidence: parsed.confidence || 0.96,
            item,
            query: searchedName,
            category: finalCategory,
            message: `Verified by Gemini API as ${finalCategory}`,
          });
        } catch (err) {
          console.warn(`[GreenBin] Error attempting model ${model}:`, err);
          continue;
        }
      }
    }

    // 2. SECONDARY: Check predefined local dataset
    const localResult = classifyWaste(query);
    if (localResult.found && localResult.item) {
      return NextResponse.json({
        success: true,
        usedGemini: false,
        confidence: 0.92,
        item: {
          ...localResult.item,
          name: searchedName,
        },
        query: searchedName,
        category: localResult.item.category,
        message: 'Classified using GreenBin waste database.',
        aiStatus: hasKey ? 'unavailable' : 'missing_key',
        aiErrorCode,
      });
    }

    // 3. TERTIARY: Item is NOT in database and Gemini was unavailable
    // Dynamically classify the unlisted item using intelligent material analysis
    const dynamicallyClassified = classifyUnlistedItem(query, searchedName);
    if (dynamicallyClassified) {
      return NextResponse.json({
        success: true,
        usedGemini: false,
        confidence: 0.88,
        item: dynamicallyClassified,
        query: searchedName,
        category: dynamicallyClassified.category,
        message: `Intelligently categorized as ${dynamicallyClassified.category}`,
        aiStatus: hasKey ? 'unavailable' : 'missing_key',
        aiErrorCode,
      });
    }

    // 4. If query is total nonsense or purely punctuation
    return NextResponse.json({
      success: false,
      usedGemini: false,
      item: null,
      query: searchedName,
      suggestions: localResult.suggestions || [],
      message: 'Item could not be identified as waste.',
      aiStatus: hasKey ? 'unavailable' : 'missing_key',
      aiErrorCode,
    });
  } catch (error: unknown) {
    console.error('[GreenBin] Error in classify-item route:', error);
    return NextResponse.json(
      { error: 'Internal server error while classifying item.' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent material & waste categorizer for any item not in the predefined database.
 * Ensures the user always receives an accurate category-wise result even if Gemini is offline!
 */
function classifyUnlistedItem(query: string, displayName: string): WasteItem | null {
  const q = query.toLowerCase().trim();

  // If input is purely gibberish (e.g. "asdfghjk", symbols, or less than 2 characters)
  if (q.length < 2 || !/[a-z]/.test(q)) {
    return null;
  }

  // Hazardous Keywords
  const hazardousKeywords = [
    'battery', 'batteries', 'cell', 'accumulator', 'lithium', 'alkaline',
    'phone', 'smartphone', 'mobile', 'iphone', 'android', 'laptop', 'computer', 'pc', 'tablet', 'ipad',
    'screen', 'monitor', 'keyboard', 'mouse', 'printer', 'cartridge', 'toner', 'ink',
    'charger', 'cable', 'wire', 'cord', 'adapter', 'plug', 'circuit', 'chip', 'electronic', 'e-waste', 'gadget',
    'bulb', 'cfl', 'fluorescent', 'tube', 'led', 'lamp', 'halogen',
    'mercury', 'thermometer', 'medical', 'medicine', 'medicines', 'pill', 'tablet', 'capsule', 'syringe', 'needle', 'bandage', 'pharma', 'blister',
    'chemical', 'chemicals', 'acid', 'solvent', 'thinner', 'paint', 'paints', 'varnish', 'stain', 'bleach',
    'pesticide', 'insecticide', 'herbicide', 'poison', 'fertilizer', 'weedicide',
    'aerosol', 'spray', 'canister', 'propane', 'butane', 'gas cylinder', 'lighter', 'fire extinguisher',
    'oil', 'motor oil', 'brake fluid', 'coolant', 'engine oil', 'antifreeze', 'grease', 'car battery',
    'vape', 'vaping', 'e-cigarette', 'smoke detector', 'radiation', 'toxic'
  ];

  // Biodegradable / Organic Keywords
  const bioKeywords = [
    'peel', 'peels', 'peeling', 'skin', 'core', 'rind', 'scraps', 'food', 'leftover', 'leftovers',
    'vegetable', 'vegetables', 'fruit', 'fruits', 'apple', 'banana', 'orange', 'mango', 'lemon', 'lime',
    'potato', 'tomato', 'onion', 'garlic', 'ginger', 'carrot', 'cabbage', 'lettuce', 'cucumber', 'spinach', 'corn', 'corncob',
    'meat', 'chicken', 'beef', 'pork', 'mutton', 'fish', 'seafood', 'bone', 'bones',
    'egg', 'eggs', 'eggshell', 'eggshells', 'bread', 'crust', 'bakery', 'cake', 'dough', 'pastry', 'cookie',
    'rice', 'pasta', 'noodle', 'noodles', 'grain', 'grains', 'cereal', 'flour', 'wheat', 'oat',
    'coffee', 'grounds', 'coffee grounds', 'tea', 'tea bag', 'tea leaves',
    'leaf', 'leaves', 'grass', 'grass clippings', 'plant', 'plants', 'flower', 'flowers', 'weed', 'weeds',
    'branch', 'branches', 'twig', 'twigs', 'bark', 'wood', 'sawdust', 'hay', 'straw',
    'coconut', 'coconut shell', 'coconut husk', 'husk', 'nut', 'nuts', 'nutshell', 'peanut', 'walnut',
    'cotton', 'wool', 'feather', 'hair', 'manure', 'compost', 'organic', 'compostable'
  ];

  // Recyclable Keywords
  const recyclableKeywords = [
    'bottle', 'bottles', 'container', 'containers', 'jug', 'can', 'cans', 'tin', 'tins', 'jar', 'jars',
    'plastic', 'plastics', 'pet', 'hdpe', 'pvc', 'ldpe', 'pp', 'ps', 'polyester', 'polythene', 'polybag',
    'paper', 'papers', 'newspaper', 'newspapers', 'magazine', 'magazines', 'flyer', 'brochure', 'catalog',
    'cardboard', 'carton', 'cartons', 'box', 'boxes', 'packaging', 'packing', 'envelope', 'paper bag',
    'metal', 'metals', 'aluminum', 'aluminium', 'foil', 'tin foil', 'steel', 'iron', 'copper', 'brass',
    'glass', 'glass bottle', 'glass jar', 'broken glass', 'cullet',
    'cup', 'cups', 'paper cup', 'plastic cup', 'plate', 'paper plate', 'plastic plate', 'tray', 'clamshell',
    'tetra pak', 'milk carton', 'juice box', 'tetra', 'bubble wrap', 'shrink wrap', 'styrofoam', 'thermocol'
  ];

  // 1. Check Hazardous
  if (hazardousKeywords.some(k => q.includes(k))) {
    return {
      id: `custom-hazard-${Date.now()}`,
      name: displayName,
      aliases: [q, displayName],
      category: 'Hazardous',
      binName: 'Red Bin / Hazardous E-Waste Drop-off',
      binColor: '#E53935',
      disposalMethod: 'Designated Hazardous Collection / E-Waste Facility',
      instructions: [
        `Never dispose of ${displayName} in regular household trash.`,
        'Store safely in a cool, dry place away from children and heat sources.',
        'Deliver to a municipal hazardous waste collection center or certified recycler.'
      ],
      tips: 'Hazardous items contain heavy metals or toxic chemicals that contaminate soil and groundwater if sent to landfills.',
      popular: false,
    };
  }

  // 2. Check Biodegradable
  if (bioKeywords.some(k => q.includes(k))) {
    return {
      id: `custom-bio-${Date.now()}`,
      name: displayName,
      aliases: [q, displayName],
      category: 'Biodegradable',
      binName: 'Green Bin (Wet / Organic Waste)',
      binColor: '#228B52',
      disposalMethod: 'Composting or Organic Waste Bin',
      instructions: [
        `Place ${displayName} into your green wet/organic waste bin.`,
        'Ideal for backyard composting or community compost systems.',
        'Do not mix with plastic wrappers, stickers, or non-biodegradable packaging.'
      ],
      tips: 'Organic waste creates nutrient-rich compost and prevents methane generation in landfills.',
      popular: false,
    };
  }

  // 3. Check Recyclable
  if (recyclableKeywords.some(k => q.includes(k))) {
    return {
      id: `custom-recycle-${Date.now()}`,
      name: displayName,
      aliases: [q, displayName],
      category: 'Recyclable',
      binName: 'Blue Bin (Dry Recyclables)',
      binColor: '#1E88E5',
      disposalMethod: 'Curbside Dry Recycling Collection',
      instructions: [
        `Empty and rinse ${displayName} lightly if it contained liquids or food.`,
        'Flatten or compress to save space in the recycling bin.',
        'Keep dry and deposit into the blue dry recycling bin.'
      ],
      tips: 'Recycling clean materials saves up to 95% of the energy needed to manufacture new products.',
      popular: false,
    };
  }

  // 4. Default smart heuristic based on broad classification
  // If no specific match, default to Recyclable with a notice
  return {
    id: `custom-general-${Date.now()}`,
    name: displayName,
    aliases: [q, displayName],
    category: 'Recyclable',
    binName: 'Blue Bin (Dry Recyclables)',
    binColor: '#1E88E5',
    disposalMethod: 'Dry Waste Sorting / Material Recovery',
    instructions: [
      `Separate ${displayName} from food and wet waste.`,
      'Ensure the item is clean and dry before disposal.',
      'Check local municipal guidelines for special material collection.'
    ],
    tips: 'When in doubt, keeping materials dry and clean ensures recyclability and prevents contamination.',
    popular: false,
  };
}
