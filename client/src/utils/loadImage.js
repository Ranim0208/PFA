// utils/loadImage.js
export const loadImage = (path) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = path;
    
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};