// User roles
export type UserRole = 'user' | 'admin';

// User affiliations (身分)
export type Affiliation = 'student' | 'faculty' | 'staff' | 'other';

// Research areas (領域)
export type ResearchArea = 'cs' | 'is' | 'ms' | 'other';

// Capture outcomes
export type CaptureOutcome = 'jaileon' | 'yellow_jaileon' | 'blue_jaileon' | 'rainbow_jaileon' | 'bird';

// Capture game states
export type CaptureState = 'LOADING' | 'APPEARING' | 'IDLE' | 'CATCHING' | 'ESCAPED' | 'RESULT';

// Database row types
// Avatar options
export type AvatarType = 'green' | 'yellow' | 'blue' | 'rainbow' | 'bird';

export interface User {
  id: string; // JW-XXXXXX format
  name: string;
  email: string;
  affiliation: Affiliation;
  research_area: ResearchArea;
  role: UserRole;
  avatar: AvatarType;
  points: number;
  capture_count: number;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface QrLocation {
  id: string; // UUID
  code: string; // UUID v4 - the actual QR code value
  name_ja: string;
  name_en: string;
  location_number: number;
  is_active: boolean;
  created_at: string;
}

export interface DailyQrOutcome {
  id: string;
  qr_location_id: string;
  date: string; // YYYY-MM-DD
  outcome: CaptureOutcome;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  qr_location_id: string;
  outcome: CaptureOutcome;
  points_earned: number;
  scanned_at: string;
  date: string; // YYYY-MM-DD for unique constraint
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number; // positive or negative
  reason: string;
  balance_after: number;
  admin_id: string | null;
  created_at: string;
}

export interface PrivacyScanLog {
  id: string;
  affiliation: Affiliation;
  research_area: ResearchArea;
  location_number: number;
  scanned_at: string;
}

// API request/response types
export interface RegisterRequest {
  name: string;
  email: string;
  affiliation: Affiliation;
  research_area: ResearchArea;
}

export interface LoginRequest {
  user_id: string;
}

export interface RecoverRequest {
  email: string;
}

export interface CaptureRequest {
  qr_code: string;
}

export interface CaptureResponse {
  outcome: CaptureOutcome;
  captured: boolean;
  points_earned: number;
  total_points: number;
  capture_count: number;
  location_name: string;
}

export interface PointOperationRequest {
  user_id: string;
  amount: number;
  reason: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  affiliation: Affiliation;
  research_area: ResearchArea;
  role: UserRole;
  avatar: AvatarType;
  points: number;
  capture_count: number;
  recent_scans: (Scan & { location_name: string })[];
  recent_transactions: PointTransaction[];
}
