export interface CompanyLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  emailStatus?: "found" | "not_found" | "protected_cloudflare" | "generic";
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
  aboutUsText?: string;
  icebreaker?: string;
  coldEmailSubject?: string;
  coldEmailBody?: string;
  isEnriched?: boolean;
  isDuplicate?: boolean;
  leadStatus?: "raw" | "scraped" | "enriched" | "exported" | "webhook_sent";
  highlight?: string;
  hasPhone?: boolean;
  hasWebsite?: boolean;
  hasAddress?: boolean;
  scrapedAt?: string;
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
  type: "single_city" | "batch_multi" | "grid_gps" | "one_click_launch";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  cities: string[];
  niches: string[];
  limitPerCity?: number;
  scope?: "city_center" | "macro_metro";
  progressPercent: number;
  currentStep: string;
  totalCombinations: number;
  completedCombinations: number;
  leadsCollected: number;
  emailsFoundCount?: number;
  enrichedCount?: number;
  skippedDuplicatesCount?: number;
  failedSitesCount?: number;
  outputCsvFile?: string;
  outputXlsxFile?: string;
  outputJsonFile?: string;
  leads: CompanyLead[];
  createdAt: string;
  finishedAt?: string;
  logs: string[];
  settingsUsed?: {
    stealthMode: boolean;
    rotateProxies: boolean;
    autoEnrichGemini: boolean;
    autoScrapeWebsites: boolean;
  };
}

export interface OutputFile {
  filename: string;
  filePath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  type: "csv" | "json" | "xlsx";
  rowCount?: number;
  nicho?: string;
  cidade?: string;
}

export interface SystemSettings {
  geminiApiKey: string;
  geminiModel: string;
  proxies: string;
  rotateProxies: boolean;
  stealthMode: boolean;
  antiDuplication: boolean;
  autoScrapeWebsites: boolean;
  autoEnrichGemini: boolean;
  sellerOffer: string;
  webhookUrl: string;
  webhookPlatform: "instantly" | "lemlist" | "n8n" | "make" | "generic";
  totalKnownDuplicates: number;
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
