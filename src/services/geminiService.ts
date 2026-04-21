import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ElectionInfoRequest {
  location: string;
  registrationStatus: string;
  specificQuestion?: string;
}

export async function getElectionGuidance(request: ElectionInfoRequest) {
  const { location, registrationStatus, specificQuestion } = request;

  const prompt = specificQuestion 
    ? `User is in ${location}, India, and their registration status is: ${registrationStatus}. 
       They have a specific question: "${specificQuestion}"
       Provide a detailed, accurate answer based on current Indian election laws (Election Commission of India) and schedules.`
    : `User is in ${location}, India, and their registration status is: ${registrationStatus}. 
       Provide a comprehensive overview of:
       1. Upcoming election dates (Lok Sabha, Legislative Assembly, or local bodies in ${location}).
       2. Voter registration (Voter ID/EPIC card) process and deadlines.
       3. Voting methods and polling details in ${location}.
       4. Required identification (Aadhaar, EPIC, etc.) for voting in India.
       Use a structured, easy-to-read format with clear steps.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert non-partisan election assistant for India. Your goal is to provide accurate, up-to-date information based on the Election Commission of India (ECI) guidelines. Always cite official sources like voters.eci.gov.in and encourage civic participation.",
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching election guidance:", error);
    throw error;
  }
}
