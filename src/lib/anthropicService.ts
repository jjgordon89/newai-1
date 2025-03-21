/**
 * Service for interacting with Anthropic API
 */

/**
 * Check if the Anthropic API key is valid
 * @param apiKey The API key to check
 * @returns Promise resolving to a boolean indicating if the key is valid
 */
export async function checkAnthropicApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking Anthropic API key:", error);
    return false;
  }
}

/**
 * Get available Anthropic models
 * @param apiKey The API key to use
 * @returns Promise resolving to an array of model objects
 */
export async function getAnthropicModels(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching Anthropic models:", error);
    return [];
  }
}

/**
 * Generate content using Anthropic API
 * @param messages Array of messages to generate content for
 * @param apiKey The API key to use
 * @param model The model to use (defaults to claude-3-opus-20240229)
 * @returns Promise resolving to the generated content
 */
export async function generateAnthropicContent(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  model: string = "claude-3-opus-20240229",
): Promise<string> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages: messages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })),
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate content: ${response.status}`);
    }

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text;
    }

    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Error generating Anthropic content:", error);
    throw error;
  }
}
