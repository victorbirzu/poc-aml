export type AmlReport = {
  output: AmlReportOutput;
};

export type AmlReportOutput = {
  searched_subject: SearchedSubject;
  consentsSigned: boolean;
  analysis_metadata: AnalysisMetadata;
  aggregated_report: AggregatedReport;
};

export type SearchedSubject = {
  name: string;
  identifier: string;
  identifier_type: string;
};

export type AnalysisMetadata = {
  processed_at: string;
  documents_analyzed: number;
};

export type AggregatedReport = {
  header: ReportHeader;
  narrative_summary: string;
  aggregated_flags: AggregatedFlags;
  cases: Case[];
};

export type ReportHeader = {
  search_date: string;
  total_cases: number;
  lost_cases_adverse_position: number;
  won_cases_adverse_position: number;
  pending_cases_adverse_position: number;
  overall_risk_level: 'High' | 'Medium' | 'Low';
};

export type AggregatedFlags = {
  [key: string]: {
    present: boolean;
    case_numbers: string[];
  };
};

export type Case = {
  case_number: string;
  court: string;
  decision_date: string;
  case_topic: string;
  language: string;
  case_types: string[];
  procedural_status: string;
  subject_role: string;
  outcome_for_subject: 'winning' | 'losing';
  financial_impact: FinancialImpact;
  aml_esg_dd_flags_in_case: string[];
  case_categories: string[];
  documents: Document[];
  procedural_history: string[];
};

export type FinancialImpact = {
  disputed_amount: string | number;
  admitted_amount: string | number;
  penalties?: number;
  currency: string;
};

export type Document = {
  document_id: string;
  url: string;
  source: string;
  decision_type: string;
};

export type PostBody = {
    name: string;
}

// Country code type (ISO 3166-1 alpha-2)
export type Alpha2CountryCode = string;

// Business entity type
export type Business = {
  entityType: "Business";
  companyNames: string[];
};

// Individual entity type
export type Individual = {
  entityType: "Individual";
  firstName: string;
  middleName: string | "";
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth?: `${string}-${string}-${string}`; // format YYYY-MM-DD
  placeOfBirth?: Alpha2CountryCode; // defaults to "MD"
};

// Request body type for Lexis Nexis (4th circle)
export type RequestBody = Business | Individual;
