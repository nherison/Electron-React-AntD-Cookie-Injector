/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// @flow
// eslint-disable-next-line spaced-comment
//import { remote } from 'electron';
// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import type {
  Dispatch,
  SettingModel,
  ProxyProvider,
  ProxyServer,
  PageStatusModel,
  ProviderCreationModel,
  ProxyCreationModel
} from '../reducers/types';

export const SET_PROXY_PROVIDER = 'SET_RPXY_PROVIDER';
export const SET_PROXIES = 'SET_PROXIES';

export const SET_PROXY_PROVIDER_LOADING = 'SET_RPXY_PROVIDER_LOADING';
export const SET_PROXIES_LOADING = 'SET_PROXIES_LOADING';

export const SET_SELECTED_PROXY_PROVIDER = 'SET_SELECTED_PROXY_PROVIDER';
type Header = {
  'Content-Type': 'application/json',
  Authorization: string
};

function _setProxyProvider(newProviders: Array<ProxyProvider>) {
  return {
    type: SET_PROXY_PROVIDER,
    payload: newProviders
  };
}

function _setProxies(newProxies: Array<ProxyServer>) {
  return {
    type: SET_PROXIES,
    payload: newProxies
  };
}

function _setSelectedProxyProvider(selectedProviderID: number) {
  return {
    type: SET_SELECTED_PROXY_PROVIDER,
    payload: selectedProviderID
  };
}

export function getProxyProviders(settings: SettingModel, pageID: number = 1) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageID
      }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/socks/settings/`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getProxyServers(
  settings: SettingModel,
  providerId: number,
  pageID: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageID
      }
    };

    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/socks/${providerId}/list`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function loadProxyProvider(settings: SettingModel) {
  return async (dispatch: Dispatch) => {
    dispatch({ type: SET_PROXY_PROVIDER_LOADING });

    try {
      const providerList: Array<ProxyProvider> = [];
      const providers = await getProxyProviders(settings);
      providerList.push(...providers.results);

      for (let i = 2; i <= providers.total_pages; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const newProviders = await getProxyProviders(settings, i);
        providerList.push(...newProviders.results);
      }

      dispatch(_setProxyProvider(providerList));
    } catch (e) {
      console.log(e);
    }
  };
}
export function setSelectedProxyProvider(selectedProviderID: number) {
  return async (dispatch: Dispatch) => {
    dispatch(_setSelectedProxyProvider(selectedProviderID));
  };
}

export function loadProxies(
  settings: SettingModel,
  selectedProviderID: number
) {
  return async (dispatch: Dispatch) => {
    dispatch({ type: SET_PROXIES_LOADING });
    try {
      const proxyList: Array<ProxyServer> = [];
      const proxies = await getProxyServers(settings, selectedProviderID);
      proxyList.push(...proxies.results);

      //   for (let i = 2; i <= proxies.total_pages; i += 1) {
      //     // eslint-disable-next-line no-await-in-loop
      //     const newProxies = await getProxyServers(
      //       settings,
      //       selectedProviderID,
      //       i
      //     );
      //     proxyList.push(...newProxies.results);
      //   }

      dispatch(_setProxies(proxyList));
    } catch (e) {
      console.log(e);
    }
  };
}

export function createProvider(
  settings: SettingModel,
  providerCreationData: ProviderCreationModel
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${settings.access_token}`
      }
    };

    axios
      .post(
        `${settings.sproot_config.url_sproot_api}/socks/settings/`,
        providerCreationData,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function createProxy(
  settings: SettingModel,
  proxyCreationData: ProxyCreationModel,
  providerID: number
) {
  // \d+.\d+.\d+.\d+

  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${settings.access_token}`
      }
    };

    axios
      .post(
        `${settings.sproot_config.url_sproot_api}/socks/${providerID}/list/`,
        proxyCreationData,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// return async (dispatch: Dispatch) => {
//     dispatch(setSettingsData(newSettings));
//     try {
//       dispatch(setSettingsData(newSettings));
//     } catch (e) {
//       newSettings.access_token = '';
//       newSettings.pagestatus = {
//         status: 0,
//         type: 'error',
//         description: 'Please check again your Credentials and Sproot API URL.'
//       };
//       dispatch(setSettingsData(newSettings));
//     }
//     newSettings.pagestatus = {
//       status: 0,
//       type: '',
//       description: ''
//     };
//     localStorage.setItem('settingObject', JSON.stringify(newSettings));
//     return dispatch(setSettingsData(newSettings));
//   };
