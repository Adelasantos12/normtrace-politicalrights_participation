import React, { useState, useEffect } from 'react'
import { Home, BookOpen, ShieldCheck, FileText, Users, Columns, Scale, Info, Globe } from 'lucide-react'

// Components
import HomeView from './components/Home'
import InstrumentsView from './components/Instruments'
import PrinciplesView from './components/Principles'
import GapMap from './components/GapMap'
import NetworkView from './components/NetworkView'
import ComparisonView from './components/Comparison'
import JurisprudenceView from './components/Jurisprudence'
import MethodologyView from './components/Methodology'
import EvidenceDrawer from './components/EvidenceDrawer'

import { countryMatches } from './utils'

const styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' },
  sidebar: { width: '280px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50 },
  sidebarHeader: { padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' },
  sidebarSub: { fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' },
  nav: { flex: 1, padding: '20px 12px', overflowY: 'auto' },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', background: active ? '#1e293b' : 'transparent', color: active ? '#38bdf8' : 'rgba(255,255,255,0.6)', border: 'none', width: '100%', textAlign: 'left', fontSize: '0.9rem', outline: 'none' }),
  main: { flex: 1, marginLeft: '280px', padding: '0', display: 'flex', flexDirection: 'column' },
  topBar: { height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 40 },
  content: { padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }
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
  const [selectedEvidence, setSelectedEvidence] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const countryPath = country === 'mexico' ? 'mexico' : 'costa_rica'
      const prefix = country === 'mexico' ? '' : 'costa_rica_'
      const base = './data'

      const endpoints = {
        principle_definitions: `${base}/international_standards/principle_definitions.json`,
        traceability_matrix: `${base}/principle_traceability/principle_traceability_matrix.json`,
        principle_explainer: `${base}/principle_traceability/principle_traceability_explainer.json`,
        gap_comparison: `${base}/principle_traceability/principle_gap_analysis_comparison.json`,
        jurisprudence: `${base}/jurisprudence/jurisprudence_index.json`,
        actor_centrality: `${base}/institutional_network_v2_functional/actor_centrality_metrics_v2.json`,
        bottleneck_diagnostics: `${base}/institutional_network_v2_functional/bottleneck_diagnostics_v2.json`,
        admin_dependence: `${base}/institutional_network_v2_functional/administrative_dependence_metrics_v2.json`,
        process_coverage: `${base}/institutional_network_v2_functional/process_stage_coverage_v2.json`,
        mechanism_metrics: `${base}/institutional_network_v2_functional/mechanism_network_metrics_v2.json`,
        summary_by_country: `${base}/principle_traceability/principle_summary_by_country.json`,
        nodes: `${base}/institutional_network_v2_functional/institutional_nodes_v2.json`,
        edges: `${base}/institutional_network_v2_functional/institutional_edges_v2.json`,
        legal_provisions: `${base}/legal_brains/${countryPath}/${prefix}legal_provisions.json`,
        mechanism_map: `${base}/legal_brains/${countryPath}/${prefix}mechanism_map.json`,
        source_hierarchy: `${base}/legal_brains/${countryPath}/${prefix}source_hierarchy.json`,
        validation_notes: `${base}/legal_brains/${countryPath}/${prefix}validation_notes.json`,
        mechanism_sources: `${base}/legal_brains/${countryPath}/${prefix}mechanism_sources.json`,
        network_validation: `${base}/institutional_network_v2_functional/network_validation_notes_v2.json`,
        international_standards: `${base}/international_standards/international_standard_provisions.json`,
        instrument_insights: `${base}/instrument_system_insights/instrument_insights.json`,
        instrument_mechanism_coverage: `${base}/instrument_system_insights/instrument_mechanism_coverage.json`,
        instrument_principle_coverage: `${base}/instrument_system_insights/instrument_principle_coverage.json`,
        instrument_actor_links: `${base}/instrument_system_insights/instrument_actor_links.json`,
        instrument_gap_flags: `${base}/instrument_system_insights/instrument_gap_flags.json`,
        system_architecture: `${base}/instrument_system_insights/system_architecture_summary.json`,
        system_level_insights: `${base}/instrument_system_insights/system_level_insights.json`,
        system_gap_implications: `${base}/instrument_system_insights/system_gap_implications.json`,
      }

      const results = {}
      await Promise.all(Object.entries(endpoints).map(([key, url]) =>
        fetch(url).then(r => r.ok ? r.json() : null).then(j => {
           results[key] = j;
           if (!j) console.warn("Failed to load:", url);
        })
      ))
      setData(results)
      setLoading(false)
    }
    fetchData()
  }, [country])

  const commonProps = { data, country, compareMode, setSelectedEvidence }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>NormTrace</div>
          <div style={styles.sidebarSub}>Political Rights</div>
        </div>
        <nav style={styles.nav}>
          {TABS.map(tab => (
            <button key={tab.id} style={styles.navItem(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <main style={styles.main}>
        <header style={styles.topBar}>
          <h2 style={{ fontSize: '1.1rem' }}>{TABS.find(t => t.id === activeTab)?.label}</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Globe size={18} />
            <select value={country} onChange={e => setCountry(e.target.value)}>
              <option value="mexico">Mexico</option>
              <option value="costa_rica">Costa Rica</option>
            </select>
          </div>
        </header>
        <div style={styles.content}>
          {loading ? <div>Loading datasets for ${country}...</div> : (
            <>
              {activeTab === 'home' && <HomeView {...commonProps} />}
              {activeTab === 'gap-map' && <GapMap {...commonProps} />}
              {activeTab === 'network' && <NetworkView {...commonProps} />}
              {activeTab === 'instruments' && <InstrumentsView {...commonProps} />}
              {activeTab === 'principles' && <PrinciplesView {...commonProps} />}
              {activeTab === 'comparison' && <ComparisonView {...commonProps} />}
              {activeTab === 'jurisprudence' && <JurisprudenceView {...commonProps} />}
              {activeTab === 'methodology' && <MethodologyView {...commonProps} />}
            </>
          )}
        </div>
      </main>
      {selectedEvidence && <EvidenceDrawer evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} data={data} country={country} />}
    </div>
  )
}
