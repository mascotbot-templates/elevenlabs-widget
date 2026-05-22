"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMascot } from "@mascotbot/react";
import {
  Alignment,
  Fit,
  Mascot,
  MascotRive,
  useMascotInputs,
  useMascotRive,
  useMascotPlayback,
  useLipsyncStream,
} from "@mascotbot/react/rive";
import {
  startElevenLabsElementTap,
  type ElevenLabsTapHandle,
} from "@/lib/elevenlabs-element-tap";
import {
  CallButton,
  type CallState,
} from "@/components/call-button";

// ───────────────────────────────────────────────────────────────────────────
// Standalone 1:1 port of the MascotBot hosted ElevenLabs widget
// (apps/app/.../widget-agent-client.tsx). A normal React call button with a
// delayed bounce-in appearance; the avatar reveals via the Rive state machine;
// ElevenLabs self-plays its voice and we tap that element for client-side
// lip-sync. No in-canvas Rive button, no backend/agent DB — config is static.
// ───────────────────────────────────────────────────────────────────────────

const MASCOT_URL = "/mascot_widget.riv";

// Static widget config (the hosted app reads this per-agent; a template
// hard-codes it). Tweak freely.
const WIDGET = {
  width: 300,
  height: 380,
  position: "bottom-right" as "bottom-right" | "bottom-left",
  paddingX: 0,
  paddingY: 0,
  playRevealAnimation: true,
  callButtonLabel: "Voice Chat",
};

// Default Notion-Guy widget Rive artboard customization.
const DEFAULT_WIDGET_CUSTOMIZATION: Record<string, number | boolean> = {
  colourful: true,
  outline: 10,
  gender: 1,
  hair_style: 1,
  eyes_type: 1,
  bg_color: 0,
  shirt_color: 0,
  accessories_hue: 0,
  accessories_saturation: 100,
  accessories_brightness: 100,
};
const CUSTOMIZATION_INPUT_NAMES = Object.keys(DEFAULT_WIDGET_CUSTOMIZATION);

// Consumer-owned inputs the .riv declares. The SDK owns mouth + is_speaking
// + stress — those are NOT declared here (rive-coexistence contract).
const WIDGET_INPUTS = [
  "gesture",
  "inCall",
  "isRevealed",
  "reveal",
  "hit",
  ...CUSTOMIZATION_INPUT_NAMES,
];

const WIDGET_LAYOUT = {
  fit: Fit.Contain,
  alignment: Alignment.BottomRight,
} as const;

// Stable lip-sync config — MUST be a module constant (a fresh object every
// render reinitializes playback and breaks lip sync after the first chunk).
const NATURAL_LIP_SYNC_CONFIG = {
  minVisemeInterval: 40,
  mergeWindow: 60,
  keyVisemePreference: 0.6,
  preserveSilence: true,
  similarityThreshold: 0.4,
  preserveCriticalVisemes: true,
  criticalVisemeMinDuration: 80,
} as const;

const WIDGET_BASELINE_WIDTH = 300;
function buttonScaleFor(width: number): number {
  return Math.max(0.5, Math.min(2, width / WIDGET_BASELINE_WIDTH));
}

const WIDGET_REVEALED_SESSION_KEY = "mascotbot-widget-revealed";
function isFirstVisitInTab(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(WIDGET_REVEALED_SESSION_KEY) === null;
  } catch {
    return false;
  }
}
function markRevealedInTab(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WIDGET_REVEALED_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

interface WidgetActions {
  start: () => void;
  end: () => void;
}

// ── Rive inputs: inCall + appearance defaults + the reveal sequence ──
function useWidgetRiveInputs(
  callState: CallState,
  onReveal: (timestamp: number) => void,
) {
  const { rive } = useMascotRive();
  const { custom, has } = useMascotInputs();
  const revealFired = useRef(false);
  const onRevealRef = useRef(onReveal);
  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const setInput = useCallback(
    (name: string, value: number | boolean) => {
      if (has(name))
        (custom as Record<string, { value: unknown }>)[name].value =
          value as never;
    },
    [custom, has],
  );

  // inCall only TRUE when actually connected (not while connecting).
  useEffect(() => {
    setInput("inCall", callState === "connected");
    Object.entries(DEFAULT_WIDGET_CUSTOMIZATION).forEach(([k, v]) =>
      setInput(k, v),
    );
  }, [callState, setInput]);

  // When the call ends, tell an embedding parent to reset click-through.
  useEffect(() => {
    if (callState === "idle" && window.parent !== window) {
      window.parent.postMessage({ type: "widget-mouse-left-button" }, "*");
    }
  }, [callState]);

  // Reveal sequence — runs once per Rive load.
  useEffect(() => {
    if (!rive || revealFired.current) return;
    const shouldPlay = WIDGET.playRevealAnimation && isFirstVisitInTab();

    const smName = rive.stateMachineNames?.[0];
    const rawInputs = smName
      ? ((rive.stateMachineInputs(smName) ?? []) as Array<{
          name: string;
          fire?: () => void;
          value?: unknown;
        }>)
      : [];
    const revealInput = rawInputs.find((i) => i.name === "reveal");
    const isRevealedInput = rawInputs.find((i) => i.name === "isRevealed");

    if (shouldPlay && revealInput) {
      const t = setTimeout(() => {
        if (revealFired.current) return;
        revealFired.current = true;
        revealInput.fire?.();
        markRevealedInTab();
        onRevealRef.current(Date.now());
      }, 1000);
      return () => clearTimeout(t);
    }

    revealFired.current = true;
    if (isRevealedInput) isRevealedInput.value = true;
    markRevealedInTab();
    // Past timestamp → button appears immediately (no reveal animation).
    onRevealRef.current(Date.now() - 10_000);
  }, [rive]);
}

function WidgetRiveSync({
  callState,
  setRevealedAt,
}: {
  callState: CallState;
  setRevealedAt: (ts: number) => void;
}) {
  useWidgetRiveInputs(callState, setRevealedAt);
  return null;
}

// ── postMessage bridge: an embed script can toggle the call ──
function useWidgetPostMessage(
  actionsRef: React.MutableRefObject<WidgetActions>,
  callState: CallState,
) {
  useEffect(() => {
    const handle = (event: MessageEvent) => {
      if (event.data?.type !== "widget-tap") return;
      if (callState === "connected") actionsRef.current.end();
      else if (callState === "idle") actionsRef.current.start();
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [callState, actionsRef]);
}

// ── The conversation lifecycle (co-located lip-sync + element-tap) ──
function ElevenLabsWidgetContent({
  onCallStateChange,
  actionsRef,
}: {
  onCallStateChange: (s: CallState) => void;
  actionsRef: React.MutableRefObject<WidgetActions>;
}) {
  const connectionStartTime = useRef<number | null>(null);
  const convoRef = useRef<{ endSession: () => Promise<void> } | null>(null);

  const { custom, has } = useMascotInputs();
  // useMascotInputs() is fresh-per-render — capture in a ref so the
  // long-lived ElevenLabs onModeChange callback reads the current handle.
  const customRef = useRef(custom);
  customRef.current = custom;

  // Co-located lip-sync pipeline — single local stream state, byte-identical
  // to the SDK reference. ElevenLabs self-plays; we tap that element.
  const { client } = useMascot();
  const playback = useMascotPlayback({
    stream: true,
    enableNaturalLipSync: true,
    naturalLipSyncConfig: NATURAL_LIP_SYNC_CONFIG,
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  useLipsyncStream({
    client,
    playback,
    source: { kind: "mediaStream", stream },
  });

  const elTapRef = useRef<ElevenLabsTapHandle | null>(null);
  const teardownElTap = useCallback(() => {
    elTapRef.current?.teardown();
    elTapRef.current = null;
    setStream(null);
  }, []);

  // Inline SDK-ready gate (resolves once the licensed client booted).
  const readyWaitersRef = useRef<Array<() => void>>([]);
  useEffect(() => {
    if (client) {
      const waiters = readyWaitersRef.current;
      readyWaitersRef.current = [];
      for (const r of waiters) r();
    }
  }, [client]);
  const whenReady = useCallback((): Promise<void> => {
    if (client) return Promise.resolve();
    return new Promise<void>((resolve) => {
      readyWaitersRef.current.push(resolve);
    });
  }, [client]);

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/get-signed-url", {
      method: "POST",
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `signed-url ${res.status}`);
    }
    const data = await res.json();
    if (!data.signedUrl) throw new Error("signed URL missing");
    return data.signedUrl as string;
  }, []);

  const startConversation = useCallback(async () => {
    try {
      // SYNCHRONOUSLY in the click, before any await: create the tap
      // (AudioContext born running) and feed THIS component's stream.
      if (!elTapRef.current) {
        elTapRef.current = startElevenLabsElementTap();
        setStream(elTapRef.current.tap.stream);
      }
      onCallStateChange("connecting");
      connectionStartTime.current = Date.now();

      await whenReady();
      const signedUrl = await getSignedUrl();

      const { Conversation } = await import("@elevenlabs/client");
      convoRef.current = await Conversation.startSession({
        signedUrl,
        // Per-turn gesture: fire the consumer-owned `gesture` trigger on
        // each agent-turn start (mascotbot-docs onModeChange recipe).
        onModeChange: ({ mode }: { mode: string }) => {
          if (mode !== "speaking") return;
          (customRef.current as Record<string, { fire?: () => void }>)
            .gesture?.fire?.();
        },
        onConnect: () => onCallStateChange("connected"),
        onStatusChange: ({
          status,
        }: {
          status: "disconnected" | "connecting" | "connected" | "disconnecting";
        }) => {
          if (status === "connected") onCallStateChange("connected");
          else if (status === "connecting") onCallStateChange("connecting");
          else if (status === "disconnected") onCallStateChange("idle");
        },
        onDisconnect: (details: { reason?: string }) => {
          const endedByAgent = details?.reason === "agent";
          teardownElTap();
          convoRef.current = null;
          onCallStateChange("idle");
          if (endedByAgent && has("hit")) {
            (custom as Record<string, { fire?: () => void }>).hit?.fire?.();
          }
        },
        onError: (message: string) => {
          console.error("[Widget] ElevenLabs error:", message);
          teardownElTap();
          convoRef.current = null;
          onCallStateChange("idle");
        },
      });
    } catch (error) {
      console.error("[Widget] Failed to start conversation:", error);
      teardownElTap();
      convoRef.current = null;
      onCallStateChange("idle");
      connectionStartTime.current = null;
    }
  }, [getSignedUrl, onCallStateChange, whenReady, teardownElTap, custom, has]);

  // Unmount safety.
  useEffect(
    () => () => {
      teardownElTap();
      void convoRef.current?.endSession().catch(() => {});
      convoRef.current = null;
    },
    [teardownElTap],
  );

  const stopConversation = useCallback(async () => {
    await convoRef.current?.endSession().catch(() => {});
  }, []);

  useEffect(() => {
    actionsRef.current = {
      start: () => void startConversation(),
      end: () => void stopConversation(),
    };
  }, [startConversation, stopConversation, actionsRef]);

  return null;
}

function WidgetWrapper({
  width,
  height,
  paddingX,
  paddingY,
  position,
  fillIframe,
  children,
}: {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  position: "bottom-right" | "bottom-left";
  fillIframe: boolean;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = fillIframe
    ? {
        position: "fixed",
        inset: 0,
        backgroundColor: "transparent",
        pointerEvents: "none",
      }
    : {
        position: "fixed",
        bottom: paddingY,
        ...(position === "bottom-left"
          ? { left: paddingX }
          : { right: paddingX }),
        width,
        height,
        backgroundColor: "transparent",
        pointerEvents: "none",
      };
  return (
    <div data-widget-wrapper style={style}>
      {children}
    </div>
  );
}

export default function Home() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const actionsRef = useRef<WidgetActions>({ start: () => {}, end: () => {} });

  const isInIframe =
    typeof window !== "undefined" && window.parent !== window;

  useWidgetPostMessage(actionsRef, callState);

  // Transparent page so the widget floats over any host site / iframe.
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const btnScale = useMemo(() => buttonScaleFor(WIDGET.width), []);

  return (
          <main
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100svh",
          overflow: "hidden",
        }}
      >
        <WidgetWrapper
          width={WIDGET.width}
          height={WIDGET.height}
          paddingX={WIDGET.paddingX}
          paddingY={WIDGET.paddingY}
          position={WIDGET.position}
          fillIframe={isInIframe}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Mascot
              src={MASCOT_URL}
              artboard="Widget"
              stateMachine="mascotStateMachine"
              shouldDisableRiveListeners
              inputs={WIDGET_INPUTS}
              layout={WIDGET_LAYOUT}
            >
              <WidgetRiveSync
                callState={callState}
                setRevealedAt={setRevealedAt}
              />
              <ElevenLabsWidgetContent
                onCallStateChange={setCallState}
                actionsRef={actionsRef}
              />
              <MascotRive />
            </Mascot>
          </div>

          <div
            data-overlay
            style={{
              position: "absolute",
              bottom: 20 * btnScale,
              left: 0,
              right: -135 * btnScale,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                transform: `scale(${btnScale})`,
                transformOrigin: "bottom center",
                pointerEvents: "auto",
              }}
            >
              <CallButton
                callState={callState}
                onStart={() => actionsRef.current.start()}
                onEnd={() => actionsRef.current.end()}
                revealedAt={revealedAt}
                idleLabel={WIDGET.callButtonLabel}
              />
            </div>
          </div>
        </WidgetWrapper>
      </main>
  );
}
