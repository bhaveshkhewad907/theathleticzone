import { useEffect, useRef } from "react";

// Automatically saves the form data to the device's hard drive as they type
export function useAutoSave<T>(storageKey: string, data: T) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render so we don't accidentally overwrite a loaded draft
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Silently save the latest state to LocalStorage
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  // A helper function to call when the admin clicks "Deploy Course Plan"
  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearDraft };
}

// Helper to pull the draft when the component first mounts
export function getInitialDraft<T>(storageKey: string, fallbackState: T): T {
  try {
    const draft = localStorage.getItem(storageKey);
    return draft ? JSON.parse(draft) : fallbackState;
  } catch (error) {
    console.error("Failed to parse draft", error);
    return fallbackState;
  }
}
