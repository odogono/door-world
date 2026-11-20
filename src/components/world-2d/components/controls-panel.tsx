import type { StrategyType } from '../../../model/dungeon';
import { ActionButton } from './action-button';
import { CheckboxControl } from './checkbox-control';
import { NumberInput } from './number-input';
import { StrategySelect } from './strategy-select';

interface ControlsPanelProps {
  fillSpace: boolean;
  isGenerating: boolean;
  onFillSpaceChange: (fillSpace: boolean) => void;
  onRecurseCountChange: (count: number) => void;
  onRegenerate: () => void;
  onResetView: () => void;
  onSeedChange: (seed: number) => void;
  onShowConnectionsChange: (show: boolean) => void;
  onShowDoorsChange: (show: boolean) => void;
  onShowRoomsChange: (show: boolean) => void;
  onStrategyChange: (strategy: StrategyType) => void;
  recurseCount: number;
  seed: number;
  selectedStrategy: StrategyType;
  showConnections: boolean;
  showDoors: boolean;
  showRooms: boolean;
}

export const ControlsPanel = ({
  fillSpace,
  isGenerating,
  onFillSpaceChange,
  onRecurseCountChange,
  onRegenerate,
  onResetView,
  onSeedChange,
  onShowConnectionsChange,
  onShowDoorsChange,
  onShowRoomsChange,
  onStrategyChange,
  recurseCount,
  seed,
  selectedStrategy,
  showConnections,
  showDoors,
  showRooms
}: ControlsPanelProps) => (
  <div
    style={{
      alignItems: 'center',
      background: '#2a2a2a',
      borderRadius: '0.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      left: '50%',
      padding: '0.5rem',
      position: 'fixed',
      top: '1.25rem',
      transform: 'translateX(-50%)',
      zIndex: 50
    }}
  >
    <StrategySelect onChange={onStrategyChange} value={selectedStrategy} />

    <CheckboxControl
      checked={fillSpace}
      label="Fill Space"
      onChange={onFillSpaceChange}
    />

    <NumberInput
      label="Seed"
      onChange={onSeedChange}
      placeholder="Enter seed"
      value={seed}
    />

    <NumberInput
      label="Recurse"
      min={1}
      onChange={onRecurseCountChange}
      placeholder="Recurse count"
      value={recurseCount}
    />

    <div style={{ display: 'flex', gap: '1rem' }}>
      <CheckboxControl
        checked={showConnections}
        label="Show Connections"
        onChange={onShowConnectionsChange}
      />
      <CheckboxControl
        checked={showRooms}
        label="Show Rooms"
        onChange={onShowRoomsChange}
      />
      <CheckboxControl
        checked={showDoors}
        label="Show Doors"
        onChange={onShowDoorsChange}
      />
    </div>

    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <ActionButton disabled={isGenerating} onClick={onRegenerate}>
        {isGenerating ? 'Generating...' : 'Regenerate'}
      </ActionButton>
      <ActionButton onClick={onResetView}>Reset View</ActionButton>
    </div>
  </div>
);
