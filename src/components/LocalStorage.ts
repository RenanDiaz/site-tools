import localforage from "localforage";

localforage.config({
  driver: localforage.INDEXEDDB,
  name: "site-tools",
  storeName: "site-tools",
});

export const LocalStorage = {
  async setItem(key: string, value: any) {
    return localforage.setItem(key, value);
  },
  async getItem(key: string) {
    return localforage.getItem(key);
  },
  async removeItem(key: string) {
    return localforage.removeItem(key);
  },
  async clear() {
    return localforage.clear();
  },
};

const IFRAMER_KEY = "iframer";

interface IFramerProps {
  url?: string;
}

let iframerCurrentValue: IFramerProps = {};

export const iframerLocalStorage = {
  async set(value: IFramerProps) {
    iframerCurrentValue = { ...iframerCurrentValue, ...value };
    return LocalStorage.setItem(IFRAMER_KEY, iframerCurrentValue);
  },
  async get(): Promise<IFramerProps | null> {
    const value = await LocalStorage.getItem(IFRAMER_KEY);
    if (value) iframerCurrentValue = value;
    return value as IFramerProps | null;
  },
};

const URL_COMPOSER_KEY = "urlComposer";

interface SearchParam {
  id: string;
  name: string;
  value: string;
}

interface URLComposerProps {
  protocol?: string;
  domain?: string;
  port?: string;
  path?: string;
  searchParams?: SearchParam[];
}

let urlComposerCurrentValue: URLComposerProps = {};

export const urlComposerLocalStorage = {
  async set(value: URLComposerProps) {
    urlComposerCurrentValue = { ...urlComposerCurrentValue, ...value };
    return LocalStorage.setItem(URL_COMPOSER_KEY, urlComposerCurrentValue);
  },
  async get(): Promise<URLComposerProps | null> {
    const value = await LocalStorage.getItem(URL_COMPOSER_KEY);
    if (value) urlComposerCurrentValue = value;
    return value as URLComposerProps | null;
  },
};
