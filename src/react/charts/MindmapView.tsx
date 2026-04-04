import { useCallback, useMemo } from "react";
import type { DiagramModel, DiagramElement } from "../../core/model/types";

interface MindmapViewProps {
  model: DiagramModel;
  onModelChange: (model: DiagramModel) => void;
  theme?: "light" | "dark";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  depth: number;
  x: number;
  y: number;
  color: string;
}

const BRANCH_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

function buildTree(elements: DiagramElement[], connections: { source: string; target: string }[]): TreeNode | null {
  if (elements.length === 0) return null;

  const childMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const conn of connections) {
    if (!childMap.has(conn.source)) childMap.set(conn.source, []);
    childMap.get(conn.source)!.push(conn.target);
    hasParent.add(conn.target);
  }

  const elementMap = new Map<string, DiagramElement>();
  for (const el of elements) elementMap.set(el.id, el);

  // Root is the element with no incoming connections, or depth=0
  let rootEl = elements.find((el) => !hasParent.has(el.id));
  if (!rootEl) rootEl = elements.find((el) => (el.properties.depth ?? 0) === 0);
  if (!rootEl) rootEl = elements[0];

  function build(elId: string, depth: number): TreeNode {
    const el = elementMap.get(elId);
    const childIds = childMap.get(elId) || [];
    return {
      id: elId,
      label: el?.label || elId,
      children: childIds.map((cid) => build(cid, depth + 1)),
      depth,
      x: 0,
      y: 0,
      color: "",
    };
  }

  return build(rootEl.id, 0);
}

function layoutRadial(
  node: TreeNode,
  cx: number,
  cy: number,
  startAngle: number,
  endAngle: number,
  radius: number,
) {
  if (radius === 0) {
    node.x = cx;
    node.y = cy;
  } else {
    const midAngle = (startAngle + endAngle) / 2;
    node.x = cx + radius * Math.cos(midAngle);
    node.y = cy + radius * Math.sin(midAngle);
  }

  if (node.children.length === 0) return;

  const angleStep = (endAngle - startAngle) / node.children.length;
  node.children.forEach((child, i) => {
    const childStart = startAngle + i * angleStep;
    const childEnd = childStart + angleStep;
    layoutRadial(child, cx, cy, childStart, childEnd, radius + 120);
  });
}

function assignColors(root: TreeNode) {
  root.color = BRANCH_COLORS[0];
  root.children.forEach((child, i) => {
    const branchColor = BRANCH_COLORS[i % BRANCH_COLORS.length];
    assignBranchColor(child, branchColor);
  });
}

function assignBranchColor(node: TreeNode, branchColor: string) {
  node.color = branchColor;
  node.children.forEach((child) => assignBranchColor(child, branchColor));
}

function getNodeOpacity(depth: number): number {
  if (depth <= 1) return 1;
  if (depth === 2) return 0.7;
  return 0.5;
}

function collectNodes(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap((c) => collectNodes(c))];
}

interface LinkData {
  parent: TreeNode;
  child: TreeNode;
  depth: number;
}

function collectLinks(node: TreeNode): LinkData[] {
  const links: LinkData[] = [];
  for (const child of node.children) {
    links.push({ parent: node, child, depth: node.depth });
    links.push(...collectLinks(child));
  }
  return links;
}

function computeViewBox(nodes: TreeNode[]): string {
  if (nodes.length === 0) return "0 0 800 600";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  }
  const pad = 100;
  return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
}

function bezierPath(parent: TreeNode, child: TreeNode): string {
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  // Control points offset toward center for organic curves
  const cx1 = parent.x + dx * 0.4;
  const cy1 = parent.y + dy * 0.1;
  const cx2 = parent.x + dx * 0.6;
  const cy2 = parent.y + dy * 0.9;
  return `M ${parent.x} ${parent.y} C ${cx1} ${cy1} ${cx2} ${cy2} ${child.x} ${child.y}`;
}

function strokeWidth(depth: number): number {
  if (depth === 0) return 3;
  if (depth === 1) return 2;
  return 1.5;
}

function nodeWidth(label: string, depth: number): number {
  const charWidth = depth === 0 ? 9 : depth === 1 ? 8 : 7;
  const base = label.length * charWidth + 24;
  if (depth === 0) return Math.max(80, base);
  if (depth === 1) return Math.max(70, base);
  return Math.max(60, base);
}

function nodeHeight(depth: number): number {
  if (depth === 0) return 80;
  if (depth === 1) return 36;
  return 30;
}

export function MindmapView({ model, onModelChange, theme: _theme = "light", selectedId, onSelect }: MindmapViewProps) {
  const tree = useMemo(() => {
    const root = buildTree(model.elements, model.connections);
    if (!root) return null;
    layoutRadial(root, 400, 300, -Math.PI, Math.PI, 0);
    assignColors(root);
    return root;
  }, [model.elements, model.connections]);

  const allNodes = useMemo(() => (tree ? collectNodes(tree) : []), [tree]);
  const allLinks = useMemo(() => (tree ? collectLinks(tree) : []), [tree]);
  const viewBox = useMemo(() => computeViewBox(allNodes), [allNodes]);

  const selectedElement = selectedId ? model.elements.find((el) => el.id === selectedId) : null;

  const updateElement = useCallback(
    (id: string, updates: Partial<DiagramElement>) => {
      const newElements = model.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      );
      onModelChange({ ...model, elements: newElements });
    },
    [model, onModelChange],
  );

  if (!tree) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#999" }}>
        No mindmap data to display.
      </div>
    );
  }

  return (
    <div className="mve-chart-container" style={{ position: "relative" }}>
      <svg className="mve-mindmap" viewBox={viewBox}>
        <defs>
          <filter id="mm-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Lines (behind nodes) */}
        <g>
          {allLinks.map((link, i) => (
            <path
              key={`link-${i}`}
              className="mve-mindmap-link"
              d={bezierPath(link.parent, link.child)}
              stroke={link.child.color}
              strokeWidth={strokeWidth(link.depth)}
              opacity={getNodeOpacity(link.child.depth)}
            />
          ))}
        </g>

        {/* Nodes on top */}
        <g>
          {allNodes.map((node) => {
            const w = nodeWidth(node.label, node.depth);
            const h = nodeHeight(node.depth);
            const isSelected = selectedId === node.id;
            const opacity = getNodeOpacity(node.depth);
            const fontSize = node.depth === 0 ? 14 : node.depth === 1 ? 12 : 11;
            const textColor = node.depth <= 1 ? "#fff" : "#1d1d1f";

            return (
              <g
                key={node.id}
                className={`mve-mindmap-node${isSelected ? " selected" : ""}`}
                onClick={() => onSelect(node.id)}
              >
                {node.depth === 0 ? (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={40}
                    fill={node.color}
                    filter="url(#mm-shadow)"
                  />
                ) : (
                  <rect
                    x={node.x - w / 2}
                    y={node.y - h / 2}
                    width={w}
                    height={h}
                    rx={node.depth === 1 ? 12 : 8}
                    fill={node.color}
                    opacity={opacity}
                    filter="url(#mm-shadow)"
                  />
                )}
                <text
                  className="mve-mindmap-label"
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={node.depth === 0 ? "bold" : "normal"}
                  fill={textColor}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {selectedElement && (
        <div className="mve-chart-edit">
          <h4>Edit Node</h4>
          <label>
            Label
            <input
              type="text"
              value={selectedElement.label}
              onChange={(e) =>
                updateElement(selectedElement.id, { label: e.target.value })
              }
            />
          </label>
          <button
            style={{ marginTop: 8, fontSize: 12, cursor: "pointer" }}
            onClick={() => onSelect(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
