import type { StrategyType } from '../../../model/dungeon';
import { fieldStyle } from './field-style';

interface StrategySelectProps {
  onChange: (strategy: StrategyType) => void;
  value: StrategyType;
}

export const StrategySelect = ({ onChange, value }: StrategySelectProps) => (
  <select
    onChange={e => onChange(e.target.value as StrategyType)}
    style={fieldStyle}
    value={value}
  >
    <option value="random">Random Strategy</option>
    <option value="growth">Growth Strategy</option>
    <option value="type">Type Strategy</option>
    <option value="branch">Branch Strategy</option>
  </select>
);
