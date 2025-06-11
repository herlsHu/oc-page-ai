import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface GenerateFieldResponse {
  success: boolean;
  content: string;
  field: string;
}

export const generateField = async (
  field: string,
  context: Record<string, any>,
  maxTokens = 200,
  temperature = 0.8
): Promise<GenerateFieldResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/characters/generate-ai-content`, {
      field,
      context,
      maxTokens,
      temperature
    });
    return {
      success: true,
      content: response.data.content,
      field
    };
  } catch (error) {
    console.error('Error generating field:', error);
    throw error;
  }
}; 