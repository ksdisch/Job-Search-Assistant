import { GoogleGenAI, Type } from "@google/genai";
import { FitAnalysis, Job } from '../types';

// Lazily instantiate the client so a missing API key doesn't crash initial render
let ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (ai) return ai;
  const apiKey = (process.env.API_KEY as string | undefined)
    || (process.env.GEMINI_API_KEY as string | undefined)
    || (typeof window !== 'undefined' ? (window as any)?.VITE_GEMINI_API_KEY : undefined);
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY in your env.");
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

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
      const prompt = "Extract the text content from this file. After extracting, please format it for optimal readability, ensuring proper line breaks, consistent spacing, and clear paragraph structure. Output only the formatted text, with no additional commentary or introductions.";

      const response = await getAI().models.generateContent({
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

    const response = await getAI().models.generateContent({
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
    const response = await getAI().models.generateContent({
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

export const generateInterviewQuestions = async (jobDescription: string, resume: string): Promise<{ questions: { type: string; question: string; tip: string }[] }> => {
    try {
        const prompt = `
            As an expert technical recruiter and interview coach, analyze the provided job description and candidate's resume.
            Generate a list of 5-7 potential interview questions that are highly relevant to this specific role and candidate.

            For each question, provide:
            1. The question itself.
            2. The type of question (e.g., "Behavioral", "Technical", "Situational").
            3. A concise "Pro Tip" on how the candidate can best answer it, ideally by referencing their own experience from the resume.

            JOB DESCRIPTION:
            ---
            ${jobDescription}
            ---

            RESUME:
            ---
            ${resume}
            ---
        `;

        const response = await getAI().models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: 'Type of question (e.g., Behavioral, Technical)' },
                                    question: { type: Type.STRING, description: 'The interview question' },
                                    tip: { type: Type.STRING, description: 'A tip for answering, referencing the resume' },
                                },
                                required: ['type', 'question', 'tip'],
                            },
                        },
                    },
                    required: ['questions'],
                },
            },
        });
        
        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText) as { questions: { type: string; question: string; tip: string }[] };
        } catch (parseError) {
            console.error("Error parsing interview questions JSON:", parseError);
            throw new Error("Failed to parse interview questions response. Please try again.");
        }
    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error("Failed to generate interview questions. This is a complex task and may sometimes fail. Please try again.");
    }
};

export const researchCompany = async (companyName: string, jobTitle: string): Promise<string> => {
    try {
        const prompt = `
            Provide a concise research briefing about the company "${companyName}" for a candidate interviewing for the role of "${jobTitle}".
            Use your search tool to find the most recent and relevant information.
            
            Structure your response in markdown with the following sections:
            - **Company Overview:** What does the company do? What is its mission?
            - **Recent News & Developments:** Mention 1-2 recent news items, product launches, or announcements.
            - **Company Culture:** Briefly describe the company culture (e.g., fast-paced, collaborative, innovative).
            - **Potential Interview Focus:** Based on the company and role, what areas might the interview focus on?
        `;
        const response = await getAI().models.generateContent({
            model: FLASH_MODEL,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error researching company:", error);
        throw new Error("Failed to research the company. The search tool might be unavailable. Please try again.");
    }
};

export const extractJobDetails = async (url: string): Promise<Omit<Job, 'id' | 'logo'>> => {
    try {
        const prompt = `
            Analyze the content of the webpage at the following URL and extract the key details of the job posting.
            URL: ${url}
            
            Extract the following information:
            - The job title.
            - The company name.
            - The location of the job (e.g., "San Francisco, CA", "Remote").
            - The full job description, formatted as plain text with appropriate line breaks.
            - A direct URL to apply for the job. If an "Apply" link is present on the page, use that link. Otherwise, use the original URL provided.
        `;

        const response = await getAI().models.generateContent({
            model: FLASH_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'The title of the job.' },
                        company: { type: Type.STRING, description: 'The name of the company.' },
                        location: { type: Type.STRING, description: 'The location of the job.' },
                        description: { type: Type.STRING, description: 'The full job description text.' },
                        url: { type: Type.STRING, description: 'The direct application URL.' },
                    },
                    required: ['title', 'company', 'location', 'description', 'url'],
                },
            },
        });
        
        const jsonText = response.text.trim();
        try {
            return JSON.parse(jsonText) as Omit<Job, 'id' | 'logo'>;
        } catch (parseError) {
            console.error("Error parsing job details JSON:", parseError);
            throw new Error("Failed to parse job details response. Please try again.");
        }
    } catch (error) {
        console.error("Error extracting job details:", error);
        throw new Error("Failed to extract job details from the link. The page might not be a valid job posting or could be inaccessible.");
    }
};

// --- Chatbot Functionality ---
export const sendMessageToBot = async (message: string, careerPreferences: string): Promise<{ text: string, sources?: {uri: string, title: string}[] }> => {
    try {
        const baseInstruction = 'You are a helpful and friendly AI assistant for a job search application. Your name is Career Companion. You can answer questions about job searching, careers, resumes, and provide general advice. When asked to find jobs, use your search tool to find relevant, up-to-date job listings and provide links.';
        
        const fullInstruction = careerPreferences && careerPreferences.trim()
            ? `${baseInstruction}\n\nIMPORTANT: Use the following context about the user's career preferences and goals to provide more tailored advice. Refer to it when suggesting jobs, companies, or strategies.\n---\n${careerPreferences}\n---`
            : baseInstruction;

        const response = await getAI().models.generateContent({
            model: FLASH_MODEL,
            contents: message,
            config: {
                systemInstruction: fullInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        // FIX: Correctly typed the `reduce` operation on `groundingChunks`. The original code had a syntax error and
        // failed to properly type the accumulator, leading to a type mismatch. This ensures the extracted sources are
        // correctly typed as an array of objects with `uri` and `title`.
        const sources = (groundingChunks as any[])
            ?.reduce((acc: { uri: string; title: string }[], chunk: any) => {
                const web = chunk?.web;
                if (web?.uri && web.title) {
                    acc.push({ uri: web.uri, title: web.title });
                }
                return acc;
            }, [] as { uri: string; title: string }[]) || [];

        // Deduplicate sources based on URI
        const uniqueSources = Array.from(
            new Map<string, { uri: string; title: string }>(sources.map(item => [item.uri, item])).values()
        ) as { uri: string; title: string }[];

        return { text, sources: uniqueSources };
    } catch (error) {
        console.error("Error in chat:", error);
        throw new Error("Failed to get response from the bot. Please try again.");
    }
};
