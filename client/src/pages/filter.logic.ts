export function matchesSelectedFilters(partOfSpeech: string, selectedFilters: string[]) {
  return selectedFilters.length === 0 || selectedFilters.includes(partOfSpeech);
}
