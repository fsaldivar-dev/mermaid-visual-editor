import { BaseNode } from "./BaseNode";

interface NodeProps {
  data: { label?: string; width?: number; height?: number };
  selected?: boolean;
}

export function CircleNode({ data, selected }: NodeProps) {
  return <BaseNode data={data} selected={selected} className="mve-circle" keepAspectRatio />;
}
