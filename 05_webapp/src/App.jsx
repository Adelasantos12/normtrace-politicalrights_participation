import React, { useState, useEffect } from 'react'
import ActorsExplorer from './components/ActorsExplorer.jsx'

const styles = {
  app: { minHeight: '100vh', background: '#f8fafc' },
  header: {
    background: '#1e3a5f', color: '#fff',
    padding: '14px 24px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '3px solid #3b82f6'
  },
  headerTitle: { fontSize: 18, fontWeight: 700, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },
  badge: {
    background: '#f59e0b', color: '#1e293b',
    fontSize: 10, fontWeight: 700, padding: '2px 8px',
    borderRadius: 12, textTransform: 'uppercase', letterSpacing: 0.5
  },
  disclaimer: {
    background: '#fef3c7', borderLeft: '4px solid #d97706',
    padding: '8px 24px', fontSize: 12, color: '#78350f'
  },
  nav: {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '0 24px', display: 'flex', gap: 0
  },
  navBtn: {
    padding: '12px 20px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    color: '#64748b', borderBottom: '3px solid transparent',
    transition: 'all 0.15s'
  },
  navBtnActive: {
    color: '#1e3a5f', borderBottom: '3px solid #3b82f6', fontWeight: 700
  },
  main: { padding: '0 24px 40px' }
}

const NAV_TABS = [
  { id: 'actors', label: 'Actor Inventory' },
  { id: 'network', label: 'Relationship Map' },
  { id: 'metrics', label: 'Network Metrics' },
]

export default function App() {
  const [tab, setTab] = useState('actors')
  const [data, setData] = useState({ nodes: null, edges: null, metrics: null, summary: null })

  useEffect(() => {
    const base = './data/network'
    Promise.all([
      fetch(`${base}/nodes.json`).then(r => r.json()),
      fetch(`${base}/edges.json`).then(r => r.json()),
      fetch(`${base}/metrics.json`).then(r => r.json()),
      fetch(`${base}/summary.json`).then(r => r.json()),
    ]).then(([nodes, edges, metrics, summary]) => {
      setData({ nodes, edges, metrics, summary })
    }).catch(err => console.error('Data load error:', err))
  }, [])

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.headerTitle}>NormTrace-IHR · Mexico Pilot</div>
          <div style={styles.headerSub}>Legal-Institutional Network · Data Package v0.1</div>
        </div>
        <span style={styles.badge}>Preliminary · AI-assisted</span>
      </header>
      <div style={styles.disclaimer}>
        ⚠ Preliminary research draft for expert feedback. Not for citation, redistribution or public release without author permission. All PABS references are provisional (IGWG Bureau draft, 9 March 2026).
      </div>
      <nav style={styles.nav}>
        {NAV_TABS.map(t => (
          <button
            key={t.id}
            style={{ ...styles.navBtn, ...(tab === t.id ? styles.navBtnActive : {}) }}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>
      <main style={styles.main}>
        {data.nodes
          ? <ActorsExplorer tab={tab} {...data} />
          : <LoadingState />}
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      <div>Loading network data…</div>
    </div>
  )
}
