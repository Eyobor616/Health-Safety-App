
export interface User {
  name: string;
  id: string;
  dept: string;
  role: 'observer' | 'manager' | 'hse';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  timestamp: number;
  read: boolean;
}

export type SBOStatus = 'open' | 'pending' | 'closed';
export type SBOType = 'safe' | 'unsafe' | 'near-miss';
export type ActOrCondition = 'act' | 'condition';

/**
 * Data model for a Safety Behavioral Observation (SBO)
 */
export interface SBO {
  id: string;
  type: SBOType;
  actOrCondition: ActOrCondition;
  location: string;
  unit: string;
  areaMgr: string; // The currently assigned manager name
  assignedToId?: string; // UID of the manager handling it
  category: string;
  subCategory: string;
  description: string;
  suggestedSolution: string;
  imageUrl?: string;
  status: SBOStatus;
  comments: Comment[];
  notifications: Notification[];
  observer: User;
  timestamp: number;
  closedAt?: number;
  closedBy?: string;
}
