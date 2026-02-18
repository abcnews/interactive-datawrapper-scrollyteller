<script lang="ts">
  import Scrollyteller from '@abcnews/svelte-scrollyteller';
  import type { PanelDefinition, PanelData } from '../../index';
  import { untrack } from 'svelte';
  import DatawrapperIframe from '../DatawrapperIframe/DatawrapperIframe.svelte';

  interface Props {
    panels: PanelDefinition<PanelData>[];
    mobileVariant?: 'blocks' | 'rows';
  }

  let { panels, mobileVariant = 'rows' }: Props = $props();
  let data = $state(untrack(() => panels[0]?.data as PanelData));
  let innerHeight = $state(window.innerHeight);

  const preloadUrls = $derived([
    ...new Set(panels.map(p => p.data.datawrapperUrl as string).filter(Boolean))
  ] as string[]);
  const currentUrlIndex = $derived(preloadUrls.indexOf(data.datawrapperUrl as string));
</script>

<svelte:window bind:innerHeight />

<Scrollyteller
  {panels}
  onMarker={newData => {
    data = newData;
  }}
  layout={{
    align: 'left',
    mobileVariant: innerHeight < 667 ? 'blocks' : mobileVariant
    // resizeInteractive: true
    // transparentFloat: true
  }}
>
  {#each preloadUrls as url, index (url)}
    <DatawrapperIframe src={url} visible={index <= currentUrlIndex} current={url === data.datawrapperUrl} />
  {/each}
</Scrollyteller>
