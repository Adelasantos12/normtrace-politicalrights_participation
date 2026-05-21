import React, { useState, useEffect, useMemo } from 'react'
import {
  Home,
  BookOpen,
  ShieldCheck,
  FileText,
  Users,
  Columns,
  Scale,
  Info,
  Globe,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

// Components (to be created)
import HomeView from './components/Home'
import InstrumentsView from './components/Instruments'
import PrinciplesView from './components/Principles'
import GapMap from './components/GapMap'
import NetworkView from './components/NetworkView'
import ComparisonView from './components/Comparison'
import JurisprudenceView from './components/Jurisprudence'
import MethodologyView from './components/Methodology'
import EvidenceDrawer from './components/EvidenceDrawer'

const styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' },
  sidebar: {
    width: '280px',
    background: '#1e3a8a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 50
  },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarTitle: { fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' },
  sidebarSub: { fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' },
  nav: { flex: 1, padding: '20px 12px', overflowY: 'auto' },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.2s',
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 400
  }),
  sidebarFooter: { padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', opacity: 0.6 },
  main: { flex: 1, marginLeft: '280px', padding: '0', display: 'flex', flexDirection: 'column' },
  topBar: {
    height: '64px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 40
  },
  content: { padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  countrySelector: { display: 'flex', gap: '8px', alignItems: 'center' },
  select: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    background: '#f1f5f9'
  },
  toggle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748b' }
}

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'instruments', label: 'Instruments Reviewed', icon: BookOpen },
  { id: 'principles', label: 'Principles & Anchoring', icon: ShieldCheck },
  { id: 'gap-map', label: 'Anchoring / Gap Map', icon: FileText },
  { id: 'network', label: 'Actors & Network', icon: Users },
  { id: 'comparison', label: 'Country Comparison', icon: Columns },
  { id: 'jurisprudence', label: 'Jurisprudence', icon: Scale },
  { id: 'methodology', label: 'Methodology', icon: Info },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [country, setCountry] = useState('mexico')
  const [compareMode, setCompareMode] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvidence, setSelectedEvidence] = useState(null)

  const fetchData = async (selectedCountry) => {
    setLoading(true)
    try {
      const countryPath = selectedCountry === 'mexico' ? 'mexico' : 'costa_rica'
      const prefix = selectedCountry === 'mexico' ? '' : 'costa_rica_'

      const endpoints = {
        // Global data
        principle_definitions: './data/international_standards/principle_definitions.json',
        traceability_matrix: './data/principle_traceability/principle_traceability_matrix.json',
        summary_by_country: './data/principle_traceability/principle_summary_by_country.json',
        gap_comparison: './data/principle_traceability/principle_gap_analysis_comparison.json',
        traceability_explainer: './data/principle_traceability/principle_traceability_explainer.json',

        // Jurisprudence
        jurisprudence_index: './data/jurisprudence/jurisprudence_index.json',

        // Network (v2 functional)
        nodes: './data/institutional_network_v2_functional/institutional_nodes_v2.json',
        edges: './data/institutional_network_v2_functional/institutional_edges_v2.json',
        centrality: './data/institutional_network_v2_functional/actor_centrality_metrics_v2.json',
        bottlenecks: './data/institutional_network_v2_functional/bottleneck_diagnostics_v2.json',
        admin_dependence: './data/institutional_network_v2_functional/administrative_dependence_metrics_v2.json',

        // Country specific
        source_hierarchy: `./data/legal_brains/${countryPath}/${prefix}source_hierarchy.json`,
        mechanism_sources: `./data/legal_brains/${countryPath}/${prefix}mechanism_sources.json`,
        legal_provisions: `./data/legal_brains/${countryPath}/${prefix}legal_provisions.json`,
        validation_notes: `./data/legal_brains/${countryPath}/${prefix}validation_notes.json`,
        mechanism_map: `./data/legal_brains/${countryPath}/${prefix}mechanism_map.json`,
        actor_map: `./data/legal_brains/${countryPath}/${prefix}actor_map.json`,
        country_profile: `./data/legal_brains/${countryPath}/${prefix}country_profile.json`,
      }

      const results = {}
      await Promise.all(
        Object.entries(endpoints).map(([key, url]) =>
          fetch(url)
            .then(res => res.ok ? res.json() : null)
            .then(json => { results[key] = json })
            .catch(() => { results[key] = null })
        )
      )

      setData(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(country)
  }, [country])

  const renderContent = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard data...</div>
    if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>

    const commonProps = { data, country, compareMode, setSelectedEvidence }

    switch (activeTab) {
      case 'home': return <HomeView {...commonProps} />
      case 'instruments': return <InstrumentsView {...commonProps} />
      case 'principles': return <PrinciplesView {...commonProps} />
      case 'gap-map': return <GapMap {...commonProps} />
      case 'network': return <NetworkView {...commonProps} />
      case 'comparison': return <ComparisonView {...commonProps} />
      case 'jurisprudence': return <JurisprudenceView {...commonProps} />
      case 'methodology': return <MethodologyView {...commonProps} />
      default: return <HomeView {...commonProps} />
    }
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>NormTrace</div>
          <div style={styles.sidebarSub}>Political Rights Dashboard</div>
        </div>
        <nav style={styles.nav}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              style={styles.navItem(activeTab === tab.id)}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          © 2026 NormTrace Project. Diagnostic legal preparedness mapping.
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={styles.countrySelector}>
              <Globe size={16} color="#64748b" />
              <select
                style={styles.select}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="mexico">Mexico</option>
                <option value="costa_rica">Costa Rica</option>
              </select>
            </div>

            <div style={styles.toggle}>
              <input
                type="checkbox"
                id="compare"
                checked={compareMode}
                onChange={() => setCompareMode(!compareMode)}
              />
              <label htmlFor="compare">Compare countries</label>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {renderContent()}
        </div>

        <footer style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center' }}>
          Diagnostic legal preparedness mapping. Not legal advice or compliance assessment.
        </footer>
      </main>

      {selectedEvidence && (
        <EvidenceDrawer
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          data={data}
        />
      )}
    </div>
  )
}
