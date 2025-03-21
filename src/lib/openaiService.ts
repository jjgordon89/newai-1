/**
 * Service for interacting with OpenAI API
 */

/**
 * Check if the OpenAI API key is valid
 * @param apiKey The API key to check
 * @returns Promise resolving to a boolean indicating if the key is valid
 */
export async function checkOpenAIApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking OpenAI API key:", error);
    return false;
  }
}

/**
 * Get available OpenAI models
 * @param apiKey The API key to use
 * @returns Promise resolving to an array of model objects
 */
export async function getOpenAIModels(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    return [];
  }
}

/**
 * Generate content using OpenAI API
 * @param messages Array of messages to generate content for
 * @param apiKey The API key to use
 * @param model The model to use (defaults to gpt-3.5-turbo)
 * @returns Promise resolving to the generated content
 */
export async function generateOpenAIContent(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  model: string = "gpt-3.5-turbo",
): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate content: ${response.status}`);
    }

    const data = await response.json();
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      return data.choices[0].message.content;
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Error generating OpenAI content:", error);
    throw error;
  }
}
