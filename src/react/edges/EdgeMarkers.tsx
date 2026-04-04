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

        {/* Class diagram markers */}
        {/* Inheritance: hollow triangle */}
        <marker id="mve-marker-triangle" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto">
          <path d="M1,1 L11,6 L1,11 Z" fill="#fff" stroke="#555" strokeWidth="1.5" />
        </marker>
        {/* Composition: filled diamond */}
        <marker id="mve-marker-diamond-filled" viewBox="0 0 14 10" refX="13" refY="5" markerWidth="12" markerHeight="10" orient="auto">
          <path d="M1,5 L7,1 L13,5 L7,9 Z" fill="#555" stroke="#555" strokeWidth="1" />
        </marker>
        {/* Aggregation: hollow diamond */}
        <marker id="mve-marker-diamond-hollow" viewBox="0 0 14 10" refX="13" refY="5" markerWidth="12" markerHeight="10" orient="auto">
          <path d="M1,5 L7,1 L13,5 L7,9 Z" fill="#fff" stroke="#555" strokeWidth="1.5" />
        </marker>
      </defs>
    </svg>
  );
}
