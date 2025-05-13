import create from 'zustand';
import type { ThemeSettings } from '../lib/utils';

const defaultThemeSettings: ThemeSettings = {
  fontSize: 'medium',
  fontFamily: 'inter',
  colorScheme: 'default',
  darkMode: false,
};

function loadThemeSettings(): ThemeSettings {
  const fontSize = (localStorage.getItem('theme_fontSize') as ThemeSettings['fontSize']) || defaultThemeSettings.fontSize;
  const fontFamily = (localStorage.getItem('theme_fontFamily') as ThemeSettings['fontFamily']) || defaultThemeSettings.fontFamily;
  const colorScheme = (localStorage.getItem('theme_colorScheme') as ThemeSettings['colorScheme']) || defaultThemeSettings.colorScheme;
  const darkMode = localStorage.getItem('theme_darkMode') === 'true';
  return { fontSize, fontFamily, colorScheme, darkMode };
}

export const useThemeSettingsStore = create<{
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings) => void;
}>((set) => ({
  themeSettings: loadThemeSettings(),
  setThemeSettings: (settings) => {
    // Save to localStorage for persistence
    localStorage.setItem('theme_fontSize', settings.fontSize);
    localStorage.setItem('theme_fontFamily', settings.fontFamily);
    localStorage.setItem('theme_colorScheme', settings.colorScheme);
    localStorage.setItem('theme_darkMode', settings.darkMode.toString());
    set({ themeSettings: settings });
  },
})); 