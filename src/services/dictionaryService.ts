/**
 * SignMate Dictionary Recommendation Service
 * Uses clean words extracted from dictionary_compact.json (95,000+ words).
 * Provides ultra-fast prefix search with common conversational word prioritization.
 */

// Core high-frequency conversational English vocabulary to prioritize at the top
const PRIORITY_WORDS: string[] = [
  'HELLO', 'HELP', 'HOW', 'HAVE', 'HERE', 'HOME', 'HAPPY', 'HEAR', 'HEART', 'HEALTH', 'HEAD', 'HOPE', 'HURT',
  'THANK', 'THANKS', 'THAT', 'THIS', 'THERE', 'THEY', 'TIME', 'TODAY', 'THINK', 'THROUGH', 'TOGETHER', 'TALK', 'TRUE',
  'PLEASE', 'PEOPLE', 'PERFECT', 'PLACE', 'PLAY', 'PHONE', 'PERSON', 'PAIN', 'PROBLEM', 'PATIENT', 'POOL', 'PASS',
  'NAME', 'NEED', 'NICE', 'NO', 'NOTHING', 'NEW', 'NEXT', 'NIGHT', 'NOW', 'NEVER', 'NEAR', 'NEWS', 'NOON',
  'MAKE', 'MEET', 'MORE', 'MORNING', 'MUCH', 'MAYBE', 'MOTHER', 'MIND', 'MESSAGE', 'MEETING', 'MEMORY', 'MONEY', 'MINUTE',
  'MOON', 'MOOD', 'MONTH', 'MOVE', 'MOVIE', 'MOST', 'MODEL', 'MONDAY',
  'YES', 'YOU', 'YOUR', 'YESTERDAY', 'YEAR', 'YOUNG', 'YELLOW',
  'SIGN', 'SORRY', 'SEE', 'SEEN', 'SEEM', 'SURE', 'SOME', 'SMILE', 'START', 'SPEAK', 'STOP', 'SAFE', 'SCHOOL', 'SISTER', 'SICK', 'SOON', 'SLEEP', 'SWEET', 'STILL', 'SMALL', 'SPEED',
  'GOOD', 'GREAT', 'GLAD', 'GO', 'GOING', 'GIVE', 'GIRL', 'GOODBYE', 'GROUP', 'GREEN', 'GRASS', 'GLASS',
  'FINE', 'FRIEND', 'FAMILY', 'FOR', 'FEEL', 'FEET', 'FIND', 'FIRST', 'FOOD', 'FATHER', 'FAST', 'FREE', 'FLOOR', 'FALSE',
  'CAN', 'CALL', 'COME', 'CARE', 'CHANGE', 'CHILD', 'CITY', 'CLEAN', 'COLD', 'CLOSE', 'COOL', 'COOK', 'COFFEE', 'CLASS', 'CAT', 'CAR', 'CHAT', 'CHECK', 'CLEAR', 'CONNECT', 'CORRECT',
  'BYE', 'BEAUTIFUL', 'BAD', 'BEST', 'BOY', 'BROTHER', 'BODY', 'BUSY', 'BOOK', 'BREAK', 'BETTER', 'BOTTLE', 'BALL',
  'LOVE', 'LIKE', 'LEARN', 'LOOK', 'LIFE', 'LITTLE', 'LEAVE', 'LISTEN', 'LATE', 'LONG', 'LETTER', 'LESS',
  'DEAF', 'DAY', 'DO', 'DOCTOR', 'DOOR', 'DRINK', 'DRIVE', 'DIFFERENT', 'DEAR', 'DEEP', 'DINNER',
  'ALL', 'AND', 'ARE', 'ABOUT', 'AFTER', 'ALWAYS', 'AGAIN', 'ASK', 'ANSWER', 'ALRIGHT', 'ALONE', 'APPLE', 'APPLY',
  'OKAY', 'ONE', 'OPEN', 'ONLY', 'OTHER', 'OUR', 'OUT', 'OVER', 'ORDER', 'OLD', 'OFFICE', 'OFFICER',
  'IMPORTANT', 'INSIDE', 'INTERESTING', 'INVITE', 'IDEA', 'INFORMATION', 'ISSUE',
  'UNDERSTAND', 'USE', 'UP', 'UNTIL', 'UNDER', 'USUAL', 'URGENT',
  'READY', 'RIGHT', 'REALLY', 'REMEMBER', 'ROOM', 'READ', 'REST', 'REASON', 'RUNNING', 'ROLL',
  'WORK', 'WHAT', 'WHERE', 'WHEN', 'WHY', 'WHO', 'WILL', 'WITH', 'WATER', 'WELCOME', 'WAIT', 'WORD', 'WORLD', 'WANT', 'WEEK', 'WOMAN', 'WELL', 'WOOD', 'WORRY',
  'VERY', 'VOICE', 'VISIT', 'VIDEO', 'VIEW', 'VACATION',
  'EAT', 'EASY', 'EVERY', 'EARLY', 'ENJOY', 'ENOUGH', 'EVENING', 'EXCUSE', 'EYE',
  'KNOW', 'KEEP', 'KIND', 'KID', 'KEY', 'KITCHEN', 'KISS',
  'JUST', 'JOB', 'JOIN', 'JOY', 'JOURNEY',
  'QUESTION', 'QUICK', 'QUIET', 'QUITE',
  'ZERO', 'ZONE', 'ZOOM',
  'XRAY', 'XYLOPHONE'
];

class DictionaryService {
  private wordsList: string[] = [];
  private fallbackDict: string[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  /**
   * Asynchronously loads high-frequency conversational words and fallback dictionary
   */
  public async init(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
          // 1. Try loading Google Top 10,000 real-world frequency vocabulary
          const res = await fetch('/conversational_words.json');
          if (res.ok) {
            const data: string[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              this.wordsList = data;
              this.isLoaded = true;
              return;
            }
          }
        }
      } catch {
        // Fallback to priority list
      }

      try {
        if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
          const res2 = await fetch('/dictionary_words.json');
          if (res2.ok) {
            const data2: string[] = await res2.json();
            if (Array.isArray(data2) && data2.length > 0) {
              this.fallbackDict = data2;
            }
          }
        }
      } catch {
        // Fallback
      }

      this.isLoaded = true;
    })();

    return this.loadPromise;
  }

  /**
   * Returns intelligent word recommendations starting with given prefix.
   * Prioritizes conversational sign vocabulary first, then top English frequency words.
   */
  public getWordSuggestions(rawPrefix: string, maxResults = 8): string[] {
    const prefix = (rawPrefix || '').trim().toUpperCase();
    if (!prefix) return [];

    const results: string[] = [];
    const seen = new Set<string>();

    // 1. Immediate priority conversational sign words
    for (const word of PRIORITY_WORDS) {
      if (word.startsWith(prefix) && !seen.has(word)) {
        results.push(word);
        seen.add(word);
        if (results.length >= maxResults) {
          return results;
        }
      }
    }

    // 2. High-frequency real-world conversational words (Google 10K dataset)
    if (this.wordsList.length > 0) {
      for (let i = 0; i < this.wordsList.length; i++) {
        const w = this.wordsList[i];
        if (w.startsWith(prefix) && !seen.has(w)) {
          results.push(w);
          seen.add(w);
          if (results.length >= maxResults) {
            return results;
          }
        }
      }
    }

    // 3. Fallback to dictionary words if still need results
    if (this.fallbackDict.length > 0 && results.length < maxResults) {
      for (let i = 0; i < this.fallbackDict.length; i++) {
        const w = this.fallbackDict[i];
        if (w.startsWith(prefix) && !seen.has(w)) {
          results.push(w);
          seen.add(w);
          if (results.length >= maxResults) {
            break;
          }
        }
      }
    }

    return results;
  }
}

export const dictionaryService = new DictionaryService();
