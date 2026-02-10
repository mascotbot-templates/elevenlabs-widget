/**
 * ElevenLabs Voice Widget Embed Script
 *
 * SIMPLE USAGE - just include the script from your deployed widget:
 * <script src="https://your-deployed-widget.com/widget-embed.js"></script>
 *
 * The widget URL is auto-detected from the script's src - no configuration needed!
 *
 * CUSTOM SIZES - specify desktop dimensions:
 * <script src="https://your-deployed-widget.com/widget-embed.js"
 *   data-widget-width="400"
 *   data-widget-height="500">
 * </script>
 *
 * RESPONSIVE - different sizes for mobile and desktop:
 * <script src="https://your-deployed-widget.com/widget-embed.js"
 *   data-widget-width="400"
 *   data-widget-height="500"
 *   data-widget-mobile-width="280"
 *   data-widget-mobile-height="350"
 *   data-widget-mobile-breakpoint="768">
 * </script>
 *
 * OPTIONS:
 * - data-widget-url: Override the widget URL (auto-detected by default)
 * - data-widget-width: Desktop width in pixels (default: 350)
 * - data-widget-height: Desktop height in pixels (default: 450)
 * - data-widget-mobile-width: Mobile width in pixels (default: same as desktop)
 * - data-widget-mobile-height: Mobile height in pixels (default: same as desktop)
 * - data-widget-mobile-breakpoint: Viewport width to switch to mobile (default: 768)
 */
(function() {
  // Get configuration from script tag or global variable
  const scriptTag = document.currentScript;

  // Auto-detect widget URL from the script's own src (e.g., https://widget.example.com/widget-embed.js)
  // This allows users to simply include the script without specifying data-widget-url
  function getWidgetUrlFromScript() {
    if (!scriptTag?.src) return null;
    try {
      const scriptUrl = new URL(scriptTag.src);
      return scriptUrl.origin;
    } catch (e) {
      return null;
    }
  }

  const widgetUrl = scriptTag?.getAttribute('data-widget-url') || window.WIDGET_URL || getWidgetUrlFromScript() || window.location.origin;

  // Desktop sizes
  const desktopWidth = parseInt(scriptTag?.getAttribute('data-widget-width') || '350', 10);
  const desktopHeight = parseInt(scriptTag?.getAttribute('data-widget-height') || '450', 10);

  // Mobile sizes (fallback to desktop sizes if not specified)
  const mobileWidth = parseInt(scriptTag?.getAttribute('data-widget-mobile-width') || desktopWidth, 10);
  const mobileHeight = parseInt(scriptTag?.getAttribute('data-widget-mobile-height') || desktopHeight, 10);

  // Mobile breakpoint (default 768px)
  const mobileBreakpoint = parseInt(scriptTag?.getAttribute('data-widget-mobile-breakpoint') || '768', 10);

  // Function to check if current viewport is mobile
  function isMobile() {
    return window.innerWidth <= mobileBreakpoint;
  }

  // Get current dimensions based on viewport
  function getCurrentDimensions() {
    if (isMobile()) {
      return { width: mobileWidth, height: mobileHeight };
    }
    return { width: desktopWidth, height: desktopHeight };
  }

  // Initial dimensions
  let { width, height } = getCurrentDimensions();

  // Button area dimensions (percentage of iframe) - must match widget's interactive zone
  const BUTTON_WIDTH_PERCENT = 0.5;  // 50% from right
  const BUTTON_HEIGHT_PERCENT = 0.2; // 20% from bottom

  // Create iframe with microphone permissions for voice chat
  const iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.allow = 'microphone; autoplay; camera';
  iframe.title = 'Voice Chat Widget';
  iframe.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: ${width}px;
    height: ${height}px;
    border: none;
    background: transparent;
    pointer-events: none;
    z-index: 2147483646;
  `;

  // Create sensor overlay (positioned over button area)
  const sensor = document.createElement('div');
  const sensorWidth = width * BUTTON_WIDTH_PERCENT;
  const sensorHeight = height * BUTTON_HEIGHT_PERCENT;
  sensor.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: ${sensorWidth}px;
    height: ${sensorHeight}px;
    z-index: 2147483647;
    pointer-events: auto;
    cursor: pointer;
  `;

  function enableIframe() {
    iframe.style.pointerEvents = 'auto';
    sensor.style.pointerEvents = 'none';
  }

  function disableIframe() {
    iframe.style.pointerEvents = 'none';
    sensor.style.pointerEvents = 'auto';
  }

  // Check if coordinates are within the button area
  function isInButtonArea(clientX, clientY) {
    const rect = iframe.getBoundingClientRect();
    const buttonLeft = rect.right - (rect.width * BUTTON_WIDTH_PERCENT);
    const buttonTop = rect.bottom - (rect.height * BUTTON_HEIGHT_PERCENT);
    return clientX >= buttonLeft && clientX <= rect.right &&
           clientY >= buttonTop && clientY <= rect.bottom;
  }

  // === DESKTOP (Mouse) ===
  // When mouse enters sensor, enable iframe
  sensor.addEventListener('mouseenter', enableIframe);

  // Track mouse movement on the entire document when iframe is active
  document.addEventListener('mousemove', function(e) {
    // If iframe is interactive, check if mouse is still in button area
    if (iframe.style.pointerEvents === 'auto') {
      if (!isInButtonArea(e.clientX, e.clientY)) {
        // Mouse left button area - disable iframe immediately
        disableIframe();
      }
    }
  });

  // === MOBILE (Touch) ===
  // On touch, send message to iframe to trigger button
  sensor.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    iframe.contentWindow.postMessage({
      type: 'widget-tap',
      x: touch.clientX - iframe.getBoundingClientRect().left,
      y: touch.clientY - iframe.getBoundingClientRect().top
    }, '*');
  }, { passive: true });

  // Handle click for both desktop and mobile
  sensor.addEventListener('click', function(e) {
    iframe.contentWindow.postMessage({
      type: 'widget-tap',
      x: e.clientX - iframe.getBoundingClientRect().left,
      y: e.clientY - iframe.getBoundingClientRect().top
    }, '*');
  });

  // Listen for messages from iframe (e.g., when widget wants to signal something)
  window.addEventListener('message', function(e) {
    if (e.data?.type === 'widget-mouse-left-button') {
      disableIframe();
    }
  });

  // Handle window resize - update dimensions for mobile/desktop and sensor size
  window.addEventListener('resize', function() {
    // Check if dimensions need to change based on breakpoint
    const newDimensions = getCurrentDimensions();
    if (newDimensions.width !== width || newDimensions.height !== height) {
      width = newDimensions.width;
      height = newDimensions.height;
      iframe.style.width = width + 'px';
      iframe.style.height = height + 'px';
    }

    // Update sensor size based on current iframe dimensions
    const rect = iframe.getBoundingClientRect();
    sensor.style.width = (rect.width * BUTTON_WIDTH_PERCENT) + 'px';
    sensor.style.height = (rect.height * BUTTON_HEIGHT_PERCENT) + 'px';
  });

  // Append to body when DOM is ready
  function init() {
    document.body.appendChild(iframe);
    document.body.appendChild(sensor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
