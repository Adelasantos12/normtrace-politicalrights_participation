export const normalizeCountry = (c) => {
  if (!c) return ''
  return c.toLowerCase().replace(/_/g, ' ')
}

export const countryMatches = (c1, c2) => {
  return normalizeCountry(c1) === normalizeCountry(c2)
}
