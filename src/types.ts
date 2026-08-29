export interface CompanyLead {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  suburb?: string;
  city?: string;
  state?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  lat?: number;
  lon?: number;
  mapsSearchUrl: string;
  mapsCoordUrl?: string;
  highlight?: string;
  hasPhone?: boolean;
  hasWebsite?: boolean;
  hasAddress?: boolean;
}

export interface IcebreakerResult {
  whatsappMessage: string;
  coldEmail: {
    subject: string;
    body: string;
  };
  personalizedHook: string;
  recommendedAngle: string;
  modelUsed?: string;
}

export interface BackgroundJob {
  id: string;
  title: string;
  type: "single_city" | "batch_multi" | "grid_gps";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  cities: string[];
  niches: string[];
  progressPercent: number;
  currentStep: string;
  totalCombinations: number;
  completedCombinations: number;
  leadsCollected: number;
  leads: CompanyLead[];
  createdAt: string;
  finishedAt?: string;
  logs: string[];
}

export interface GridTile {
  id: string;
  lat: number;
  lon: number;
  distanceKm: number;
  url: string;
}

export interface GridResponse {
  success: boolean;
  keyword: string;
  center: { lat: number; lon: number };
  radiusKm: number;
  gridStepKm: number;
  totalTiles: number;
  estimatedPotentialUrls: number;
  tiles: GridTile[];
}

export interface PythonScript {
  id: string;
  title: string;
  fileName: string;
  description: string;
  badge: string;
  category: "maps_fix" | "alternative_osm" | "grid_orchestrator" | "gemini_enricher" | "pipeline_sh";
  code: string;
}

