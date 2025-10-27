// src/webSearch.js
export const searchGoogleImages = async (query) => {
  const apiKey = 'YOUR_SERPAPI_KEY'; // Add in .env
  const cx = 'YOUR_CUSTOM_SEARCH_ENGINE';
  try {
    const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=isch&api_key=${apiKey}`);
    const data = await res.json();
    return data.images_results?.[0]?.original;
  } catch {
    return null;
  }
};
