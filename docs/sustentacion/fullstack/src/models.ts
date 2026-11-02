export interface Application {
  id: string;
  status: string;
  score: number;
}

export interface PipelineSummary {
  status: string;
  count: number;
  averageScore: number;
  nextAction: string;
}
