export function EdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <marker id="mve-marker-circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8">
          <circle cx="5" cy="5" r="4" fill="none" stroke="#555" strokeWidth="1.5" />
        </marker>
        <marker id="mve-marker-cross" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8">
          <path d="M2,2 L8,8 M8,2 L2,8" stroke="#555" strokeWidth="1.5" fill="none" />
        </marker>
        <marker id="mve-marker-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1,1 L9,5 L1,9" fill="none" stroke="#555" strokeWidth="1.5" />
        </marker>
        <marker id="mve-marker-arrowclosed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1,1 L9,5 L1,9 Z" fill="#555" stroke="#555" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}
