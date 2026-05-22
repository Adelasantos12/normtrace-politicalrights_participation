export const normalizeCountry = (c) => {
  if (!c) return ''
  return c.toLowerCase().replace(/_/g, ' ')
}

export const countryMatches = (c1, c2) => {
  return normalizeCountry(c1) === normalizeCountry(c2)
}

export const getCountryDataFile = (country, filename) => {
  const norm = normalizeCountry(country)
  if (norm === 'costa rica') {
    return filename.startsWith('costa_rica_') ? filename : 'costa_rica_' + filename
  }
  return filename
}

export const getScoreColor = (score) => {
  const s = parseFloat(score);
  if (isNaN(s)) return '#f1f5f9';
  if (s === 0) return '#f1f5f9';
  if (s > 0 && s < 2) return '#fee2e2';
  if (s >= 2 && s < 3) return '#ffedd5';
  if (s >= 3 && s < 4) return '#fef9c3';
  if (s >= 4 && s < 5) return '#dcfce7';
  if (s >= 5) return '#bbf7d0';
  return '#f1f5f9';
};

export const getScoreLabel = (score) => {
  const s = Math.round(parseFloat(score));
  const labels = {
    0: 'Absent',
    1: 'Declaratory',
    2: 'Partial Basis',
    3: 'Functional Basis',
    4: 'Strong Basis',
    5: 'Integrated Basis'
  };
  return labels[s] || 'Unknown';
};
