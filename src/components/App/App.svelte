<script lang="ts">
  import Scrollyteller from '@abcnews/svelte-scrollyteller';
  import type { PanelDefinition, PanelData } from '../../index';
  import { untrack } from 'svelte';
  import DatawrapperIframe from '../DatawrapperIframe/DatawrapperIframe.svelte';

  let { panels, mobileVariant = 'rows' }: { panels: PanelDefinition<PanelData>[]; mobileVariant: 'blocks' | 'rows' } =
    $props();
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
    align: 'left',
    mobileVariant: mobileVariant
    // resizeInteractive: true
    // transparentFloat: true
  }}
>
  {#each preloadUrls as url (url)}
    <DatawrapperIframe src={url} visible={url == data.datawrapperUrl} />
  {/each}
</Scrollyteller>

<style lang="scss">
</style>
