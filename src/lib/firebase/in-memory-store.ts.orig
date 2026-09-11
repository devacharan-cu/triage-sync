import {
  Patient,
  PatientInput,
  ClinicalFact,
  ClinicalConflict,
  RecommendedAction,
  HospitalResource,
  AuditEvent,
} from '@/types';

class InMemoryStore {
  patients = new Map<string, Patient>();
  inputs = new Map<string, PatientInput>();
  facts = new Map<string, ClinicalFact>();
  conflicts = new Map<string, ClinicalConflict>();
  actions = new Map<string, RecommendedAction>();
  auditEvents = new Map<string, AuditEvent>();
  resources = new Map<string, HospitalResource>();

  // Subscriptions
  private patientListeners = new Map<string, Set<(p: Patient | null) => void>>();
  private allPatientsListeners = new Set<(patients: Patient[]) => void>();
  private inputsListeners = new Map<string, Set<(inputs: PatientInput[]) => void>>();
  private factsListeners = new Map<string, Set<(facts: ClinicalFact[]) => void>>();
  private conflictsListeners = new Map<string, Set<(conflicts: ClinicalConflict[]) => void>>();
  private actionsListeners = new Map<string, Set<(actions: RecommendedAction[]) => void>>();
  private auditListeners = new Map<string, Set<(events: AuditEvent[]) => void>>();
  private resourcesListeners = new Set<(resources: HospitalResource[]) => void>();

  reset() {
    this.patients.clear();
    this.inputs.clear();
    this.facts.clear();
    this.conflicts.clear();
    this.actions.clear();
    this.auditEvents.clear();
    this.resources.clear();
  }

  // --- Patients ---
  getPatient(id: string): Patient | null {
    return this.patients.get(id) ?? null;
  }

  listPatients(): Patient[] {
    return Array.from(this.patients.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  setPatient(patient: Patient): void {
    this.patients.set(patient.id, { ...patient });
    this.notifyPatient(patient.id);
    this.notifyAllPatients();
  }

  subscribePatient(id: string, callback: (p: Patient | null) => void): () => void {
    if (!this.patientListeners.has(id)) {
      this.patientListeners.set(id, new Set());
    }
    const set = this.patientListeners.get(id)!;
    set.add(callback);
    // Send immediate initial value
    callback(this.getPatient(id));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.patientListeners.delete(id);
    };
  }

  subscribeAllPatients(callback: (patients: Patient[]) => void): () => void {
    this.allPatientsListeners.add(callback);
    callback(this.listPatients());
    return () => {
      this.allPatientsListeners.delete(callback);
    };
  }

  private notifyPatient(id: string) {
    const listeners = this.patientListeners.get(id);
    if (listeners) {
      const p = this.getPatient(id);
      listeners.forEach((cb) => {
        try {
          cb(p);
        } catch (e) {
          console.error(`Error in patient listener for ${id}:`, e);
        }
      });
    }
  }

  private notifyAllPatients() {
    const list = this.listPatients();
    this.allPatientsListeners.forEach((cb) => {
      try {
        cb(list);
      } catch (e) {
        console.error('Error in allPatients listener:', e);
      }
    });
  }

  // --- Inputs ---
  getInputs(patientId: string): PatientInput[] {
    return Array.from(this.inputs.values())
      .filter((i) => i.patientId === patientId)
      .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
  }

  setInput(input: PatientInput): void {
    this.inputs.set(input.id, { ...input });
    this.notifyInputs(input.patientId);
  }

  subscribeInputs(patientId: string, callback: (inputs: PatientInput[]) => void): () => void {
    if (!this.inputsListeners.has(patientId)) {
      this.inputsListeners.set(patientId, new Set());
    }
    const set = this.inputsListeners.get(patientId)!;
    set.add(callback);
    callback(this.getInputs(patientId));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.inputsListeners.delete(patientId);
    };
  }

  private notifyInputs(patientId: string) {
    const listeners = this.inputsListeners.get(patientId);
    if (listeners) {
      const list = this.getInputs(patientId);
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch (e) {
          console.error(`Error in inputs listener for ${patientId}:`, e);
        }
      });
    }
  }

  // --- Facts ---
  getFacts(patientId: string): ClinicalFact[] {
    return Array.from(this.facts.values())
      .filter((f) => f.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  setFact(fact: ClinicalFact): void {
    this.facts.set(fact.id, { ...fact });
    this.notifyFacts(fact.patientId);
  }

  subscribeFacts(patientId: string, callback: (facts: ClinicalFact[]) => void): () => void {
    if (!this.factsListeners.has(patientId)) {
      this.factsListeners.set(patientId, new Set());
    }
    const set = this.factsListeners.get(patientId)!;
    set.add(callback);
    callback(this.getFacts(patientId));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.factsListeners.delete(patientId);
    };
  }

  private notifyFacts(patientId: string) {
    const listeners = this.factsListeners.get(patientId);
    if (listeners) {
      const list = this.getFacts(patientId);
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch (e) {
          console.error(`Error in facts listener for ${patientId}:`, e);
        }
      });
    }
  }

  // --- Conflicts ---
  getConflicts(patientId: string): ClinicalConflict[] {
    return Array.from(this.conflicts.values())
      .filter((c) => c.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  setConflict(conflict: ClinicalConflict): void {
    this.conflicts.set(conflict.id, { ...conflict });
    this.notifyConflicts(conflict.patientId);
  }

  subscribeConflicts(
    patientId: string,
    callback: (conflicts: ClinicalConflict[]) => void
  ): () => void {
    if (!this.conflictsListeners.has(patientId)) {
      this.conflictsListeners.set(patientId, new Set());
    }
    const set = this.conflictsListeners.get(patientId)!;
    set.add(callback);
    callback(this.getConflicts(patientId));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.conflictsListeners.delete(patientId);
    };
  }

  private notifyConflicts(patientId: string) {
    const listeners = this.conflictsListeners.get(patientId);
    if (listeners) {
      const list = this.getConflicts(patientId);
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch (e) {
          console.error(`Error in conflicts listener for ${patientId}:`, e);
        }
      });
    }
  }

  // --- Actions ---
  getActions(patientId: string): RecommendedAction[] {
    return Array.from(this.actions.values())
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => {
        const pOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const pA = typeof a.priority === 'number' ? a.priority : (pOrder[a.priority] ?? 0);
        const pB = typeof b.priority === 'number' ? b.priority : (pOrder[b.priority] ?? 0);
        return pB - pA;
      });
  }

  setAction(action: RecommendedAction): void {
    this.actions.set(action.id, { ...action });
    this.notifyActions(action.patientId);
  }

  subscribeActions(
    patientId: string,
    callback: (actions: RecommendedAction[]) => void
  ): () => void {
    if (!this.actionsListeners.has(patientId)) {
      this.actionsListeners.set(patientId, new Set());
    }
    const set = this.actionsListeners.get(patientId)!;
    set.add(callback);
    callback(this.getActions(patientId));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.actionsListeners.delete(patientId);
    };
  }

  private notifyActions(patientId: string) {
    const listeners = this.actionsListeners.get(patientId);
    if (listeners) {
      const list = this.getActions(patientId);
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch (e) {
          console.error(`Error in actions listener for ${patientId}:`, e);
        }
      });
    }
  }

  // --- Resources ---
  getResources(): HospitalResource[] {
    return Array.from(this.resources.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  setResource(resource: HospitalResource): void {
    this.resources.set(resource.id, { ...resource });
    this.notifyResources();
  }

  subscribeResources(callback: (resources: HospitalResource[]) => void): () => void {
    this.resourcesListeners.add(callback);
    callback(this.getResources());
    return () => {
      this.resourcesListeners.delete(callback);
    };
  }

  private notifyResources() {
    const list = this.getResources();
    this.resourcesListeners.forEach((cb) => {
      try {
        cb(list);
      } catch (e) {
        console.error('Error in resources listener:', e);
      }
    });
  }

  // --- Audit Events ---
  getAuditEvents(patientId: string): AuditEvent[] {
    return Array.from(this.auditEvents.values())
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  setAuditEvent(event: AuditEvent): void {
    this.auditEvents.set(event.id, { ...event });
    this.notifyAudit(event.patientId);
  }

  subscribeAuditEvents(
    patientId: string,
    callback: (events: AuditEvent[]) => void
  ): () => void {
    if (!this.auditListeners.has(patientId)) {
      this.auditListeners.set(patientId, new Set());
    }
    const set = this.auditListeners.get(patientId)!;
    set.add(callback);
    callback(this.getAuditEvents(patientId));
    return () => {
      set.delete(callback);
      if (set.size === 0) this.auditListeners.delete(patientId);
    };
  }

  private notifyAudit(patientId: string) {
    const listeners = this.auditListeners.get(patientId);
    if (listeners) {
      const list = this.getAuditEvents(patientId);
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch (e) {
          console.error(`Error in audit listener for ${patientId}:`, e);
        }
      });
    }
  }
}

export const inMemoryStore = new InMemoryStore();

