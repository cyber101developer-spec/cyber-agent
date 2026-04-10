import type { Source } from './types'

export const DEFAULT_SOURCES: Omit<Source, 'id' | 'created_at'>[] = [
  {
    name: 'Federal Register — Cybersecurity',
    url: 'https://www.federalregister.gov/documents/search.json?conditions%5Bterm%5D=cybersecurity&format=rss',
    type: 'rss',
    is_active: true,
    is_default: true,
  },
  {
    name: 'FFIEC Cybersecurity Awareness',
    url: 'https://www.ffiec.gov/resources/cybersecurity-awareness',
    type: 'html',
    is_active: true,
    is_default: true,
  },
  {
    name: 'FDIC Cybersecurity Resources',
    url: 'https://www.fdic.gov/banker-resource-center/cybersecurity-resources',
    type: 'html',
    is_active: true,
    is_default: true,
  },
  {
    name: 'Federal Reserve IT Guidance',
    url: 'https://www.federalreserve.gov/supervisionreg/topics/information-technology-guidance.htm',
    type: 'html',
    is_active: true,
    is_default: true,
  },
  {
    name: 'OCC Bank Technology Publications',
    url: 'https://www.occ.gov/topics/supervision-and-examination/bank-operations/bit/bit-issuances.html',
    type: 'html',
    is_active: true,
    is_default: true,
  },
  {
    name: 'NYDFS Cybersecurity Guidance',
    url: 'https://www.dfs.ny.gov/industry_guidance/cybersecurity',
    type: 'html',
    is_active: true,
    is_default: true,
  },
]
