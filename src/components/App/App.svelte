<script lang="ts">
  import Scrollyteller from '@abcnews/svelte-scrollyteller';
  import type { PanelDefinition, PanelData } from '../../index';
  import { untrack } from 'svelte';

  let { panels }: { panels: PanelDefinition<PanelData>[] } = $props();
  let data = $state(untrack(() => panels[0]?.data as PanelData));

  const preloadUrls = $derived([
    ...new Set(panels.map(p => p.data.datawrapperUrl as string).filter(Boolean))
  ] as string[]);
</script>

<Scrollyteller
  {panels}
  onMarker={newData => {
    data = newData;
  }}
  layout={{
    align: 'left'
    // resizeInteractive: true
    // transparentFloat: true
  }}
>
  {#each preloadUrls as url (url)}
    <iframe src={url} title="" class:visible={url == data.datawrapperUrl}> </iframe>
  {/each}
</Scrollyteller>

<style lang="scss">
  iframe {
    border: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.25s;
    opacity: 0;
    &.visible {
      opacity: 1;
    }
  }
</style>
