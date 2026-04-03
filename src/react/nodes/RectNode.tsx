import { BaseNode } from "./BaseNode";

interface NodeProps {
  data: { label?: string };
  selected?: boolean;
}

export function RectNode({ data, selected }: NodeProps) {
  return <BaseNode data={data} selected={selected} className="mve-rect" />;
}
