import type { EntityNodeData } from '../../types'

/**
 * Acteur du mémoire, en présentation strictement neutre.
 *
 * Chaque acteur utilise la même géométrie et la même typographie : la couleur
 * distingue les rôles, elle ne les classe pas. Aucune carte individuelle n’est
 * bordée, afin qu’aucun bloc ne ressemble à un conteneur plus important qu’un
 * autre. Aucun `<Handle>` n’est rendu : la figure ne contient aucune arête.
 */
const ROLE_SIZE = 30
const FUNCTION_SIZE = 24
const INITIAL_SIZE = 34

function px(value: number) {
  return {
    // Même convention que les figures d’impression existantes : la taille suit
    // `--org-font-scale`, déjà recopiée pendant l’export SVG.
    fontSize: `calc(var(--org-font-scale, 1) * ${value}px)`,
  }
}

export default function ActorNode({ data }: { data: EntityNodeData }) {
  if (data.actorRule) {
    return (
      <div
        data-export-root
        // `exportWidth`, pas `100 %` : voir le contrat sur `EntityNodeData`.
        style={{ width: data.exportWidth }}
      >
        {/* Hauteur sur l’enfant interne, jamais sur la racine : le `height`
          de la capture (`height: auto`) écraserait un `height` de racine et
          ferait disparaître le filet du SVG — mesuré à zéro pixel. */}
        <div className="bg-foreground/25" style={{ height: 2 }} />
      </div>
    )
  }

  return (
    <div
      data-export-root
      className="flex w-full flex-col items-center text-center"
      // `exportWidth`, pas `w-full` seul : voir le contrat sur `EntityNodeData`.
      style={{ minHeight: data.minHeight, width: data.exportWidth }}
    >
      <div
        className="flex items-center justify-center rounded-full font-bold text-white"
        style={{
          width: 120,
          height: 120,
          backgroundColor: data.color,
          ...px(INITIAL_SIZE),
        }}
      >
        {data.actorInitial}
      </div>
      <div
        className="mt-4 font-bold leading-tight text-foreground"
        style={px(ROLE_SIZE)}
      >
        {data.label}
      </div>
      <div
        // `/85`, pas `/70` : à ~8,7 pt en italique rasterisé, `/70` tombait à
        // ~3:1 sur fond blanc et devenait illisible dans le mémoire. `/85`
        // remonte vers ~6:1 tout en gardant la fonction secondaire au rôle.
        className="mt-2 italic leading-snug text-foreground/85"
        style={px(FUNCTION_SIZE)}
      >
        {data.actorFunction}
      </div>
    </div>
  )
}
