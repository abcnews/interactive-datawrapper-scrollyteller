<script lang="ts">
  let { src, visible }: { src: string; visible: boolean } = $props();

  let iframeEl: HTMLIFrameElement | undefined = $state();
  let height = $state('400'); // Default height

  /**
   * Handle messages from Datawrapper for auto-resizing.
   * Datawrapper sends a message with the required height when its content changes.
   */
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data['datawrapper-height'] !== 'undefined' && iframeEl) {
      // Check if this message is for this specific iframe
      if (iframeEl.contentWindow === event.source) {
        for (const chartId in event.data['datawrapper-height']) {
          height = event.data['datawrapper-height'][chartId] + 20;
        }
      }
    }
  };
</script>

<svelte:window onmessage={handleMessage} />
<div class="iframe-wrapper">
  <iframe
    bind:this={iframeEl}
    {src}
    title=""
    class:visible
    style:height="{height}px"
    aria-hidden={!visible}
    loading="lazy"
  ></iframe>
</div>

<style lang="scss">
  .iframe-wrapper {
    width: 0;
  }
  iframe {
    border: none;
    transition: opacity 0.25s;
    opacity: 0;
    transform: translateX(-50%);
    margin-top: 24px;
    min-width: min(480px, calc(100vw - 48px));
    @media (min-width: 744px) and (min-height: 700px) {
      margin-top: 84px;
      min-width: min(480px, calc(100vw - 99px));
    }
    @media (min-width: 993px) and (min-height: 700px) {
      margin-top: 0;
      min-width: 480px;

      // centre visually in the middle of the free space
      // Warning: charts taller than the screen will be broken, and no amount
      // of scrolling will fix them, so don't make tall charts pls.
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    &.visible {
      opacity: 1;
      pointer-events: auto; // Changed from none to allow interaction if visible
    }

    &:not(.visible) {
      pointer-events: none;
    }
  }
</style>
