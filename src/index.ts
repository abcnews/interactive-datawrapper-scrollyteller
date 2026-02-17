import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { loadScrollyteller } from '@abcnews/svelte-scrollyteller';
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

// Attempt to stop datawrapper charts loading any further.
// This doesn't shift the needle that much compared to loading=lazy
const IFRAME_CLASS = 'interactive-datawrapper-scrollyteller';
document.querySelectorAll<HTMLIFrameElement>('iframe[src*=datawrapper]').forEach(iframe => {
  iframe.dataset.src = iframe.src;
  iframe.src = 'about:blank';
  iframe.classList.add(IFRAME_CLASS);
});

whenOdysseyLoaded.then(() => {
  // Select all scrollyteller mounts
  const scrollyMounts = selectMounts('scrollytellerNAMEdatawrapper', { markAsUsed: false });

  // Loop through em
  scrollyMounts.forEach(mountEl => {
    const scrollyName = getMountValue(mountEl, 'scrollytellerNAME');
    const scrollyData = loadScrollyteller<PanelData>(scrollyName, 'u-full', 'mark');

    // Pull Datawrapper charts out of the panels and put them in as props
    let datawrapperUrl = '';
    const modifiedPanels = scrollyData.panels.map(panel => {
      const newNodes = panel.nodes.filter(node => {
        const dwIframe = node.querySelector<HTMLIFrameElement>(`iframe.${IFRAME_CLASS}`);
        if (dwIframe) {
          datawrapperUrl = dwIframe.dataset.src || '';
          return false;
        }
        return true;
      });
      return {
        ...panel,
        data: { ...panel.data, datawrapperUrl },
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
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[interactive-datawrapper-scrollyteller] public path: ${__webpack_public_path__}`);
}
