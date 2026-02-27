/**
 * Intent Router
 * Parses natural language queries and routes to appropriate verticals
 */

import type { VerticalType, SearchIntent } from './schema.js';

// Intent classification keywords
const VERTICAL_KEYWORDS: Record<VerticalType, string[]> = {
  clinic: [
    'clinic', 'doctor', 'physician', 'medical', 'health', 'hospital', 
    'urgent care', 'walk-in', 'patient', 'medicine', 'pediatric', 'family doctor',
    'dentist', 'physio', 'physiotherapy', 'chiropractor', 'specialist'
  ],
  playground: [
    'playground', 'play', 'indoor play', 'trampoline', 'birthday party', 
    'kids', 'children', 'family fun', 'activity centre', 'play centre',
    'soft play', 'climbing', 'slides', 'toddler'
  ],
  wellness: [
    'wellness', 'spa', 'massage', 'facial', 'meditation', 'yoga', 
    'wellness centre', 'relaxation', 'therapy', 'acupuncture', 'holistic'
  ],
  travel: [
    'hotel', 'motel', 'stay', 'accommodation', 'travel', 'tourism', 
    'visit', 'attraction', 'tour', 'vacation', 'bnb'
  ],
  food: [
    'restaurant', 'food', 'cafe', 'dining', 'eat', 'cuisine', 
    'bakery', 'coffee', 'bar', 'pub', 'takeout'
  ],
  industrial: [
    'industrial', 'automation', 'controls', 'manufacturing', 'factory',
    'equipment', 'machinery', 'engineering', 'b2b', 'supplier'
  ]
};

// Location extraction patterns
const LOCATION_PATTERNS = [
  // City names
  /\b(calgary|edmonton|red deer|lethbridge|medicine hat|fort mcmurray|sherwood park|st\.? albert|airdrie|okotoks|cochrane|spruce grove)\b/gi,
  // "in X" pattern
  /\bin\s+([a-z\s]+?)(?:\s+(?:area|region|nearby))?\b/gi,
  // "near X" pattern
  /\bnear\s+([a-z\s]+?)\b/gi
];

// Intent type patterns
const INTENT_PATTERNS = {
  recommend: ['recommend', 'suggest', 'best', 'top', 'good', 'great', 'favorite'],
  compare: ['compare', 'difference', 'versus', 'vs', 'better than'],
  book: ['book', 'appointment', 'schedule', 'reserve', 'reservation'],
  inquire: ['contact', 'reach', 'call', 'email', 'inquiry', 'question']
};

export class IntentRouter {
  
  /**
   * Parse a natural language query into structured intent
   */
  parseQuery(query: string, context?: { userId?: string; sessionId?: string }): SearchIntent {
    const normalizedQuery = query.toLowerCase();
    
    // 1. Detect vertical
    const vertical = this.detectVertical(normalizedQuery);
    
    // 2. Detect location
    const location = this.detectLocation(normalizedQuery);
    
    // 3. Detect intent type
    const intent = this.detectIntentType(normalizedQuery);
    
    // 4. Extract filters
    const filters = this.extractFilters(normalizedQuery, vertical);
    
    return {
      intent,
      vertical,
      location,
      filters,
      query: normalizedQuery,
      context: context || {}
    };
  }
  
  /**
   * Detect which vertical the query is about
   */
  private detectVertical(query: string): VerticalType | undefined {
    const scores: Record<VerticalType, number> = {
      clinic: 0, playground: 0, wellness: 0, 
      travel: 0, food: 0, industrial: 0
    };
    
    // Score each vertical based on keyword matches
    for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (query.includes(keyword.toLowerCase())) {
          scores[vertical as VerticalType] += 1;
          // Boost exact matches
          if (query.includes(` ${keyword} `) || query.startsWith(`${keyword} `)) {
            scores[vertical as VerticalType] += 0.5;
          }
        }
      }
    }
    
    // Find highest scoring vertical
    let bestVertical: VerticalType | undefined;
    let bestScore = 0;
    
    for (const [vertical, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestVertical = vertical as VerticalType;
      }
    }
    
    return bestVertical;
  }
  
  /**
   * Detect location from query
   */
  private detectLocation(query: string): SearchIntent['location'] {
    // Direct city name matching
    const cityMatch = query.match(/\b(calgary|edmonton|red deer|lethbridge|medicine hat|sherwood park|st\.?\s*albert|airdrie|okotoks|cochrane|spruce grove)\b/gi);
    
    if (cityMatch) {
      return {
        city: cityMatch[0].toLowerCase().replace(/\s+/g, ' ').trim(),
        province: 'AB'
      };
    }
    
    // Check for "in X" pattern
    const inMatch = query.match(/\bin\s+([a-z\s]+?)(?:\s+(?:area|region|nearby|for))?\s*(?:\?|$|\s)/i);
    if (inMatch) {
      return {
        city: inMatch[1].trim().toLowerCase(),
        province: 'AB'
      };
    }
    
    return undefined;
  }
  
  /**
   * Detect intent type (search, recommend, compare, book, inquire)
   */
  private detectIntentType(query: string): SearchIntent['intent'] {
    for (const [intentType, keywords] of Object.entries(INTENT_PATTERNS)) {
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          return intentType as SearchIntent['intent'];
        }
      }
    }
    return 'search';
  }
  
  /**
   * Extract vertical-specific filters from query
   */
  private extractFilters(query: string, vertical?: VerticalType): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Common filters
    if (query.includes('open now') || query.includes('currently open')) {
      filters.isOpen = true;
    }
    
    if (query.includes('highly rated') || query.includes('4+ stars')) {
      filters.minRating = 4;
    }
    
    // Clinic-specific filters
    if (vertical === 'clinic') {
      if (query.includes('walk in') || query.includes('walk-in') || query.includes('no appointment')) {
        filters.isWalkIn = true;
      }
      if (query.includes('accepting new patients') || query.includes('taking new patients')) {
        filters.acceptingNewPatients = true;
      }
      if (query.includes('pediatric') || query.includes('children') || query.includes('kids doctor')) {
        filters.category = 'pediatrics';
      }
    }
    
    // Playground-specific filters
    if (vertical === 'playground') {
      if (query.includes('birthday') || query.includes('party')) {
        filters.hasPartyPackages = true;
      }
      if (query.includes('toddler') || query.includes('baby')) {
        filters.maxAge = 3;
      }
      if (query.includes('trampoline')) {
        filters.feature = 'trampoline';
      }
    }
    
    return filters;
  }
  
  /**
   * Generate search suggestions based on partial query
   */
  getSuggestions(partialQuery: string): string[] {
    const normalized = partialQuery.toLowerCase();
    const suggestions: string[] = [];
    
    // Vertical suggestions
    if (normalized.includes('play')) {
      suggestions.push(
        'playgrounds in Edmonton',
        'indoor playgrounds Calgary',
        'birthday party venues'
      );
    }
    
    if (normalized.includes('clinic') || normalized.includes('doctor')) {
      suggestions.push(
        'walk-in clinics Edmonton',
        'family doctors accepting new patients Calgary',
        'pediatric clinics near me'
      );
    }
    
    if (normalized.includes('spa') || normalized.includes('massage')) {
      suggestions.push(
        'massage therapy Calgary',
        'wellness centres Edmonton',
        'spas with direct billing'
      );
    }
    
    return suggestions;
  }
}

export const intentRouter = new IntentRouter();
