import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Check initial match
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Set up listener to handle changes
    const listener = () => setMatches(media.matches);
    
    // Modern approach using addEventListener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}