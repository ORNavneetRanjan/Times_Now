// judgeImageWithGemini.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY,
});

export async function judgeImageWithGemini({ result, userDescription }) {
  const config = {
    thinkingConfig: {
      thinkingBudget: 8000,
    },
    responseMimeType: "application/json",
  };

  const model = "gemini-2.5-flash-preview-04-17";

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `i want to you judge an image that does not making much value to any business for e.g. image without anything prominent, hazzy.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, I understand... [truncated for brevity, leave unchanged in your file]`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `i want you response to be very consise as i will display your result strainght onto my website`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, concise response:\n\n**Low Commercial Value.** Lacks clarity and a focal point, limiting practical business applications.`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `little bit of detailing of the image as well`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, here's a concise response with a bit more detail:\n\n**Low Commercial Value.** Hazy image lacks clarity and a prominent subject. Limited use for marketing, branding, or visual communication.`,
        },
      ],
    },
    {
      role: "user",
      parts: [{ text: userDescription }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let resultText = "";
  for await (const chunk of response) {
    if (chunk?.candidates?.[0]?.content?.parts?.[0]?.text) {
      resultText += chunk.candidates[0].content.parts[0].text;
    }
  }

  return resultText.trim();
}
