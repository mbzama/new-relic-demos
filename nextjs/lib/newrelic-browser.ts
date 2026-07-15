// Thin wrappers around the New Relic Browser agent global (window.newrelic).
// All methods use optional calling (?.) so a missing or partially-initialised
// agent never throws into application code.

declare global {
  interface Window {
    // window.newrelic is populated by @newrelic/browser-agent after mount.
    // All fields are optional because the agent may initialise asynchronously.
    newrelic?: Partial<{
      noticeError: (err: Error | string, attrs?: Record<string, unknown>) => void;
      addPageAction: (name: string, attrs?: Record<string, unknown>) => void;
      setCustomAttribute: (key: string, value: string | number | boolean) => void;
      setAttribute: (key: string, value: string | number | boolean) => void;
      interaction: () => {
        setName: (name: string) => { save: () => void };
        save: () => void;
      };
      setPageViewName: (name: string, host?: string) => void;
    }>;
  }
}

function nr() {
  return typeof window !== 'undefined' ? window.newrelic : undefined;
}

export function noticeError(err: Error | string, attrs?: Record<string, unknown>) {
  nr()?.noticeError?.(err, attrs);
}

export function addPageAction(name: string, attrs?: Record<string, unknown>) {
  nr()?.addPageAction?.(name, attrs);
}

export function setCustomAttribute(key: string, value: string | number | boolean) {
  const agent = nr();
  // @newrelic/browser-agent v1.x exposes setAttribute; older snippet uses setCustomAttribute
  agent?.setCustomAttribute?.(key, value);
  agent?.setAttribute?.(key, value);
}

export function setPageViewName(name: string) {
  nr()?.setPageViewName?.(name);
}

export function saveInteraction(name: string) {
  nr()?.interaction?.()?.setName?.(name)?.save?.();
}
