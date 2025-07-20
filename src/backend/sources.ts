import { targets, makeSimpleProxyFetcher, makeSources, makeStandardFetcher } from "@manga_web/sources";

const proxyBase = 'http://localhost:3000'; //TODO: use proxyurl from settings
const fetcher = makeStandardFetcher(fetch);
const proxiedFetcher = makeSimpleProxyFetcher(proxyBase, fetch);

export const sources = makeSources({
  fetcher,
  proxiedFetcher,
  target: targets.BROWSER,
});


export const availableSources = sources.listSources();
