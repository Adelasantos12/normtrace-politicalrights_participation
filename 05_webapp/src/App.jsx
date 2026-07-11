import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Map,
  Network,
  Scale,
  Layers,
  FileSearch,
  Globe,
  Info,
  ChevronRight,
  Menu,
  X,
  Loader2,
  GitMerge
} from 'lucide-react';

import Home from './components/Home';
import Instruments from './components/Instruments';
import Principles from './components/Principles';
import GapMap from './components/GapMap';
import NetworkView from './components/NetworkView';
import Comparison from './components/Comparison';
import Jurisprudence from './components/Jurisprudence';
import Methodology from './components/Methodology';
import EvidenceDrawer from './components/EvidenceDrawer';
import NormDiagnostic from './components/NormDiagnostic';
import { getCountryDataFile } from './utils';

const views = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'normdiagnostic', label: 'Norm Diagnostic', icon: Layers, highlight: true },
  { id: 'instruments', label: 'Instruments Reviewed', icon: BookOpen },
  { id: 'principles', label: 'Principles & Anchoring', icon: Target },
  { id: 'gapmap', label: 'Anchoring / Gap Map', icon: Map },
  { id: 'network', label: 'Actors & Network', icon: Network },
  { id: 'comparison', label: 'Country Comparison', icon: Scale },
  { id: 'jurisprudence', label: 'Jurisprudence', icon: FileSearch },
  { id: 'methodology', label: 'Methodology', icon: Info }
];

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [country, setCountry] = useState('Mexico');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [evidenceContext, setEvidenceContext] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const countryPath = country === 'Mexico' ? 'mexico' : 'costa_rica';

        // Helper to fetch JSON from public/data with resilience
        const fetchJson = async (path) => {
          try {
            const res = await fetch(`/data/${path}`);
            if (!res.ok) {
              console.warn(`Failed to load ${path}: ${res.statusText}`);
              return null;
            }
            return await res.json();
          } catch (e) {
            console.error(`Error fetching ${path}:`, e);
            return null;
          }
        };

        const [
          principle_definitions,
          traceability_matrix,
          principle_explainer,
          principle_summary_by_country,
          system_level_insights,
          system_architecture,
          system_gap_implications,
          instrument_insights,
          jurisprudence_index,
          nodes,
          edges,
          actor_centrality,
          mechanism_metrics,
          bottlenecks,
          admin_dependence,
          stage_coverage,
          network_validation,
          source_hierarchy,
          mechanism_sources,
          legal_provisions,
          validation_notes,
          mechanism_map
        ] = await Promise.all([
          fetchJson('international_standards/principle_definitions.json'),
          fetchJson('principle_traceability/principle_traceability_matrix.json'),
          fetchJson('principle_traceability/principle_traceability_explainer.json'),
          fetchJson('principle_traceability/principle_summary_by_country.json'),
          fetchJson('instrument_system_insights/system_level_insights.json'),
          fetchJson('instrument_system_insights/system_architecture_summary.json'),
          fetchJson('instrument_system_insights/system_gap_implications.json'),
          fetchJson('instrument_system_insights/instrument_insights.json'),
          fetchJson('jurisprudence/jurisprudence_index.json'),
          fetchJson('institutional_network_v2_functional/institutional_nodes_v2.json'),
          fetchJson('institutional_network_v2_functional/institutional_edges_v2.json'),
          fetchJson('institutional_network_v2_functional/actor_centrality_metrics_v2.json'),
          fetchJson('institutional_network_v2_functional/mechanism_network_metrics_v2.json'),
          fetchJson('institutional_network_v2_functional/bottleneck_diagnostics_v2.json'),
          fetchJson('institutional_network_v2_functional/administrative_dependence_metrics_v2.json'),
          fetchJson('institutional_network_v2_functional/process_stage_coverage_v2.json'),
          fetchJson('institutional_network_v2_functional/network_validation_notes_v2.json'),
          fetchJson(`legal_brains/${countryPath}/${getCountryDataFile(country, 'source_hierarchy.json')}`),
          fetchJson(`legal_brains/${countryPath}/${getCountryDataFile(country, 'mechanism_sources.json')}`),
          fetchJson(`legal_brains/${countryPath}/${getCountryDataFile(country, 'legal_provisions.json')}`),
          fetchJson(`legal_brains/${countryPath}/${getCountryDataFile(country, 'validation_notes.json')}`),
          fetchJson(`legal_brains/${countryPath}/${getCountryDataFile(country, 'mechanism_map.json')}`)
        ]);

        setData({
          principle_definitions,
          traceability_matrix,
          principle_explainer,
          principle_summary_by_country,
          system_level_insights,
          system_architecture,
          system_gap_implications,
          instrument_insights,
          jurisprudence_index,
          nodes,
          edges,
          actor_centrality,
          mechanism_metrics,
          bottlenecks,
          admin_dependence,
          stage_coverage,
          network_validation,
          source_hierarchy,
          mechanism_sources,
          legal_provisions,
          validation_notes,
          mechanism_map
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country]);

  const openEvidence = (ctx) => {
    setEvidenceContext(ctx);
    setIsEvidenceOpen(true);
  };

  const renderView = () => {
    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px', color: '#64748b' }}>
        <Loader2 className="animate-spin" size={48} />
        <p>Loading diagnostic data...</p>
      </div>
    );
    if (error) return (
      <div style={{ padding: '40px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#991b1b' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Data Load Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', background: '#991b1b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );

    switch (activeView) {
      case 'home': return <Home data={data} country={country} openEvidence={openEvidence} isMobile={isMobile} />;
      case 'normdiagnostic': return <NormDiagnostic country={country} isMobile={isMobile} />;
      case 'instruments': return <Instruments data={data} country={country} openEvidence={openEvidence} isMobile={isMobile} />;
      case 'principles': return <Principles data={data} country={country} openEvidence={openEvidence} isMobile={isMobile} />;
      case 'gapmap': return <GapMap data={data} country={country} openEvidence={openEvidence} isMobile={isMobile} />;
      case 'network': return <NetworkView data={data} country={country} openEvidence={openEvidence} isMobile={isMobile} />;
      case 'comparison': return <Comparison data={data} isMobile={isMobile} />;
      case 'jurisprudence': return <Jurisprudence data={data} country={country} isMobile={isMobile} />;
      case 'methodology': return <Methodology data={data} isMobile={isMobile} />;
      default: return <Home data={data} country={country} />;
    }
  };

  const Sidebar = () => (
    <aside style={{
      width: '280px',
      backgroundColor: '#0f172a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #1e293b',
      position: isMobile ? 'fixed' : 'relative',
      left: isMobile && !isSidebarOpen ? '-280px' : '0',
      top: 0,
      bottom: 0,
      zIndex: 50,
      transition: 'left 0.3s ease-in-out'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>NormTrace</h1>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Political Rights</p>
        </div>
        {isMobile && (
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {views.map(view => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          const isHighlight = view.highlight && !isActive;
          return (
            <button
              key={view.id}
              onClick={() => {
                setActiveView(view.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: isHighlight ? '1px solid #0ea5e920' : 'none',
                backgroundColor: isActive ? '#1e293b' : isHighlight ? '#0c4a6e20' : 'transparent',
                color: isActive ? '#38bdf8' : isHighlight ? '#7dd3fc' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={20} />
              <span style={{ fontWeight: isActive ? 600 : isHighlight ? 600 : 400 }}>{view.label}</span>
              {isHighlight && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '1px 6px', background: '#0ea5e9', color: '#fff', borderRadius: '4px', fontWeight: 700 }}>NEW</span>}
              {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #1e293b', backgroundColor: '#1e293b33' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>Country Focus</div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }}
        >
          <option value="Mexico">Mexico</option>
          <option value="Costa Rica">Costa Rica</option>
        </select>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />

      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          padding: isMobile ? '12px 20px' : '20px 40px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#1e293b', cursor: 'pointer', padding: '4px' }}>
                <Menu size={24} />
              </button>
            )}
            <h2 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {views.find(v => v.id === activeView)?.label}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: isMobile ? '0.75rem' : '0.85rem' }}>
              <Globe size={16} /> {!isMobile && country}
            </div>
          </div>
        </header>

        <div style={{ padding: isMobile ? '20px' : '40px' }}>
          {renderView()}
        </div>

        <footer style={{ marginTop: 'auto', padding: '24px 40px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.7 }}>
          <div>Diagnostic legal preparedness mapping. Not legal advice or compliance assessment.</div>
          <div style={{ marginTop: '6px' }}>
            Santos Domínguez, A. B. (2026). <em>NormTrace-Political Rights</em> (v0.1.2) [Computer software]. Zenodo.{' '}
            <a
              href="https://doi.org/10.5281/zenodo.21296393"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#64748b', textDecoration: 'underline' }}
            >
              https://doi.org/10.5281/zenodo.21296393
            </a>
          </div>
        </footer>
      </main>

      {isEvidenceOpen && (
        <EvidenceDrawer
          isOpen={isEvidenceOpen}
          onClose={() => setIsEvidenceOpen(false)}
          context={evidenceContext}
          country={country}
          data={data}
        />
      )}
    </div>
  );
}
