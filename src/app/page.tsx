"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import {
  Alignment,
  Fit,
  MascotClient,
  MascotProvider,
  MascotRive,
  useMascot,
  useMascotElevenlabs,
} from "@mascotbot-sdk/react";
import { EventType, RiveEventType } from "@rive-app/react-webgl2";
import "./globals.css";

// ============================================================================
// WIDGET CUSTOMIZATION CONFIG
// ============================================================================
// Customize your widget's appearance by modifying these values.
// These settings are applied on page load.
//
// For NotionGuy/NotionPeople avatars:
// - gender: 1 (male) or 2 (female)
// - outline: 0-100 (stroke thickness)
// - colourful: true/false (colorful vs monochrome)
// - flip: true/false (mirror the character)
// - crop: true/false (show background circle)
// - bg_color: 0-10 (background color, only when crop=true)
// - shirt_color: 1-6 (shirt color variant)
// - eyes_type: 1-2 (eye style)
// - hair_style: 1-3 (hair style, 3=with accessories)
// - accessories_hue: 0-360 (accessory color hue, only when hair_style=3)
// - accessories_saturation: 0-100 (accessory saturation, only when hair_style=3)
// - accessories_brightness: 0-100 (accessory brightness, only when hair_style=3)
//
// ============================================================================

const WIDGET_CUSTOMIZATION = {
  gender: 1, // 1 = male, 2 = female
  outline: 10,
  colourful: true,
  flip: false,
  crop: false,
  bg_color: 0,
  shirt_color: 2,
  eyes_type: 2,
  hair_style: 3,
  accessories_hue: 0,
  accessories_saturation: 0,
  accessories_brightness: 100,
};

interface ElevenLabsWidgetContentProps {
  dynamicVariables?: Record<string, string | number | boolean>;
  customization?: typeof WIDGET_CUSTOMIZATION;
}

// Widget content component that uses hooks inside MascotClient
function ElevenLabsWidgetContent({ dynamicVariables, customization = WIDGET_CUSTOMIZATION }: ElevenLabsWidgetContentProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const urlRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const connectionStartTime = useRef<number | null>(null);
  const isUserInitiatedEnd = useRef(false); // Track if user clicked end button

  // Natural lip sync configuration
  const [lipSyncConfig] = useState({
    minVisemeInterval: 40,
    mergeWindow: 60,
    keyVisemePreference: 0.6,
    preserveSilence: true,
    similarityThreshold: 0.4,
    preserveCriticalVisemes: true,
    criticalVisemeMinDuration: 80,
  });

  // Get mascot context for accessing rive instance and custom inputs
  // @ts-ignore - customInputs exists at runtime
  const { rive, customInputs } = useMascot();

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("[Widget] ElevenLabs Connected");
      setIsConnecting(false);

      // Update Rive inputs
      if (customInputs?.is_connected) {
        customInputs.is_connected.value = true;
      }
      if (customInputs?.is_connecting) {
        customInputs.is_connecting.value = false;
      }

      // Calculate and log connection time
      if (connectionStartTime.current) {
        const timeElapsed = Date.now() - connectionStartTime.current;
        console.log(`[Widget] Connection established in ${timeElapsed}ms`);
        connectionStartTime.current = null;
      }
    },
    onDisconnect: (details) => {
      console.log("[Widget] ElevenLabs Disconnected", details);
      console.log("[Widget] Was user initiated?", isUserInitiatedEnd.current);
      setIsConnecting(false);

      // Update Rive inputs
      if (customInputs?.is_connected) {
        customInputs.is_connected.value = false;
      }
      if (customInputs?.is_connecting) {
        customInputs.is_connecting.value = false;
      }

      // If the call was ended by the agent (not user), fire the hit trigger
      if (!isUserInitiatedEnd.current && customInputs?.hit) {
        console.log("[Widget] Agent ended the call, firing hit trigger");
        customInputs.hit.fire();
      }

      // Reset the flag for next time
      isUserInitiatedEnd.current = false;
    },
    onError: (error: any) => {
      console.error("[Widget] ElevenLabs Error:", error);
      setIsConnecting(false);

      // Update Rive inputs on error
      if (customInputs?.is_connected) {
        customInputs.is_connected.value = false;
      }
      if (customInputs?.is_connecting) {
        customInputs.is_connecting.value = false;
      }
    },
    onMessage: () => {
      // Empty handler to prevent SDK errors
    },
    onDebug: () => {
      // Empty handler to prevent SDK errors
    },
  });

  // Use the mascot elevenlabs hook - it handles playback internally
  useMascotElevenlabs({
    conversation,
    debug: false,
    gesture: true, // Enable stress gesture on each response
    naturalLipSync: true, // Enable natural lip sync
    naturalLipSyncConfig: lipSyncConfig,
  });

  // Get signed URL for ElevenLabs
  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch(`/api/get-signed-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        dynamicVariables: dynamicVariables || {},
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const data = await response.json();
    return data.signedUrl;
  };

  // Fetch and cache signed URL
  const fetchAndCacheUrl = useCallback(async () => {
    try {
      console.log("[Widget] Fetching signed URL...");
      const url = await getSignedUrl();
      setCachedUrl(url);
      console.log("[Widget] Signed URL cached successfully");
    } catch (error) {
      console.error("[Widget] Failed to fetch signed URL:", error);
      setCachedUrl(null);
    }
  }, [dynamicVariables]);

  // Set up URL pre-fetching and refresh
  useEffect(() => {
    // Fetch URL immediately on page load
    fetchAndCacheUrl();

    // Set up refresh interval (every 9 minutes = 540000ms)
    urlRefreshInterval.current = setInterval(
      () => {
        console.log("[Widget] Refreshing cached URL...");
        fetchAndCacheUrl();
      },
      9 * 60 * 1000
    ); // 9 minutes

    // Cleanup on unmount
    return () => {
      if (urlRefreshInterval.current) {
        clearInterval(urlRefreshInterval.current);
        urlRefreshInterval.current = null;
      }
    };
  }, [fetchAndCacheUrl]);

  // Start conversation
  const startConversation = useCallback(async () => {
    try {
      console.log("[Widget] Starting conversation...");
      setIsConnecting(true);
      connectionStartTime.current = Date.now(); // Record start time

      // Update Rive inputs
      if (customInputs?.is_connecting) {
        customInputs.is_connecting.value = true;
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Use cached URL if available, otherwise fetch a new one
      let signedUrl = cachedUrl;
      if (!signedUrl) {
        console.log("[Widget] No cached URL available, fetching new one...");
        signedUrl = await getSignedUrl();
      } else {
        console.log("[Widget] Using cached URL for faster connection");
      }

      if (!signedUrl) {
        throw new Error("The signed URL is missing.");
      }
      await conversation.startSession({
        signedUrl,
        dynamicVariables: dynamicVariables,
      });
    } catch (error) {
      console.error("[Widget] Failed to start conversation:", error);
      setIsConnecting(false);
      connectionStartTime.current = null; // Reset on error

      // Update Rive inputs on error
      if (customInputs?.is_connecting) {
        customInputs.is_connecting.value = false;
      }
    }
  }, [conversation, cachedUrl, customInputs, dynamicVariables]);

  // Stop conversation
  const stopConversation = useCallback(async () => {
    console.log("[Widget] Stopping conversation...");
    await conversation.endSession();
  }, [conversation]);

  // Apply customization settings when customInputs become available
  useEffect(() => {
    if (!customInputs) return;

    // Apply all customization values directly
    Object.entries(customization).forEach(([key, value]) => {
      if (customInputs[key]) {
        customInputs[key].value = value;
      }
    });

    // Legacy alias: "character" mirrors "gender"
    if (customInputs.character) {
      customInputs.character.value = customization.gender;
    }
  }, [customInputs, customization]);

  // Fire reveal trigger after page loads
  useEffect(() => {
    if (!rive || !customInputs) return;

    // Fire reveal trigger after 1 second
    const revealTimer = setTimeout(() => {
      console.log("[Widget] Firing reveal trigger");
      if (customInputs?.reveal) {
        customInputs.reveal.fire();
      } else {
        console.log("[Widget] Reveal trigger not found in customInputs");
      }
    }, 1000);

    return () => clearTimeout(revealTimer);
  }, [rive, customInputs]);

  // Set up Rive event listeners
  useEffect(() => {
    if (!rive) return;

    const onRiveEventReceived = (riveEvent: any) => {
      const eventData = riveEvent.data;
      const eventName = eventData.name;

      console.log("[Widget] Rive event received:", eventName, eventData);

      if (eventData.type === RiveEventType.General) {
        // Handle specific events by name
        if (eventName === "startCall") {
          console.log("[Widget] Start call event received from Rive");
          if (conversation.status !== "connected" && !isConnecting) {
            startConversation();
          }
        } else if (eventName === "endCall") {
          console.log("[Widget] End call event received from Rive (user clicked button)");
          if (conversation.status === "connected") {
            // Mark this as user-initiated since it came from the Rive button
            isUserInitiatedEnd.current = true;
            stopConversation();
          }
        }
      }
    };

    // Add event listener
    console.log("[Widget] Setting up Rive event listener");
    rive.on(EventType.RiveEvent, onRiveEventReceived);

    // Cleanup
    return () => {
      console.log("[Widget] Cleaning up Rive event listener");
      rive.off(EventType.RiveEvent, onRiveEventReceived);
    };
  }, [rive, conversation.status, isConnecting, startConversation, stopConversation]);

  // Listen for postMessage from embed script (for tap/click on mobile and desktop)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'widget-tap') {
        console.log('[Widget] Received tap via postMessage', event.data);
        // Toggle conversation on tap
        if (conversation.status === 'connected') {
          isUserInitiatedEnd.current = true;
          stopConversation();
        } else if (!isConnecting) {
          startConversation();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [conversation.status, isConnecting, startConversation, stopConversation]);

  // The widget is entirely controlled by Rive, so we just render the mascot
  return null; // MascotRive will be rendered at the parent level
}

// Widget wrapper component with transparent background
// When embedded as iframe, this tracks mouse position and notifies parent when leaving button area
function WidgetWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if we're embedded in an iframe - use state to avoid hydration mismatch
  // Start with false (matches server render), then update after mount
  const [isEmbedded, setIsEmbedded] = useState(false);

  // Button area dimensions (percentage of container) - must match embed script
  const BUTTON_WIDTH_PERCENT = 0.5;  // 50% from right
  const BUTTON_HEIGHT_PERCENT = 0.2; // 20% from bottom

  // Check if embedded after hydration
  useEffect(() => {
    setIsEmbedded(window.parent !== window);
  }, []);

  // Track mouse movement and notify parent when leaving button area
  useEffect(() => {
    if (!isEmbedded) return;

    const container = containerRef.current;
    if (!container) return;

    let isInButtonArea = false;

    const checkButtonArea = (clientX: number, clientY: number) => {
      // Use viewport dimensions (which match iframe dimensions when embedded)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const buttonLeft = viewportWidth - (viewportWidth * BUTTON_WIDTH_PERCENT);
      const buttonTop = viewportHeight - (viewportHeight * BUTTON_HEIGHT_PERCENT);

      return clientX >= buttonLeft && clientX <= viewportWidth &&
             clientY >= buttonTop && clientY <= viewportHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const wasInButtonArea = isInButtonArea;
      isInButtonArea = checkButtonArea(e.clientX, e.clientY);

      // If mouse just left the button area, notify parent
      if (wasInButtonArea && !isInButtonArea) {
        window.parent.postMessage({ type: 'widget-mouse-left-button' }, '*');
      }
    };

    const handleMouseLeave = () => {
      if (isInButtonArea) {
        isInButtonArea = false;
        window.parent.postMessage({ type: 'widget-mouse-left-button' }, '*');
      }
    };

    // Track mouse on the entire document to catch all movements
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Also listen for mouseenter to set initial state when mouse enters widget
    const handleMouseEnter = (e: MouseEvent) => {
      isInButtonArea = checkButtonArea(e.clientX, e.clientY);
    };
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isEmbedded]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0"
      style={{
        width: "100vh",
        height: "100vh",
        backgroundColor: "transparent",
      }}
    >
      {/* Rive canvas renders here at full size - receives pointer events */}
      {children}

      {/*
        Click blocker ONLY when NOT embedded.
        When embedded, the parent page's embed script handles click-through behavior.
        When viewing directly, this blocker prevents clicks outside the button area.
      */}
      {!isEmbedded && (
        <div
          data-overlay
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "auto",
            clipPath: `polygon(
              0% 0%,
              100% 0%,
              100% 85%,
              60% 85%,
              60% 100%,
              0% 100%
            )`,
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  // Widget Rive file - place your mascot_widget.riv in the public folder
  // Available with Mascot Bot SDK subscription
  // Note: Widget Rive files have "_widget" suffix and use the "Widget" artboard
  // You can also use a CDN URL: "https://your-cdn.com/mascot_widget.riv"
  const mascotUrl = "/mascot_widget.riv";

  // Dynamic variables to pass to the ElevenLabs agent
  // These can be customized based on your agent's configuration
  const dynamicVariables = {
    name: "User",
    // Add more variables as needed for your agent
  };

  // Apply transparent background on client side to avoid hydration issues
  useEffect(() => {
    // Apply styles to ensure transparency
    document.documentElement.style.background = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.background = "transparent";
    document.body.style.backgroundColor = "transparent";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // Remove any background from Next.js root
    const nextRoot = document.getElementById("__next");
    if (nextRoot) {
      nextRoot.style.background = "transparent";
      nextRoot.style.backgroundColor = "transparent";
    }
  }, []);

  return (
    <MascotProvider>
      <main className="flex h-svh flex-col overflow-hidden">
        <WidgetWrapper>
          <MascotClient
            src={mascotUrl}
            artboard="Widget"
            shouldDisableRiveListeners={false}
            inputs={[
              // Core widget inputs
              "gesture",
              "is_speaking",
              "is_connected",
              "is_connecting",
              "reveal",
              "hit",
              // Customization inputs
              "gender",
              "character", // legacy alias for gender
              "outline",
              "colourful",
              "flip",
              "crop",
              "bg_color",
              "shirt_color",
              "eyes_type",
              "hair_style",
              "accessories_hue",
              "accessories_saturation",
              "accessories_brightness",
            ]}
            layout={{
              fit: Fit.Contain,
              alignment: Alignment.BottomRight,
            }}
          >
            <ElevenLabsWidgetContent
              dynamicVariables={dynamicVariables}
              customization={WIDGET_CUSTOMIZATION}
            />
            <MascotRive showLoadingSpinner={false} />
          </MascotClient>
        </WidgetWrapper>
      </main>
    </MascotProvider>
  );
}
