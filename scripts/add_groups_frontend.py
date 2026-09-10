from pathlib import Path
p = Path('/home/ubuntu/english-echo-vault/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('function formatDate(timestamp: number) {', '''function readGroups(): VocabularyGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GROUPS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function formatDate(timestamp: number) {''', 1)
s = s.replace('  const [entries, setEntries] = useState<Entry[]>(readEntries);', '''  const [entries, setEntries] = useState<Entry[]>(readEntries);
  const [groups, setGroups] = useState<VocabularyGroup[]>(readGroups);
  const [groupName, setGroupName] = useState("");
  const [groupNote, setGroupNote] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [groupEditorOpen, setGroupEditorOpen] = useState(false);''', 1)
p.write_text(s)
