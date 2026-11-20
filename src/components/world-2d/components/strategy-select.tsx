import type { StrategyType } from '../../../model/dungeon';

interface StrategySelectProps {
  onChange: (strategy: StrategyType) => void;
  value: StrategyType;
}

export const StrategySelect = ({ onChange, value }: StrategySelectProps) => (
  <select
    className="rounded border border-[#4d4d4d] bg-[#3d3d3d] p-1.5 text-sm text-white"
    onChange={e => onChange(e.target.value as StrategyType)}
    value={value}
  >
    <option value="random">Random Strategy</option>
    <option value="growth">Growth Strategy</option>
    <option value="type">Type Strategy</option>
    <option value="branch">Branch Strategy</option>
  </select>
);
