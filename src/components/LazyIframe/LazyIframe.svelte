<script lang="ts">
  interface Props {
    /** The URL of the iframe contents. */
    src: string;
    /** Whether the iframe matches the current view (for accessibility) */
    current?: boolean;
    /** Title for the iframe */
    title?: string;
    /** Additional CSS classes for the iframe */
    className?: string;
  }

  let { src, current = true, title = '', className = '' }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let iframeEl: HTMLIFrameElement | undefined = $state();
  let height = $state('400'); // Default height
  let hasEnteredViewport = $state(false);

  /**
   * We use an effect to handle the viewport detection.
   */
  $effect(() => {
    if (!container || hasEnteredViewport) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          hasEnteredViewport = true;
          observer.disconnect();
        }
      },
      {
        rootMargin: '100% 0px' // Load when within 1 screen height
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  });

  /**
   * Handle messages from Datawrapper for auto-resizing.
   */
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data['datawrapper-height'] !== 'undefined' && iframeEl) {
      if (iframeEl.contentWindow === event.source) {
        for (const chartId in event.data['datawrapper-height']) {
          height = event.data['datawrapper-height'][chartId] + 20;
        }
      }
    }
  };
</script>

<svelte:window onmessage={handleMessage} />

<div bind:this={container} class="lazy-iframe-container {className}">
  {#if hasEnteredViewport}
    <iframe bind:this={iframeEl} {src} {title} style:height="{height}px" aria-hidden={!current}></iframe>
  {/if}
</div>

<style lang="scss">
  iframe {
    width: 100%;
    border: none;
    display: block;
  }
</style>
