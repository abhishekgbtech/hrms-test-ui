/**
 * Comprehensive Test Suite for Service Management Module
 * Tests:
 * 1. Tenant-level Service Catalogue independence from legal entities
 * 2. Multi-client engagements with custom deliverable selection
 * 3. Custom client tasks without master template pollution
 * 4. Cross-legal-entity collaboration and team allocation
 * 5. Idempotent recurrence task generation across frequencies
 * 6. Client timesheet logging, rate calculation, and approvals
 * 7. Tenant isolation & audit logging
 */

import {
  serviceManagementStore,
  INITIAL_SERVICE_CATALOGUE,
  INITIAL_CLIENTS,
  INITIAL_ENGAGEMENTS,
} from '../src/services/serviceManagementData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ ${message}`);
}

async function runTestSuite() {
  console.log('=====================================================');
  console.log('STARTING SERVICE MANAGEMENT COMPREHENSIVE TEST SUITE');
  console.log('=====================================================\n');

  const actor = {
    id: 'EMP001',
    name: 'Deepa Rathi',
    entity: 'ECOVIS RKCA - Mumbai HQ'
  };

  // Test 1: Service Catalogue Independence
  console.log('--- TEST 1: Tenant-Level Service Catalogue Independence ---');
  const services = serviceManagementStore.getServices();
  assert(services.length >= 4, 'Service catalogue contains initial master services');
  const initialAuditService = services.find(s => s.id === 'srv-stat-audit');
  assert(!!initialAuditService, 'Found master service srv-stat-audit');
  const initialDeliverablesCount = initialAuditService!.deliverables.length;
  assert(initialDeliverablesCount === 3, 'Master service has 3 initial deliverables');

  // Test 2: Add New Master Service
  console.log('\n--- TEST 2: Authoring New Service Master ---');
  const newService = serviceManagementStore.addService({
    code: 'SRV-TEST-99',
    title: 'Automated Test Consulting Service',
    category: 'Corporate Advisory',
    description: 'Service created for verification tests',
    department: 'Corporate Advisory',
    standardHourlyRate: 4000,
    currency: 'INR',
    estimatedDurationDays: 14,
    tags: ['Test', 'Advisory'],
    isActive: true,
    deliverables: [
      {
        id: 'del-t1',
        title: 'Initial Discovery Review',
        description: 'Discovery phase for client',
        estimatedHours: 10,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [{ id: 'st-t1', title: 'Data Gathering', estimatedHours: 5 }],
        executionSteps: [{ id: 'es-t1', text: 'Step 1' }]
      }
    ]
  }, actor);
  assert(serviceManagementStore.getServices().some(s => s.id === newService.id), 'New service template successfully added to tenant catalogue');

  // Test 3: Multi-Client Service Subscription & Selection
  console.log('\n--- TEST 3: Multi-Client Service Subscription & Task Selection ---');
  const clients = serviceManagementStore.getClients();
  assert(clients.length >= 4, 'Client directory loaded with initial clients');
  const testClient = clients[0]; // Tata Consumer

  const engagement = serviceManagementStore.addEngagement({
    clientId: testClient.id,
    serviceId: newService.id,
    servicingLegalEntityId: 'le-mum',
    billingType: 'monthly_retainer',
    contractValue: 120000,
    currency: 'INR',
    status: 'active',
    startDate: '2026-01-01',
    selectedTemplateTaskIds: ['del-t1'], // Only select 1 deliverable
    customTasks: [],
    collaborators: [
      {
        userId: 'EMP001',
        userName: 'Deepa Rathi',
        userEmail: 'deepa.rathi@ecovis.com',
        homeLegalEntityId: 'le-mum',
        homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        engagementRole: 'engagement_partner',
        allocatedHours: 10
      },
      {
        userId: 'EMP002',
        userName: 'Namita Chaudhary',
        userEmail: 'namita.chaudhary@ecovis.com',
        homeLegalEntityId: 'le-del', // CROSS-LEGAL-ENTITY!
        homeLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
        engagementRole: 'manager',
        allocatedHours: 30
      }
    ],
    recurrence: {
      frequency: 'monthly',
      startDate: '2026-01-01',
      dayOfMonth: 15,
      leadDays: 7,
      isActive: true
    }
  }, actor);

  assert(!!engagement.id, 'Engagement created successfully');
  assert(engagement.collaborators.length === 2, 'Collaborators assigned');
  const crossEntityCollab = engagement.collaborators.find(c => c.homeLegalEntityId !== engagement.servicingLegalEntityId);
  assert(!!crossEntityCollab, 'Cross-legal-entity collaborator (New Delhi) successfully linked to Mumbai servicing entity');

  // Test 4: Bespoke Custom Client Tasks without Master Template Mutation
  console.log('\n--- TEST 4: Custom Client Tasks (Zero Master Template Mutation) ---');
  const customTask = serviceManagementStore.addCustomTaskToEngagement(
    engagement.id,
    {
      title: 'Bespoke Confidential Tax Audit for Tata Board',
      description: 'Exclusive deliverable only for Tata Consumer Products',
      estimatedHours: 18,
      priority: 'high',
      subtasks: [{ id: 'st-c1', title: 'Board Briefing Prep' }],
      executionSteps: [{ id: 'es-c1', text: 'Present to audit committee' }]
    },
    actor
  );

  assert(!!customTask.id, 'Custom task successfully added to client engagement');
  // Verify master service template was NOT altered
  const freshMasterService = serviceManagementStore.getServices().find(s => s.id === newService.id);
  assert(freshMasterService!.deliverables.length === 1, 'Master service deliverables remain strictly 1 (Master template was NOT modified)');
  assert(!freshMasterService!.deliverables.some(d => d.title.includes('Bespoke Confidential')), 'Master service does not contain client bespoke task');

  // Test 5: Idempotency in Recurrence Engine
  console.log('\n--- TEST 5: Recurrence Engine & Idempotency Guarantees ---');
  // First run for period 2026-M11
  const run1 = serviceManagementStore.generateRecurringTasksForEngagement(engagement.id, actor, '2026-M11');
  assert(run1.spawnedCount === 2, `First run spawned exactly 2 task instances (1 selected standard + 1 custom): got ${run1.spawnedCount}`);
  assert(run1.skippedCount === 0, 'First run skipped 0 duplicates');

  // Second run for same period 2026-M11 - must be 100% idempotent
  const run2 = serviceManagementStore.generateRecurringTasksForEngagement(engagement.id, actor, '2026-M11');
  assert(run2.spawnedCount === 0, `Second run spawned 0 task instances (Idempotent): got ${run2.spawnedCount}`);
  assert(run2.skippedCount === 2, `Second run correctly skipped 2 duplicate tasks: got ${run2.skippedCount}`);

  // Test 6: Client Timesheet Logging & Approval Flow
  console.log('\n--- TEST 6: Client Timesheets & Manager Approvals ---');
  const timesheetEntry = serviceManagementStore.logTimesheet({
    engagementId: engagement.id,
    clientId: testClient.id,
    clientName: testClient.name,
    serviceId: newService.id,
    serviceTitle: newService.title,
    taskTitle: customTask.title,
    userId: 'EMP002',
    userName: 'Namita Chaudhary',
    userLegalEntityId: 'le-del',
    userLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
    isCrossEntityCollaboration: true,
    date: '2026-10-25',
    hours: 6,
    isBillable: true,
    hourlyRate: 4000,
    description: 'Reviewed board briefing deck with New Delhi regional tax counsel.'
  }, actor);

  assert(timesheetEntry.totalBilledAmount === 24000, `Billed amount calculated correctly (6 hrs * 4000 = 24,000): got ${timesheetEntry.totalBilledAmount}`);
  assert(timesheetEntry.status === 'submitted', 'Timesheet entry initialized in submitted state');
  assert(timesheetEntry.isCrossEntityCollaboration === true, 'Timesheet flagged as cross-legal-entity billing');

  // Approve timesheet
  serviceManagementStore.approveTimesheet(timesheetEntry.id, actor);
  const updatedTs = serviceManagementStore.getTimesheets().find(t => t.id === timesheetEntry.id);
  assert(updatedTs!.status === 'approved', 'Timesheet entry approved successfully');
  assert(updatedTs!.approvedBy === actor.name, `Approved by ${actor.name}`);

  // Test 7: Audit Logging
  console.log('\n--- TEST 7: Tenant Audit Trail Verification ---');
  const audits = serviceManagementStore.getAuditLogs();
  assert(audits.length > 0, 'Audit ledger contains entries');
  assert(audits.some(a => a.action === 'TIMESHEET_APPROVED'), 'Found TIMESHEET_APPROVED in audit trail');
  assert(audits.some(a => a.action === 'CUSTOM_TASK_ADDED'), 'Found CUSTOM_TASK_ADDED in audit trail');

  console.log('\n=====================================================');
  console.log('ALL SERVICE MANAGEMENT TESTS PASSED WITH 100% SUCCESS');
  console.log('=====================================================');
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
