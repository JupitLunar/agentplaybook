/**
 * Lead Service
 * Handles lead creation and management via Supabase
 */

import { supabase } from './data-service.js';
import type { Lead, LeadRequest } from './schema.js';

export class LeadService {
  
  /**
   * Create a new lead
   */
  async createLead(request: LeadRequest): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        type: request.type,
        vertical: request.vertical,
        place_ids: request.placeIds,
        contact_name: request.contact.name,
        contact_email: request.contact.email,
        contact_phone: request.contact.phone,
        requirements: request.requirements,
        timing: request.timing,
        metadata: request.metadata,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('[LeadService] Error creating lead:', error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }
    
    return {
      id: data.id,
      status: data.status,
      createdAt: new Date(data.created_at),
      estimatedResponse: this.calculateResponseTime(request),
      nextSteps: this.generateNextSteps(request)
    };
  }
  
  /**
   * Get lead by ID
   */
  async getById(leadId: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      status: data.status,
      createdAt: new Date(data.created_at),
      estimatedResponse: data.estimated_response,
      nextSteps: data.next_steps
    };
  }
  
  /**
   * Calculate estimated response time based on request type
   */
  private calculateResponseTime(request: LeadRequest): string {
    switch (request.type) {
      case 'book':
        return 'Within 24 hours';
      case 'match':
        return 'Within 2 hours';
      case 'shortlist':
        return 'Within 4 hours';
      case 'contact':
        return 'Within 1 business day';
      default:
        return 'Within 24 hours';
    }
  }
  
  /**
   * Generate next steps for the user
   */
  private generateNextSteps(request: LeadRequest): string[] {
    const steps = [
      'Check your email for confirmation'
    ];
    
    if (request.type === 'book') {
      steps.push('Prepare your availability for scheduling');
    }
    
    if (request.placeIds && request.placeIds.length > 0) {
      steps.push('Review the places we matched for you');
    }
    
    steps.push('Watch for follow-up questions from our team');
    
    return steps;
  }
}

export const leadService = new LeadService();
