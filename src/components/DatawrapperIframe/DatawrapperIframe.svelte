<script lang="ts">
  import LazyIframe from '../LazyIframe/LazyIframe.svelte';

  interface Props {
    /** The URL of the Datawrapper chart. */
    src: string;
    /** Whether the iframe should be visually rendered (opacity 1). Older charts stay visible so new charts fade over the top. */
    visible: boolean;
    /** Whether this is the chart matching the current scrollyteller panel. Used to toggle aria-hidden for accessibility. */
    current: boolean;
  }

  let { src, visible, current }: Props = $props();
</script>

<div class="iframe-wrapper" class:visible>
  <LazyIframe {src} {current} className="scrolly-chart" />
</div>

<style lang="scss">
  .iframe-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: white;
    transition: opacity 0.25s;
    overflow: hidden auto;

    opacity: 0;
    &.visible {
      opacity: 1;
      pointer-events: auto; // Changed from none to allow interaction if visible
    }

    &:not(.visible) {
      pointer-events: none;
    }
  }
  .iframe-wrapper :global(iframe) {
    border: none;
    pointer-events: none;
    min-width: min(480px, calc(100vw - 48px));
    @media (min-width: 744px) and (min-height: 700px) {
      min-width: min(480px, calc(100vw - 99px));
    }
    @media (min-width: 993px) and (min-height: 700px) {
      margin-top: 0;
      min-width: 480px;
    }
  }
</style>
