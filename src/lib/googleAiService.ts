/**
 * Service for interacting with Google AI API
 */

/**
 * Check if the Google AI API key is valid
 * @param apiKey The API key to check
 * @returns Promise resolving to a boolean indicating if the key is valid
 */
export async function checkGoogleAiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        method: "GET",
        headers: {
          "x-goog-api-key": apiKey,
        },
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Error checking Google AI API key:", error);
    return false;
  }
}

/**
 * Get available Google AI models
 * @param apiKey The API key to use
 * @returns Promise resolving to an array of model objects
 */
export async function getGoogleAiModels(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        method: "GET",
        headers: {
          "x-goog-api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("Error fetching Google AI models:", error);
    return [];
  }
}

/**
 * Generate content using Google AI API
 * @param prompt The prompt to generate content for
 * @param apiKey The API key to use
 * @param model The model to use (defaults to gemini-pro)
 * @returns Promise resolving to the generated content
 */
export async function generateGoogleAiContent(
  prompt: string,
  apiKey: string,
  model: string = "gemini-pro",
): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to generate content: ${response.status}`);
    }

    const data = await response.json();
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Error generating Google AI content:", error);
    throw error;
  }
}
