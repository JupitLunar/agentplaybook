/**
 * Unified Vertical Schema
 * All business verticals share this common interface
 */

// Vertical types supported by Agent Layer
export type VerticalType = 'clinic' | 'playground' | 'wellness' | 'travel' | 'food' | 'industrial';

// Core place/location interface - unified across all verticals
export interface UnifiedPlace {
  id: string;
  name: string;
  slug: string;
  
  // Categorization
  vertical: VerticalType;
  category: string;
  subcategories?: string[];
  
  // Location (standardized)
  location: {
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    neighborhood?: string;
  };
  
  // Contact info
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    bookingUrl?: string;
  };
  
  // Content
  description?: string;
  images: string[];
  
  // Ratings & reviews
  rating?: number;
  reviewCount: number;
  
  // Business attributes (vertical-specific stored here)
  attributes: Record<string, any>;
  
  // Availability
  availability?: {
    isOpen?: boolean;
    hours?: Record<string, string>;
    timezone?: string;
  };
  
  // Metadata
  tags: string[];
  amenities?: string[];
  languages?: string[];
  paymentMethods?: string[];
  
  // Verification & sourcing
  source: {
    type: 'supabase' | 'sqlite' | 'api' | 'manual' | 'scraped';
    table?: string;
    externalId?: string;
    url?: string;
    lastVerified: Date;
    claimed: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Search intent types
export interface SearchIntent {
  intent: 'search' | 'recommend' | 'compare' | 'book' | 'inquire';
  vertical?: VerticalType;
  location?: {
    city?: string;
    province?: string;
    near?: { lat: number; lng: number; radius?: number };
  };
  filters?: Record<string, any>;
  query?: string;
  context?: {
    userId?: string;
    sessionId?: string;
    previousSearches?: string[];
  };
}

// MCP Tool response format - structured for AI consumption
export interface McpToolResponse<T = any> {
  data: T;
  meta: {
    total?: number;
    page?: number;
    hasMore?: boolean;
    queryId: string;
    duration: number;
  };
  actions: McpAction[];
  suggestions?: string[];
}

// Actionable next steps for the calling agent
export interface McpAction {
  type: 'get_detail' | 'compare' | 'book' | 'call' | 'visit' | 'create_lead' | 'navigate';
  label: string;
  params: Record<string, any>;
  available: boolean;
}

// Lead/Conversion types
export interface LeadRequest {
  type: 'match' | 'shortlist' | 'contact' | 'book';
  vertical: VerticalType;
  placeIds?: string[];
  contact: {
    name?: string;
    email: string;
    phone?: string;
  };
  requirements?: string;
  timing?: 'asap' | 'this_week' | 'this_month' | 'flexible';
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  status: 'pending' | 'matched' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  estimatedResponse?: string;
  nextSteps?: string[];
}

// Vertical-specific attribute schemas
export interface ClinicAttributes {
  isWalkIn: boolean;
  acceptingNewPatients: boolean;
  services: string[];
  specialties?: string[];
  physicians?: Array<{
    name: string;
    specialty?: string;
    acceptingNewPatients?: boolean;
  }>;
}

export interface PlaygroundAttributes {
  ageRange: { min: number; max?: number };
  features: string[];
  capacity?: number;
  partyPackages?: boolean;
  admissionFee?: string;
  supervisionRequired?: boolean;
  safetyCertifications?: string[];
}

export interface WellnessAttributes {
  services: string[];
  practitioners?: Array<{
    name: string;
    type: string;
    specialties?: string[];
  }>;
  acceptsInsurance?: boolean;
  directBilling?: boolean;
}
