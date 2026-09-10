from pathlib import Path
p=Path('/home/ubuntu/english-echo-vault/client/src/pages/Home.tsx')
s=p.read_text()
s=s.replace('''  const persist = (nextEntries: Entry[]) => {
    setEntries(nextEntries);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    }
    if (isAuthenticated) {
      replaceVocabulary.mutate({ entries: nextEntries });
    }
  };''','''  const persist = (nextEntries: Entry[], nextGroups = groups) => {
    setEntries(nextEntries);
    setGroups(nextGroups);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(nextGroups));
    }
    if (isAuthenticated) replaceVocabulary.mutate({ entries: nextEntries, groups: nextGroups });
  };''',1)
s=s.replace('''    const cloudEntries = vocabularyQuery.data.map((entry) => ({''','''    const cloudEntries = vocabularyQuery.data.entries.map((entry) => ({''',1)
s=s.replace('''      favorite: entry.favorite,
    }));
    if (cloudEntries.length > 0) {''','''      favorite: entry.favorite,
      groupId: entry.groupId,
    }));
    const cloudGroups = vocabularyQuery.data.groups.map((group) => ({ id: group.id, name: group.name, note: group.note, createdAt: group.createdAt }));
    setGroups(cloudGroups);
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(cloudGroups));
    if (cloudEntries.length > 0) {''',1)
s=s.replace('''    if (entries.length > 0) replaceVocabulary.mutate({ entries });
  }, [entries, isAuthenticated, replaceVocabulary, vocabularyQuery.data, vocabularyQuery.isLoading]);''','''    if (entries.length > 0 || groups.length > 0) replaceVocabulary.mutate({ entries, groups });
  }, [entries, groups, isAuthenticated, replaceVocabulary, vocabularyQuery.data, vocabularyQuery.isLoading]);''',1)
s=s.replace('''      favorite: false,
    };''','''      favorite: false,
      groupId: activeGroupId,
    };''',1)
s=s.replace('''      const matchesSearchFilter = matchesSelectedFilters(entry.partOfSpeech, searchFilters);
      return (matchesEnglish || matchesMeaning) && matchesTabFilter && matchesSearchFilter;''','''      const matchesSearchFilter = matchesSelectedFilters(entry.partOfSpeech, searchFilters);
      const group = groups.find((item) => item.id === entry.groupId);
      const matchesGroup = !activeGroupId || entry.groupId === activeGroupId;
      const matchesGroupQuery = !groupQuery.trim() || group?.name.toLowerCase().includes(groupQuery.trim().toLowerCase());
      return (matchesEnglish || matchesMeaning || matchesGroupQuery) && matchesTabFilter && matchesSearchFilter && matchesGroup;''',1)
s=s.replace('''  }, [entries, filter, query, searchFilters]);''','''  }, [entries, filter, query, searchFilters, groups, activeGroupId, groupQuery]);''',1)
p.write_text(s)
