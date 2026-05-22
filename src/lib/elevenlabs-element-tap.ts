"use client";

import { createElementTap, type ElementTap } from "@mascotbot/react";

/**
 * ElevenLabs Conversational AI → lipsync tap.
 *
 * `@elevenlabs/client` self-plays its assistant audio through an
 * AudioWorklet → MediaStreamDestination → a hidden `<audio>` it
 * constructs with `new Audio()` and whose `.srcObject` it sets to that
 * MediaStream (a tick AFTER construction). `createElementTap()` taps
 * that element cross-browser (Safari has no `captureStream()`).
 *
 * CONTRACT — call `startElevenLabsElementTap()` **synchronously inside
 * the call-start click handler, before any `await`**. `createElementTap()`
 * does `new AudioContext()`, born SUSPENDED outside a user gesture
 * (Chrome autoplay policy + Safari) — a suspended context's
 * MediaStreamDestination emits silence, so the worklet taps a dead
 * stream. Feed `handle.tap.stream` to the lipsync pipeline immediately
 * (silent until the poll `attach()`es the element). Call
 * `handle.teardown()` on every stop / disconnect / error / unmount.
 */
export interface ElevenLabsTapHandle {
  /** Stable MediaStream — hand to the lipsync hook right away. */
  tap: ElementTap;
  /** Stop the element poll, restore `window.Audio`, close the tap. */
  teardown: () => void;
}

interface AudioWindow {
  Audio: typeof Audio;
  __mascot_el_audio?: HTMLAudioElement | null;
}

/** MUST be invoked from within the call-start click, before any await. */
export function startElevenLabsElementTap(): ElevenLabsTapHandle {
  // Created here, inside the gesture, so its AudioContext starts
  // running rather than suspended.
  const tap = createElementTap();

  const w = window as unknown as AudioWindow;
  const OrigAudio = w.Audio;
  // Per-call patch (restored in teardown). `@elevenlabs/client`
  // constructs its output element via `new Audio()`; stash the
  // most-recent instance so we can tap it.
  w.Audio = function (...args: unknown[]) {
    const el = new OrigAudio(...(args as []));
    w.__mascot_el_audio = el;
    return el;
  } as unknown as typeof Audio;

  // Prefer the stashed element; fall back to an authoritative DOM scan
  // for a real `<audio srcObject=MediaStream>` (bundler-robust).
  //
  const hasAudioStream = (el: HTMLMediaElement): boolean =>
    el.srcObject instanceof MediaStream &&
    el.srcObject.getAudioTracks().length > 0;
  const findElAudio = (): HTMLMediaElement | null => {
    const stashed = w.__mascot_el_audio;
    if (stashed && hasAudioStream(stashed)) return stashed;
    const nodes = document.querySelectorAll<HTMLMediaElement>("audio,video");
    for (const n of Array.from(nodes)) {
      if (hasAudioStream(n)) return n;
    }
    return null;
  };

  let tries = 0;
  const iv = window.setInterval(() => {
    const el = findElAudio();
    if (el) {
      tap.attach(el);
      tap.resume();
      window.clearInterval(iv);
    } else if (++tries > 100) {
      // ~10s cap so a misbehaving SDK can't poll forever.
      window.clearInterval(iv);
    }
  }, 100);

  const teardown = () => {
    window.clearInterval(iv);
    w.Audio = OrigAudio;
    // Clear the stashed ref so the next call's first poll iteration
    // doesn't latch onto the (now dead) element from THIS call. Belt-
    // and-suspenders with `isLiveElAudio` above: the track-state guard
    // is the real defense; this skips a wasteful iteration.
    w.__mascot_el_audio = null;
    tap.close();
  };

  return { tap, teardown };
}
