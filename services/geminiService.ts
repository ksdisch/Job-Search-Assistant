import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FitAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const PRO_MODEL = 'gemini-2.5-pro';
const FLASH_MODEL = 'gemini-2.5-flash';

// Helper to convert File to base64 for Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      const filePart = await fileToGenerativePart(file);
      const prompt = "Extract the text content from this resume file. Output only the raw text, with no additional commentary or formatting.";

      const response = await ai.models.generateContent({
        model: FLASH_MODEL,
        contents: { parts: [filePart, { text: prompt }] },
      });

      return response.text;
    } catch (error) {
      console.error("Error extracting text from file:", error);
      throw new Error("Failed to extract text from the file. The file might be corrupted or in an unsupported format. Please try again or paste the text manually.");
    }
  };

export const analyzeJobFit = async (jobDescription: string, resume: string): Promise<FitAnalysis> => {
  try {
    const prompt = `
      Analyze the following job description against the provided resume.
      Provide a "fit score" from 0 to 100 representing how well the candidate's resume matches the job requirements.
      Provide a concise one-sentence summary of the fit.
      List 3-5 key qualifications from the resume that match the job description (pros).
      List 3-5 potential gaps or areas where the resume is weaker for this specific role (cons).
      
      JOB DESCRIPTION:
      ---
      ${jobDescription}
      ---
      
      RESUME:
      ---
      ${resume}
      ---
    `;

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fitScore: { type: Type.INTEGER, description: 'A score from 0-100' },
            summary: { type: Type.STRING, description: 'A one-sentence summary' },
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of matching qualifications' },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of potential gaps' },
          },
          required: ['fitScore', 'summary', 'pros', 'cons'],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FitAnalysis;
  } catch (error) {
    console.error("Error analyzing job fit:", error);
    throw new Error("Failed to analyze job fit. This is a complex task and may sometimes fail. Please try again.");
  }
};

const generateText = async (prompt: string, model: string, config?: Record<string, any>): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
       config: {
          temperature: 0.7,
          ...config,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate content.");
  }
};

export const generateCoverLetter = (jobDescription: string, resume: string): Promise<string> => {
  const prompt = `
    Based on the following resume and job description, write a professional, concise, and compelling cover letter.
    The tone should be confident but not arrogant. Highlight the key skills and experiences from the resume that are most relevant to the job description.
    Keep it to 3-4 paragraphs.

    JOB DESCRIPTION:
    ---
    ${jobDescription}
    ---
    
    RESUME:
    ---
    ${resume}
    ---
  `;
  return generateText(prompt, PRO_MODEL, { thinkingConfig: { thinkingBudget: 32768 } });
};

export const generateResumeBullets = (jobDescription: string, resume: string): Promise<string> => {
  const prompt = `
    Analyze the provided resume and job description. Generate 3-5 tailored resume bullet points that highlight the most relevant skills and experiences for this specific job.
    Each bullet point should start with an action verb and be achievement-oriented.
    Format the output as a markdown list.

    JOB DESCRIPTION:
    ---
    ${jobDescription}
    ---
    
    RESUME:
    ---
    ${resume}
    ---
  `;
  return generateText(prompt, PRO_MODEL, { thinkingConfig: { thinkingBudget: 32768 } });
};

export const generateOutreachPitch = (jobDescription: string, resume: string): Promise<string> => {
  const prompt = `
    Based on the resume and job description, write a short and effective "elevator pitch" (2-3 sentences).
    This pitch can be used in an outreach email or a LinkedIn message to a recruiter. It should quickly summarize the candidate's value proposition for this role.

    JOB DESCRIPTION:
    ---
    ${jobDescription}
    ---
    
    RESUME:
    ---
    ${resume}
    ---
  `;
  return generateText(prompt, FLASH_MODEL);
};

export const improveContent = (contentToImprove: string): Promise<string> => {
  const prompt = `You are an expert career coach. Rewrite the following text to be more impactful and professional for a job application. Keep the core message intact but enhance the language and tone.\n\nTEXT:\n---\n${contentToImprove}\n---`;
  return generateText(prompt, FLASH_MODEL);
};

// --- Chatbot Functionality ---
let chatSession: Chat | null = null;

function getChatSession(): Chat {
    if (!chatSession) {
        chatSession = ai.chats.create({
            model: FLASH_MODEL,
            config: {
                systemInstruction: 'You are a helpful and friendly AI assistant for a job search application. Your name is Career Companion. You can answer questions about job searching, careers, resumes, and provide general advice.',
            },
        });
    }
    return chatSession;
}

export const sendMessageToBot = async (message: string): Promise<string> => {
    try {
        const chat = getChatSession();
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        chatSession = null; // Reset session on error
        throw new Error("Failed to get response from the bot. The session has been reset. Please try again.");
    }
};
