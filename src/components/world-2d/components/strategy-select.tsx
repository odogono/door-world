import { StrategyType } from '@model/dungeon';

interface StrategySelectProps {
  value: StrategyType;
  onChange: (strategy: StrategyType) => void;
}

export const StrategySelect = ({ value, onChange }: StrategySelectProps) => {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as StrategyType)}
      className="p-1.5 bg-[#3d3d3d] text-white border border-[#4d4d4d] rounded text-sm"
    >
      <option value="random">Random Strategy</option>
      <option value="growth">Growth Strategy</option>
      <option value="type">Type Strategy</option>
      <option value="branch">Branch Strategy</option>
    </select>
  );
};
