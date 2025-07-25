// Model capabilities and information
export const MODEL_CAPABILITIES = {
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    supportsImages: true,
    supportsVision: true,
    maxTokens: 1048576,
    description: 'Google\'s latest multimodal model with enhanced vision and reasoning',
    limitations: ['Direct Google API access'],
    pricing: 'Free (with API key)'
  }
};

export const getCurrentModel = () => {
  const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
  return settings.selectedModel || 'gemini-2.0-flash';
};

export const getCurrentModelCapabilities = () => {
  const currentModel = getCurrentModel();
  return MODEL_CAPABILITIES[currentModel] || MODEL_CAPABILITIES['gemini-2.0-flash'];
};

export const getModelsWithImageSupport = () => {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([_, capabilities]) => capabilities.supportsImages)
    .map(([id, capabilities]) => ({ id, ...capabilities }));
};

export const getFreeModels = () => {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([_, capabilities]) => capabilities.pricing === 'Free (with API key)')
    .map(([id, capabilities]) => ({ id, ...capabilities }));
};

export const getFreeModelsWithImageSupport = () => {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([_, capabilities]) => capabilities.supportsImages && capabilities.pricing === 'Free (with API key)')
    .map(([id, capabilities]) => ({ id, ...capabilities }));
};

export const checkImageSupport = (modelId) => {
  const capabilities = MODEL_CAPABILITIES[modelId];
  return capabilities ? capabilities.supportsImages : false;
};
