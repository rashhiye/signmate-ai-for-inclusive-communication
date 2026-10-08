/**
 * SignMate Dictionary Recommendation Service
 * Uses clean words extracted from dictionary_compact.json (95,000+ words).
 * Provides ultra-fast prefix search with common conversational word prioritization.
 */

// Core high-frequency conversational English vocabulary to prioritize at the top
const PRIORITY_WORDS: string[] = [
  'HELLO', 'HELP', 'HOW', 'HAVE', 'HERE', 'HOME', 'HAPPY', 'HEAR', 'HEART', 'HEALTH', 'HEAD', 'HOPE', 'HURT',
  'THANK', 'THANKS', 'THAT', 'THIS', 'THERE', 'THEY', 'TIME', 'TODAY', 'THINK', 'THROUGH', 'TOGETHER', 'TALK',
  'PLEASE', 'PEOPLE', 'PERFECT', 'PLACE', 'PLAY', 'PHONE', 'PERSON', 'PAIN', 'PROBLEM', 'PATIENT',
  'NAME', 'NEED', 'NICE', 'NO', 'NOTHING', 'NEW', 'NEXT', 'NIGHT', 'NOW', 'NEVER', 'NEAR', 'NEWS',
  'MAKE', 'MEET', 'MORE', 'MORNING', 'MUCH', 'MAYBE', 'MOTHER', 'MIND', 'MESSAGE', 'MEETING', 'MEMORY', 'MONEY', 'MINUTE',
  'YES', 'YOU', 'YOUR', 'YESTERDAY', 'YEAR', 'YOUNG',
  'SIGN', 'SORRY', 'SEE', 'SURE', 'SOME', 'SMILE', 'START', 'SPEAK', 'STOP', 'SAFE', 'SCHOOL', 'SISTER', 'SICK',
  'GOOD', 'GREAT', 'GLAD', 'GO', 'GOING', 'GIVE', 'GIRL', 'GOODBYE', 'GROUP',
  'FINE', 'FRIEND', 'FAMILY', 'FOR', 'FEEL', 'FIND', 'FIRST', 'FOOD', 'FATHER', 'FAST',
  'CAN', 'CALL', 'COME', 'CARE', 'CHANGE', 'CHILD', 'CITY', 'CLEAN', 'COLD', 'CLOSE',
  'BYE', 'BEAUTIFUL', 'BAD', 'BEST', 'BOY', 'BROTHER', 'BODY', 'BUSY', 'BOOK', 'BREAK',
  'LOVE', 'LIKE', 'LEARN', 'LOOK', 'LIFE', 'LITTLE', 'LEAVE', 'LISTEN', 'LATE', 'LONG',
  'DEAF', 'DAY', 'DO', 'DOCTOR', 'DOOR', 'DRINK', 'DRIVE', 'DIFFERENT', 'DEAR',
  'ALL', 'AND', 'ARE', 'ABOUT', 'AFTER', 'ALWAYS', 'AGAIN', 'ASK', 'ANSWER', 'ALRIGHT', 'ALONE',
  'OKAY', 'ONE', 'OPEN', 'ONLY', 'OTHER', 'OUR', 'OUT', 'OVER', 'ORDER', 'OLD',
  'IMPORTANT', 'INSIDE', 'INTERESTING', 'INVITE', 'IDEA', 'INFORMATION', 'ISSUE',
  'UNDERSTAND', 'USE', 'UP', 'UNTIL', 'UNDER', 'USUAL', 'URGENT',
  'READY', 'RIGHT', 'REALLY', 'REMEMBER', 'ROOM', 'READ', 'REST', 'REASON',
  'WORK', 'WHAT', 'WHERE', 'WHEN', 'WHY', 'WHO', 'WILL', 'WITH', 'WATER', 'WELCOME', 'WAIT', 'WORD', 'WORLD', 'WANT', 'WEEK', 'WOMAN',
  'VERY', 'VOICE', 'VISIT', 'VIDEO', 'VIEW', 'VACATION',
  'EAT', 'EASY', 'EVERY', 'EARLY', 'ENJOY', 'ENOUGH', 'EVENING', 'EXCUSE', 'EYE',
  'KNOW', 'KEEP', 'KIND', 'KID', 'KEY', 'KITCHEN',
  'JUST', 'JOB', 'JOIN', 'JOY', 'JOURNEY',
  'QUESTION', 'QUICK', 'QUIET', 'QUITE',
  'ZERO', 'ZONE', 'ZOOM',
  'XRAY', 'XYLOPHONE'
];

class DictionaryService {
  private wordsList: string[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  /**
   * Asynchronously loads the 95,000+ words exported from dictionary_compact.json
   */
  public async init(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
          const res = await fetch('/dictionary_words.json');
          if (res.ok) {
            const data: string[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              this.wordsList = data;
              this.isLoaded = true;
              console.log(`[SignMate] Loaded ${data.length} words from dictionary_compact.json`);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('[SignMate] Could not fetch /dictionary_words.json:', err);
      }

      // Fallback: use priority words list
      this.wordsList = [...PRIORITY_WORDS].sort();
      this.isLoaded = true;
    })();

    return this.loadPromise;
  }

  /**
   * Fast binary search for first index of word starting with prefix
   */
  private binarySearchPrefix(prefix: string): number {
    let low = 0;
    let high = this.wordsList.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const word = this.wordsList[mid];

      if (word.startsWith(prefix)) {
        result = mid;
        high = mid - 1; // keep looking left for the first occurrence
      } else if (word < prefix) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }

  /**
   * Returns word recommendations starting with given prefix.
   * Prioritizes common everyday conversational words, followed by dictionary words.
   * Only returns the words (no definitions or meanings).
   */
  public getWordSuggestions(rawPrefix: string, maxResults = 8): string[] {
    const prefix = (rawPrefix || '').trim().toUpperCase();
    if (!prefix) return [];

    const results: string[] = [];
    const seen = new Set<string>();

    // 1. First add matching high-priority conversational words
    for (const word of PRIORITY_WORDS) {
      if (word.startsWith(prefix) && !seen.has(word)) {
        results.push(word);
        seen.add(word);
        if (results.length >= maxResults) {
          return results;
        }
      }
    }

    // 2. Query 95,000+ words from dictionary_compact.json
    if (this.wordsList.length > 0) {
      const firstIdx = this.binarySearchPrefix(prefix);
      if (firstIdx !== -1) {
        for (let i = firstIdx; i < this.wordsList.length; i++) {
          const w = this.wordsList[i];
          if (!w.startsWith(prefix)) break;

          if (!seen.has(w)) {
            // Prefer words of reasonable conversational length (<= 12 chars)
            results.push(w);
            seen.add(w);
            if (results.length >= maxResults) {
              break;
            }
          }
        }
      }
    }

    return results;
  }
}

export const dictionaryService = new DictionaryService();
