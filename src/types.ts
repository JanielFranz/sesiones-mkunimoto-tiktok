export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  date: string;
  isStudent?: boolean;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  discordId?: string;
  date: string;
  timeSlot: string;
  motive: 'secundaria' | 'universitario' | 'reconversion' | 'general';
  customDetails: string;
  status: 'confirmed' | 'pending';
  code: string;
}

export interface RoadmapRequest {
  currentStage: string; // 'secundaria' | 'universidad_inicial' | 'universidad_final' | 'reconversion'
  dreamRole: string; // 'frontend' | 'backend' | 'datascience' | 'mobile' | 'game'
  experienceYears: string;
  mainDoubt: string;
}

export interface RoadmapStep {
  title: string;
  duration: string;
  description: string;
  skillsToLearn: string[];
  kuniTip: string;
}

export interface RoadmapResponse {
  roleName: string;
  summary: string;
  steps: RoadmapStep[];
  kuniFinalAdvice: string;
}

export interface ProfileReviewRequest {
  profileText: string;
  type: 'linkedin' | 'cv';
}

export interface ProfileReviewResponse {
  score: number; // 0-100
  positives: string[];
  negatives: string[];
  suggestedRewrites: {
    title: string;
    description: string;
    summary: string;
    rationale: string;
  }[];
  kuniFeedback: string;
}
