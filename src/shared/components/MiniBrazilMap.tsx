'use client';
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// Configuração de Zoom e Centro para cada estado
const STATE_MAP_CONFIG: Record<string, { scale: number, center: [number, number] }> = {
  'GO': { scale: 3000, center: [-49.5, -15.5] },
  'DF': { scale: 18000, center: [-47.8, -15.75] }, 
  'TO': { scale: 2900, center: [-48, -10] },
  'BA': { scale: 2200, center: [-41.5, -12.5] },
  'PE': { scale: 4000, center: [-37, -8.3] },
  'TODOS': { scale: 620, center: [-54, -15] } // Visão geral do Brasil
};

interface MiniMapProps {
    activeState?: string;       // Usado nos cards (mostra só 1 estado)
    activeStates?: string[];    // Usado no Dashboard Admin (mostra o Brasil e pinta vários)
}

export default function MiniBrazilMap({ activeState, activeStates }: MiniMapProps) {
  // Define se a visão é focada em 1 estado ou global
  const currentView = activeState ? activeState.toUpperCase() : 'TODOS';
  const config = STATE_MAP_CONFIG[currentView] || STATE_MAP_CONFIG['TODOS'];
  const isSingleStateView = activeState && currentView !== 'TODOS';

  // Array de estados que devem ser destacados no modo Global
  const highlightedStates = activeStates ? activeStates.map(s => s.toUpperCase()) : [];

  return (
    <div className="w-full h-full flex items-center justify-center">
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
              // SE FOR VISÃO DE CARD: Filtra para mostrar só o estado específico
              // SE FOR DASHBOARD (activeStates): Mantém todos os estados para formar o Brasil
              .filter(geo => isSingleStateView ? geo.properties.sigla === currentView : true)
              .map((geo) => {
                const sigla = geo.properties.sigla;
                
                // Variáveis de cor padrão (Modo Card isolado)
                let fillColor = "#FFFFFF"; 
                let strokeColor = "transparent";

                // Lógica de cor (Modo Visão Global do Dashboard)
                if (!isSingleStateView) {
                    if (highlightedStates.includes(sigla)) {
                        fillColor = "#16a34a"; // Verde Tailwind para estados com filiais
                        strokeColor = "#15803d"; // Borda verde escura
                    } else {
                        fillColor = "#e2e8f0"; // Cinza claro para estados sem filiais
                        strokeColor = "#cbd5e1"; // Borda cinza
                    }
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={0.5}
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}