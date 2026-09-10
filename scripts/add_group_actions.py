from pathlib import Path
p=Path('/home/ubuntu/english-echo-vault/client/src/pages/Home.tsx')
s=p.read_text()
needle='''  const handleDelete = (id: string) => {'''
insert='''  const saveGroup = () => {
    const name = groupName.trim();
    if (!name) { toast.error("請輸入群組名稱。"); return; }
    const group: VocabularyGroup = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, note: groupNote.trim(), createdAt: Date.now() };
    persist(entries, [...groups, group]);
    setGroupName(""); setGroupNote(""); setGroupEditorOpen(false); setActiveGroupId(group.id);
    toast.success(`已建立群組「${name}」`);
  };

  const applyGroupToEntry = (entryId: string, groupId: string) => {
    persist(entries.map((entry) => entry.id === entryId ? { ...entry, groupId: groupId || null } : entry));
  };

  const removeGroup = (groupId: string) => {
    const group = groups.find((item) => item.id === groupId);
    const nextGroups = groups.filter((item) => item.id !== groupId);
    persist(entries.map((entry) => entry.groupId === groupId ? { ...entry, groupId: null } : entry), nextGroups);
    if (activeGroupId === groupId) setActiveGroupId(null);
    toast.success(`已刪除群組「${group?.name ?? ""}」，英文內容仍保留`);
  };

'''+needle
s=s.replace(needle,insert,1)
p.write_text(s)
