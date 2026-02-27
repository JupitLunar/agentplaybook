/**
 * MCP Tool Handlers - Native structured data responses
 * Designed for AI agents to consume directly
 */

import { dataService } from '../core/data-service.js';
import { intentRouter } from '../core/intent-router.js';
import { leadService } from './lead-service.js';
import type { 
  McpToolResponse, 
  UnifiedPlace, 
  LeadRequest,
  SearchIntent,
  VerticalType 
} from '../core/schema.js';

/**
 * Generate actionable next steps for a place
 */
function generateActions(place: UnifiedPlace): McpToolResponse['actions'] {
  const actions: McpToolResponse['actions'] = [];
  
  // Get detail action
  actions.push({
    type: 'get_detail',
    label: 'Get full details',
    params: { placeId: place.id, vertical: place.vertical },
    available: true
  });
  
  // Call action
  if (place.contact.phone) {
    actions.push({
      type: 'call',
      label: `Call ${place.contact.phone}`,
      params: { phone: place.contact.phone },
      available: true
    });
  }
  
  // Visit website
  if (place.contact.website) {
    actions.push({
      type: 'visit',
      label: 'Visit website',
      params: { url: place.contact.website },
      available: true
    });
  }
  
  // Book/Create lead action
  actions.push({
    type: 'create_lead',
    label: place.vertical === 'clinic' ? 'Request appointment' : 'Inquire availability',
    params: { 
      placeId: place.id, 
      vertical: place.vertical,
      type: place.vertical === 'clinic' ? 'book' : 'inquire'
    },
    available: true
  });
  
  // Navigate (if coordinates available)
  if (place.location.coordinates) {
    actions.push({
      type: 'navigate',
      label: 'Get directions',
      params: { 
        lat: place.location.coordinates.lat, 
        lng: place.location.coordinates.lng,
        address: place.location.address
      },
      available: true
    });
  }
  
  return actions;
}

/**
 * Search places tool - Core discovery
 */
export async function searchPlacesTool(params: {
  query?: string;
  vertical?: VerticalType;
  city?: string;
  province?: string;
  filters?: Record<string, any>;
  limit?: number;
}): Promise<McpToolResponse<{ places: UnifiedPlace[] }>> {
  const startTime = Date.now();
  const queryId = `search_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  
  // Build search intent
  const intent: SearchIntent = {
    intent: 'search',
    vertical: params.vertical,
    location: {
      city: params.city,
      province: params.province || 'AB'
    },
    filters: {
      ...params.filters,
      limit: params.limit || 10
    },
    query: params.query
  };
  
  // If natural language query provided but no vertical, parse intent
  if (params.query && !params.vertical) {
    const parsed = intentRouter.parseQuery(params.query);
    intent.vertical = parsed.vertical;
    intent.location = parsed.location || intent.location;
    intent.filters = { ...intent.filters, ...parsed.filters };
  }
  
  // Execute search
  const { places, total } = await dataService.search(intent);
  
  // Enhance with actions
  const placesWithActions = places.map(place => ({
    ...place,
    actions: generateActions(place)
  }));
  
  // Generate comparison action if multiple results
  const actions: McpToolResponse['actions'] = [];
  if (places.length >= 2) {
    actions.push({
      type: 'compare',
      label: `Compare ${places.length} places`,
      params: { placeIds: places.map(p => p.id) },
      available: true
    });
  }
  
  // Add create lead action for all results
  actions.push({
    type: 'create_lead',
    label: 'Get matched with options',
    params: { 
      placeIds: places.map(p => p.id),
      vertical: intent.vertical,
      type: 'match'
    },
    available: true
  });
  
  return {
    data: { places: placesWithActions },
    meta: {
      total,
      hasMore: total > (params.limit || 10),
      queryId,
      duration: Date.now() - startTime
    },
    actions,
    suggestions: intentRouter.getSuggestions(params.query || '')
  };
}

/**
 * Get place details tool
 */
export async function getPlaceTool(params: {
  placeId: string;
  vertical?: VerticalType;
}): Promise<McpToolResponse<UnifiedPlace>> {
  const startTime = Date.now();
  const queryId = `detail_${params.placeId}`;
  
  const place = await dataService.getById(params.placeId, params.vertical);
  
  if (!place) {
    return {
      data: null as any,
      meta: {
        queryId,
        duration: Date.now() - startTime
      },
      actions: [],
      suggestions: ['Try searching with different criteria']
    };
  }
  
  return {
    data: place,
    meta: {
      queryId,
      duration: Date.now() - startTime
    },
    actions: generateActions(place),
    suggestions: [
      `See more ${place.vertical}s in ${place.location.city}`,
      `Compare with similar ${place.vertical}s`
    ]
  };
}

/**
 * Compare places tool
 */
export async function comparePlacesTool(params: {
  placeIds: string[];
}): Promise<McpToolResponse<{ comparison: any }>> {
  const startTime = Date.now();
  const queryId = `compare_${params.placeIds.join('_')}`;
  
  // Fetch all places
  const places = await Promise.all(
    params.placeIds.map(id => dataService.getById(id))
  );
  
  const validPlaces = places.filter((p): p is UnifiedPlace => p !== null);
  
  if (validPlaces.length < 2) {
    return {
      data: { comparison: null },
      meta: { queryId, duration: Date.now() - startTime },
      actions: [],
      suggestions: ['Need at least 2 valid places to compare']
    };
  }
  
  // Build comparison matrix
  const comparison = {
    places: validPlaces.map(p => ({
      id: p.id,
      name: p.name,
      vertical: p.vertical,
      rating: p.rating,
      reviewCount: p.reviewCount,
      location: p.location,
      contact: p.contact,
      attributes: p.attributes
    })),
    differences: extractDifferences(validPlaces),
    recommendations: generateComparisonRecommendations(validPlaces)
  };
  
  return {
    data: { comparison },
    meta: {
      total: validPlaces.length,
      queryId,
      duration: Date.now() - startTime
    },
    actions: [
      {
        type: 'create_lead',
        label: 'Request quotes from all',
        params: { placeIds: validPlaces.map(p => p.id), type: 'shortlist' },
        available: true
      }
    ]
  };
}

/**
 * Create lead tool
 */
export async function createLeadTool(params: {
  type: 'match' | 'shortlist' | 'contact' | 'book';
  vertical: VerticalType;
  placeIds?: string[];
  email: string;
  phone?: string;
  name?: string;
  requirements?: string;
  timing?: 'asap' | 'this_week' | 'this_month' | 'flexible';
  metadata?: Record<string, any>;
}): Promise<McpToolResponse<{ leadId: string; status: string }>> {
  const startTime = Date.now();
  const queryId = `lead_${Date.now()}`;
  
  const leadRequest: LeadRequest = {
    type: params.type,
    vertical: params.vertical,
    placeIds: params.placeIds,
    contact: {
      name: params.name,
      email: params.email,
      phone: params.phone
    },
    requirements: params.requirements,
    timing: params.timing,
    metadata: params.metadata
  };
  
  const lead = await leadService.createLead(leadRequest);
  
  return {
    data: {
      leadId: lead.id,
      status: lead.status
    },
    meta: {
      queryId,
      duration: Date.now() - startTime
    },
    actions: [
      {
        type: 'get_detail',
        label: 'Check lead status',
        params: { leadId: lead.id },
        available: true
      }
    ],
    suggestions: lead.nextSteps || []
  };
}

/**
 * Get lead status tool
 */
export async function getLeadTool(params: {
  leadId: string;
}): Promise<McpToolResponse<any>> {
  const startTime = Date.now();
  
  const lead = await leadService.getById(params.leadId);
  
  if (!lead) {
    return {
      data: null,
      meta: { queryId: params.leadId, duration: Date.now() - startTime },
      actions: []
    };
  }
  
  return {
    data: lead,
    meta: { queryId: params.leadId, duration: Date.now() - startTime },
    actions: []
  };
}

/**
 * Discover/determine vertical tool
 */
export async function discoverVerticalTool(params: {
  query: string;
}): Promise<McpToolResponse<{ vertical?: string; confidence: number; intent?: any }>> {
  const startTime = Date.now();
  
  const intent = intentRouter.parseQuery(params.query);
  
  // Calculate confidence based on keyword matches
  let confidence = 0;
  if (intent.vertical) {
    confidence = 0.7;
    if (intent.location) confidence += 0.15;
    if (intent.filters && Object.keys(intent.filters).length > 0) confidence += 0.15;
  }
  
  return {
    data: {
      vertical: intent.vertical,
      confidence,
      intent: intent
    },
    meta: {
      queryId: `discover_${Date.now()}`,
      duration: Date.now() - startTime
    },
    actions: intent.vertical ? [
      {
        type: 'get_detail',
        label: `Search ${intent.vertical}s`,
        params: { vertical: intent.vertical, query: params.query },
        available: true
      }
    ] : [],
    suggestions: intentRouter.getSuggestions(params.query)
  };
}

// Helper functions

function extractDifferences(places: UnifiedPlace[]): any[] {
  const differences = [];
  
  // Compare ratings
  const ratings = places.map(p => p.rating).filter((r): r is number => r !== undefined);
  if (ratings.length > 1) {
    const maxRating = Math.max(...ratings);
    const minRating = Math.min(...ratings);
    if (maxRating - minRating >= 0.5) {
      differences.push({
        field: 'rating',
        description: `Rating varies from ${minRating.toFixed(1)} to ${maxRating.toFixed(1)}`,
        highest: places.find(p => p.rating === maxRating)?.name
      });
    }
  }
  
  // Compare attributes
  const vertical = places[0].vertical;
  if (vertical === 'clinic') {
    const walkInCount = places.filter(p => p.attributes.isWalkIn).length;
    if (walkInCount > 0 && walkInCount < places.length) {
      differences.push({
        field: 'walkIn',
        description: `${walkInCount} of ${places.length} accept walk-ins`,
        places: places.filter(p => p.attributes.isWalkIn).map(p => p.name)
      });
    }
  }
  
  return differences;
}

function generateComparisonRecommendations(places: UnifiedPlace[]): string[] {
  const recommendations = [];
  
  // Best rated
  const bestRated = places
    .filter(p => p.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  if (bestRated) {
    recommendations.push(`Best rated: ${bestRated.name} (${bestRated.rating}★)`);
  }
  
  // Most reviewed
  const mostReviewed = places.sort((a, b) => b.reviewCount - a.reviewCount)[0];
  if (mostReviewed?.reviewCount > 0) {
    recommendations.push(`Most reviewed: ${mostReviewed.name} (${mostReviewed.reviewCount} reviews)`);
  }
  
  return recommendations;
}
