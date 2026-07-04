import { useEffect, useRef, useState } from "react";

export function useAutoSave<T>(storageKey: string, data: T) {
  const isFirstRender = useRef(true);
  // 🚀 NEW: Keep track of the save status for the UI
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 🚀 THE FIX: We wrap the save logic in a setTimeout (Debounce).
    // This clears the linter error AND stops the app from saving
    // 10 times in a row if an admin types a 10-letter word really fast.
    const saveTimer = setTimeout(() => {
      setSaveStatus("saving");
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Show the green checkmark half a second after saving
      setTimeout(() => {
        setSaveStatus("saved");
      }, 500);
    }, 500); // Waits 500ms after they stop typing before executing

    // Cleanup: If they type another letter before 500ms, cancel the previous save
    return () => clearTimeout(saveTimer);
  }, [data, storageKey]);

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearDraft, saveStatus }; // 🚀 NEW: Export the status
}

export function getInitialDraft<T>(storageKey: string, fallbackState: T): T {
  try {
    const draft = localStorage.getItem(storageKey);
    return draft ? JSON.parse(draft) : fallbackState;
  } catch (error) {
    console.error("Failed to parse draft", error);
    return fallbackState;
  }
}
