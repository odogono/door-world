import { StrategyType } from '@model/dungeon';
import { ActionButton } from './action-button';
import { CheckboxControl } from './checkbox-control';
import { NumberInput } from './number-input';
import { StrategySelect } from './strategy-select';

interface ControlsPanelProps {
  selectedStrategy: StrategyType;
  onStrategyChange: (strategy: StrategyType) => void;
  fillSpace: boolean;
  onFillSpaceChange: (fillSpace: boolean) => void;
  seed: number;
  onSeedChange: (seed: number) => void;
  recurseCount: number;
  onRecurseCountChange: (count: number) => void;
  showConnections: boolean;
  onShowConnectionsChange: (show: boolean) => void;
  showRooms: boolean;
  onShowRoomsChange: (show: boolean) => void;
  showDoors: boolean;
  onShowDoorsChange: (show: boolean) => void;
  isGenerating: boolean;
  onRegenerate: () => void;
  onResetView: () => void;
}

export const ControlsPanel = ({
  selectedStrategy,
  onStrategyChange,
  fillSpace,
  onFillSpaceChange,
  seed,
  onSeedChange,
  recurseCount,
  onRecurseCountChange,
  showConnections,
  onShowConnectionsChange,
  showRooms,
  onShowRoomsChange,
  showDoors,
  onShowDoorsChange,
  isGenerating,
  onRegenerate,
  onResetView
}: ControlsPanelProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center p-2 bg-[#2a2a2a] rounded fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <StrategySelect value={selectedStrategy} onChange={onStrategyChange} />

      <CheckboxControl
        label="Fill Space"
        checked={fillSpace}
        onChange={onFillSpaceChange}
      />

      <NumberInput
        value={seed}
        onChange={onSeedChange}
        placeholder="Enter seed"
        label="Seed"
      />

      <NumberInput
        value={recurseCount}
        onChange={onRecurseCountChange}
        placeholder="Recurse count"
        label="Recurse"
        min={1}
      />

      <div className="flex gap-4">
        <CheckboxControl
          label="Show Connections"
          checked={showConnections}
          onChange={onShowConnectionsChange}
        />
        <CheckboxControl
          label="Show Rooms"
          checked={showRooms}
          onChange={onShowRoomsChange}
        />
        <CheckboxControl
          label="Show Doors"
          checked={showDoors}
          onChange={onShowDoorsChange}
        />
      </div>

      <div className="flex gap-2">
        <ActionButton onClick={onRegenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </ActionButton>
        <ActionButton onClick={onResetView}>Reset View</ActionButton>
      </div>
    </div>
  );
};
