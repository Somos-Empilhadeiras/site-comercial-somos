'use client';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const GEO_URL = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

// ✅ O SEGREDO ESTÁ AQUI: Dicionário completo de centralização e zoom para os 27 estados!
const STATE_MAP_CONFIG: Record<string, { scale: number, center: [number, number] }> = {
  'AC': { scale: 4000, center: [-70.5, -9] },
  'AL': { scale: 15000, center: [-36.5, -9.5] },
  'AM': { scale: 1800, center: [-64.5, -4.5] },
  'AP': { scale: 5000, center: [-52, 1.5] },
  'BA': { scale: 2500, center: [-41.5, -12.5] },
  'CE': { scale: 5500, center: [-39.5, -5.5] },
  'DF': { scale: 40000, center: [-47.8, -15.8] }, // Zoom gigante para o DF
  'ES': { scale: 8000, center: [-40.5, -19.5] },
  'GO': { scale: 3000, center: [-49.5, -15.5] },
  'MA': { scale: 3000, center: [-45, -5] },
  'MG': { scale: 3000, center: [-44.5, -18.5] },
  'MS': { scale: 3000, center: [-54.5, -20.5] },
  'MT': { scale: 2200, center: [-56, -13] },
  'PA': { scale: 1800, center: [-53, -4] },
  'PB': { scale: 9000, center: [-36.5, -7.2] }, // Zoom ajustado para a Paraíba!
  'PE': { scale: 8000, center: [-38, -8.5] },
  'PI': { scale: 3500, center: [-43, -7.5] },
  'PR': { scale: 4500, center: [-51.5, -24.5] },
  'RJ': { scale: 9000, center: [-42.5, -22] },
  'RN': { scale: 10000, center: [-36.5, -5.8] },
  'RO': { scale: 3500, center: [-63, -11] },
  'RR': { scale: 4000, center: [-61, 2] },
  'RS': { scale: 3500, center: [-53.5, -29.5] },
  'SC': { scale: 6000, center: [-50.5, -27.5] },
  'SE': { scale: 20000, center: [-37.5, -10.5] },
  'SP': { scale: 4000, center: [-48.5, -22.5] },
  'TO': { scale: 3000, center: [-48, -10] },
  'TODOS': { scale: 900, center: [-54, -15] } // Visão geral do Brasil
};

interface MiniMapProps {
  activeState?: string;
  activeStates?: string[] | any;
  rentalStates?: string[] | any;
  onClickState?: (sigla: string) => void;
  interactive?: boolean;
}

export default function MiniBrazilMap({ activeState, activeStates, rentalStates, onClickState, interactive = false }: MiniMapProps) {
  const [tooltipContent, setTooltipContent] = useState('');

  const currentView = activeState ? activeState.toUpperCase() : 'TODOS';
  const config = STATE_MAP_CONFIG[currentView] || STATE_MAP_CONFIG['TODOS'];
  const isSingleStateView = activeState && currentView !== 'TODOS';

  const highlightedStates = activeStates ? activeStates.map((s: string) => s.toUpperCase()) : [];
  const blueRentalStates = rentalStates ? rentalStates.map((s: string) => s.toUpperCase()) : [];

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: config.scale, center: config.center }}
        style={{ width: "100%", height: "100%" }}
        data-tooltip-id="map-tooltip"
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => isSingleStateView ? geo.properties.sigla === currentView : true)
              .map((geo) => {
                const sigla = geo.properties.sigla;

                let fillColor = "#e2e8f0";
                let strokeColor = "#cbd5e1";

                const isVenda = highlightedStates.includes(sigla);
                const isLocacao = blueRentalStates.includes(sigla);

                if (isVenda && isLocacao) {
                  fillColor = "#0d9488"; // Turquesa (Ambos)
                  strokeColor = "#0f766e";
                } else if (isVenda) {
                  fillColor = "#16a34a"; // Verde (Vendas/Unidade)
                  strokeColor = "#15803d";
                } else if (isLocacao) {
                  fillColor = "#3b82f6"; // Azul (Locação)
                  strokeColor = "#1d4ed8";
                }


                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (interactive) setTooltipContent('AMPLIAR');
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                    onClick={() => {
                      if (interactive && onClickState) {
                        onClickState(sigla);
                      }
                    }}
                    style={{
                      default: { outline: "none", transition: "all 0.3s", cursor: interactive ? 'pointer' : 'default' },
                      hover: { outline: "none", fill: interactive ? '#a9abab' : fillColor, cursor: interactive ? 'pointer' : 'default' },
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
      {interactive && <ReactTooltip id="map-tooltip" content={tooltipContent} />}
    </div>
  );
}