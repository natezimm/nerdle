export const WINDOW_STYLES = ['auto', 'macos', 'windows', 'none'];
export const BOARD_STYLES = ['tiles', 'full-terminal', 'terminal'];

export const readAppearance = (key, options, fallback) => {
  const stored = localStorage.getItem(key);
  return options.includes(stored) ? stored : fallback;
};

// This only chooses decoration; a saved manual choice always takes precedence.
export const resolveWindowStyle = (preference, device = navigator) => {
  if (preference !== 'auto') return preference;

  const { platform = '', userAgent = '', maxTouchPoints = 0 } = device;
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    (/Mac/i.test(platform) && maxTouchPoints > 1);
  if (isMobile) return 'none';
  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) return 'windows';
  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) return 'macos';
  return 'none';
};
