export type RiskLevel = 'low' | 'medium' | 'critical';

export type Channel = 'sms' | 'call' | 'whatsapp';

export type SignalSeverity = RiskLevel;

export type Signal = {
  id: string;
  label: string;
  description: string;
  severity: SignalSeverity;
};

export type EvidenceType = 'web_scrape' | 'family_memory' | 'official_policy';

export type Evidence = {
  id: string;
  source: string;
  finding: string;
  type: EvidenceType;
};

export type ActionButton = {
  id: string;
  label: string;
  primary: boolean;
  icon: string;
};

export type AgentTrace = {
  analyzer: string;
  investigator: string;
  guardian: string;
};

export type Caption = {
  atMs: number;
  text: string;
};

export type Scenario = {
  id: string;
  message: {
    text: string;
    from: string;
    channel: Channel;
  };
  score: number;
  riskLevel: RiskLevel;
  signals: Signal[];
  evidence: Evidence[];
  empathicResponse: string;
  actions: ActionButton[];
  agentTrace: AgentTrace;
  callScript?: Caption[];
};
