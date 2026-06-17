export type FlashcardType = 'kanji' | 'vocab' | 'grammar';
export type FlashcardLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

export interface Flashcard {
  id: number;
  type: FlashcardType;
  level: FlashcardLevel;
  front: string;
  reading: string | null;
  meaning: string;
  example_sentence: string | null;
  example_translation: string | null;
}
