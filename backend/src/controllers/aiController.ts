import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { GenerateFieldRequest } from '../types/requests';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const generateField = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { field, context, maxTokens = 200, temperature = 0.8 } = req.body as GenerateFieldRequest;

    // 构建提示词
    const prompt = buildPrompt(field, context);

    // 调用 DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的角色设定助手，负责生成角色设定中的各个字段内容。请根据上下文生成符合角色设定的内容。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.choices[0]?.message?.content || '';

    res.json({
      success: true,
      generatedText,
      field
    });
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    next(error);
  }
};

function buildPrompt(field: string, context: Record<string, any>): string {
  const fieldPrompts: Record<string, string> = {
    appearance: "请根据以下角色信息，生成一段详细的外貌描述：",
    personality: "请根据以下角色信息，生成一段详细的性格描述：",
    identity: "请根据以下角色信息，生成一段详细的身份背景：",
    supplemental: "请根据以下角色信息，生成一段详细的补充设定：",
    world: "请根据以下角色信息，生成一段详细的世界观设定：",
    userRelation: "请根据以下角色信息，生成一个合适的与用户的关系描述：",
    addressUser: "请根据以下角色信息，生成一个合适的对用户的称呼：",
    greeting: "请根据以下角色信息，生成一句合适的开场白：",
    catchphrase: "请根据以下角色信息，生成一句合适的口癖：",
    stance: "请根据以下角色信息，生成一个合适的立场描述：",
  };

  const basePrompt = fieldPrompts[field] || "请根据以下角色信息，生成合适的内容：";
  
  // 构建上下文描述
  const contextDescription = Object.entries(context)
    .filter(([_, value]) => value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `${basePrompt}\n\n角色信息：\n${contextDescription}`;
} 