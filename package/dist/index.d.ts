import * as react_jsx_runtime from 'react/jsx-runtime';
import { UseRiveParameters, UseRiveOptions, RiveState, RiveParameters, Fit, Alignment } from '@rive-app/react-webgl2';
export { Alignment, Fit } from '@rive-app/react-webgl2';
import { StateMachineInput } from '@rive-app/webgl2';
import * as React$1 from 'react';
import React__default from 'react';
import { RTVIClientOptions, TransportState } from '@pipecat-ai/client-js';

type SetImageAsset = (name: string, url: string) => void;
declare function useMascotRive(riveParams?: UseRiveParameters | undefined, opts?: Partial<UseRiveOptions> | undefined): RiveState & {
    setImageAsset: SetImageAsset;
};

type UseLoadRiveReturn = Pick<RiveState, "rive" | "RiveComponent"> & {
    isRiveLoaded: boolean;
    setImageAsset: SetImageAsset;
};
interface UseLoadRiveParams extends Pick<RiveParameters, "src"> {
    artboard?: string;
    shouldDisableRiveListeners?: boolean;
    layout?: {
        fit?: Fit;
        alignment?: Alignment;
        layoutScaleFactor?: number;
    };
    onRiveLoad?: (rive: any) => void;
}
declare const useLoadRive: (stateMachineName: string, params?: UseLoadRiveParams) => UseLoadRiveReturn;

declare const VISEMES_MAP: {
    readonly 0: 100;
    readonly 1: 101;
    readonly 2: 102;
    readonly 3: 104;
    readonly 4: 103;
    readonly 5: 114;
    readonly 6: 105;
    readonly 7: 110;
    readonly 8: 112;
    readonly 9: 103;
    readonly 10: 110;
    readonly 11: 101;
    readonly 12: 118;
    readonly 13: 114;
    readonly 14: 108;
    readonly 15: 113;
    readonly 16: 115;
    readonly 17: 116;
    readonly 18: 109;
    readonly 19: 116;
    readonly 20: 118;
    readonly 21: 107;
};
declare const DEFAULT_SM_INPUT: {
    value: any;
    fire: () => void;
    asBool: () => any;
    asNumber: () => any;
    asTrigger: () => any;
};

type SafeStateMachineInputReturn = StateMachineInput | typeof DEFAULT_SM_INPUT;
type RiveInputs = Record<"mouth" | "emotions" | "stress", Record<string | number, SafeStateMachineInputReturn>>;

type UseRiveInputsReturnType<T extends string = string> = {
    isSpeakingInput: SafeStateMachineInputReturn;
    eyesSmileInput: SafeStateMachineInputReturn;
    visemeInputs: Record<string | number, SafeStateMachineInputReturn>;
    riveInputs: RiveInputs;
    customInputs: Record<T | "gesture", SafeStateMachineInputReturn> | undefined;
    visemeMap: typeof VISEMES_MAP;
};

interface MascotProviderProps {
}
type MascotProviderContextType = MascotProviderProps;
declare function MascotProvider({ children }: React__default.PropsWithChildren<MascotProviderProps>): react_jsx_runtime.JSX.Element;

type MascotClientProps<T extends string = string> = {
    src: string;
    artboard?: string;
    shouldDisableRiveListeners?: boolean;
    inputs?: T[];
    layout?: {
        fit?: Fit;
        alignment?: Alignment;
        layoutScaleFactor?: number;
    };
    onRiveLoad?: (rive: any) => void;
} | {
    rive: RiveState | (RiveState & {
        setImageAsset: SetImageAsset;
    });
    inputs?: T[];
    layout?: {
        fit?: Fit;
        alignment?: Alignment;
        layoutScaleFactor?: number;
    };
    onRiveLoad?: (rive: any) => void;
};
type MascotClientContextType<T extends string = string> = MascotProviderContextType & UseRiveInputsReturnType<T> & ReturnType<typeof useLoadRive>;
declare function MascotClient<T extends string>({ inputs, children, ...props }: React.PropsWithChildren<MascotClientProps<T>>): react_jsx_runtime.JSX.Element;

interface MascotRiveProps<T extends string = string> {
    onClick?: (event: {
        inputs: Record<T, SafeStateMachineInputReturn> | undefined;
    }) => void;
    showLoadingSpinner?: boolean;
}
declare function MascotRive<T extends string>(props: React.PropsWithChildren<MascotRiveProps<T>>): string | number | true | Iterable<React$1.ReactNode> | react_jsx_runtime.JSX.Element;

interface UseVoiceClientOptions extends Partial<RTVIClientOptions> {
    apiUrl: string;
    tts?: {
        engine?: "elevenlabs" | "cartesia" | "mascotbot-tts";
        voice?: string;
        system_prompt?: string;
        api_key?: string;
    };
    llm?: {
        engine?: "openai" | "groq" | "anthropic";
        model?: string;
        system_prompt?: string;
        api_key?: string;
    };
    system_prompt?: string;
    apiKey?: string;
    spreadsheet_id?: string;
    mascot_id?: string;
}

/**
 * MascotCall props interface
 *
 * @param apiUrl - Required. The URL of the API endpoint for the voice call
 * @param tts - Optional. Text-to-speech configuration (server will provide defaults if not specified)
 * @param llm - Optional. Language model configuration (server will provide defaults if not specified)
 * @param debug - Optional. Whether to show debug information
 * @param onStateChange - Optional. Callback for transport state changes
 * @param apiKey - Optional. API key for authorization (server will provide if not specified)
 * @param spreadsheet_id - Optional. ID of the Google Spreadsheet to save transcripts to (server will provide default if not specified)
 * @param mascot_id - Optional. ID of the mascot to use, allowing server to select appropriate configuration
 * @param enableStressReaction - Optional. Whether to trigger the "stress" Rive input when bot starts speaking (defaults to false)
 */
interface MascotCallProps<T extends string> extends MascotRiveProps<T>, UseVoiceClientOptions {
    apiUrl: string;
    debug?: boolean;
    onStateChange?: (state: TransportState) => void;
    apiKey?: string;
    spreadsheet_id?: string;
    mascot_id?: string;
    enableStressReaction?: boolean;
}
interface MascotCallRenderProps {
    /** Props for the "start call" button (e.g. onClick, disabled, etc.) */
    startProps: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
    /** Props for the "end call" button */
    endProps: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
    /** Props for the "mute/unmute" button */
    muteProps: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;
    /** Current transport state (connecting, ready, etc.) */
    state: TransportState;
    /** Whether the mic is currently muted */
    muted: boolean;
}
interface MascotCallWithChildren {
    children?: React.ReactNode | ((provided: MascotCallRenderProps) => React.JSX.Element);
}
declare function MascotCall<T extends string>(props: MascotCallProps<T> & MascotCallWithChildren): react_jsx_runtime.JSX.Element | null;
declare function MascotCallControlPanel(): react_jsx_runtime.JSX.Element;

type Viseme$1 = {
    offset: number;
    visemeId: number;
};
type Stress = {
    stress: number;
    offset: number;
};
interface MascotPlaybackOptions {
    /**
     * Controls whether to automatically set the "is_speaking" state to true while the mascot is speaking.
     * @default true
     */
    setSpeakingState?: boolean;
    /**
     * Enables manual control over the speaking state for queue-aware applications.
     * When enabled, automatic speaking state management is disabled and manual methods are available.
     * @default false
     */
    manualSpeakingStateControl?: boolean;
    /**
     * Enable streaming mode - prevents automatic reset when chunks are empty.
     * Use this for real-time streaming scenarios where chunks arrive gradually.
     * @default false
     */
    stream?: boolean;
    /**
     * Enable natural lip sync processing to create more realistic mouth movements.
     * @default false
     */
    enableNaturalLipSync?: boolean;
    /**
     * Configuration for natural lip sync processing.
     */
    naturalLipSyncConfig?: {
        minVisemeInterval?: number;
        mergeWindow?: number;
        keyVisemePreference?: number;
        preserveSilence?: boolean;
        similarityThreshold?: number;
        preserveCriticalVisemes?: boolean;
    };
}
declare const useMascotPlayback: (options?: MascotPlaybackOptions) => {
    add: (visemes: Viseme$1[]) => void;
    stress: (stresses: Stress[]) => void;
    play: () => void;
    seek: (offset: number) => void;
    pause: () => void;
    reset: () => void;
    loadPrefetchedData: (visemes: Viseme$1[], stresses?: Stress[]) => void;
    setSpeakingStateManually: (speaking: boolean) => void | undefined;
    getSpeakingState: () => boolean;
    isManualSpeakingStateControlEnabled: () => boolean;
};

interface UseMascotReturnType extends Pick<MascotClientContextType<string>, "rive" | "RiveComponent" | "isRiveLoaded" | "customInputs" | "setImageAsset"> {
}
declare const useMascot: () => UseMascotReturnType;

type VisemeData = {
    visemeId: number;
    offset: number;
};
type TTSParams = {
    tts_engine: string;
    tts_api_key: string;
    voice: string;
    speed?: number;
};
type QueueItem = {
    id: string;
    text: string;
    voice?: string;
    ttsParams?: TTSParams;
    timestamp: number;
    status: "pending" | "fetching" | "ready" | "playing" | "completed" | "error";
    audioData?: {
        audioEvents: Map<number, any>;
        visemesBySequence: Map<number, any[]>;
    };
    error?: string;
};
/**
 * Voice ID constants for available voices
 * These ids can be used with the speak() function
 */
declare const MascotVoices: {
    AmericanFemaleHeart: string;
    AmericanFemaleAlloy: string;
    AmericanFemaleAoede: string;
    AmericanFemaleBella: string;
    AmericanFemaleJessica: string;
    AmericanFemaleKore: string;
    AmericanFemaleNicole: string;
    AmericanFemaleNova: string;
    AmericanFemaleRiver: string;
    AmericanFemaleSarah: string;
    AmericanFemaleSky: string;
    AmericanMaleSanta: string;
    AmericanMaleAdam: string;
    AmericanMaleEcho: string;
    AmericanMaleEric: string;
    AmericanMaleFenrir: string;
    AmericanMaleLiam: string;
    AmericanMaleMichael: string;
    AmericanMaleOnyx: string;
    AmericanMalePuck: string;
    BritishFemaleAlice: string;
    BritishFemaleEmma: string;
    BritishFemaleIsabella: string;
    BritishFemaleLily: string;
    BritishMaleDaniel: string;
    BritishMaleFable: string;
    BritishMaleGeorge: string;
    BritishMaleLewis: string;
};
interface MascotSpeechOptions {
    /**
     * API key for authentication with the MascotBot API
     * When provided, Authorization header will be added to requests
     * When omitted, no auth headers will be sent
     */
    apiKey?: string;
    /**
     * Number of chunks to buffer before starting playback
     * Higher values may result in smoother playback but increased initial delay
     * @default 1
     */
    bufferSize?: number;
    /**
     * Whether to enable timing events for performance monitoring
     * @default true
     */
    enableTimingEvents?: boolean;
    /**
     * Whether to enable debug logging (includes detailed trace logs)
     * Set to false in production to reduce console noise
     * @default false
     */
    debug?: boolean;
    /**
     * API endpoint to use for speech synthesis (required)
     * Examples:
     * - "/api/visemes-audio" (local proxy)
     * - "https://api.mascot.bot/v1/visemes-audio" (direct API calls)
     * - "https://your-custom-server.com/speech" (custom endpoint)
     */
    apiEndpoint: string;
    /**
     * Default voice to use for speech
     * @default "am_fenrir"
     */
    defaultVoice?: string;
    /**
     * Disable automatic speaking state management
     * When true, the hook will not automatically update the is_speaking state
     * based on audio playback. This is useful for export scenarios where
     * pre-fetched audio is used and manual control is needed.
     * @default false
     */
    disableAutomaticSpeakingState?: boolean;
    /**
     * Enable natural lip sync processing to create more realistic mouth movements.
     * @default false
     */
    enableNaturalLipSync?: boolean;
    /**
     * Configuration for natural lip sync processing.
     */
    naturalLipSyncConfig?: {
        minVisemeInterval?: number;
        mergeWindow?: number;
        keyVisemePreference?: number;
        preserveSilence?: boolean;
        similarityThreshold?: number;
        preserveCriticalVisemes?: boolean;
    };
}
interface MascotSpeechResult {
    /**
     * Start speaking with the given text and voice
     * @param text The text to speak
     * @param options Options for speech including voice and TTS parameters
     */
    speak: (text: string, options?: {
        voice?: string;
        ttsParams?: TTSParams;
    }) => Promise<boolean>;
    /**
     * Add text to the speech queue
     * @param text The text to add to queue
     * @param options Options for speech including voice and TTS parameters
     * @returns Queue item ID
     */
    addToQueue: (text: string, options?: {
        voice?: string;
        ttsParams?: TTSParams;
    }) => string;
    /**
     * Pre-fetch audio and viseme data without playing
     * @param text The text to pre-fetch
     * @param options Options for speech including voice and TTS parameters
     * @returns Promise with audio data and duration
     */
    prefetchAudio?: (text: string, options?: {
        voice?: string;
        ttsParams?: TTSParams;
    }) => Promise<{
        audioData: {
            audioEvents: Map<number, any>;
            visemesBySequence: Map<number, any[]>;
        };
        duration: number;
    } | null>;
    /**
     * Clear the speech queue (but don't stop current playback)
     */
    clearQueue: () => void;
    /**
     * Stop current speech playback and clear the queue
     */
    stopAndClear: () => void;
    /**
     * Stop current speech playback
     */
    stopSpeaking: () => void;
    /**
     * Preview a voice with sample text
     * @param previewText Text to use for preview
     * @param voiceId Voice ID to preview
     */
    previewVoice: (previewText: string, voiceId: string) => Promise<boolean>;
    /**
     * Whether the mascot is currently speaking
     */
    isSpeaking: boolean;
    /**
     * Whether speech is currently being loaded/prepared
     */
    isLoading: boolean;
    /**
     * Whether the queue is being processed
     */
    isProcessingQueue: boolean;
    /**
     * Current speech queue
     */
    queue: QueueItem[];
    /**
     * Currently playing queue item
     */
    currentQueueItem: QueueItem | null;
    /**
     * Number of items in queue
     */
    queueLength: number;
    /**
     * Any error that occurred during speech
     */
    error: string | null;
    /**
     * Time delay from button press to playback start
     */
    playbackStartDelay: number | null;
    /**
     * Current buffer size
     */
    bufferSize: number;
    /**
     * Set buffer size dynamically
     */
    setBufferSize: (size: number) => void;
}
/**
 * Enhanced hook for adding text-to-speech capability to a mascot
 * Supports multiple TTS engines, dynamic buffer sizing, voice preview, and advanced timing
 *
 * @example
 * ```tsx
 * // Using local proxy (no API key needed)
 * const speech = useMascotSpeech({
 *   apiEndpoint: "/api/visemes-audio"
 * });
 *
 * // Using direct API calls
 * const speech = useMascotSpeech({
 *   apiKey: "your-api-key",
 *   apiEndpoint: "https://api.mascot.bot/v1/visemes-audio"
 * });
 *
 * // Using custom endpoint with API key
 * const speech = useMascotSpeech({
 *   apiKey: "your-api-key",
 *   apiEndpoint: "https://your-custom-endpoint.com/v1/visemes-audio"
 * });
 *
 * // Using custom endpoint without API key (no auth headers)
 * const speech = useMascotSpeech({
 *   apiEndpoint: "https://my-custom-server.com/speech"
 * });
 *
 * // Basic usage
 * speech.speak("Hello world", { voice: MascotVoices.AmericanMaleSanta });
 *
 * // With custom TTS engine
 * speech.speak("Hello world", {
 *   ttsParams: {
 *     tts_engine: "elevenlabs",
 *     tts_api_key: "your-elevenlabs-key",
 *     voice: "voice-id",
 *     speed: 1.0
 *   }
 * });
 *
 * // Preview a voice
 * speech.previewVoice("This is a preview", MascotVoices.AmericanFemaleNova);
 * ```
 */
declare const useMascotSpeech: (options: MascotSpeechOptions) => MascotSpeechResult;

/**
 * WebSocket Interceptor for ElevenLabs Integration
 *
 * This module intercepts WebSocket connections to capture audio and viseme messages
 * without modifying the ElevenLabs SDK behavior.
 */
interface AudioMessage {
    type: "audio";
    audio_event: {
        audio_base_64: string;
        event_id: number;
    };
}
interface VisemeMessage {
    type: "visemes";
    visemes: Array<{
        offset: number;
        visemeId: number;
    }>;
    audio_event_id: number;
    subchunk_id: number;
    total_chunks: number;
    audio_duration?: number;
}

interface ElevenlabsConversation {
    status: "disconnected" | "disconnecting" | "connecting" | "connected";
}
interface UseMascotElevenlabsOptions {
    conversation: ElevenlabsConversation;
    debug?: boolean;
    onVisemeReceived?: (visemes: Array<{
        offset: number;
        visemeId: number;
    }>) => void;
    gesture?: boolean;
    naturalLipSync?: boolean;
    naturalLipSyncConfig?: {
        minVisemeInterval?: number;
        mergeWindow?: number;
        keyVisemePreference?: number;
        preserveSilence?: boolean;
        similarityThreshold?: number;
        preserveCriticalVisemes?: boolean;
    };
}
interface UseMascotElevenlabsResult {
    isIntercepting: boolean;
    messageCount: {
        audio: number;
        viseme: number;
    };
    lastMessage: {
        audio?: AudioMessage;
        viseme?: VisemeMessage;
    };
    lastResponseData?: {
        audioChunks: string[];
        visemeChunks: Array<{
            visemes: Array<{
                offset: number;
                visemeId: number;
            }>;
            audio_duration?: number;
        }>;
    };
}
/**
 * Hook to integrate ElevenLabs conversation with Mascot animations
 *
 * This is a minimal implementation for Iteration 2 testing
 */
declare function useMascotElevenlabs({ conversation, debug, onVisemeReceived, gesture, naturalLipSync, naturalLipSyncConfig, }: UseMascotElevenlabsOptions): UseMascotElevenlabsResult;

/**
 * WebSocket Interceptor for Gemini Live API Integration
 *
 * This module intercepts WebSocket connections to capture audio and viseme messages
 * without modifying the Google Gen AI SDK behavior.
 *
 * Key differences from ElevenLabs:
 * - Audio and visemes come in a SINGLE combined message
 * - Message structure uses `serverContent.modelTurn.parts` for audio
 * - Visemes are in `mascotVisemes` field (same message as audio)
 * - WebSocket frames can be binary (UTF-8 JSON)
 * - Sample rate is 24kHz
 */
interface Viseme {
    visemeId: number;
    offset: number;
}
interface MascotVisemes {
    visemes: Viseme[];
    audio_event_id: number;
    subchunk_id: number;
    total_chunks: number;
    audio_duration: number;
}
interface GeminiAudioVisemeMessage {
    serverContent: {
        modelTurn: {
            parts: Array<{
                inlineData: {
                    mimeType: string;
                    data: string;
                };
            }>;
        };
    };
    mascotVisemes: MascotVisemes;
}
interface GeminiInterruptionMessage {
    serverContent: {
        interrupted: boolean;
    };
}

interface LiveAPISession {
    status: "disconnected" | "disconnecting" | "connecting" | "connected";
}
interface UseMascotLiveAPIOptions {
    session: LiveAPISession;
    debug?: boolean;
    onVisemeReceived?: (visemes: Array<{
        offset: number;
        visemeId: number;
    }>) => void;
    gesture?: boolean;
    naturalLipSync?: boolean;
    naturalLipSyncConfig?: {
        minVisemeInterval?: number;
        mergeWindow?: number;
        keyVisemePreference?: number;
        preserveSilence?: boolean;
        similarityThreshold?: number;
        preserveCriticalVisemes?: boolean;
    };
    /** Enable audio playback of Gemini responses (default: true) */
    playAudio?: boolean;
    /** Audio sample rate in Hz (default: 24000 for Gemini) */
    audioSampleRate?: number;
}
interface UseMascotLiveAPIResult {
    isIntercepting: boolean;
    messageCount: number;
    lastMessage: GeminiAudioVisemeMessage | null;
    /** Debug data from the last completed response - audio and visemes pre-merged for replay */
    lastResponseData?: {
        /** Merged audio as base64 PCM16 (24kHz) */
        mergedAudioBase64: string;
        /** Merged visemes with cumulative offsets applied */
        mergedVisemes: Array<{
            offset: number;
            visemeId: number;
        }>;
        /** Total duration in milliseconds */
        totalDurationMs: number;
        /** Sample rate of the audio */
        sampleRate: number;
    };
}
/**
 * Hook to integrate Google Gemini Live API with Mascot animations
 *
 * This hook works alongside the @google/genai SDK, intercepting WebSocket
 * messages to extract viseme data for lip-sync animation.
 *
 * Implementation matches useMascotElevenlabs exactly - only difference is
 * that Gemini sends audio + visemes in a SINGLE combined message.
 */
declare function useMascotLiveAPI({ session, debug, onVisemeReceived, gesture, naturalLipSync, naturalLipSyncConfig, playAudio, audioSampleRate, }: UseMascotLiveAPIOptions): UseMascotLiveAPIResult;

/**
 * Natural Lip Sync Algorithm
 *
 * This algorithm creates more natural-looking lip sync by intelligently
 * filtering and merging visemes based on animation principles.
 */
interface NaturalLipSyncConfig {
    /**
     * Minimum time (ms) between visemes. Visemes closer than this will be merged.
     * Default: 60ms (allows ~16 visemes per second max)
     */
    minVisemeInterval: number;
    /**
     * Time window (ms) to look ahead for similar visemes to merge.
     * Default: 80ms
     */
    mergeWindow: number;
    /**
     * Strength of preference for key visemes (0-1).
     * Higher values keep more distinct mouth shapes.
     * Default: 0.7
     */
    keyVisemePreference: number;
    /**
     * Whether to preserve all silence visemes (recommended).
     * Default: true
     */
    preserveSilence: boolean;
    /**
     * Similarity threshold for merging visemes (0-1).
     * Higher values require more similar visemes to merge.
     * Default: 0.6
     */
    similarityThreshold: number;
    /**
     * Enable critical viseme preservation.
     * When true, critical visemes (like "u", "o", "l", "v") are never skipped.
     * Default: true
     */
    preserveCriticalVisemes: boolean;
}
declare const DEFAULT_NATURAL_LIPSYNC_CONFIG: NaturalLipSyncConfig;
declare class NaturalLipSyncProcessor {
    private config;
    constructor(config?: Partial<NaturalLipSyncConfig>);
    /**
     * Process visemes to create more natural lip sync
     */
    processVisemes(visemes: Array<{
        offset: number;
        visemeId: number;
    }>): Array<{
        offset: number;
        visemeId: number;
    }>;
    private calculateVisemeWeight;
    private mergeRapidTransitions;
    private areVisemesSimilar;
    private mergeVisemeGroup;
    private applyKeyVisemePreference;
    /**
     * Update configuration dynamically
     */
    updateConfig(config: Partial<NaturalLipSyncConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): NaturalLipSyncConfig;
}
/**
 * Convenience function to process visemes with default settings
 */
declare function processNaturalLipSync(visemes: Array<{
    offset: number;
    visemeId: number;
}>, config?: Partial<NaturalLipSyncConfig>): Array<{
    offset: number;
    visemeId: number;
}>;

export { DEFAULT_NATURAL_LIPSYNC_CONFIG, GeminiAudioVisemeMessage, GeminiInterruptionMessage, LiveAPISession, MascotCall, MascotCallControlPanel, MascotCallProps, MascotClient, MascotClientProps, MascotPlaybackOptions, MascotProvider, MascotRive, MascotSpeechOptions, MascotSpeechResult, MascotVoices, NaturalLipSyncConfig, NaturalLipSyncProcessor, QueueItem, SetImageAsset, TTSParams, UseMascotElevenlabsOptions, UseMascotElevenlabsResult, UseMascotLiveAPIOptions, UseMascotLiveAPIResult, VisemeData, processNaturalLipSync, useMascot, useMascotElevenlabs, useMascotLiveAPI, useMascotPlayback, useMascotRive, useMascotSpeech };
