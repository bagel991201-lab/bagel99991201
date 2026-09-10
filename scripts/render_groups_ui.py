from pathlib import Path
p=Path('/home/ubuntu/english-echo-vault/client/src/pages/Home.tsx')
s=p.read_text()
s=s.replace('''  const [groupName, setGroupName] = useState("");''','''  const [groupQuery, setGroupQuery] = useState("");
  const [groupName, setGroupName] = useState("");''',1)
old='''          <div className="toolbar">
            <div className="search-wrap"><Search size={17} /><input aria-label="搜尋英文或中文意思" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search English or 中文意思..." />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="清除搜尋">×</button>}</div>'''
new='''          <div className="group-bar">
            <div className="group-heading"><span className="group-icon"><Library size={15} /></span><span><strong>英文群組</strong><small>為收藏建立主題與備註</small></span></div>
            <select className="group-select" aria-label="選擇英文群組" value={activeGroupId ?? ""} onChange={(event) => { setActiveGroupId(event.target.value || null); setGroupQuery(""); }}><option value="">全部群組</option>{groups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}</select>
            <input className="group-search" aria-label="搜尋群組名稱" value={groupQuery} onChange={(event) => { setGroupQuery(event.target.value); setActiveGroupId(null); }} placeholder="搜尋群組名稱..." />
            <button type="button" className="group-add-button" onClick={() => setGroupEditorOpen((open) => !open)}><Plus size={14} /> 新增群組</button>
          </div>
          {groupEditorOpen && <div className="group-editor"><input aria-label="群組名稱" value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="例如：多益單字、旅行英文" /><textarea aria-label="群組文字" value={groupNote} onChange={(event) => setGroupNote(event.target.value)} placeholder="輸入這組英文的說明或學習目標（可選）" rows={2} /><button type="button" className="save-button" onClick={saveGroup}>保存群組 <Check size={15} /></button></div>}
          {activeGroupId && <div className="active-group-note"><span>目前顯示：{groups.find((group) => group.id === activeGroupId)?.name}</span><button type="button" onClick={() => setActiveGroupId(null)}>顯示全部</button></div>}
          <div className="toolbar">
            <div className="search-wrap"><Search size={17} /><input aria-label="搜尋英文或中文意思" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search English or 中文意思..." />{query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="清除搜尋">×</button>}</div>'''
if old not in s: raise SystemExit('toolbar anchor not found')
s=s.replace(old,new,1)
old_card='''<span className="entry-content"><span className="entry-text">{entry.text}</span><span className="entry-meaning">{entry.meaning || "尚未添加中文意思"}</span><span className="entry-meta"><span className={`kind-label kind-${entry.kind.toLowerCase()}`}>{entry.kind}</span><span>·</span><span className="pos-label">{pos?.label ?? "其他"} · {pos?.short ?? "Other"}</span><span>·</span><span>{formatDate(entry.createdAt)}</span></span></span>'''
new_card='''<span className="entry-content"><span className="entry-text">{entry.text}</span><span className="entry-meaning">{entry.meaning || "尚未添加中文意思"}</span><span className="entry-meta"><span className={`kind-label kind-${entry.kind.toLowerCase()}`}>{entry.kind}</span><span>·</span><span className="pos-label">{pos?.label ?? "其他"} · {pos?.short ?? "Other"}</span>{entry.groupId && <><span>·</span><span className="group-label">{groups.find((group) => group.id === entry.groupId)?.name ?? "群組"}</span></>}<span>·</span><span>{formatDate(entry.createdAt)}</span></span></span>'''
if old_card not in s: raise SystemExit('card anchor not found')
s=s.replace(old_card,new_card,1)
old_actions='''<button type="button" className="icon-button edit-button" onClick={() => startEditing(entry)} aria-label={`編輯 ${entry.text}`}><Pencil size={15} /></button>'''
new_actions='''<select className="entry-group-select" aria-label={`設定 ${entry.text} 的群組`} value={entry.groupId ?? ""} onChange={(event) => applyGroupToEntry(entry.id, event.target.value)}><option value="">未分組</option>{groups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}</select><button type="button" className="icon-button edit-button" onClick={() => startEditing(entry)} aria-label={`編輯 ${entry.text}`}><Pencil size={15} /></button>'''
s=s.replace(old_actions,new_actions,1)
p.write_text(s)
