
import { GoogleGenAI, Type } from "@google/genai";
import { FitAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const model = 'gemini-2.5-flash';

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
      model,
      contents: prompt,
      config: {
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
    throw new Error("Failed to analyze job fit. Please check the console for details.");
  }
};

const generateText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
       config: {
          temperature: 0.7,
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
  return generateText(prompt);
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
  return generateText(prompt);
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
  return generateText(prompt);
};
