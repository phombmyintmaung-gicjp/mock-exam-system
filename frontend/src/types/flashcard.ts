export type FlashcardType = 'kanji' | 'vocab' | 'grammar';
export type FlashcardLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface Flashcard {
  id: number;
  type: FlashcardType;
  level: FlashcardLevel;
  front: string;
  reading: string | null;
  meaning: string;
  meaning_my: string | null;
  example_sentence: string | null;
  example_translation: string | null;
  frequency_band?: number | null;
}

export interface CustomFlashcardSet {
  id: number;
  name: string;
  type: FlashcardType;
  levels: FlashcardLevel[];
}
