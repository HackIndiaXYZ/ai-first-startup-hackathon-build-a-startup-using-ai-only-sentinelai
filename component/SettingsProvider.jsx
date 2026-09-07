"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SettingsContext = createContext(null);

export const DEFAULT_SETTINGS = {
  theme: "dark",
  compactMode: false,
  animations: true,

  responseStyle: "balanced",
  securityMode: true,
  workspaceContext: true,
  codeExamples: true,
};

const STORAGE_KEY = "sentinel-settings";

const ALLOWED_THEMES = ["dark", "system"];
const ALLOWED_RESPONSE_STYLES = [
  "concise",
  "balanced",
  "detailed",
];

function mergeSettings(settings) {
  return {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
  };
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /*
   * ---------------------------------------------------------
   * SYSTEM THEME
   * ---------------------------------------------------------
   */

  const getSystemTheme = useCallback(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  }, []);

  /*
   * ---------------------------------------------------------
   * APPLY SETTINGS GLOBALLY
   * ---------------------------------------------------------
   */

  const applySettings = useCallback(
    (nextSettings) => {
      if (typeof document === "undefined") return;

      const root = document.documentElement;

      const resolvedTheme =
        nextSettings.theme === "system"
          ? getSystemTheme()
          : nextSettings.theme;

      // Theme
      root.dataset.theme = resolvedTheme;

      // Keep the user's selected theme available too.
      root.dataset.themePreference = nextSettings.theme;

      // Compact mode
      root.dataset.compact = nextSettings.compactMode
        ? "true"
        : "false";

      // Animations
      root.dataset.animations = nextSettings.animations
        ? "true"
        : "false";

      /*
       * Useful global classes for components that prefer
       * class-based styling.
       */
      root.classList.toggle(
        "sentinel-compact",
        nextSettings.compactMode
      );

      root.classList.toggle(
        "sentinel-no-animations",
        !nextSettings.animations
      );

      /*
       * Accessibility / browser-level animation preference.
       * We only disable animations when the user explicitly
       * turns Sentinel animations off.
       */
      root.style.setProperty(
        "--sentinel-animations",
        nextSettings.animations ? "1" : "0"
      );
    },
    [getSystemTheme]
  );

  /*
   * ---------------------------------------------------------
   * LOCAL CACHE
   * ---------------------------------------------------------
   *
   * This is only a fast client-side cache.
   * Neon remains the source of truth.
   */

  const cacheSettings = useCallback((nextSettings) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextSettings)
      );
    } catch (error) {
      console.warn(
        "Sentinel settings cache unavailable:",
        error
      );
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD SETTINGS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      /*
       * Show cached settings immediately if available.
       * This prevents the UI from flashing back to defaults.
       */
      try {
        const cached = localStorage.getItem(STORAGE_KEY);

        if (cached) {
          const parsed = JSON.parse(cached);
          const merged = mergeSettings(parsed);

          if (!cancelled) {
            setSettingsState(merged);
            applySettings(merged);
          }
        }
      } catch (error) {
        console.warn(
          "Could not restore cached Sentinel settings:",
          error
        );
      }

      /*
       * Neon is the actual source of truth.
       */
      try {
        const response = await fetch(
          "/api/settings/preferences",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Settings request failed (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled && data?.settings) {
          const merged = mergeSettings(data.settings);

          setSettingsState(merged);
          cacheSettings(merged);
          applySettings(merged);
          setError(null);
        }
      } catch (error) {
        console.error(
          "SettingsProvider load error:",
          error
        );

        if (!cancelled) {
          setError(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [applySettings, cacheSettings]);

  /*
   * ---------------------------------------------------------
   * UPDATE SETTINGS
   * ---------------------------------------------------------
   *
   * Usage:
   *
   * await updateSettings({
   *   theme: "dark"
   * });
   *
   * or:
   *
   * await updateSettings({
   *   compactMode: true,
   *   animations: false
   * });
   */

  const updateSettings = useCallback(
    async (changes) => {
      if (!changes || typeof changes !== "object") {
        throw new Error("Invalid settings update");
      }

      /*
       * Validate values on the client before sending them.
       */

      if (
        changes.theme !== undefined &&
        !ALLOWED_THEMES.includes(changes.theme)
      ) {
        throw new Error("Invalid theme");
      }

      if (
        changes.responseStyle !== undefined &&
        !ALLOWED_RESPONSE_STYLES.includes(
          changes.responseStyle
        )
      ) {
        throw new Error("Invalid response style");
      }

      const booleanSettings = [
        "compactMode",
        "animations",
        "securityMode",
        "workspaceContext",
        "codeExamples",
      ];

      for (const key of booleanSettings) {
        if (
          changes[key] !== undefined &&
          typeof changes[key] !== "boolean"
        ) {
          throw new Error(`${key} must be a boolean`);
        }
      }

      const previousSettings = settings;
      const nextSettings = mergeSettings({
        ...settings,
        ...changes,
      });

      /*
       * Optimistic update:
       * the interface changes immediately.
       */
      setSettingsState(nextSettings);
      applySettings(nextSettings);
      cacheSettings(nextSettings);
      setSaving(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/settings/preferences",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changes),
          }
        );

        const data = await response.json().catch(
          () => null
        );

        if (!response.ok) {
          throw new Error(
            data?.error ||
              `Failed to save settings (${response.status})`
          );
        }

        /*
         * Use the server's returned settings when available.
         */
        const savedSettings = mergeSettings(
          data?.settings || nextSettings
        );

        setSettingsState(savedSettings);
        applySettings(savedSettings);
        cacheSettings(savedSettings);

        return savedSettings;
      } catch (error) {
        /*
         * Roll back if the backend rejects the update.
         */
        setSettingsState(previousSettings);
        applySettings(previousSettings);
        cacheSettings(previousSettings);

        setError(error.message);

        console.error(
          "Settings update error:",
          error
        );

        throw error;
      } finally {
        setSaving(false);
      }
    },
    [
      settings,
      applySettings,
      cacheSettings,
    ]
  );

  /*
   * ---------------------------------------------------------
   * RESET SETTINGS
   * ---------------------------------------------------------
   */

  const resetSettings = useCallback(async () => {
    const reset = mergeSettings(DEFAULT_SETTINGS);

    setSettingsState(reset);
    applySettings(reset);
    cacheSettings(reset);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/settings/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reset),
        }
      );

      const data = await response.json().catch(
        () => null
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to reset settings (${response.status})`
        );
      }

      const savedSettings = mergeSettings(
        data?.settings || reset
      );

      setSettingsState(savedSettings);
      applySettings(savedSettings);
      cacheSettings(savedSettings);

      return savedSettings;
    } catch (error) {
      setError(error.message);

      console.error(
        "Settings reset error:",
        error
      );

      throw error;
    } finally {
      setSaving(false);
    }
  }, [applySettings, cacheSettings]);

  /*
   * ---------------------------------------------------------
   * INDIVIDUAL SETTERS
   * ---------------------------------------------------------
   *
   * These make the Settings UI extremely simple.
   */

  const setTheme = useCallback(
    (theme) => updateSettings({ theme }),
    [updateSettings]
  );

  const setCompactMode = useCallback(
    (compactMode) =>
      updateSettings({ compactMode }),
    [updateSettings]
  );

  const setAnimations = useCallback(
    (animations) =>
      updateSettings({ animations }),
    [updateSettings]
  );

  const setResponseStyle = useCallback(
    (responseStyle) =>
      updateSettings({ responseStyle }),
    [updateSettings]
  );

  const setSecurityMode = useCallback(
    (securityMode) =>
      updateSettings({ securityMode }),
    [updateSettings]
  );

  const setWorkspaceContext = useCallback(
    (workspaceContext) =>
      updateSettings({ workspaceContext }),
    [updateSettings]
  );

  const setCodeExamples = useCallback(
    (codeExamples) =>
      updateSettings({ codeExamples }),
    [updateSettings]
  );

  /*
   * ---------------------------------------------------------
   * SYSTEM THEME CHANGES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (settings.theme !== "system") return;

    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      applySettings(settings);
    };

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, [settings, applySettings]);

  /*
   * ---------------------------------------------------------
   * CROSS-TAB SYNCHRONIZATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);
        const merged = mergeSettings(parsed);

        setSettingsState(merged);
        applySettings(merged);
      } catch (error) {
        console.warn(
          "Could not sync Sentinel settings:",
          error
        );
      }
    }

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [applySettings]);

  /*
   * ---------------------------------------------------------
   * CONTEXT VALUE
   * ---------------------------------------------------------
   */

  const value = useMemo(
    () => ({
      // State
      settings,
      loading,
      saving,
      error,

      // General update API
      setSettings: setSettingsState,
      updateSettings,
      resetSettings,

      // Individual settings
      setTheme,
      setCompactMode,
      setAnimations,
      setResponseStyle,
      setSecurityMode,
      setWorkspaceContext,
      setCodeExamples,
    }),
    [
      settings,
      loading,
      saving,
      error,
      updateSettings,
      resetSettings,
      setTheme,
      setCompactMode,
      setAnimations,
      setResponseStyle,
      setSecurityMode,
      setWorkspaceContext,
      setCodeExamples,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}