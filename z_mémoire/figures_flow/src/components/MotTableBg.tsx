import type { MotTableConfig } from '../types'
import { DEFAULT_MOT_TABLE_CONFIG } from '../types'

const MOT_COLOR = 'hsl(15, 100%, 40%)'

function hsla(color: string, alpha: number): string {
  const m = color.match(/^hsl\((\d+)/)
  return `hsla(${m?.[1] ?? 15}, 100%, 40%, ${alpha})`
}

const TREATMENTS = [
  { id: 'T0', label: 'Créer la campagne' },
  { id: 'T1', label: 'Soumettre la candidature' },
  { id: 'T2', label: 'Répondre au quiz' },
  { id: 'T3', label: 'Conduire et évaluer l\'entretien' },
  { id: 'T4', label: 'Valider la décision du recruteur' },
  { id: 'T5', label: 'Gérer la demande d\'annulation' },
  { id: 'T6', label: 'Journaliser audit_event' },
]

interface MotTableBgProps {
  config?: MotTableConfig
}

export default function MotTableBg({ config = DEFAULT_MOT_TABLE_CONFIG }: MotTableBgProps) {
  const c = config.colWidths
  const r = config.rowHeights
  const fs = config.fontScale ?? 1.0
  const totalWidth = c.temps + c.recruteur + c.candidat + c.systeme + c.type
  const totalHeight = 35 + r.reduce((a, b) => a + b, 0)

  return (
    <div
      style={{
        width: totalWidth,
        height: totalHeight,
        background: 'hsl(var(--background))',
        borderRadius: 12,
        border: `2px solid ${MOT_COLOR}`,
        overflow: 'hidden',
        boxShadow: '0 7px 9px 0 rgba(0,0,0,0.02)',
        fontSize: 11 * fs,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          fontWeight: 700,
          fontSize: 13 * fs,
          borderBottom: `2px solid ${MOT_COLOR}`,
          backgroundColor: hsla(MOT_COLOR, 0.094),
          color: MOT_COLOR,
        }}
      >
        MOT — Modèle Organisationnel de Traitement
      </div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: c.temps }} />
          <col style={{ width: c.recruteur }} />
          <col style={{ width: c.candidat }} />
          <col style={{ width: c.systeme }} />
          <col style={{ width: c.type }} />
        </colgroup>
        <thead>
          <tr>
            {['Temps', 'Recruteur', 'Candidat', 'Système', 'Type'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 12px',
                  textAlign: h === 'Temps' || h === 'Type' ? 'left' : 'center',
                  fontWeight: 700,
                  fontSize: 12 * fs,
                  borderBottom: `2px solid ${MOT_COLOR}`,
                  borderLeft: h !== 'Temps' ? `1px solid ${hsla(MOT_COLOR, 0.6)}` : undefined,
                  color: MOT_COLOR,
                  background: hsla(MOT_COLOR, 0.18),
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TREATMENTS.map((t, i) => (
            <tr key={t.id}>
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top',
                  borderBottom: i < TREATMENTS.length - 1 ? `1px solid ${hsla(MOT_COLOR, 0.6)}` : undefined,
                  fontWeight: 600,
                  fontSize: 10 * fs,
                  color: MOT_COLOR,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 11 * fs }}>{t.id}</div>
                <div style={{ marginTop: 2, color: 'hsl(var(--muted-foreground))' }}>{t.label}</div>
              </td>
              {['Recruteur', 'Candidat', 'Système'].map((actor) => (
                <td
                  key={actor}
                  style={{
                    height: r[i] ?? 400,
                    verticalAlign: 'top',
                    padding: 4,
                    borderLeft: `1px solid ${hsla(MOT_COLOR, 0.6)}`,
                    borderBottom: i < TREATMENTS.length - 1 ? `1px solid ${hsla(MOT_COLOR, 0.6)}` : undefined,
                  }}
                />
              ))}
              <td
                style={{
                  padding: '8px 12px',
                  verticalAlign: 'top',
                  borderLeft: `1px solid ${hsla(MOT_COLOR, 0.6)}`,
                  borderBottom: i < TREATMENTS.length - 1 ? `1px solid ${hsla(MOT_COLOR, 0.6)}` : undefined,
                  fontSize: 10 * fs,
                  color: MOT_COLOR,
                  fontStyle: 'italic',
                }}
              >
                Saisie / Manuel
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
