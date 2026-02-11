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
  <iframe bind:this={iframeEl} {src} title="" class:visible style:height="{height}px" aria-hidden={!visible}></iframe>
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
    min-width: max(480px, calc(100vw - 48px));
    @media (min-width: 744px) {
      margin-top: 84px;
      min-width: max(480px, calc(100vw - 99px));
    }
    @media (min-width: 993px) {
      margin-top: 0;
      min-width: 480px;
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
