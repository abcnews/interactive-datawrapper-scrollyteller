import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { loadScrollyteller } from "@abcnews/svelte-scrollyteller";
import App from './components/App/App.svelte';
import { mount } from 'svelte';

export type PanelData = {
  datawrapperUrl: string;
};

export type PanelDefinition<Data> = {
  data: Data;
  nodes: Element[];
  [key: string]: any;
};

let appMountEl: Mount;
let appProps;

whenOdysseyLoaded.then(() => {
  const scrollyData = loadScrollyteller<PanelData>(
    "datawrapper", // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
    "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
    "mark", // Name of marker in CoreMedia eg. for "point" use #point default: #mark
  );

  // Strip out Datawrapper charts
  let datawrapperUrl = '';
  const modifiedPanels = scrollyData.panels.map(panel => {
    const newNodes = panel.nodes.filter(node => {
      const dwIframe = node.querySelector('iframe[src*=datawrapper]');
      if (dwIframe) {
        datawrapperUrl = dwIframe.getAttribute('src') || '';
        return false;
      }
      return true;
    })
    return {
      ...panel,
      data: { ...panel.data, datawrapperUrl },
      nodes: newNodes
    }
  })
  mount(App, {
    target: scrollyData.mountNode,
    props: { panels: modifiedPanels },
  })

});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[interactive-datawrapper-scrollyteller] public path: ${__webpack_public_path__}`);
}
