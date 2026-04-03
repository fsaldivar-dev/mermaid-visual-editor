import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MermaidEditor, type MermaidEditorProps } from "../react/MermaidEditor";
import type { EditorMode } from "../react/EditorToolbar";

export interface CreateEditorOptions {
  value?: string;
  mode?: EditorMode;
  theme?: "light" | "dark";
  readOnly?: boolean;
  height?: number | string;
  toolbar?: boolean;
  minimap?: boolean;
  onChange?: (text: string) => void;
}

export interface EditorInstance {
  update: (options: Partial<CreateEditorOptions>) => void;
  getValue: () => string;
  destroy: () => void;
}

export function createMermaidEditor(
  container: HTMLElement,
  options: CreateEditorOptions = {}
): EditorInstance {
  let currentOptions = { ...options };
  let currentValue = options.value || "";
  const root: Root = createRoot(container);

  function render() {
    const props: MermaidEditorProps = {
      value: currentValue,
      mode: currentOptions.mode,
      theme: currentOptions.theme,
      readOnly: currentOptions.readOnly,
      height: currentOptions.height,
      toolbar: currentOptions.toolbar,
      minimap: currentOptions.minimap,
      onChange: (text: string) => {
        currentValue = text;
        currentOptions.onChange?.(text);
      },
    };
    root.render(createElement(MermaidEditor, props));
  }

  render();

  return {
    update(newOptions: Partial<CreateEditorOptions>) {
      currentOptions = { ...currentOptions, ...newOptions };
      if (newOptions.value !== undefined) currentValue = newOptions.value;
      render();
    },
    getValue() {
      return currentValue;
    },
    destroy() {
      root.unmount();
    },
  };
}
