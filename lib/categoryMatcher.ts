// lib/categoryMatcher.ts
// Fuzzy matching for transaction categories

import { CARBON_COEFFICIENTS } from './carbonCoefficients';

export interface CategoryMatch {
  matched: boolean;
  category: string;
  confidence: number;
  suggestions: string[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  air_travel: ['flight', 'airline', 'air', 'plane', 'aviation', 'ticket', 'travel', 'trip'],
  road_freight: ['truck', 'courier', 'delivery', 'freight', 'logistics', 'shipping', 'van', 'transport'],
  sea_freight: ['ship', 'ocean', 'port', 'cargo', 'maritime', 'vessel', 'freight', 'container'],
  energy_utilities: ['electricity', 'power', 'gas', 'water', 'utility', 'energy', 'bill', 'fuel'],
  manufacturing: ['factory', 'production', 'manufacture', 'plant', 'industrial', 'goods', 'parts'],
  it_cloud: ['cloud', 'aws', 'azure', 'server', 'hosting', 'software', 'saas', 'it', 'tech', 'digital'],
  food_hospitality: ['restaurant', 'food', 'catering', 'meal', 'lunch', 'dinner', 'hotel', 'hospitality'],
  local_groceries: ['grocery', 'supermarket', 'groceries', 'market', 'store', 'food', 'shopping'],
  professional_svcs: ['legal', 'accounting', 'consulting', 'services', 'professional', 'lawyer', 'accountant'],
  retail_ecommerce: ['amazon', 'retail', 'shopping', 'ecommerce', 'store', 'purchase', 'online', 'shop'],
};

function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[len2][len1];
}

function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return 1 - distance / maxLen;
}

export function matchCategory(input: string): CategoryMatch {
  const normalizedInput = input.toLowerCase().trim();
  const validCategories = Object.keys(CARBON_COEFFICIENTS);

  // Check exact match first
  if (validCategories.includes(normalizedInput)) {
    return {
      matched: true,
      category: normalizedInput,
      confidence: 1.0,
      suggestions: [],
    };
  }

  // Check keyword matches
  const keywordMatches: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedInput.includes(keyword) || keyword.includes(normalizedInput)) {
        keywordMatches[category] = (keywordMatches[category] || 0) + 1;
      }
    }
  }

  if (Object.keys(keywordMatches).length > 0) {
    const topMatch = Object.entries(keywordMatches).sort(([, a], [, b]) => b - a)[0];
    return {
      matched: true,
      category: topMatch[0],
      confidence: Math.min(0.95, 0.5 + (topMatch[1] * 0.1)),
      suggestions: validCategories.filter(c => c !== topMatch[0]).slice(0, 3),
    };
  }

  // Check similarity (Levenshtein distance)
  const similarities: Array<[string, number]> = validCategories.map(cat => [
    cat,
    calculateSimilarity(normalizedInput, cat),
  ]);

  similarities.sort(([, a], [, b]) => b - a);
  const topMatch = similarities[0];

  if (topMatch[1] > 0.6) {
    return {
      matched: true,
      category: topMatch[0],
      confidence: topMatch[1],
      suggestions: similarities.slice(1, 4).map(([cat]) => cat),
    };
  }

  // No match found
  return {
    matched: false,
    category: '',
    confidence: 0,
    suggestions: validCategories.slice(0, 5),
  };
}

export function getAllCategories(): string[] {
  return Object.keys(CARBON_COEFFICIENTS);
}
