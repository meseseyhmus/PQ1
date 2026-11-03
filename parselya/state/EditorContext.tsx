"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { EditorAction, EditorState, OverlayItem } from "@/types";
import {
  DEFAULT_PARCEL,
  OVERLAY_PRESETS,
} from "@/config/siteConfig";
import { centroid } from "@/lib/geo";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildInitialState(): EditorState {
  return {
    parcel: {
      il: DEFAULT_PARCEL.il,
      ilce: DEFAULT_PARCEL.ilce,
      mahalle: DEFAULT_PARCEL.mahalle,
      ada: DEFAULT_PARCEL.ada,
      parsell: DEFAULT_PARCEL.parsell,
      polygon: DEFAULT_PARCEL.polygon,
      areaM2: DEFAULT_PARCEL.areaM2,
      center: DEFAULT_PARCEL.center,
      pois: DEFAULT_PARCEL.pois,
    },
    overlays: OVERLAY_PRESETS.map((o) => ({ ...o, id: uid() })),
    style: {
      strokeColor: "#22c55e",
      strokeWidth: 3,
      fillOpacity: 0.18,
      showGrid: false,
      showWatermark: true,
      showEdgeLengths: true,
      showCenterBadge: true,
    },
    background: {
      source: "google-satellite",
      customImageUrl: null,
      customImageName: null,
      opacity: 0.95,
      brightness: 100,
      zoomOffset: 0,
      customRotation: 0,
      customScale: 1,
    },
    camera: {
      motion: "zoom-in",
      duration: 15,
      intensity: 0.6,
    },
    playback: { time: 0, playing: false, fps: 30, speed: 1 },
    aspect: "9:16",
    credits: 3,
    purpose: "Emlakçıyım",
    sidebarTab: "ozet",
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  switch (action.type) {
    case "SET_PARCEL_FORM":
      return {
        ...state,
        parcel: { ...state.parcel, [action.field]: action.value },
      };
    case "LOAD_PARCEL":
      return {
        ...state,
        parcel: { ...action.parcel },
        playback: { ...state.playback, time: 0, playing: false },
      };
    case "LOAD_GEOJSON": {
      if (action.polygon.length < 3) return state;
      return {
        ...state,
        parcel: {
          ...state.parcel,
          polygon: action.polygon,
          center: centroid(action.polygon),
        },
        playback: { ...state.playback, time: 0, playing: false },
      };
    }
    case "ADD_OVERLAY":
      return { ...state, overlays: [...state.overlays, action.overlay] };
    case "REMOVE_OVERLAY":
      return {
        ...state,
        overlays: state.overlays.filter((o) => o.id !== action.id),
      };
    case "UPDATE_OVERLAY":
      return {
        ...state,
        overlays: state.overlays.map((o) =>
          o.id === action.id
            ? {
                ...o,
                ...action.patch,
                startTime: clamp(action.patch.startTime ?? o.startTime, 0, state.camera.duration),
                endTime: clamp(action.patch.endTime ?? o.endTime, 0, state.camera.duration),
              }
            : o,
        ),
      };
    case "SET_STYLE":
      return { ...state, style: { ...state.style, ...action.patch } };
    case "SET_BACKGROUND":
      return { ...state, background: { ...state.background, ...action.patch } };
    case "SET_CUSTOM_BG_IMAGE":
      return {
        ...state,
        background: {
          ...state.background,
          source: action.url ? "custom" : "google-satellite",
          customImageUrl: action.url,
          customImageName: action.name || null,
        },
      };
    case "SET_CAMERA": {
      const camera = { ...state.camera, ...action.patch };
      return {
        ...state,
        camera,
        playback: {
          ...state.playback,
          time: clamp(state.playback.time, 0, camera.duration),
        },
        overlays: state.overlays.map((o) => ({
          ...o,
          startTime: clamp(o.startTime, 0, camera.duration),
          endTime: clamp(o.endTime, 0, camera.duration),
        })),
      };
    }
    case "SET_PLAYING":
      return { ...state, playback: { ...state.playback, playing: action.playing } };
    case "SET_TIME":
      return {
        ...state,
        playback: {
          ...state.playback,
          time: clamp(action.time, 0, state.camera.duration),
        },
      };
    case "SET_SPEED":
      return {
        ...state,
        playback: {
          ...state.playback,
          speed: clamp(action.speed, 0.5, 2.0),
        },
      };
    case "TICK":
      return {
        ...state,
        playback: {
          ...state.playback,
          time: clamp(state.playback.time + action.dt, 0, state.camera.duration),
        },
      };
    case "TOGGLE_PLAY":
      return {
        ...state,
        playback: {
          ...state.playback,
          playing: !state.playback.playing,
          time:
            !state.playback.playing && state.playback.time >= state.camera.duration
              ? 0
              : state.playback.time,
        },
      };
    case "RESTART":
      return {
        ...state,
        playback: { ...state.playback, time: 0, playing: true },
      };
    case "SET_ASPECT":
      return { ...state, aspect: action.aspect };
    case "USE_CREDIT":
      return { ...state, credits: Math.max(0, state.credits - 1) };
    case "SET_PURPOSE":
      return { ...state, purpose: action.purpose };
    case "SET_SIDEBAR_TAB":
      return { ...state, sidebarTab: action.tab };
    case "TOGGLE_EDGE_LENGTHS":
      return {
        ...state,
        style: {
          ...state.style,
          showEdgeLengths: !state.style.showEdgeLengths,
        },
      };
    case "TOGGLE_CENTER_BADGE":
      return {
        ...state,
        style: {
          ...state.style,
          showCenterBadge: !state.style.showCenterBadge,
        },
      };
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  /** Aktif (enabled + zaman aralığında) overlay'ler */
  activeOverlaysAt: (time: number) => OverlayItem[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, undefined, buildInitialState);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      activeOverlaysAt: (time: number) =>
        state.overlays.filter(
          (o) => o.enabled && time >= o.startTime && time <= o.endTime,
        ),
    }),
    [state],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor, EditorProvider içinde kullanılmalıdır");
  return ctx;
}

/**
 * Oynatma motoru: playing iken zamanı ilerletir, süre sonunda durur.
 * tek bir yerden çalışır, tüm bileşenler aynı `time`'ı okur.
 */
export function usePlaybackClock() {
  const { state, dispatch } = useEditor();
  const { playing, time, fps } = state.playback;
  const duration = state.camera.duration;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const spd = state.playback.speed ?? 1;
      const dt = ((now - last) / 1000) * spd;
      last = now;
      dispatch({ type: "TICK", dt });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // time bilinçli olarak bağımlılık dışı: her karede yeni efekt kurulmaz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, dispatch, duration, fps, state.playback.speed]);

  useEffect(() => {
    if (playing && time >= duration) {
      dispatch({ type: "SET_PLAYING", playing: false });
      dispatch({ type: "SET_TIME", time: duration });
    }
  }, [playing, time, duration, dispatch]);
}
