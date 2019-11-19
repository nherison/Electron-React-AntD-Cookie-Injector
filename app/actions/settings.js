// @flow
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */

// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import { configConsumerProps } from 'antd/lib/config-provider';
import type { Dispatch, SettingModel } from '../reducers/types';
import { getChargeToken } from './charge';

export const SET_SETTINGS_DATA = 'SET_SETTINGS_DATA';

function setSettingsData(newSetting: SettingModel) {
  return {
    type: SET_SETTINGS_DATA,
    payload: newSetting
  };
}
function getAccessToken(host: string, username: string, password: string) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${host}/auth/token/`, {
        username,
        password
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
const init: boolean = true;
export function saveSettingsData(
  payload: SettingModel,
  neededToken: boolean = init
) {
  const newSettings: SettingModel = payload;
  return async (dispatch: Dispatch) => {
    if (!neededToken) {
      localStorage.setItem('settingObject', JSON.stringify(newSettings));
      return dispatch(setSettingsData(newSettings));
    }
    newSettings.pagestatus.status = 1;
    dispatch(setSettingsData(newSettings));
    try {
      const access_token = await getAccessToken(
        payload.sproot_config.url_sproot_api,
        payload.credential.username,
        payload.credential.password
      );
      newSettings.access_token = access_token.token;
      let charge_token = '';
      try {
        const chargeToken = await getChargeToken(
          payload.extra_urls.url_charge_api,
          payload.credential.username,
          payload.credential.password
        );
        charge_token = chargeToken.token;
      } catch (e) {
        charge_token = '';
      }
      newSettings.charge_token = charge_token;
      if (charge_token === '' && payload.extra_urls.url_charge_api !== '') {
        newSettings.pagestatus = {
          status: 0,
          type: 'error',
          description:
            'Sproot setting has been done but your charge url or credentail is invalid. Please check that again.'
        };
        dispatch(setSettingsData(newSettings));
      } else {
        newSettings.pagestatus = {
          status: 0,
          type: 'success',
          description: `Default configuration set ...`
        };
        dispatch(setSettingsData(newSettings));
      }
    } catch (e) {
      newSettings.access_token = '';
      newSettings.charge_token = '';
      newSettings.pagestatus = {
        status: 0,
        type: 'error',
        description: 'Please check again your credentials and API URLs.'
      };
      dispatch(setSettingsData(newSettings));
    }
    newSettings.pagestatus = {
      status: 0,
      type: '',
      description: ''
    };
    localStorage.setItem('settingObject', JSON.stringify(newSettings));
    return dispatch(setSettingsData(newSettings));
  };
}

export function loadSettingsData() {
  return (dispatch: Dispatch) => {
    // eslint-disable-next-line camelcase
    let local_setting: SettingModel = localStorage.getItem('settingObject');
    if (local_setting === null) {
      local_setting = {
        credential: {
          username: '',
          password: ''
        },
        sproot_config: {
          url_sproot_api: '',
          sfqdn: [],
          lfqdn: [],
          default_human_red_url: '',
          default_bot_red_url: '',
          default_error_red_url: ''
        },
        extra_urls: {
          url_charge_api: '',
          url_extraction_api: ''
        },
        default_proxy_config: {
          proxy_type: '',
          proxy_address: '',
          port: '',
          credential: {
            username: '',
            password: ''
          }
        },
        access_token: '',
        charge_token: '',
        pagestatus: {
          status: 0,
          type: '',
          description: ''
        }
      };
      localStorage.setItem('settingObject', JSON.stringify(local_setting));
    } else {
      local_setting = JSON.parse(local_setting);
    }
    dispatch(setSettingsData(local_setting));
  };
}
