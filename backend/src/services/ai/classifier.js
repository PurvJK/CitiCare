import { createGeminiTextCompletion } from './gemini.js';

/**
 * Classifies a complaint based on its title and description using Gemini.
 * Maps it to the best matching category and department ID from the database.
 * 
 * @param {Object} params
 * @param {string} params.title - Complaint title
 * @param {string} params.description - Complaint description
 * @param {Array} params.departments - Array of departments populated from DB ({ id, name, category })
 * @returns {Promise<Object>} The classification result
 */
export async function generateClassification({ title, description, departments }) {
  const systemPrompt = `You are a Smart City civic classifier. Your goal is to analyze a citizen's complaint title and description, and determine the most appropriate complaint category and department from the provided list.

Categories available:
- roads (Roads & Streets, potholes, dividers, pavements, broken roads)
- water (Water Supply, leaks, drainage water contamination, pipeline damage)
- electricity (Electricity, power cuts, spark, transformer, electrical wires)
- garbage (Waste & Garbage, cleaning, overflowing bin, open trash)
- sewage (Sewage & Drainage, pipeline leakage, drainage block, sewage overflow)
- street_lights (Street Lights, broken lamp, dark poles, street light not working)
- parks (Parks & Gardens, pruning trees, damaged park equipment, public gardens)
- other (Default category for issues not covered by above)

Departments available:
${JSON.stringify(departments, null, 2)}

Instructions:
1. Examine the title and description carefully.
2. Select the single best matching category code (e.g. "street_lights", "water", "roads") from the list above.
3. Select the single best matching department ID from the provided departments list based on their name and category matching.
4. Output the result strictly as a JSON object with the following fields:
{
  "category": "roads" | "water" | "electricity" | "garbage" | "sewage" | "street_lights" | "parks" | "other",
  "department_id": "string (the matching department's ID or null)",
  "confidence": 0.0 to 1.0 (float representing your match confidence)
}
5. Do not write any other explanations, formatting, markdown code blocks, or HTML. Return ONLY the raw JSON object.`;

  const userPrompt = `Complaint Details:
Title: ${title}
Description: ${description}`;

  try {
    const { content } = await createGeminiTextCompletion(systemPrompt, userPrompt);
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('[Classifier] Failed to parse standard JSON, attempting regex cleanup on:', content);
      const cleaned = content.replace(/```json/i, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }
    
    return {
      category: parsed.category || 'other',
      department_id: parsed.department_id || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch (error) {
    console.error('[ClassifierService] Error generating classification:', error.message);
    throw error;
  }
}
