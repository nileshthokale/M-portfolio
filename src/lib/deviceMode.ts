import { useState, useEffect } from 'react';

export type DeviceMode = 'desktop' | 'mobile';

// Config override: set to null (auto-detect), 'desktop', or 'mobile'
export const MODE_OVERRIDE: null | DeviceMode = null;

// Desktop mode = matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)")
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

export function getInitialDeviceMode(): DeviceMode {
  if (typeof window === 'undefined') return 'desktop';

  // 1. URL search param override: ?mode=desktop or ?mode=mobile
  try {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'desktop' || urlMode === 'mobile') {
      return urlMode;
    }
  } catch (e) {}

  // 2. Code-level override
  if (MODE_OVERRIDE) {
    return MODE_OVERRIDE;
  }

  // 3. Media query match
  try {
    if (window.matchMedia && window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
      return 'desktop';
    }
  } catch (e) {}

  return 'mobile';
}

export function useDeviceMode(): DeviceMode {
  const [mode, setMode] = useState<DeviceMode>(getInitialDeviceMode);

  useEffect(() => {
    // If URL or config override is present, preserve it without auto-switching
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'desktop' || urlMode === 'mobile' || MODE_OVERRIDE) {
        return;
      }
    } catch (e) {}

    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newMode: DeviceMode = e.matches ? 'desktop' : 'mobile';
      setMode(newMode);

      // Handle transitions
      if (newMode === 'mobile') {
        // Stop desktop swarm, reveal everything, remove overlay
        window.dispatchEvent(new CustomEvent('cancel-agent-swarm'));
        document.documentElement.classList.remove('agent-swarm-active');
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      (mq as any).addListener(onChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        (mq as any).removeListener(onChange);
      }
    };
  }, []);

  return mode;
}

