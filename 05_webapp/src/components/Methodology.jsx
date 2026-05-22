import React from 'react'
import { Info, HelpCircle, ShieldAlert, Layers, Network } from 'lucide-react'

export default function MethodologyView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Methodology & Framing</h2>
        <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6 }}>
          NormTrace Political Rights maps <strong>diagnostic legal preparedness</strong>. It evaluates whether political participation mechanisms are legally anchored and operationalised through formal mandates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
              <Layers size={20} color="#2563eb" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Anchoring Scores (0–5)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { s: '0', l: 'Absent', d: 'No detected legal basis for the mechanism/principle.' },
              { s: '1', l: 'Declaratory', d: 'High-level mention without operational detail.' },
              { s: '2', l: 'Partial Basis', d: 'Fragmented legal basis; lacks core procedures.' },
              { s: '3', l: 'Functional Basis', d: 'Core procedures and actors are legally defined.' },
              { s: '4', l: 'Strong Basis', d: 'Detailed mandates with clear remedies/safeguards.' },
              { s: '5', l: 'Integrated Basis', d: 'Seamless cross-instrument legal consistency.' }
            ].map(item => (
              <div key={item.s} style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ width: '24px', fontWeight: 800, color: '#2563eb' }}>{item.s}</div>
                <div><strong>{item.l}:</strong> {item.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '8px' }}>
              <ShieldAlert size={20} color="#ea580c" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Core Caveats</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#475569', paddingLeft: '20px' }}>
            <li><strong>Not Legal Advice:</strong> This dashboard is for analytical research and diagnostic mapping only.</li>
            <li><strong>Statutory focus:</strong> We prioritize statutory anchoring over administrative flexibility.</li>
            <li><strong>Interpretive Layer:</strong> Jurisprudence provides support but does not substitute for domestic law.</li>
            <li><strong>Functional Network:</strong> Actor maps show legally-encoded relationships, not real-world implementation.</li>
            <li><strong>Manual Review:</strong> Flags indicate where automated detection requires expert legal validation.</li>
          </ul>
        </div>
      </div>

      <div style={{ background: '#0f172a', padding: '32px', borderRadius: '12px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Network size={24} color="#38bdf8" />
          <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Functional Network Logic</h3>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
          The institutional network is built from normative "actor-mechanism" edges. We use centrality metrics
          (Degree, Betweenness) to identify which institutions are the legal "gatekeepers" of participation.
          Bottleneck diagnostics highlight where a mechanism's legal path is concentrated through a single
          point of failure or requires excessive administrative discretion.
        </p>
      </div>
    </div>
  )
}
