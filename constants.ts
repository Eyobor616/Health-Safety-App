import { User } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Manager Tom', role: 'manager', dept: 'Operations' },
  { id: '2', name: 'Manager Jerry', role: 'manager', dept: 'Operations' },
  { id: '3', name: 'HSE Admin', role: 'hse', dept: 'Safety' },
  { id: '4', name: 'Observer 1', role: 'observer', dept: 'Operations' },
  { id: '5', name: 'Observer 2', role: 'observer', dept: 'Operations' },
  { id: '6', name: 'Observer 3', role: 'observer', dept: 'Operations' },
  { id: '7', name: 'Observer 4', role: 'observer', dept: 'Operations' },
  { id: '8', name: 'Observer 5', role: 'observer', dept: 'Operations' },
];

export const LOCATIONS = [
  'Plant A',
  'Plant B',
  'Plant C',
  'Warehouse',
  'Office'
];

export const UNITS = [
  'Unit 1',
  'Unit 2',
  'Unit 3',
  'Line A',
  'Line B'
];

export const AREA_MANAGERS = [
  'John Doe',
  'Sarah Smith',
  'Michael Chen',
  'Olu Bakare'
];

export const CATEGORIES = [
  'Equipment',
  'Procedures',
  'Environment',
  'Personal Protective Equipment',
  'Training'
];

const SUBCATEGORIES: Record<string, string[]> = {
  'Equipment': ['Maintenance', 'Operation', 'Calibration'],
  'Procedures': ['Documentation', 'Compliance', 'Execution'],
  'Environment': ['Cleanliness', 'Lighting', 'Ventilation'],
  'Personal Protective Equipment': ['Availability', 'Condition', 'Usage'],
  'Training': ['Certification', 'Awareness', 'Skills']
};

export const getSubCategories = (category: string): string[] => {
  return SUBCATEGORIES[category] || [];
};