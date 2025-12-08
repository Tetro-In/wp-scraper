declare module '@google/genai' {
  type GenerateContentParams = {
    model: string;
    contents: any;
    config?: Record<string, unknown>;
  };

  export class GoogleGenAI {
    constructor(options: { apiKey: string; apiVersion?: string });
    models: {
      generateContent(params: GenerateContentParams): Promise<any>;
    };
  }
}


