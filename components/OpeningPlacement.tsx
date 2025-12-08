'use client';

import { useState } from 'react';
import { BuildingDesign, Opening } from '@/types/building';
import { windowOptions, doorOptions, OpeningOption } from '@/data/windowsDoors';

interface OpeningPlacementProps {
  design: BuildingDesign;
  onOpeningsChange: (openings: Opening[]) => void;
}

export default function OpeningPlacement({ design, onOpeningsChange }: OpeningPlacementProps) {
  const [selectedOpening, setSelectedOpening] = useState<string | null>(null);
  const [selectedWall, setSelectedWall] = useState<'front' | 'back' | 'left' | 'right'>('front');

  const allOptions: OpeningOption[] = [...windowOptions, ...doorOptions];

  const handleAddOpening = (option: OpeningOption) => {
    const newOpening: Opening = {
      id: `${option.type}-${Date.now()}`,
      type: option.type,
      x: 50, // Default center position
      y: 50,
      width: option.width,
      height: option.height,
      name: option.name,
      price: option.price,
      wall: selectedWall,
    };
    const currentOpenings = design.openings || [];
    onOpeningsChange([...currentOpenings, newOpening]);
  };

  const handleRemoveOpening = (id: string) => {
    const currentOpenings = design.openings || [];
    onOpeningsChange(currentOpenings.filter(o => o.id !== id));
  };

  const handlePositionChange = (id: string, x: number, y: number) => {
    const currentOpenings = design.openings || [];
    onOpeningsChange(
      currentOpenings.map(o =>
        o.id === id ? { ...o, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : o
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Window & Door Placement</h3>
      
      {/* Wall Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Wall</label>
        <div className="grid grid-cols-4 gap-2">
          {(['front', 'back', 'left', 'right'] as const).map(wall => (
            <button
              key={wall}
              onClick={() => setSelectedWall(wall)}
              className={`px-4 py-2 rounded ${
                selectedWall === wall
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {wall.charAt(0).toUpperCase() + wall.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Available Openings */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Available Windows</h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {windowOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleAddOpening(option)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-left"
            >
              <div className="font-medium">{option.name}</div>
              <div className="text-sm text-gray-600">${option.price}</div>
            </button>
          ))}
        </div>

        <h4 className="font-semibold mb-2">Available Doors</h4>
        <div className="grid grid-cols-2 gap-2">
          {doorOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleAddOpening(option)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded text-left"
            >
              <div className="font-medium">{option.name}</div>
              <div className="text-sm text-gray-600">${option.price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Openings */}
      <div>
        <h4 className="font-semibold mb-2">
          Placed Openings ({selectedWall} wall)
          {design.openings && design.openings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({design.openings.filter(o => o.wall === selectedWall).length} on this wall)
            </span>
          )}
        </h4>
        {!design.openings || design.openings.filter(o => o.wall === selectedWall).length === 0 ? (
          <p className="text-gray-500 text-sm">No openings on this wall. Click above to add.</p>
        ) : (
          <div className="space-y-2">
            {design.openings
              .filter(o => o.wall === selectedWall)
              .map(opening => (
                <div
                  key={opening.id}
                  className="p-3 bg-gray-50 rounded border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{opening.name}</div>
                      <div className="text-sm text-gray-600">
                        {opening.width}' × {opening.height}' | Position: {opening.x.toFixed(0)}%, {opening.y.toFixed(0)}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOpening(opening.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-xs text-gray-600 w-16">Horizontal:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opening.x}
                      onChange={(e) =>
                        handlePositionChange(opening.id, parseInt(e.target.value), opening.y)
                      }
                      className="flex-1"
                      title="Horizontal position"
                    />
                    <span className="text-xs text-gray-600 w-8">{opening.x}%</span>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <label className="text-xs text-gray-600 w-16">Vertical:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opening.y}
                      onChange={(e) =>
                        handlePositionChange(opening.id, opening.x, parseInt(e.target.value))
                      }
                      className="flex-1"
                      title="Vertical position"
                    />
                    <span className="text-xs text-gray-600 w-8">{opening.y}%</span>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {/* Show all openings summary */}
        {design.openings && design.openings.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">All Openings ({design.openings.length} total)</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {['front', 'back', 'left', 'right'].map(wall => {
                const count = design.openings.filter(o => o.wall === wall).length;
                return count > 0 ? (
                  <div key={wall}>
                    {wall.charAt(0).toUpperCase() + wall.slice(1)}: {count} opening{count !== 1 ? 's' : ''}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

