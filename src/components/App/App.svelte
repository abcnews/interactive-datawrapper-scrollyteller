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
  const uniqueCharts = $derived([
    ...new Set(panels.map(p => `${p.data.datawrapperId}/${p.data.datawrapperVersion}`).filter(s => s !== '/'))
  ]);
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
    {#each uniqueCharts as chartKey}
      {@const [chartId, chartVersion] = chartKey.split('/')}
      <div class="chart">
        <DatawrapperIframe
          src="https://datawrapper.dwcdn.net/{chartId}/{chartVersion}/"
          current={chartId === data.datawrapperId && chartVersion === data.datawrapperVersion}
          visible={uniqueCharts.indexOf(chartKey) <=
            uniqueCharts.indexOf(`${data.datawrapperId}/${data.datawrapperVersion}`)}
        />
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
