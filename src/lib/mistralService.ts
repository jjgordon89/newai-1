/**
 * Service for interacting with Mistral AI API
 */

/**
 * Check if the Mistral API key is valid
 * @param apiKey The API key to check
 * @returns Promise resolving to a boolean indicating if the key is valid
 */
export async function checkMistralApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.mistral.ai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking Mistral API key:", error);
    return false;
  }
}

/**
 * Get available Mistral models
 * @param apiKey The API key to use
 * @returns Promise resolving to an array of model objects
 */
export async function getMistralModels(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch("https://api.mistral.ai/v1/models", {
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
    console.error("Error fetching Mistral models:", error);
    return [];
  }
}

/**
 * Generate embeddings using Mistral API
 * @param texts Array of texts to embed
 * @param apiKey The API key to use
 * @param model The embedding model to use (defaults to mistral-embed)
 * @returns Promise resolving to an array of embeddings
 */
export async function generateMistralEmbeddings(
  texts: string[],
  apiKey: string,
  model: string = "mistral-embed",
): Promise<number[][]> {
  try {
    const results: number[][] = [];

    // Process each text individually to avoid request size limits
    for (const text of texts) {
      const response = await fetch("https://api.mistral.ai/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate embeddings: ${response.status}`);
      }

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].embedding) {
        results.push(data.data[0].embedding);
      }
    }

    return results;
  } catch (error) {
    console.error("Error generating Mistral embeddings:", error);
    throw error;
  }
}
