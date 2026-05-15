import { descriptionDict } from './descriptionDict';
import { Language } from '../i18n';

/**
 * Translate a link card description based on the current language.
 * - If language is 'en', always returns the original text.
 * - If language is 'zh', looks up the dictionary for a match.
 * - Falls back to the original text if no match is found.
 *
 * Does NOT modify any stored data — this is display-only.
 */
export function translateDescription(text: string | undefined | null, language: Language): string {
  if (!text) return '';
  if (language === 'en') return text;

  // Case-insensitive lookup
  const key = text.trim().toLowerCase();
  return descriptionDict[key] ?? text;
}
