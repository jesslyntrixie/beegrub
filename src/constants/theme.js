// Import and re-export colors
export { COLORS } from './colors';

export const FONTS = {
  // Font families - you can add custom fonts later
  regular: 'System', // Will use system default, or add custom font
  medium: 'System',
  bold: 'System',
  
  // Font sizes based on your design
  extraLarge: 64,  // BeeGrub title
  large: 32,       // Screen titles
  medium: 18,      // Tagline, body text
  regular: 16,     // Regular body text
  small: 14,       // Small text, labels
  extraSmall: 12,  // Very small text
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
};