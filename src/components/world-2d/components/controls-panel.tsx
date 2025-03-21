import { StrategyType } from '@model/dungeon';
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
}: ControlsPanelProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center p-2 bg-[#2a2a2a] rounded fixed top-5 left-1/2 -translate-x-1/2 z-50">
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

      <div className="flex gap-4">
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

      <div className="flex gap-2">
        <ActionButton disabled={isGenerating} onClick={onRegenerate}>
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </ActionButton>
        <ActionButton onClick={onResetView}>Reset View</ActionButton>
      </div>
    </div>
  );
};
