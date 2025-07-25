const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Validate API key on module load
if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables');
}

export const sendMessage = async (messages) => {
  try {
    // Convert OpenAI format to Gemini format
    const contents = messages.map(msg => {
      const parts = [];
      
      // Add text if present
      if (msg.content && typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      }
      
      // Add images if present
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(image => {
          // Handle different image data formats
          let imageData = image.data || image.preview;
          if (imageData) {
            // Extract base64 data and mime type from data URL
            const base64Data = imageData.split(',')[1];
            const mimeType = imageData.split(';')[0].split(':')[1];
            
            parts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            });
          }
        });
      }
      
      return {
        parts: parts,
        role: msg.role === 'assistant' ? 'model' : 'user'
      };
    });

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const sendMessageStream = async (messages, onChunk) => {
  try {
    // Convert OpenAI format to Gemini format
    const contents = messages.map(msg => {
      const parts = [];
      
      // Add text if present
      if (msg.content && typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      }
      
      // Add images if present
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(image => {
          // Handle different image data formats
          let imageData = image.data || image.preview;
          if (imageData) {
            // Extract base64 data and mime type from data URL
            const base64Data = imageData.split(',')[1];
            const mimeType = imageData.split(';')[0].split(':')[1];
            
            parts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            });
          }
        });
      }
      
      return {
        parts: parts,
        role: msg.role === 'assistant' ? 'model' : 'user'
      };
    });

    const response = await fetch(`${GEMINI_URL}:streamGenerateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Error streaming message:", error);
    throw error;
  }
};
