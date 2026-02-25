/**
 * Lead Service - Handle lead capture and actions
 */

import { db } from '../utils/db.js';
import { leads, type Lead, type NewLead } from '../models/schema-sqlite.js';
import { generateId } from '../utils/id.js';
import { eq, desc } from 'drizzle-orm';
import type { LeadCreate } from '../models/validation.js';
import { notificationService } from './notificationService.js';

export interface ActionResult {
  actionId: string;
  status: 'accepted' | 'queued' | 'failed';
  message: string;
  estimatedResponse?: string;
  nextSteps?: string[];
}

export class LeadService {
  
  async createLead(data: LeadCreate): Promise<ActionResult> {
    const id = generateId('lead');
    
    // Calculate priority
    const priority = this.calculatePriority(data);
    
    const lead: NewLead = {
      id,
      actionType: data.action,
      vertical: data.vertical,
      province: data.region.province,
      city: data.region.city || null,
      email: data.email,
      phone: data.phone || null,
      name: data.name || null,
      placeIds: data.placeIds || [],
      message: data.message || null,
      requirements: data.requirements || null,
      payload: data,
      status: 'new',
      priority,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(leads).values(lead);
    
    // Send notifications asynchronously
    this.processLeadAsync(lead as Lead).catch(console.error);

    return {
      actionId: id,
      status: 'accepted',
      message: this.getConfirmationMessage(data.action),
      estimatedResponse: 'Within 24 hours',
      nextSteps: this.getNextSteps(data.action)
    };
  }

  async getById(id: string): Promise<Lead | null> {
    const result = await db.query.leads.findFirst({
      where: eq(leads.id, id)
    });
    return result || null;
  }

  async updateStatus(
    id: string, 
    status: Lead['status'], 
    assignedTo?: string
  ): Promise<Lead | null> {
    const updates: Partial<NewLead> = { status, updatedAt: new Date() };
    if (assignedTo) updates.assignedTo = assignedTo;

    const [updated] = await db.update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();

    return updated || null;
  }

  async list(options: {
    status?: Lead['status'];
    vertical?: string;
    priority?: Lead['priority'];
    limit?: number;
    offset?: number;
  } = {}): Promise<Lead[]> {
    const { limit = 50, offset = 0 } = options;
    
    return await db.query.leads.findMany({
      limit,
      offset,
      orderBy: [desc(leads.createdAt)]
    });
  }

  // ==================== Private Methods ====================

  private calculatePriority(data: LeadCreate): Lead['priority'] {
    // High priority: Direct contact with specific business
    if (data.action === 'lead_contact_business' && (data.placeIds?.length || 0) > 0) {
      return 'high';
    }
    
    // Medium-high: Shortlist with multiple places
    if (data.action === 'lead_request_shortlist' && (data.placeIds?.length || 0) >= 3) {
      return 'high';
    }
    
    // Medium: General matching
    if (data.action === 'lead_get_matched') {
      return 'medium';
    }
    
    return 'low';
  }

  private getConfirmationMessage(action: string): string {
    const messages: Record<string, string> = {
      lead_get_matched: 'We received your request and will match you with the best options within 24 hours.',
      lead_request_shortlist: 'Your shortlist request has been saved. We will send you a curated list shortly.',
      lead_contact_business: 'Your message has been forwarded to the business. They will contact you directly.'
    };
    return messages[action] || 'Your request has been received.';
  }

  private getNextSteps(action: string): string[] {
    const steps: Record<string, string[]> = {
      lead_get_matched: [
        'Check your email for matched recommendations',
        'Reply to refine your preferences',
        'Book directly or request more options'
      ],
      lead_request_shortlist: [
        'Check your email for the curated shortlist',
        'Save or share your favorites',
        'Contact businesses directly from the list'
      ],
      lead_contact_business: [
        'Expect a response within 24-48 hours',
        'Check your email (and spam folder)',
        'Reply if you need assistance'
      ]
    };
    return steps[action] || ['Check your email for updates'];
  }

  private async processLeadAsync(lead: Lead): Promise<void> {
    console.log(`[LeadService] Processing lead ${lead.id} (${lead.actionType})`);
    
    // Send Slack notification
    await notificationService.notifyNewLead(lead);
    
    // Send confirmation email to user
    await notificationService.sendConfirmationEmail(lead);
    
    // TODO: Additional integrations:
    // - CRM integration (HubSpot/Salesforce)
    // - Webhook to external systems
    // - SMS notifications for high-priority leads
  }
}

export const leadService = new LeadService();
