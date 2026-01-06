
export const LOCATIONS = ['Lagos Plant', 'Aba Plant', 'Agbara Plant'];
export const UNITS = ['Canline 1', 'Canline 2', 'Endline 1', 'Warehouse', 'Maintenance'];
export const AREA_MANAGERS = ['John Doe', 'Sarah Smith', 'Michael Chen', 'Olu Bakare'];
export const DEPARTMENTS = ['Production', 'Safety', 'Engineering', 'Logistics', 'Quality'];

/**
 * JSON Mapping of Categories to Subcategories based on GZI Excel data.
 */
export const CATEGORIES_MAP: Record<string, string[]> = {
  'Body Position': [
    'Ascending/Descending', 'Grip/Force', 'Lifting/Lowering', 
    'Line of fire', 'Pivoting/Twisting', 'Posture', 
    'Risk of burns', 'Risk of falling', 'Others'
  ],
  'Food Safety': [
    'CAN Contamination', 'External Openings', 'Access Control', 
    'Raw Material Contamination', 'Pest Infestation', 'Personnel Hygiene'
  ],
  'Peoples Initial Reaction': [
    'Adapting the task', 'Adjusting PPE', 'Changing position', 
    'Stopping the task', 'Others'
  ],
  'Pollution': [
    'Air', 'Land', 'Water', 'Others'
  ],
  'PPE': [
    'Body', 'Eyes and face', 'Feet and legs', 'Hands and arms', 
    'Head', 'Hearing', 'Respiratory System', 'Others'
  ],
  'Procedures': [
    'Adequate but no followed', 'Inadequate', 'LOTO/Energy Isolation', 
    'There are no written procedures', 'Others'
  ],
  'Tools & Equipment': [
    'Appropriate for the task/use', 'Selection/condition', 
    'Used correctly', 'Others'
  ],
  'Work Environment': [
    'Appropriate for the task/use', 'Selection/condition', 
    'Used correctly', 'Others'
  ]
};

export const CATEGORIES = Object.keys(CATEGORIES_MAP);

export const getSubCategories = (category: string): string[] => {
  return CATEGORIES_MAP[category] || [];
};
