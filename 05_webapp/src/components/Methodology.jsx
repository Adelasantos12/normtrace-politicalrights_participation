import React from 'react'
import {
  Info, Scale, AlertTriangle, Network, ShieldCheck,
  Database, Layers, BookOpen, GitMerge, Target, Globe,
  AlertCircle, Activity, CheckCircle, XCircle, MinusCircle
} from 'lucide-react'

const styles = {
  container: (isMobile) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '24px' : '36px',
    maxWidth: '960px',
  }),
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  h2: (isMobile) => ({
    fontSize: isMobile ? '1.2rem' : '1.4rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  }),
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  p: (isMobile) => ({
    fontSize: isMobile ? '0.9rem' : '0.95rem',
    color: '#475569',
    lineHeight: '1.7',
    margin: 0,
  }),
  subhead: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  disclaimer: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderLeft: '4px solid #ef4444',
    padding: '16px 20px',
    borderRadius: '10px',
    display: 'flex',
    gap: '14px',
  },
  layerRow: {
    display: 'grid',
    gridTemplateColumns: '32px 120px 1fr',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  layerNum: (shade) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: shade,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9rem',
    flexShrink: 0,
  }),
  scoreRow: {
    display: 'grid',
    gridTemplateColumns: '48px 120px 1fr',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  scoreNum: (score) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: score === 0 ? '#f1f5f9' : score === 1 ? '#fef2f2' : score === 2 ? '#fff7ed' : score === 3 ? '#fefce8' : score === 4 ? '#f0fdf4' : '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '1rem',
    color: score === 0 ? '#94a3b8' : score >= 4 ? '#065f46' : '#92400e',
    flexShrink: 0,
  }),
  pipeStatus: (color, bg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color,
    background: bg,
    textTransform: 'uppercase',
  }),
  principleTag: {
    padding: '4px 10px',
    borderRadius: '6px',
    background: '#e0f2fe',
    color: '#0369a1',
    fontSize: '0.72rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
}

const LAYERS = [
  { num: 1, label: 'Constitutional', desc: 'Direct provision in the constitution or equivalent supreme norm. Provides the highest-order normative basis; absence here represents a fundamental anchoring failure.', shade: '#0f172a' },
  { num: 2, label: 'Statutory', desc: 'General or federal law enacted by the legislature. Required to operationalize constitutional mandates; without this layer, rights may be constitutionally recognized but legally inert.', shade: '#1e3a5f' },
  { num: 3, label: 'Regulatory / Procedural', desc: 'Implementing regulations, parliamentary reglamentos. Translates statutory mandates into operational procedures; gap here produces procedural voids.', shade: '#1e4d80' },
  { num: 4, label: 'Electoral Administrative', desc: 'INE lineamientos, TSE resolutions, acuerdos. Country-specific administrative instruments that operationalize electoral procedures at the agency level.', shade: '#1a6699' },
  { num: 5, label: 'Jurisprudential / Interpretive', desc: 'Supreme Court or electoral tribunal criteria. Fills interpretive gaps and can extend or restrict the practical scope of statutory and constitutional norms.', shade: '#0e7490' },
]

const SCORES = [
  { num: 0, label: 'Absent', desc: 'No provision found in the corpus for this principle–mechanism intersection.' },
  { num: 1, label: 'Declaratory', desc: 'Right is mentioned but no operational mechanism or procedure exists — formal without functional effect.' },
  { num: 2, label: 'Partial Basis', desc: 'Administrative-only anchoring; mechanism exists but relies on instruments below the statutory threshold required for the type of obligation.' },
  { num: 3, label: 'Functional Basis', desc: 'Statutory basis exists with procedural coverage but identifiable gaps in safeguards, judicial remedies, or full regulatory chain.' },
  { num: 4, label: 'Strong Basis', desc: 'Comprehensive statutory coverage with minor gaps; most of the normative chain is intact.' },
  { num: 5, label: 'Integrated Basis', desc: 'All five analytical dimensions are present and coherent across the hierarchy — constitutional, statutory, regulatory, administrative, and jurisprudential.' },
]

const PIPE_STATUSES = [
  { label: 'Coupled', color: '#10b981', bg: '#d1fae5', icon: CheckCircle, desc: 'Connection is present and legally sufficient for the type of obligation.' },
  { label: 'Partial', color: '#f59e0b', bg: '#fef3c7', icon: MinusCircle, desc: 'Connection exists but is incomplete or relies on administrative instruments where statutory ones are required.' },
  { label: 'Decoupled — TUBERÍA ROTA (Broken Pipe)', color: '#ef4444', bg: '#fee2e2', icon: XCircle, desc: 'Required connection is absent. The normative cascade is broken at this point.' },
  { label: 'Tension', color: '#8b5cf6', bg: '#ede9fe', icon: AlertTriangle, desc: 'Connection exists but contains conflicting or contradictory provisions.' },
  { label: 'Potential Gap', color: '#6366f1', bg: '#e0e7ff', icon: AlertCircle, desc: 'Connection is uncertain or depends on interpretive resolution not yet settled.' },
]

const CASCADE_PATTERNS = [
  { label: 'Inter-system decoupling', desc: 'Treaty ratified → no statutory transposition. International obligation remains unintegrated into domestic law.' },
  { label: 'Thin statutory anchoring', desc: 'Constitutional right → no implementing statute. Fundamental right exists only at the declaratory level.' },
  { label: 'Procedural gap', desc: 'Statute exists → no implementing regulation. The right is legally recognized but procedurally inoperative.' },
  { label: 'Coordination gap', desc: 'Regulation exists → no institutional competence attribution. No actor is mandated to act.' },
  { label: 'Capacity gap', desc: 'Competence attributed → no operational capacity or budget allocation. Institutional mandate without resource basis.' },
]

const PRINCIPLES = [
  { id: 'PRIN-001', name: 'Legal Basis', sources: 'ICCPR Art. 25, ACHR Art. 23' },
  { id: 'PRIN-002', name: 'Universal Suffrage', sources: 'ICCPR Art. 25(b), HRC GC-25 §10' },
  { id: 'PRIN-003', name: 'Equality & Non-Discrimination', sources: 'ICCPR Art. 2, 25, ACHR Art. 23, 24' },
  { id: 'PRIN-004', name: 'Right to Stand for Election', sources: 'ICCPR Art. 25(b), ACHR Art. 23(1)(b)' },
  { id: 'PRIN-005', name: 'Genuine Elections', sources: 'ICCPR Art. 25(b), HRC GC-25 §19–20' },
  { id: 'PRIN-006', name: 'Freedom of Expression & Information', sources: 'ICCPR Art. 19, ACHR Art. 13' },
  { id: 'PRIN-007', name: 'Right of Association', sources: 'ICCPR Art. 22, ACHR Art. 16' },
  { id: 'PRIN-008', name: 'Secret Ballot & Electoral Integrity', sources: 'ICCPR Art. 25(b), HRC GC-25 §20' },
  { id: 'PRIN-009', name: 'Effective Remedy', sources: 'ICCPR Art. 2(3), ACHR Art. 25' },
  { id: 'PRIN-010', name: 'Accessibility', sources: 'CRPD Art. 29, HRC GC-25 §20' },
  { id: 'PRIN-011', name: 'Periodic Elections', sources: 'ICCPR Art. 25(b), ACHR Art. 23(1)(b)' },
  { id: 'PRIN-012', name: 'Transparency & Accountability', sources: 'ICCPR Art. 25, IDEA frameworks' },
]

export default function Methodology({ isMobile }) {
  return (
    <div style={styles.container(isMobile)}>

      {/* Header */}
      <header>
        <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Methodology
        </h1>
        <p style={{ ...styles.p(isMobile), fontSize: isMobile ? '1rem' : '1.1rem', borderLeft: '4px solid #38bdf8', paddingLeft: '20px', color: '#334155' }}>
          NormTrace Political Rights is a <strong>diagnostic legal preparedness mapping framework</strong>. It does not assess compliance with legal norms; it maps whether the normative architecture necessary for a given right to be exercised exists, and at what level of the legal hierarchy it is anchored.
        </p>
      </header>

      {/* Disclaimer */}
      <div style={styles.disclaimer}>
        <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '0.85rem', color: '#991b1b' }}>Important Disclaimer</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.6 }}>
            This is a preliminary analytical mapping; not legal advice; subject to expert validation. Jurisprudence is flagged where relevant but not fully incorporated. State/provincial legislation is not in the corpus except where federal law mandates. Corpus currency: 2024–2025.
          </p>
        </div>
      </div>

      {/* Section 1: Complex Systems Model */}
      <section>
        <div style={styles.sectionHeader}>
          <Activity size={24} color="#0ea5e9" />
          <h2 style={styles.h2(isMobile)}>The Complex Systems Model</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            Political rights frameworks are analyzed as <strong>multi-layer normative systems</strong> where a right's effective operability depends on coherent anchoring across all relevant normative layers. A norm that exists at the constitutional level but has no statutory development, no implementing regulation, and no institutional competence assignment is <strong>functionally inoperative</strong> — regardless of its formal recognition.
          </p>
          <p style={styles.p(isMobile)}>
            NormTrace maps the five layers of the normative hierarchy for each principle–mechanism pair. The diagnostic score reflects not simply whether a provision exists, but whether it exists at the <em>appropriate hierarchical level</em> and whether the full cascade from international obligation to operational procedure is intact.
          </p>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Five Normative Layers Analyzed
            </p>
            {LAYERS.map((layer, idx) => (
              <div key={idx} style={{ ...styles.layerRow, borderBottom: idx < LAYERS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={styles.layerNum(layer.shade)}>{layer.num}</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', paddingTop: '6px' }}>{layer.label}</div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, paddingTop: '5px' }}>{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Norm Internalization Cascade */}
      <section>
        <div style={styles.sectionHeader}>
          <GitMerge size={24} color="#8b5cf6" />
          <h2 style={styles.h2(isMobile)}>The Norm Internalization Cascade</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            An international or constitutional obligation must propagate <em>downward</em> through the normative hierarchy to be operational. If a norm is present at layer N but absent at layer N+1 (which is required for implementation), there is a <strong>cascade break</strong> — rendered visually as a "tubería rota" (broken pipe) in the Acoplamiento Jurídico view.
          </p>
          <p style={styles.p(isMobile)}>
            NormTrace flags where in the hierarchy each right's anchoring chain breaks. The following patterns represent the most analytically significant cascade break types identified in the corpus:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CASCADE_PATTERNS.map((pattern, idx) => (
              <div key={idx} style={{ padding: '12px 16px', borderRadius: '8px', background: '#f8fafc', borderLeft: '3px solid #8b5cf6' }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{pattern.label}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{pattern.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: The Pipe Puzzle */}
      <section>
        <div style={styles.sectionHeader}>
          <Activity size={24} color="#f59e0b" />
          <h2 style={styles.h2(isMobile)}>The Pipe Puzzle Visualization</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            The <strong>Acoplamiento Jurídico (Instrument Coupling)</strong> tab visualizes the normative cascade as a pipe system. Each coupling represents a required normative connection between two hierarchical layers. The "pipe" metaphor is diagnostic: a working pipe means the right "flows" through the legal system; a broken pipe means the cascade is interrupted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PIPE_STATUSES.map(({ label, color, bg, icon: Icon, desc }, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px', borderRadius: '8px', background: bg, border: `1px solid ${color}20` }}>
                <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ ...styles.pipeStatus(color, 'transparent'), padding: 0, fontSize: '0.78rem' }}>{label}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: The Gap Map */}
      <section>
        <div style={styles.sectionHeader}>
          <Target size={24} color="#10b981" />
          <h2 style={styles.h2(isMobile)}>The Anchoring / Gap Map</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            The heatmap crosses <strong>12 analytical principles</strong> against the detected legal mechanisms for each country, drawn from the <code>principle_traceability_matrix</code>. Each cell contains an anchoring score from 0 to 5. The matrix reveals not just which rights are weakly anchored, but <em>which mechanism-level gaps</em> are producing the weakness — enabling targeted reform recommendations.
          </p>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Score Scale (0–5)
            </p>
            {SCORES.map((s, idx) => (
              <div key={idx} style={{ ...styles.scoreRow, borderBottom: idx < SCORES.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={styles.scoreNum(s.num)}>{s.num}</div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', paddingTop: '8px' }}>{s.label}</div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6, paddingTop: '7px' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: The 12 Principles */}
      <section>
        <div style={styles.sectionHeader}>
          <ShieldCheck size={24} color="#0369a1" />
          <h2 style={styles.h2(isMobile)}>The 12 Analytical Principles</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            The 12 principles are derived from <strong>ICCPR Art. 25</strong>, <strong>ACHR Art. 23</strong>, <strong>HRC General Comment 25</strong>, and IDEA comparative frameworks. They represent the analytically distinct dimensions of political participation rights that require distinct normative operationalization.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            {PRINCIPLES.map((p, idx) => (
              <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #e0f2fe', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.principleTag}>{p.id}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{p.name}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>{p.sources}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Institutional Network */}
      <section>
        <div style={styles.sectionHeader}>
          <Network size={24} color="#7c3aed" />
          <h2 style={styles.h2(isMobile)}>Institutional Network Analysis</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            The actor network visualizes <strong>legally mandated relationships</strong> between institutions. An edge exists only when a domestic legal provision explicitly mandates or authorizes an interaction between two actors in the context of a specific political rights mechanism.
          </p>
          <p style={styles.p(isMobile)}>
            <strong>Edge colors</strong> reflect anchor strength of the underlying provision: strong anchoring (score ≥ 4) renders as green; medium (≥ 2) as amber; weak as grey. <strong>Node size</strong> reflects degree centrality — how many legally mandated procedures pass through each actor.
          </p>
          <div style={{ padding: '14px 18px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', borderLeft: '4px solid #ca8a04' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.82rem', color: '#713f12' }}>Structural Bottleneck Interpretation</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#854d0e', lineHeight: 1.6 }}>
              High concentration of centrality in a single actor (e.g., INE in Mexico) signals potential structural bottleneck risk: the failure, capture, or dysfunction of that single actor can cascade across multiple mechanisms simultaneously.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Data Corpus */}
      <section>
        <div style={styles.sectionHeader}>
          <Database size={24} color="#065f46" />
          <h2 style={styles.h2(isMobile)}>Data Corpus and Sources</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            The legal corpus is indexed in <code>source_hierarchy.json</code> per country. It is scoped as follows:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.82rem', color: '#065f46' }}>Included in Corpus</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#064e3b', lineHeight: 1.7 }}>
                <li>Constitution (CPEUM / Constitución Política de Costa Rica)</li>
                <li>General / organic / federal laws</li>
                <li>Implementing regulations and parliamentary reglamentos</li>
                <li>INE / TSE administrative instruments (lineamientos, acuerdos)</li>
                <li>Select international standards (ICCPR, ACHR, CRPD, CEDAW)</li>
              </ul>
            </div>
            <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.82rem', color: '#991b1b' }}>Not Included</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.7 }}>
                <li>State / provincial legislation (except where federal law mandates)</li>
                <li>Jurisprudence (flagged where relevant but not systematically indexed)</li>
                <li>Administrative practice or executive circulars</li>
                <li>Municipal or local regulatory instruments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Diagnostic vs. Compliance */}
      <section>
        <div style={styles.sectionHeader}>
          <Scale size={24} color="#ef4444" />
          <h2 style={styles.h2(isMobile)}>Diagnostic vs. Compliance Assessment</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            NormTrace <strong>does not assess legal compliance</strong>. It does not evaluate whether rights are actually exercised, whether laws are enforced, or whether institutions behave as mandated. It evaluates the <em>normative architecture</em>: whether the legal instruments required for a right's exercise exist, at the appropriate hierarchical level, with the required connections intact.
          </p>
          <p style={styles.p(isMobile)}>
            A country can score highly on the anchoring map and still exhibit systematic violations in practice. Conversely, a country with formal legal gaps may exhibit functional workarounds through institutional practice — which NormTrace will not capture. The diagnostic is a map of legal preparedness, not a measure of democratic quality or compliance.
          </p>
          <div style={styles.disclaimer}>
            <Info size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.6 }}>
              This is a preliminary diagnostic mapping based on statutory text analysis. Not legal advice. Subject to expert validation. Findings should be verified against authoritative legal commentary and updated jurisprudence before use in policy or advocacy contexts.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: Citation */}
      <section>
        <div style={styles.sectionHeader}>
          <BookOpen size={24} color="#0369a1" />
          <h2 style={styles.h2(isMobile)}>How to Cite</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.p(isMobile)}>
            If you use this platform or its outputs in research, policy or advocacy work, please cite it as:
          </p>
          <p style={{ ...styles.p(isMobile), padding: '14px 18px', background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '10px', fontStyle: 'italic' }}>
            Santos Domínguez, A. B. (2026). NormTrace-Political Rights: Legal-Institutional Activation Mapping of Political Participation Rights in Mexico and Costa Rica (Version v0.1.2) [Computer software]. Zenodo.{' '}
            <a href="https://doi.org/10.5281/zenodo.21296393" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', fontStyle: 'normal' }}>
              https://doi.org/10.5281/zenodo.21296393
            </a>
          </p>
        </div>
      </section>

    </div>
  )
}
