<script lang="ts">
  import Scrollyteller from '@abcnews/svelte-scrollyteller';
  import type { PanelDefinition, PanelData } from '../../index';
  import { untrack } from 'svelte';
  import DatawrapperWithScript from '../DatawrapperWithScript/DatawrapperWithScript.svelte';
  import DatawrapperIframe from '../DatawrapperIframe/DatawrapperIframe.svelte';

  interface Props {
    panels: PanelDefinition<PanelData>[];
    mobileVariant?: 'blocks' | 'rows';
  }

  let { panels, mobileVariant = 'rows' }: Props = $props();
  let data = $state(untrack(() => panels[0]?.data as PanelData));
  let innerHeight = $state(window.innerHeight);
  const uniqueIDs = $derived([...new Set(panels.map(p => p.data.datawrapperId as string).filter(Boolean))] as string[]);
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
  <div class="charts">
    {#each uniqueIDs as datawrapperId}
      <div class="chart">
        {#key datawrapperId}
          <DatawrapperIframe
            src="https://datawrapper.dwcdn.net/{datawrapperId}/1/"
            current={datawrapperId === data.datawrapperId}
            visible={uniqueIDs.indexOf(datawrapperId) <= uniqueIDs.indexOf(data.datawrapperId)}
          />
        {/key}
      </div>
    {/each}
  </div>
</Scrollyteller>

<style lang="scss">
  .chart {
    width: 100%;
    height: 100%;
  }
</style>
