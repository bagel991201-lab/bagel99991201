import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Library,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Type,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import { toast } from "sonner";

type EntryKind = "Word" | "Phrase" | "Sentence";
type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "other";

type Entry = {
  id: string;
  text: string;
  kind: EntryKind;
  partOfSpeech: PartOfSpeech;
  meaning: string;
  createdAt: number;
  favorite: boolean;
};

type SpellCheckState = {
  original: string;
  suggestions: string[];
} | null;

const STORAGE_KEY = "english-echo-vault.entries";

const starterEntries: Entry[] = [
  {
    id: "starter-serendipity",
    text: "serendipity",
    kind: "Word",
    partOfSpeech: "noun",
    meaning: "意外發現的美好事物",
    createdAt: Date.now() - 1000 * 60 * 38,
    favorite: true,
  },
  {
    id: "starter-page",
    text: "Turn the page.",
    kind: "Sentence",
    partOfSpeech: "other",
    meaning: "翻開新的一頁／開啟新篇章",
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    favorite: false,
  },
  {
    id: "starter-momentum",
    text: "build momentum",
    kind: "Phrase",
    partOfSpeech: "verb",
    meaning: "建立動能、累積氣勢",
    createdAt: Date.now() - 1000 * 60 * 60 * 23,
    favorite: false,
  },
];

const kindOptions: EntryKind[] = ["Word", "Phrase", "Sentence"];
const partOfSpeechOptions: { value: PartOfSpeech; label: string; short: string }[] = [
  { value: "noun", label: "名詞", short: "Noun" },
  { value: "verb", label: "動詞", short: "Verb" },
  { value: "adjective", label: "形容詞", short: "Adj." },
  { value: "adverb", label: "副詞", short: "Adv." },
  { value: "pronoun", label: "代名詞", short: "Pron." },
  { value: "preposition", label: "介系詞", short: "Prep." },
  { value: "conjunction", label: "連接詞", short: "Conj." },
  { value: "interjection", label: "感嘆詞", short: "Interj." },
  { value: "other", label: "其他", short: "Other" },
];

const knownWords = new Set(
  [
    "a", "about", "again", "always", "and", "are", "as", "at", "beautiful", "because", "become", "book", "build", "calm", "can", "change", "choose", "collection", "confidence", "day", "dream", "echo", "English", "every", "focus", "for", "from", "good", "grow", "have", "hear", "hope", "how", "in", "is", "it", "keep", "kind", "learn", "library", "little", "listen", "momentum", "my", "new", "one", "page", "practice", "quiet", "remember", "save", "serendipity", "small", "speak", "step", "stay", "the", "this", "time", "to", "today", "turn", "use", "voice", "word", "with", "you", "your",
  ].map((word) => word.toLowerCase()),
);

function readEntries(): Entry[] {
  if (typeof window === "undefined") return starterEntries;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterEntries;
    const parsed = JSON.parse(saved) as Partial<Entry>[];
    if (!Array.isArray(parsed)) return starterEntries;
    return parsed.map((entry) => ({
      ...entry,
      partOfSpeech: entry.partOfSpeech ?? (entry.kind === "Word" ? "noun" : "other"),
      meaning: entry.meaning ?? "",
    })) as Entry[];
  } catch {
    return starterEntries;
  }
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

  if (sameDay) {
    return `Today · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.error("此瀏覽器目前不支援英文朗讀。");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.86;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function levenshtein(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function findSpellingSuggestions(text: string) {
  const normalized = text.trim().toLowerCase();
  if (!/^[a-z]+$/i.test(normalized) || knownWords.has(normalized)) return [];

  const ranked = Array.from(knownWords)
    .map((word) => ({ word, distance: levenshtein(normalized, word) }))
    .filter(({ word, distance }) => distance <= Math.max(2, Math.floor(normalized.length / 3)) && Math.abs(word.length - normalized.length) <= 3)
    .sort((left, right) => left.distance - right.distance || left.word.localeCompare(right.word));

  return ranked.slice(0, 4).map(({ word }) => word);
}

function meaningMatches(meaning: string, query: string) {
  const normalizedMeaning = meaning.toLowerCase().replace(/\s+/g, "");
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
  if (!normalizedQuery) return true;
  if (normalizedMeaning.includes(normalizedQuery)) return true;

  // 對中文意思做輕量字元重疊比對，讓「美好發現」也能找到「意外發現的美好事物」。
  if (normalizedQuery.length < 2) return false;
  const queryCharacters = Array.from(new Set(normalizedQuery));
  const matchedCharacters = queryCharacters.filter((character) => normalizedMeaning.includes(character));
  return matchedCharacters.length / queryCharacters.length >= 0.6;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>(readEntries);
  const [draft, setDraft] = useState("");
  const [meaning, setMeaning] = useState("");
  const [kind, setKind] = useState<EntryKind>("Word");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>("noun");
  const [composerStep, setComposerStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | EntryKind | "Favorites">("All");
  const [spellCheck, setSpellCheck] = useState<SpellCheckState>(null);

  const persist = (nextEntries: Entry[]) => {
    setEntries(nextEntries);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  };

  const resetComposer = () => {
    setDraft("");
    setMeaning("");
    setComposerStep(1);
  };

  const saveEntry = (text: string, chineseMeaning: string) => {
    const newEntry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      kind,
      partOfSpeech,
      meaning: chineseMeaning.trim(),
      createdAt: Date.now(),
      favorite: false,
    };

    persist([newEntry, ...entries]);
    resetComposer();
    setSpellCheck(null);
    toast.success("已將英文、詞性與中文意思一起保存", {
      description: "點擊英文內容即可聽到發音。",
    });
  };

  const continueToPartOfSpeech = () => {
    const text = draft.trim();
    if (!text) {
      toast.error("先輸入一個英文單字或句子吧。");
      return;
    }

    const suggestions = kind === "Word" ? findSpellingSuggestions(text) : [];
    if (suggestions.length > 0) {
      setSpellCheck({ original: text, suggestions });
      return;
    }

    setComposerStep(2);
  };

  const acceptSpellingAndContinue = (text: string) => {
    setDraft(text);
    setSpellCheck(null);
    setComposerStep(2);
  };

  const continueToMeaning = () => {
    setComposerStep(3);
  };

  const handleFinalSave = () => {
    if (!meaning.trim()) {
      toast.error("請輸入這個英文的中文意思。");
      return;
    }
    saveEntry(draft.trim(), meaning);
  };

  const handleKindChange = (nextKind: EntryKind) => {
    setKind(nextKind);
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((entry) => entry.id !== id));
    toast.success("已從收藏庫移除");
  };

  const toggleFavorite = (id: string) => {
    persist(
      entries.map((entry) =>
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
      ),
    );
  };

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesEnglish = entry.text.toLowerCase().includes(normalizedQuery);
      const matchesMeaning = meaningMatches(entry.meaning, normalizedQuery);
      const matchesFilter =
        filter === "All" ||
        (filter === "Favorites" ? entry.favorite : entry.kind === filter);
      return (matchesEnglish || matchesMeaning) && matchesFilter;
    });
  }, [entries, filter, query]);

  const wordCount = entries.filter((entry) => entry.kind === "Word").length;
  const phraseCount = entries.filter((entry) => entry.kind !== "Word").length;
  const favoriteCount = entries.filter((entry) => entry.favorite).length;
  const selectedPartOfSpeech = partOfSpeechOptions.find((option) => option.value === partOfSpeech);

  return (
    <main className="app-shell">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />

      <div className="app-container">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"><Waves size={20} strokeWidth={2.4} /></div>
            <div>
              <div className="brand-name">English Echo Vault</div>
              <div className="brand-tagline">words worth hearing again</div>
            </div>
          </div>
          <div className="local-pill"><span className="status-dot" />Saved locally</div>
        </header>

        <section className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> 今日的語感練習</div>
            <h1>Keep the words<br /><em>that stay with you.</em></h1>
            <p>把遇到的英文留下來。每一個單字、片語或句子，都能在你需要時再次發聲。</p>
            <div className="hero-note"><Headphones size={17} /> <span>英文、詞性、中文意思，一起建立你的語感收藏。</span></div>
          </div>

          <div className="composer-card">
            <div className="card-kicker"><Plus size={15} /> ADD TO YOUR VAULT</div>
            <div className="step-progress" aria-label={`新增步驟 ${composerStep} / 3`}>
              {["英文", "詞性", "中文意思"].map((label, index) => {
                const step = (index + 1) as 1 | 2 | 3;
                return (
                  <div className={composerStep === step ? "step-item active" : composerStep > step ? "step-item done" : "step-item"} key={label}>
                    <span className="step-number">{composerStep > step ? <Check size={12} /> : step}</span><span>{label}</span>
                    {step < 3 && <ChevronRight size={13} className="step-divider" />}
                  </div>
                );
              })}
            </div>

            {composerStep === 1 && (
              <div className="composer-stage">
                <label htmlFor="english-entry" className="composer-label">先輸入你想記住的英文</label>
                <textarea
                  id="english-entry"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") continueToPartOfSpeech();
                  }}
                  placeholder="e.g. take it one step at a time"
                  rows={3}
                />
                <div className="composer-footer">
                  <div className="kind-picker" role="group" aria-label="內容類型">
                    {kindOptions.map((option) => (
                      <button key={option} type="button" className={kind === option ? "kind-chip active" : "kind-chip"} onClick={() => handleKindChange(option)}>{option}</button>
                    ))}
                  </div>
                  <button type="button" className="save-button" onClick={continueToPartOfSpeech}>Next step <ArrowUpRight size={16} /></button>
                </div>
              </div>
            )}

            {composerStep === 2 && (
              <div className="composer-stage">
                <div className="stage-label">STEP 02 · 詞性</div>
                <div className="english-review"><span>{draft}</span><button type="button" onClick={() => setComposerStep(1)}>編輯英文</button></div>
                <p className="composer-step-copy">這個英文在你的筆記中是什麼詞性？</p>
                <label className="pos-picker pos-picker-large">
                  <span>選擇詞性 <small>Part of speech</small></span>
                  <select value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value as PartOfSpeech)}>
                    {partOfSpeechOptions.map((option) => <option value={option.value} key={option.value}>{option.label} · {option.short}</option>)}
                  </select>
                </label>
                <div className="step-actions"><button type="button" className="back-button" onClick={() => setComposerStep(1)}><ArrowLeft size={15} /> Back</button><button type="button" className="save-button" onClick={continueToMeaning}>Next step <ArrowUpRight size={16} /></button></div>
              </div>
            )}

            {composerStep === 3 && (
              <div className="composer-stage">
                <div className="stage-label">STEP 03 · 中文意思</div>
                <div className="entry-summary"><span className="summary-english">{draft}</span><span className="summary-pos">{selectedPartOfSpeech?.label} · {selectedPartOfSpeech?.short}</span></div>
                <label htmlFor="meaning-entry" className="composer-label">最後，添加中文意思</label>
                <textarea
                  id="meaning-entry"
                  className="meaning-input"
                  value={meaning}
                  onChange={(event) => setMeaning(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") handleFinalSave();
                  }}
                  placeholder="例如：意外發現的美好事物"
                  rows={3}
                />
                <div className="step-actions"><button type="button" className="back-button" onClick={() => setComposerStep(2)}><ArrowLeft size={15} /> Back</button><button type="button" className="save-button" onClick={handleFinalSave}>Save all <Check size={16} /></button></div>
              </div>
            )}
            <div className="composer-hint">⌘ / Ctrl + Enter 可前進或保存</div>
          </div>
        </section>

        <section className="stats-strip" aria-label="收藏統計">
          <div className="stat-intro"><div className="stat-icon"><Library size={18} /></div><div><strong>Your collection</strong><span>你的英文收藏庫</span></div></div>
          <div className="stat-item"><span className="stat-number">{entries.length}</span><span>total saved</span></div>
          <div className="stat-item"><span className="stat-number">{wordCount}</span><span>words</span></div>
          <div className="stat-item"><span className="stat-number">{phraseCount}</span><span>phrases</span></div>
          <div className="stat-item stat-favorite"><Star size={15} fill="currentColor" /><span>{favoriteCount} favorite{favoriteCount === 1 ? "" : "s"}</span></div>
        </section>

        <section className="library-section">
          <div className="section-heading"><div><div className="section-kicker"><Type size={14} /> THE LIBRARY</div><h2>Words in residence</h2></div><div className="section-caption"><Clock3 size={15} /> 按最近加入排序</div></div>
          <div className="toolbar">
            <div className="search-wrap"><Search size={17} /><input aria-label="搜尋英文或中文意思" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search English or 中文意思..." />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="清除搜尋">×</button>}</div>
            <div className="filter-tabs" role="tablist" aria-label="收藏篩選">
              {["All", "Word", "Phrase", "Sentence", "Favorites"].map((option) => <button key={option} type="button" role="tab" aria-selected={filter === option} className={filter === option ? "filter-tab active" : "filter-tab"} onClick={() => setFilter(option as "All" | EntryKind | "Favorites")}>{option === "Favorites" && <Star size={13} fill="currentColor" />}{option}</button>)}
            </div>
          </div>

          <div className="entry-list">
            {filteredEntries.map((entry, index) => {
              const pos = partOfSpeechOptions.find((option) => option.value === entry.partOfSpeech);
              return (
                <article className="entry-card" key={entry.id} style={{ "--entry-delay": `${index * 45}ms` } as React.CSSProperties}>
                  <button type="button" className="entry-copy" onClick={() => speak(entry.text)} aria-label={`播放 ${entry.text} 的英文發音`}>
                    <span className="entry-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="entry-content"><span className="entry-text">{entry.text}</span><span className="entry-meaning">{entry.meaning || "尚未添加中文意思"}</span><span className="entry-meta"><span className={`kind-label kind-${entry.kind.toLowerCase()}`}>{entry.kind}</span><span>·</span><span className="pos-label">{pos?.label ?? "其他"} · {pos?.short ?? "Other"}</span><span>·</span><span>{formatDate(entry.createdAt)}</span></span></span>
                  </button>
                  <div className="entry-actions"><button type="button" className="icon-button play-button" onClick={() => speak(entry.text)} aria-label={`播放 ${entry.text}`}><Play size={15} fill="currentColor" /></button><button type="button" className={entry.favorite ? "icon-button favorite-button active" : "icon-button favorite-button"} onClick={() => toggleFavorite(entry.id)} aria-label={entry.favorite ? "取消最愛" : "加入最愛"}><Heart size={17} fill={entry.favorite ? "currentColor" : "none"} /></button><button type="button" className="icon-button delete-button" onClick={() => handleDelete(entry.id)} aria-label={`刪除 ${entry.text}`}><Trash2 size={16} /></button></div>
                </article>
              );
            })}
          </div>

          {filteredEntries.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={20} /></div><h3>找不到符合的內容</h3><p>試試英文、中文意思，或切換收藏分類。</p><button type="button" onClick={() => { setQuery(""); setFilter("All"); }}>清除篩選</button></div>}
          <div className="library-footer"><span><Volume2 size={15} /> US English voice · Browser speech</span><span className="footer-tip">Search by the word or the meaning you remember.</span></div>
        </section>

        <footer className="app-footer"><span>English Echo Vault</span><span>Built for small moments of fluency.</span></footer>
      </div>

      {spellCheck && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSpellCheck(null); }}><section className="spell-modal" role="dialog" aria-modal="true" aria-labelledby="spell-title"><button type="button" className="modal-close" onClick={() => setSpellCheck(null)} aria-label="關閉拼寫檢查"><X size={17} /></button><div className="spell-icon"><AlertTriangle size={20} /></div><div className="spell-kicker">SPELL CHECK</div><h2 id="spell-title">這個拼法看起來需要確認</h2><p>你輸入的是 <strong>{spellCheck.original}</strong>。請選擇正確英文後繼續填寫詞性與中文意思，或確認保留原文。</p><div className="suggestion-list">{spellCheck.suggestions.map((suggestion) => <button type="button" className="suggestion-button" key={suggestion} onClick={() => acceptSpellingAndContinue(suggestion)}><span><Check size={15} /> {suggestion}</span><ArrowUpRight size={15} /></button>)}</div><button type="button" className="keep-original" onClick={() => acceptSpellingAndContinue(spellCheck.original)}><span>不是拼錯，保留「{spellCheck.original}」</span><span>Keep as entered</span></button></section></div>}
    </main>
  );
}
