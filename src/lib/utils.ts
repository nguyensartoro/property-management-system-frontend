import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ThemeSettings = {
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'inter' | 'roboto' | 'open-sans';
  colorScheme: 'default' | 'ocean' | 'forest';
  darkMode: boolean;
};

export const fontSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
} as const;

export const fontFamilyClasses = {
  inter: 'font-inter',
  roboto: 'font-roboto',
  'open-sans': 'font-opensans',
} as const;

export const colorSchemeClasses = {
  default: 'theme-default',
  ocean: 'theme-ocean',
  forest: 'theme-forest',
} as const;

export const applyThemeSettings = (settings: ThemeSettings) => {
  document.documentElement.classList.remove(...Object.values(fontSizeClasses));
  document.documentElement.classList.add(fontSizeClasses[settings.fontSize]);
  document.documentElement.classList.remove(...Object.values(fontFamilyClasses));
  document.documentElement.classList.add(fontFamilyClasses[settings.fontFamily]);
  document.documentElement.classList.remove(...Object.values(colorSchemeClasses));
  document.documentElement.classList.add(colorSchemeClasses[settings.colorScheme]);
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
};

export const saveThemeSettings = (settings: ThemeSettings) => {
  localStorage.setItem('theme_fontSize', settings.fontSize);
  localStorage.setItem('theme_fontFamily', settings.fontFamily);
  localStorage.setItem('theme_colorScheme', settings.colorScheme);
  localStorage.setItem('theme_darkMode', settings.darkMode.toString());
  applyThemeSettings(settings);
};

export const loadThemeSettings = (): ThemeSettings => {
  const fontSize = (localStorage.getItem('theme_fontSize') as ThemeSettings['fontSize']) || 'medium';
  const fontFamily = (localStorage.getItem('theme_fontFamily') as ThemeSettings['fontFamily']) || 'inter';
  const colorScheme = (localStorage.getItem('theme_colorScheme') as ThemeSettings['colorScheme']) || 'default';
  const darkMode = localStorage.getItem('theme_darkMode') === 'true';
  return {
    fontSize,
    fontFamily,
    colorScheme,
    darkMode
  };
};