'use client';
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// Configuração de Zoom e Centro para cada estado
// Esses valores centralizam e dão zoom no estado específico.
const STATE_MAP_CONFIG: Record<string, { scale: number, center: [number, number] }> = {
  'GO': { scale: 3000, center: [-49.5, -15.5] },
  'DF': { scale: 15000, center: [-47.8, -15.75] }, // DF precisa de muito zoom
  'TO': { scale: 2500, center: [-48, -10] },
  'BA': { scale: 1800, center: [-41.5, -12.5] },
  'PE': { scale: 4000, center: [-37, -8.3] },
  'TODOS': { scale: 750, center: [-54, -15] } // Visão geral do Brasil
};

interface MiniMapProps {
  activeState: string; // Ex: 'GO', 'DF', 'BA', 'TODOS'
}

export default function MiniBrazilMap({ activeState }: MiniMapProps) {
  const current = activeState ? activeState.toUpperCase() : 'TODOS';
  
  // Pega a configuração do estado atual, ou usa a do Brasil (TODOS) como fallback
  const config = STATE_MAP_CONFIG[current] || STATE_MAP_CONFIG['TODOS'];
  const isTodos = current === 'TODOS';

  return (
    <div className="w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: config.scale,
          center: config.center
        }}
        // Remove interatividade, é só visual
        style={{ width: "100%", height: "100%", pointerEvents: 'none' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              // AQUI É O PULO DO GATO: Filtramos para mostrar SÓ o estado atual.
              // Se for 'TODOS', mostra todos. Se for um estado, só mostra ele.
              .filter(geo => isTodos || geo.properties.sigla === current)
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                  // Visual:
                  // - Branco Sólido (#FFFFFF) para destacar
                  // - Se for 'TODOS', usa um branco mais transparente para não ficar muito pesado
                  fill={"#FFFFFF"}
                  stroke="transparent" // Sem borda para um visual mais limpo "recortado"
                />
              ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}