import type { DiagramDefinition } from '../../types'

const SAFE_HUES = [15, 225, 330, 285, 0, 240, 345, 300, 210, 315, 15, 270, 30, 255, 335, 275, 128, 166, 100]

const COLS = 4
const GAP_X = 300
const GAP_Y = 200

export const colorPalette: DiagramDefinition = {
  id: 'palette-colors',
  title: 'Palette de couleurs',
  category: 'palette',
  domain: 'SAFE_HUES — Couleurs du projet',
  nodes: SAFE_HUES.map((hue, i) => ({
    id: `swatch-${i}`,
    type: 'entity' as const,
    position: { x: (i % COLS) * GAP_X, y: Math.floor(i / COLS) * GAP_Y },
    data: {
      label: `hsl(${hue}, 100%, 40%)`,
      variant: 'mcd' as const,
      attributes: [
        { name: 'hue', type: `${hue}` },
        { name: 'saturation', type: '100%' },
        { name: 'lightness', type: '40%' },
      ],
    },
  })),
  edges: [],
}
