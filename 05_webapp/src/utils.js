export const countryMatches = (dataCountry, selectedCountry) => {
  if (!dataCountry || !selectedCountry) return false
  const d = dataCountry.toLowerCase()
  const s = selectedCountry.toLowerCase()
  return d === s || (s === 'mexico' && d === 'mex') || (s === 'costa rica' && d === 'crc')
}

export const getScoreColor = (score) => {
  if (score === 0) return '#94a3b8' // absent
  if (score < 2) return '#f87171'   // declaratory/partial
  if (score < 4) return '#fbbf24'   // partial/functional
  return '#10b981'                 // strong/integrated
}

export const getScoreLabel = (score) => {
  if (score === 0) return 'Absent'
  if (score <= 1) return 'Declaratory Only'
  if (score <= 2) return 'Partial Basis'
  if (score <= 3) return 'Functional Basis'
  if (score <= 4) return 'Strong Basis'
  return 'Integrated Basis'
}

export const getCountryDataFile = (country, fileName) => {
  if (country === 'Mexico') return fileName
  // For Costa Rica, most files are prefixed with costa_rica_
  return `costa_rica_${fileName}`
}

export const normalizeId = (id) => {
  if (!id) return ''
  return id.toLowerCase().replace(/[\s-]/g, '_')
}
