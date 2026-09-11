import { Patient, ClinicalFact, ClinicalConflict, HospitalResource } from '@/types';
import { ReferenceData } from '@/types';

export const INDIAN_REFERENCE_DATA: ReferenceData[] = [
  {
    id: 'ref_stemi_icmr',
    topic: 'STEMI / Chest Pain',
    type: 'workflow',
    title: 'ICMR Standard Treatment Workflow for STEMI',
    content: 'Immediate ECG (within 10 min). Loading dose of Aspirin 300mg, Clopidogrel 300mg, and Atorvastatin 80mg. Transfer to PCI capable center if timeline < 120 mins, otherwise thrombolysis with Tenecteplase/Streptokinase.',
    sourceName: 'ICMR',
    sourceUrl: 'https://icmr.nic.in/stw',
    referenceVersion: 'v1.2 (2022)',
    retrievedAt: new Date().toISOString(),
    notes: 'Prioritize door-to-balloon time in Indian metropolitan context.'
  },
  {
    id: 'ref_snakebite_mohfw',
    topic: 'Snakebite Management',
    type: 'protocol',
    title: 'National Snakebite Management Protocol',
    content: 'Administer ASV (Anti-Snake Venom) immediately if signs of envenomation (progressive swelling, neurotoxic symptoms, systemic bleeding). Initial dose: 10 vials polyvalent ASV in 250ml NS over 1 hr. Do NOT wait for laboratory results if clinical signs are obvious.',
    sourceName: 'MoHFW',
    sourceUrl: 'https://mohfw.gov.in/snakebite',
    referenceVersion: '2015 Update',
    retrievedAt: new Date().toISOString(),
  },
  {
    id: 'ref_dengue_cdsco',
    topic: 'Dengue Fever / Hemorrhagic',
    type: 'workflow',
    title: 'Guidelines for Clinical Management of Dengue Fever',
    content: 'Avoid NSAIDs (Ibuprofen, Diclofenac) due to bleeding risk. Paracetamol is the only recommended antipyretic. Strict fluid management using NS or RL. Monitor hematocrit and platelet count closely.',
    sourceName: 'NVBDCP / MoHFW',
    referenceVersion: '2023',
    retrievedAt: new Date().toISOString(),
  },
  {
    id: 'ref_rta_trauma',
    topic: 'Polytrauma / Road Traffic Accident (RTA)',
    type: 'protocol',
    title: 'Initial Management of Polytrauma',
    content: 'ATLS protocol: Airway, Breathing, Circulation, Disability, Exposure. Initiate FAST (Focused Assessment with Sonography in Trauma). Administer Tranexamic Acid (TXA) 1g IV over 10 min followed by 1g over 8 hrs if massive hemorrhage is suspected.',
    sourceName: 'AIIMS Trauma Protocol',
    retrievedAt: new Date().toISOString(),
    notes: 'Highly relevant for high-velocity highway RTAs in India.'
  },
  {
    id: 'ref_asthma_copd',
    topic: 'Acute Respiratory Distress',
    type: 'protocol',
    title: 'Management of Acute Exacerbation of Bronchial Asthma',
    content: 'Nebulized Salbutamol (2.5-5 mg) with Ipratropium Bromide. Systemic Corticosteroids (Hydrocortisone 100-200 mg IV or oral Prednisolone 40-50 mg). Oxygen supplementation to target SpO2 93-95%.',
    sourceName: 'ICMR STW',
    referenceVersion: 'v2.0',
    retrievedAt: new Date().toISOString(),
  }
];


export const SYNTHETIC_PATIENTS: Patient[] = [
  {
    id: 'pt_ind_009',
    name: 'Anil Desai',
    age: 58,
    gender: 'M',
    incidentId: 'INC-DEMO-009',
    incidentDescription: 'Awaiting Triage Input',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'Unassigned',
    primaryComplaint: 'Pending Handover',
    state: 'UPLOADED',
    severity: 'WARNING',
    vitals: { heartRate: 110, bloodPressure: '90/60', oxygenSaturation: 94, respiratoryRate: 22 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_001',
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'M',
    incidentId: 'INC-2024-DEL-01',
    incidentDescription: 'Road Traffic Accident (Two-wheeler vs Car) on Ring Road, Delhi',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'T1 - Resuscitation',
    primaryComplaint: 'Severe head trauma and open femur fracture',
    state: 'ACTION_PENDING',
    severity: 'CRITICAL',
    vitals: { heartRate: 125, bloodPressure: '85/50', oxygenSaturation: 88, respiratoryRate: 28 },
    sbar: {
      situation: '45M brought in by CATS ambulance following high-speed RTA. Unresponsive, massive bleeding from right thigh.',
      background: 'No known medical history available. Wearing no helmet.',
      assessment: 'Hemorrhagic shock and severe TBI. GCS 6. Right open femur fracture.',
      recommendation: 'Immediate intubation, massive transfusion protocol, and urgent orthopedic/neurosurgical consult.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_002',
    name: 'Sunita Sharma',
    age: 62,
    gender: 'F',
    incidentId: 'INC-2024-MUM-02',
    incidentDescription: 'Collapsed at home, Mumbai',
    arrivalTime: new Date(Date.now() - 3600000).toISOString(),
    triageCategory: 'T2 - Emergent',
    primaryComplaint: 'Crushing chest pain radiating to left jaw',
    state: 'CONFLICT_DETECTED',
    severity: 'CRITICAL',
    vitals: { heartRate: 110, bloodPressure: '160/100', oxygenSaturation: 95, temperature: 98.6, respiratoryRate: 20 },
    sbar: {
      situation: '62F presenting with severe retrosternal chest pain starting 2 hours ago.',
      background: 'Known Type 2 Diabetic on Metformin. History of Hypertension.',
      assessment: 'Suspected acute STEMI. Diaphoretic and tachycardic.',
      recommendation: 'Stat ECG, Troponin, load with dual antiplatelets.'
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_003',
    name: 'Aarav Patel',
    age: 8,
    gender: 'M',
    incidentId: 'INC-2024-AHD-03',
    incidentDescription: 'Brought by parents from rural Ahmedabad',
    arrivalTime: new Date(Date.now() - 7200000).toISOString(),
    triageCategory: 'T2 - Emergent',
    primaryComplaint: 'Snakebite on right ankle 3 hours ago',
    state: 'HUMAN_REVIEW',
    severity: 'WARNING',
    vitals: { heartRate: 130, bloodPressure: '90/60', oxygenSaturation: 98, respiratoryRate: 24 },
    sbar: {
      situation: '8M with snakebite (unknown species) on right ankle. Progressive swelling up to the knee.',
      background: 'Previously healthy. Parents applied a tight tourniquet which paramedics removed.',
      assessment: 'Local envenomation signs present. High risk of systemic coagulopathy.',
      recommendation: 'Administer ASV per MoHFW guidelines, check WBCT20 (Whole Blood Clotting Test).'
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_004',
    name: 'Mohammed Tariq',
    age: 55,
    gender: 'M',
    incidentId: 'INC-2024-LKO-04',
    incidentDescription: 'Referred from local clinic in Lucknow',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'T3 - Urgent',
    primaryComplaint: 'Severe breathlessness and productive cough',
    state: 'EXTRACTED',
    severity: 'WARNING',
    vitals: { heartRate: 115, bloodPressure: '140/90', oxygenSaturation: 89, temperature: 101.2, respiratoryRate: 28 },
    sbar: {
      situation: '55M presenting with acute worsening of breathlessness and fever for 3 days.',
      background: 'Chronic beedi smoker (30 pack-years). Known COPD.',
      assessment: 'Acute Exacerbation of COPD, likely triggered by lower respiratory tract infection.',
      recommendation: 'Nebulized bronchodilators, IV corticosteroids, and empirical antibiotics.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_005',
    name: 'Lakshmi Iyer',
    age: 28,
    gender: 'F',
    incidentId: 'INC-2024-CHE-05',
    incidentDescription: 'Domestic incident, Chennai',
    arrivalTime: new Date(Date.now() - 1800000).toISOString(),
    triageCategory: 'T2 - Emergent',
    primaryComplaint: 'Thermal burns (approx 40% TBSA)',
    state: 'ACTION_PENDING',
    severity: 'CRITICAL',
    vitals: { heartRate: 135, bloodPressure: '100/65', oxygenSaturation: 97, respiratoryRate: 26 },
    sbar: {
      situation: '28F suffered accidental thermal burns from a kerosene stove.',
      background: 'No significant past medical history.',
      assessment: '40% TBSA second and third-degree burns involving anterior torso and bilateral upper limbs.',
      recommendation: 'Aggressive fluid resuscitation (Parkland formula), secure airway if inhalation injury suspected, IV analgesics.'
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_006',
    name: 'Rohan Deshmukh',
    age: 35,
    gender: 'M',
    incidentId: 'INC-2024-PUN-06',
    incidentDescription: 'Fainted at office desk, Pune',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'T3 - Urgent',
    primaryComplaint: 'Altered sensorium and profound sweating',
    state: 'HUMAN_REVIEW',
    severity: 'WARNING',
    vitals: { heartRate: 105, bloodPressure: '110/70', oxygenSaturation: 99, respiratoryRate: 18 },
    sbar: {
      situation: '35M brought by colleagues after fainting at work. Currently drowsy but rousable.',
      background: 'Known Type 1 Diabetic. Missed lunch after taking morning insulin.',
      assessment: 'Severe Hypoglycemia (CBG: 35 mg/dL).',
      recommendation: 'Administer 25% Dextrose IV stat. Monitor CBG closely.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_007',
    name: 'Meena Kumari',
    age: 72,
    gender: 'F',
    incidentId: 'INC-2024-KOL-07',
    incidentDescription: 'Sudden weakness at home, Kolkata',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'T2 - Emergent',
    primaryComplaint: 'Right-sided hemiparesis and aphasia',
    state: 'ACTION_PENDING',
    severity: 'CRITICAL',
    vitals: { heartRate: 88, bloodPressure: '180/110', oxygenSaturation: 96, respiratoryRate: 16 },
    sbar: {
      situation: '72F presenting with sudden onset right-sided weakness and inability to speak starting 45 mins ago.',
      background: 'Hypertensive, non-compliant with medications.',
      assessment: 'Acute Ischemic Stroke (in window period).',
      recommendation: 'Code Stroke activation. Urgent Non-Contrast CT Head to rule out hemorrhage prior to thrombolysis.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pt_ind_008',
    name: 'Karan Singh',
    age: 19,
    gender: 'M',
    incidentId: 'INC-2024-BLR-08',
    incidentDescription: 'Fever clinic triage, Bangalore',
    arrivalTime: new Date().toISOString(),
    triageCategory: 'T4 - Less Urgent',
    primaryComplaint: 'High-grade fever, retro-orbital pain, myalgia for 4 days',
    state: 'COMPLETED',
    severity: 'NORMAL',
    vitals: { heartRate: 100, bloodPressure: '120/80', oxygenSaturation: 99, temperature: 103.1, respiratoryRate: 18 },
    sbar: {
      situation: '19M presenting with classic dengue-like symptoms during monsoon season.',
      background: 'No comorbidities. Took Ibuprofen OTC at home.',
      assessment: 'Suspected Dengue Fever. No warning signs currently, but OTC NSAID use increases bleeding risk.',
      recommendation: 'Check CBC (platelets/Hct) and Dengue NS1. Advise strictly Paracetamol only and oral hydration.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const SYNTHETIC_FACTS: ClinicalFact[] = [
  { id: 'fact_ind_009_1', patientId: 'pt_ind_009', category: 'medical_history', value: 'History of Atrial Fibrillation', confidence: 100, sourceInputIds: [], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() },
  { id: 'fact_ind_009_2', patientId: 'pt_ind_009', category: 'medication', value: 'Takes Apixaban (Eliquis) 5mg BD (Blood thinner)', confidence: 100, sourceInputIds: [], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() },
  { id: 'fact_ind_009_3', patientId: 'pt_ind_009', category: 'allergy', value: 'Allergic to Cefotaxime (Severe anaphylaxis)', confidence: 100, sourceInputIds: [], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() },
  { id: 'fact_ind_001', patientId: 'pt_ind_002', category: 'allergy', value: 'Allergic to Aspirin (Hives)', confidence: 95, sourceInputIds: ['input_001'], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() },
  { id: 'fact_ind_002', patientId: 'pt_ind_002', category: 'medication', value: 'Metformin 500mg BD', confidence: 99, sourceInputIds: ['input_001'], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() },
  { id: 'fact_ind_003', patientId: 'pt_ind_008', category: 'medication', value: 'Ibuprofen 400mg OTC', confidence: 90, sourceInputIds: ['input_002'], verificationStatus: 'VERIFIED', createdAt: new Date().toISOString() }
];

export const SYNTHETIC_CONFLICTS: ClinicalConflict[] = [
  { id: 'conf_ind_001', patientId: 'pt_ind_002', severity: 'critical', topic: 'Aspirin Allergy vs STEMI Protocol', description: 'Patient requires Aspirin for suspected STEMI per ICMR STW, but has a verified Aspirin allergy.', conflictingFactIds: ['fact_ind_001'], requiresHumanReview: true, status: 'pending', type: 'conflict', createdAt: new Date().toISOString() },
  { id: 'conf_ind_002', patientId: 'pt_ind_008', severity: 'high', topic: 'NSAID use in suspected Dengue', description: 'Patient took Ibuprofen. CDSCO guidelines strictly advise against NSAIDs in Dengue due to bleeding risk.', conflictingFactIds: ['fact_ind_003'], requiresHumanReview: true, status: 'pending', type: 'missed_signal', createdAt: new Date().toISOString() }
];

export const HOSPITAL_RESOURCES: HospitalResource[] = [
  { id: 'res_tr_1', type: 'trauma_bay', name: 'Trauma Resuscitation Bay 1', quantity: 1, available: 0, location: 'ER Ground Floor', updatedAt: new Date().toISOString() },
  { id: 'res_tr_2', type: 'trauma_bay', name: 'Trauma Resuscitation Bay 2', quantity: 1, available: 1, location: 'ER Ground Floor', updatedAt: new Date().toISOString() },
  { id: 'res_icu', type: 'icu_bed', name: 'Neuro ICU Beds', quantity: 10, available: 2, location: '3rd Floor, Tower B', updatedAt: new Date().toISOString() },
  { id: 'res_blood_o_neg', type: 'blood', name: 'O-Negative Packed RBC', quantity: 20, available: 5, location: 'Main Blood Bank', updatedAt: new Date().toISOString() },
  { id: 'res_asv', type: 'blood', name: 'Polyvalent ASV Vials', quantity: 50, available: 35, location: 'ER Pharmacy Fridge', updatedAt: new Date().toISOString() },
  { id: 'res_vent', type: 'ventilator', name: 'Portable ER Ventilators', quantity: 5, available: 2, location: 'ER Equipment Room', updatedAt: new Date().toISOString() }
];
