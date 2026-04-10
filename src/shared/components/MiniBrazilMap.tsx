'use client';
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

const STATE_MAP_CONFIG: Record<string, { scale: number, center: [number, number] }> = {
  'GO': { scale: 3000, center: [-49.5, -15.5] },
  'DF': { scale: 18000, center: [-47.8, -15.75] }, 
  'TO': { scale: 2900, center: [-48, -10] },
  'BA': { scale: 2200, center: [-41.5, -12.5] },
  'PE': { scale: 4000, center: [-37, -8.3] },
  'TODOS': { scale: 900, center: [-54, -15] }
};

interface MiniMapProps {
    activeState?: string;       
    activeStates?: string[];    // Vendas/Cadastro (Verde)
    rentalStates?: string[];    // Locações (Azul) - NOVO!
}

export default function MiniBrazilMap({ activeState, activeStates, rentalStates }: MiniMapProps) {
  const currentView = activeState ? activeState.toUpperCase() : 'TODOS';
  const config = STATE_MAP_CONFIG[currentView] || STATE_MAP_CONFIG['TODOS'];
  const isSingleStateView = activeState && currentView !== 'TODOS';

  const highlightedStates = activeStates ? activeStates.map(s => s.toUpperCase()) : [];
  const blueRentalStates = rentalStates ? rentalStates.map(s => s.toUpperCase()) : [];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: config.scale, center: config.center }}
        style={{ width: "100%", height: "100%", pointerEvents: 'none' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => isSingleStateView ? geo.properties.sigla === currentView : true)
              .map((geo) => {
                const sigla = geo.properties.sigla;
                
                let fillColor = "#FFFFFF"; 
                let strokeColor = "transparent";

                if (!isSingleStateView) {
                    // A PRIORIDADE É AZUL: Se tem locação lá, pinta de Azul. 
                    // Se não tem locação, mas tem cadastro comum, pinta de Verde.
                    if (blueRentalStates.includes(sigla)) {
                        fillColor = "#3b82f6"; // Azul Locação (Tailwind blue-500)
                        strokeColor = "#1d4ed8"; // Borda azul escura
                    } else if (highlightedStates.includes(sigla)) {
                        fillColor = "#16a34a"; // Verde Vendas/Filial
                        strokeColor = "#15803d";
                    } else {
                        fillColor = "#e2e8f0"; // Cinza claro vazio
                        strokeColor = "#cbd5e1"; 
                    }
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { outline: "none", transition: "all 0.3s" },
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