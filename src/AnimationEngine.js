// src/AnimationEngine.js
import { searchGoogleImages } from './webSearch.js';

const animationMap = {
  'magnesium': 'AnimatedMagnesiumBurn',
  'burn': 'AnimatedMagnesiumBurn',
  'torch': 'AnimatedTorchBulb',
  'bulb': 'AnimatedTorchBulb',
  'glow': 'AnimatedTorchBulb',
  'circuit': 'AnimatedTorchBulb',
  'rust': 'AnimatedRustingIron',
  'iron': 'AnimatedRustingIron',
  'corrosion': 'AnimatedRustingIron',
};

export const findAnimation = async (text) => {
  const lower = text.toLowerCase();
  for (const [keyword, component] of Object.entries(animationMap)) {
    if (lower.includes(keyword)) {
      return component;
    }
  }

  // WEB SEARCH FOR MISSING ANIMATIONS
  const searchTerms = ['animated gif', 'svg animation', 'science experiment'];
  for (const term of searchTerms) {
    if (lower.includes(term.split(' ')[0])) {
      const query = `${lower} ${term} site:.edu OR site:.gov`;
      const url = await searchGoogleImages(query);
      if (url) return { type: 'web', url };
    }
  }

  return null;
};
