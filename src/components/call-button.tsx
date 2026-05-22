"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Voice-Chat call button — a normal React/DOM control (NOT an in-canvas Rive
// button). Pill-shaped, inline-styled, appears with a bounce-in animation a
// few seconds after the avatar reveals. 1:1 with the MascotBot hosted-widget
// implementation (apps/app/components/widget/call-button.tsx).
// ---------------------------------------------------------------------------

// Delay before the button appears after the reveal fires (ms).
export const BUTTON_APPEAR_AFTER_REVEAL = 4100;
// Bounce-in animation duration (ms).
export const BUTTON_BOUNCE_DURATION = 450;

export type CallState = "idle" | "connecting" | "connected";

function CallButtonKeyframes() {
  return (
    <style>{`
      @keyframes mascotBounceIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.12); }
        75% { transform: scale(0.95); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes mascotSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  );
}

const phoneIconJsx = (
  <svg
    width="11.063"
    height="11.001"
    viewBox="0 0 11.0634 11.0013"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M2.9101 8.09741C1.29683 6.49654 0 4.39928 0 2.63088C0 1.85527 0.254401 1.1417 0.831458 0.564647C1.19755 0.198557 1.60087 0 1.97316 0C2.28961 0 2.58745 0.142713 2.81703 0.471573L4.05181 2.23377C4.19452 2.43233 4.28139 2.63709 4.28139 2.85426C4.28139 3.10866 4.1635 3.38788 3.88428 3.70433L3.44373 4.20693C3.37547 4.26898 3.35065 4.33723 3.35065 4.41169C3.35065 4.46133 3.36927 4.52959 3.40029 4.59784C3.54921 4.95152 4.0394 5.62786 4.70332 6.29178C5.37966 6.96812 6.0684 7.43969 6.40347 7.60722C6.47172 7.63825 6.54618 7.66307 6.61444 7.66307C6.70131 7.66307 6.78197 7.63204 6.84402 7.56999L7.30939 7.12324C7.61343 6.83781 7.89265 6.71992 8.14705 6.71992C8.36422 6.71992 8.56898 6.80679 8.76134 6.9433L10.6414 8.25253C10.9517 8.4697 11.0634 8.73031 11.0634 8.99092C11.0634 9.41285 10.7593 9.8472 10.4739 10.1264C9.89063 10.7159 9.20189 11.0013 8.37043 11.0013C6.59582 11.0013 4.50477 9.69207 2.9101 8.09741Z"
      fill="white"
    />
  </svg>
);

const loaderIconJsx = (
  <svg
    width="17.461"
    height="17.461"
    viewBox="0 0 17.4609 17.4609"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, animation: "mascotSpin 2.5s linear infinite" }}
  >
    <path
      d="M7.93066 15.2861V13.1035C7.93066 12.6617 8.28864 12.3037 8.73047 12.3037C9.1723 12.3037 9.53027 12.6617 9.53027 13.1035V15.2861C9.53027 15.728 9.1723 16.0859 8.73047 16.0859C8.28864 16.0859 7.93066 15.728 7.93066 15.2861ZM5.07227 11.2646C5.38469 10.9522 5.89168 10.9522 6.2041 11.2646C6.51652 11.5771 6.51652 12.0841 6.2041 12.3965L4.63965 13.96C4.32723 14.2724 3.82121 14.2724 3.50879 13.96C3.19637 13.6475 3.19637 13.1415 3.50879 12.8291L5.07227 11.2646ZM11.2568 11.2646C11.5693 10.9522 12.0763 10.9522 12.3887 11.2646L13.9521 12.8291C14.2646 13.1415 14.2646 13.6475 13.9521 13.96C13.6397 14.2724 13.1337 14.2724 12.8213 13.96L11.2568 12.3965C10.9444 12.0841 10.9444 11.5771 11.2568 11.2646ZM4.36523 7.93848C4.80706 7.93848 5.16504 8.29645 5.16504 8.73828C5.16504 9.18011 4.80706 9.53809 4.36523 9.53809H2.18262C1.74079 9.53809 1.38281 9.18011 1.38281 8.73828C1.38281 8.29645 1.74079 7.93848 2.18262 7.93848H4.36523ZM15.2783 7.93848C15.7201 7.93848 16.0781 8.29645 16.0781 8.73828C16.0781 9.18011 15.7201 9.53809 15.2783 9.53809H13.0957C12.6539 9.53809 12.2959 9.18011 12.2959 8.73828C12.2959 8.29645 12.6539 7.93848 13.0957 7.93848H15.2783ZM3.50879 3.5166C3.82121 3.20418 4.32723 3.20418 4.63965 3.5166L6.2041 5.08008C6.51652 5.3925 6.51652 5.89949 6.2041 6.21191C5.89168 6.52433 5.38469 6.52433 5.07227 6.21191L3.50879 4.64746C3.19637 4.33504 3.19637 3.82902 3.50879 3.5166ZM12.8213 3.5166C13.1337 3.20418 13.6397 3.20418 13.9521 3.5166C14.2646 3.82902 14.2646 4.33504 13.9521 4.64746L12.3887 6.21191C12.0763 6.52433 11.5693 6.52433 11.2568 6.21191C10.9444 5.89949 10.9444 5.3925 11.2568 5.08008L12.8213 3.5166ZM7.93066 4.37305V2.19043C7.93066 1.7486 8.28864 1.39062 8.73047 1.39062C9.1723 1.39062 9.53027 1.7486 9.53027 2.19043V4.37305C9.53027 4.81487 9.1723 5.17285 8.73047 5.17285C8.28864 5.17285 7.93066 4.81487 7.93066 4.37305Z"
      fill="white"
    />
  </svg>
);

export interface CallButtonProps {
  callState: CallState;
  onStart: () => void;
  onEnd: () => void;
  /**
   * Timestamp the reveal animation began. The button becomes visible
   * exactly `BUTTON_APPEAR_AFTER_REVEAL` ms after this moment (clamped
   * to 0 for past timestamps so resumes show it immediately). Pass
   * `null` to keep it hidden until reveal fires.
   */
  revealedAt: number | null;
  /** Custom idle-state label. Defaults to "Voice Chat". */
  idleLabel?: string;
}

const DEFAULT_IDLE_LABEL = "Voice Chat";

export function CallButton({
  callState,
  onStart,
  onEnd,
  revealedAt,
  idleLabel,
}: CallButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (revealedAt == null) {
      setVisible(false);
      return;
    }
    const elapsed = Date.now() - revealedAt;
    const remaining = Math.max(0, BUTTON_APPEAR_AFTER_REVEAL - elapsed);
    const timer = setTimeout(() => setVisible(true), remaining);
    return () => clearTimeout(timer);
  }, [revealedAt]);

  if (!visible) return null;

  const isEndCall = callState === "connected";
  const isConnecting = callState === "connecting";
  const backgroundColor = isEndCall ? "#d03318" : "#1f1d22";
  const trimmedIdleLabel = idleLabel?.trim();
  const label = isEndCall
    ? "End Call"
    : isConnecting
      ? "Connecting"
      : trimmedIdleLabel && trimmedIdleLabel.length > 0
        ? trimmedIdleLabel
        : DEFAULT_IDLE_LABEL;

  return (
    <>
      <CallButtonKeyframes />
      <button
        data-call-button
        onClick={isEndCall ? onEnd : onStart}
        disabled={isConnecting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "clip",
          borderRadius: "43.902px",
          fontSize: "14px",
          fontWeight: 500,
          textTransform: "uppercase",
          color: "white",
          border: "none",
          cursor: isConnecting ? "default" : "pointer",
          transition: "opacity 150ms, background-color 200ms",
          opacity: isConnecting ? 0.85 : 1,
          userSelect: "none",
          whiteSpace: "nowrap",
          backgroundColor,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.14px",
          lineHeight: "19.105px",
          gap: isEndCall ? "5.268px" : "3px",
          padding: "8px 11px",
          pointerEvents: "auto",
          animation: `mascotBounceIn ${BUTTON_BOUNCE_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        }}
        onMouseEnter={(e) => {
          if (!isConnecting)
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          if (!isConnecting)
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
      >
        {isConnecting ? loaderIconJsx : phoneIconJsx}
        <span>{label}</span>
      </button>
    </>
  );
}
