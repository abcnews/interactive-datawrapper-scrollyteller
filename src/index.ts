import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { loadScrollyteller } from '@abcnews/svelte-scrollyteller';
import App from './components/App/App.svelte';
import { mount } from 'svelte';
import DatawrapperIframe from './components/DatawrapperIframe/DatawrapperIframe.svelte';
import LazyIframe from './components/LazyIframe/LazyIframe.svelte';

export type PanelData = {
  datawrapperId: string;
  datawrapperVersion: string;
};

export type PanelDefinition<Data> = {
  data: Data;
  nodes: Element[];
  [key: string]: any;
};

function getDatawrapperId(node) {
  if ((node as HTMLDivElement).dataset.component === 'Anchor' && node.id.match(/^chart/)) {
    const fullId = node.id.slice(5); // remove 'chart' prefix
    const id = fullId.slice(0, 5);
    const version = fullId.slice(5) || '1';
    return { id, version };
  }
  return { id: null, version: null };
}

async function go() {
  await whenOdysseyLoaded;
  // Select all scrollyteller mounts
  const scrollyMounts = selectMounts('scrollytellerNAMEdatawrapper', { markAsUsed: false });

  // Loop through em
  scrollyMounts.forEach(mountEl => {
    const scrollyName = getMountValue(mountEl, 'scrollytellerNAME');
    const scrollyData = loadScrollyteller<PanelData>(scrollyName, 'u-full', 'mark');

    // Pull Datawrapper charts out of the panels and put them in as props
    let datawrapperId = '';
    let datawrapperVersion = '';
    const modifiedPanels = scrollyData.panels.map(panel => {
      const newNodes = panel.nodes.filter(node => {
        const result = getDatawrapperId(node);
        if (result.id) {
          datawrapperId = result.id;
          datawrapperVersion = result.version;
          node.parentElement?.removeChild(node);
          return false;
        }
        return true;
      });
      return {
        ...panel,
        data: { ...panel.data, datawrapperId, datawrapperVersion },
        nodes: newNodes
      };
    });

    mount(App, {
      target: scrollyData.mountNode,
      props: {
        panels: modifiedPanels,
        mobileVariant: scrollyData.mountNode.id.includes('MOBILErows') ? 'rows' : 'blocks'
      }
    });
  });

  document.querySelectorAll<HTMLElement>(`[data-component="Anchor"]`)?.forEach(node => {
    const { id, version } = getDatawrapperId(node);
    if (!id || !node.parentElement) {
      return;
    }
    node.dataset.mount = undefined;
    node.style.padding = '16px';
    const chartUrl = `https://datawrapper.dwcdn.net/${id}/${version}/`;
    mount(LazyIframe, {
      target: node,
      props: {
        src: chartUrl,
        visible: true,
        current: true
      }
    });
  });
}

go();

if (process.env.NODE_ENV === 'development') {
  console.debug(`[interactive-datawrapper-scrollyteller] public path: ${__webpack_public_path__}`);
}
