<script lang="ts">
  interface Props {
    /** The Datawrapper chart ID (e.g. '9gBym'). */
    chartId: string;
    /** The minimum height of the chart container. Defaults to '426px'. */
    minHeight?: string;
    /** Descriptive text for the noscript fallback image. */
    altText?: string;
    /** Whether the chart should be visible. */
    isVisible?: boolean;
  }

  let { chartId, minHeight = '426px', altText = 'Datawrapper chart', isVisible = true }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let hasEnteredViewport = $state(false);

  /**
   * We use an effect to handle the script injection once the container is ready
   * and has entered the viewport (within 1 screen height).
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

  let loadedId = $state('');

  /**
   * Inject the script once the chart has entered the viewport.
   * Datawrapper's embed.js looks for a 'data-target' selector to mount into.
   */
  $effect(() => {
    if (!hasEnteredViewport || !container || !chartId || loadedId) return;

    // Once we decide to load, we capture the current chartId and stay with it.
    // This makes the component non-reactive to chartId changes once loaded.
    loadedId = chartId;

    // Clear any previous content/scripts just in case
    container.innerHTML = `<h1>${loadedId}</h1>`;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.defer = true;
    script.src = `https://datawrapper.dwcdn.net/${loadedId}/embed.js`;
    script.charset = 'utf-8';
    script.setAttribute('data-target', `#datawrapper-vis-${loadedId}`);

    container.appendChild(script);

    return () => {
      script.remove();
    };
  });
</script>

{#if chartId}
  <div
    bind:this={container}
    id="datawrapper-vis-{loadedId || chartId}"
    class="datawrapper-container"
    style:min-height={minHeight}
    style:opacity={isVisible ? 1 : 0}
    style:pointer-events={isVisible ? 'auto' : 'none'}
  >
    <h1>{loadedId || chartId}</h1>
  </div>
{/if}

<style lang="scss">
  div {
    width: 100%;
    margin: 1rem 0;
    transition: opacity 0.3s ease-in-out;
    border: 1px solid red;
  }
</style>
