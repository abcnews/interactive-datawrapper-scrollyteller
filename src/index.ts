import { getTier, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from '@abcnews/svelte-scrollyteller';
import App from './components/App/App.svelte';
import { mount } from 'svelte';
import DatawrapperIframe from './components/DatawrapperIframe/DatawrapperIframe.svelte';
import LazyIframe from './components/LazyIframe/LazyIframe.svelte';
import { logger } from './utils/logger';

const MIN_SCREEN_SCROLLY = 350;

export type PanelData = {
  datawrapperId: string;
};

export type PanelDefinition<Data> = {
  data: Data;
  nodes: Element[];
  [key: string]: any;
};

/**
 * Extracts the Datawrapper chart ID from a given DOM element.
 * Assumes the entire suffix after the 'chart' prefix is the chart ID.
 *
 * @param node The DOM element to check.
 * @returns The extracted Datawrapper ID or null if not a matching anchor.
 */
function getDatawrapperId(node: Element) {
  if ((node as HTMLDivElement).dataset.component === 'Anchor' && node.id.match(/^chart/)) {
    const id = node.id.slice(5); // remove 'chart' prefix
    return { id };
  }
  return { id: null };
}

function initScrollyteller() {
  // Select all scrollyteller mounts
  const scrollyMounts = selectMounts('scrollytellerNAMEdatawrapper', { markAsUsed: false });

  // Loop through em
  scrollyMounts.forEach(mountEl => {
    const scrollyName = getMountValue(mountEl, 'scrollytellerNAME');
    const scrollyData = loadScrollyteller<PanelData>(scrollyName, 'u-full', 'mark');

    // Pull Datawrapper charts out of the panels and put them in as props.
    // We only need the chart ID, as version numbers are no longer required on the URL.
    let datawrapperId = '';
    const modifiedPanels = scrollyData.panels.map(panel => {
      const newNodes = panel.nodes.filter(node => {
        const result = getDatawrapperId(node);
        if (result.id) {
          datawrapperId = result.id;
          node.parentElement?.removeChild(node);
          return false;
        }
        return true;
      });
      return {
        ...panel,
        data: { ...panel.data, datawrapperId },
        nodes: newNodes
      };
    });

    mount(App, {
      target: scrollyData.mountNode,
      props: {
        panels: modifiedPanels,
        mobileVariant: 'blocks'
        // mobileVariant: scrollyData.mountNode.id.includes('MOBILErows') ? 'rows' : 'blocks'
      }
    });
  });
}

async function go() {
  await whenOdysseyLoaded;
  // @ts-ignore
  if (window.visualViewport?.height > MIN_SCREEN_SCROLLY) {
    initScrollyteller();
  }

  document.querySelectorAll<HTMLElement>(`[data-component="Anchor"]`)?.forEach(node => {
    const { id } = getDatawrapperId(node);
    if (!id || !node.parentElement) {
      return;
    }
    node.dataset.mount = undefined;
    node.style.padding = '16px';

    // Construct the URL without the version number, letting Datawrapper
    // handle redirection to the latest chart version automatically.
    const chartUrl = `https://datawrapper.dwcdn.net/${id}/?dark=false`;
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
  logger.debug(`[interactive-datawrapper-scrollyteller] public path: ${__webpack_public_path__}`);
}
