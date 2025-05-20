import { GoogleGenAI } from "@google/genai";

export async function main({ result }) {
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 8000,
    },
    responseMimeType: "application/json",
  };
  const model = "gemini-2.5-flash-preview-04-17";
  const userDescription = `
      Please judge this image. It has a blurriness score of ${result.blurriness_score}.
      The system classified its value as: "${result.status}".
      The image was enhanced (base64 encoded) and may contain unclear subjects or haze.
`;
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `i want to you judge an image that does not making much value to any business for e.g. image without anything prominent, hazzy.
`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, I understand.  Since the image is described as not having much value to a business and being hazy and lacking prominence, my judgment would likely be along these lines:

**Overall Assessment: Low Commercial Value**

Here's a breakdown of my reasoning:

*   **Lack of Visual Clarity:** Haze obscures details and creates a general lack of definition. This makes the image less appealing and less useful for conveying information or attracting attention. Visual clarity is essential for communication and is a basic requirement for effective marketing.

*   **Absence of Focal Point/Prominence:** Without a prominent subject or focal point, the image lacks a clear message or purpose. Images with no discernible subject are difficult to use for marketing, advertising, or branding. It's hard to create a narrative or draw the viewer in.

*   **Limited Use Cases:** The haziness and lack of clear subject matter significantly restrict the potential applications for this image. It would be difficult to use for:
    *   **Marketing/Advertising:**  No product or service is highlighted, and the overall aesthetic is not compelling.
    *   **Branding:**  Does not project a specific brand identity or value.
    *   **Website Design:**  Unlikely to contribute positively to the user experience or visual appeal of a website.
    *   **Social Media:** Will probably not generate engagement.

*   **Potential Negative Connotations:** Depending on the degree of haziness and the overall tone, the image might even evoke negative feelings (e.g., unclear, confusing, uncertain) which are generally not desirable for business purposes.

**Possible (Limited) Exceptions:**

There *might* be extremely niche situations where such an image could be used, but these are rare and highly context-dependent:

*   **Abstract Art or Conceptual Imagery:** In a highly artistic or conceptual context, the haziness could be interpreted as intentional and contribute to a specific artistic message. But this is unlikely to translate into commercial value for most businesses.

*   **Background Texture (with heavy manipulation):**  If the haziness is subtle enough, and the underlying structure of the image offers interesting textures, it might *potentially* be used as a heavily manipulated background in a design project. But even then, there are likely better options available.

**In summary:**  Based on the description, the image would likely be considered of low commercial value due to its lack of clarity, absence of a clear subject, and limited potential applications.

**To be more specific, if you could provide more detail or the actual image, I could give a more tailored judgement.** For example:

*   **What kind of haze is it?** (e.g., mist, fog, smoke, blur)
*   **What, if anything, is visible in the image?** (e.g., colors, shapes, vague outlines)
*   **What is the overall tone or feeling of the image?** (e.g., peaceful, unsettling, mysterious)
`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `i want you response to be very consise as i will display your result strainght onto my website
`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, concise response:

**Low Commercial Value.** Lacks clarity and a focal point, limiting practical business applications.
`,
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: `little bit of detailing of the image as well
`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Okay, here's a concise response with a bit more detail:

**Low Commercial Value.** Hazy image lacks clarity and a prominent subject. Limited use for marketing, branding, or visual communication.
`,
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
    resultText += chunk;
  }
  console.log(resultText);
  return resultText;
}
