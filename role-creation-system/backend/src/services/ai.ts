import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Define the type for character form data based on frontend structure
interface CharacterFormData {
  avatar: any; // File object, not directly used by AI, but part of context
  voice: any; // File object, not directly used by AI, but part of context
  language: string;
  name: string;
  gender: string;
  otherGender: string;
  age: string;
  birthday: string;
  mbti: string;
  otherMbti: string;
  stance: string;
  otherStance: string;
  personality: string;
  appearance: string;
  world: string;
  identity: string;
  supplemental: string;
  userRelation: string;
  addressUser: string;
  greeting: string;
  catchphrase: string;
  examples: string[];
}

export async function generateAIContent(field: keyof CharacterFormData, context: CharacterFormData): Promise<string> {
  try {
    let fieldInstruction = `为 '${field}' 字段生成内容。`;

    // Add specific instructions based on the field
    switch (field) {
      case 'personality':
        fieldInstruction = '生成角色的性格**描述**，包括优缺点、兴趣爱好等。';
        break;
      case 'appearance':
        fieldInstruction = '生成角色的外貌**描述**，包括身高体型、发型发色、瞳色等。';
        break;
      case 'world':
        fieldInstruction = '生成简短的世界观或背景**描述**，包括时代背景、文化冲突等。仅关注世界观元素，避免角色对话。';
        break;
      case 'identity':
        fieldInstruction = '生成角色的身份**描述**，包括种族、职业、阶层等。';
        break;
      case 'supplemental':
        fieldInstruction = '生成**补充设定描述**，例如角色经历、生活习惯等。';
        break;
      case 'userRelation':
        fieldInstruction = '生成角色与用户的关系**描述**，例如：挚友、上下级、主仆等。输出为简短的一句话。';
        break;
      case 'addressUser':
        fieldInstruction = '生成角色**如何称呼用户**的短语，例如：主人、挚友、阁下等。';
        break;
      case 'greeting':
        fieldInstruction = '生成角色的**开场白**，应是与人见面时的第一句问候。输出为简短的一句话。';
        break;
      case 'catchphrase':
        fieldInstruction = '生成角色的**口癖或常说的话**。';
        break;
      case 'examples':
        fieldInstruction = '生成一句代表角色说话风格的**示例对话**或台词摘录。';
        break;
      case 'mbti':
          fieldInstruction = '基于已有背景，建议一个**MBTI 类型或自定义类型**。';
          break;
      case 'stance':
          fieldInstruction = '基于已有背景，建议一个**阵营或立场**（例如：守序善良，混乱邪恶）或自定义立场。';
          break;
      // Add cases for other fields as needed
      default:
        fieldInstruction = `为 '${field}' 字段生成内容。`;
    }

    // Construct the prompt including the field-specific instruction and structured context
    const prompt = `任务：${fieldInstruction}。请严格按照要求输出纯文本内容，不需要任何 Markdown 格式，总长度不超过 300 字。\n\n角色数据背景 (请根据这些信息生成内容)：\n${JSON.stringify(context, null, 2)}\n\n请仅生成 '${field}' 字段所需的内容，不需要任何额外解释、格式或针对其他字段的内容。`;

    // Filter out File objects from context before sending to AI if necessary (depends on AI API capability)
    // For most text-based models, sending File objects directly is not useful.
    // Assuming DeepSeek API is text-based, we stringify the relevant parts.
    // The JSON.stringify above already handles this by representing File objects as empty objects or similar.

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专注于角色开发的创意写作助手。你的回应应详细、富有想象力，并与角色已有的特征保持一致。请严格按照用户指示，只输出请求的内容，不要任何额外解释或格式，并确保输出为纯文本且简洁。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8, // Slightly increased temperature for more variety
        max_tokens: 350 // Adjusted max_tokens to be closer to 300 characters
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text from the response
    const generatedText = response.data.choices[0]?.message?.content || '';

    // Basic post-processing: remove potential surrounding quotes or unexpected formatting
    // Adjusted regex to correctly handle escaped characters within the string literal
     return generatedText.trim().replace(/^['"【】]*/, '').replace(/['"【】]*$/, '');

  } catch (error) {
    console.error('Error generating AI content:', error);
    // Provide a more specific error message if possible, or rethrow
    if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
        throw new Error(`Failed to generate AI content: ${error.message || error.response?.statusText}`);
    } else {
        throw new Error('Failed to generate AI content');
    }
  }
} 