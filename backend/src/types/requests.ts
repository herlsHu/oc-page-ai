export interface GenerateFieldRequest {
  field: string;
  context: {
    language?: string;
    name?: string;
    gender?: string;
    age?: string;
    birthday?: string;
    mbti?: string;
    bloodType?: string;
    stance?: string;
    appearance?: string;
    personality?: string;
    identity?: string;
    catchphrase?: string;
    greeting?: string;
    userRelation?: string;
    supplemental?: string;
    world?: string;
    examples?: string[];
    [key: string]: any;
  };
  maxTokens?: number;
  temperature?: number;
} 