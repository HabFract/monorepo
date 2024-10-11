export const sortWinRecordEntryArrayByWinRecordDateIndex = (a, b) => {
  const dateA = Object.keys(a.entry.winData)[0]; // Get the first (and only) date key
  const dateB = Object.keys(b.entry.winData)[0];

  // Convert DD/MM/YYYY to YYYY-MM-DD for proper string comparison
  const formattedDateA = dateA.split('/').reverse().join('-');
  const formattedDateB = dateB.split('/').reverse().join('-');

  return formattedDateA.localeCompare(formattedDateB);
};