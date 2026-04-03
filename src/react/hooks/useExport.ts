import { useCallback } from "react";
import { toPng, toSvg } from "html-to-image";

function downloadBlob(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function getFlowElement(): HTMLElement | null {
  return document.querySelector(".react-flow") as HTMLElement | null;
}

export function useExport() {
  const exportToPng = useCallback(async (filename = "diagram.png") => {
    const el = getFlowElement();
    if (!el) return;

    const dataUrl = await toPng(el, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      filter: (node) => {
        // Exclude controls and minimap from export
        const cls = (node as HTMLElement)?.className;
        if (typeof cls === "string") {
          if (cls.includes("react-flow__controls")) return false;
          if (cls.includes("react-flow__minimap")) return false;
        }
        return true;
      },
    });
    downloadBlob(dataUrl, filename);
  }, []);

  const exportToSvg = useCallback(async (filename = "diagram.svg") => {
    const el = getFlowElement();
    if (!el) return;

    const dataUrl = await toSvg(el, {
      filter: (node) => {
        const cls = (node as HTMLElement)?.className;
        if (typeof cls === "string") {
          if (cls.includes("react-flow__controls")) return false;
          if (cls.includes("react-flow__minimap")) return false;
        }
        return true;
      },
    });
    downloadBlob(dataUrl, filename);
  }, []);

  return { exportToPng, exportToSvg };
}
