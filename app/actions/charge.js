/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// @flow
// eslint-disable-next-line spaced-comment
//import { remote } from 'electron';
// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import type { TargetModel, SettingModel } from '../reducers/types';

type Header = {
  'Content-Type': 'application/json',
  Authorization: string
};

// Active proxylink by link id
export function charge(settings: SettingModel, targetData: TargetModel) {
  const { extra_urls } = settings;
  const { url_charge_api } = extra_urls;

  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `Bearer ${settings.charge_token}`
      }
    };
    const body = {
      event_type: 'inject',
      session: targetData.session,
      link: {
        shortcode: targetData.link.shortcode,
        original_host: targetData.link.original_host
      },
      twofactor: targetData.is_two_step_verification,
      eksym: targetData.cookies.session_key,
      eksym_pwd: targetData.password.password_session_key
    };

    axios
      .post(`${url_charge_api}/api/charge`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getChargeToken(
  host: string,
  username: string,
  password: string
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        'Content-Type': `application/json`
      }
    };
    axios
      .post(
        `${host}/api/token`,
        {
          username,
          password
        },
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getChargeEvents(settings: SettingModel) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `Bearer ${settings.charge_token}`
      }
    };
    axios
      .get(`${settings.extra_urls.url_charge_api}/api/events`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getChargeEventDetail(settings: SettingModel, eventID: string) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `Bearer ${settings.charge_token}`
      }
    };
    axios
      .get(`${settings.extra_urls.url_charge_api}/api/event/${eventID}`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getCost(settings: SettingModel, targetData: TargetModel) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `Bearer ${settings.charge_token}`
      }
    };
    const body = {
      event_type: 'inject',
      session: targetData.session,
      link: {
        shortcode: targetData.link.shortcode,
        original_host: targetData.link.original_host
      },
      login: targetData.login,
      twofactor: targetData.is_two_step_verification,
      eksym: targetData.cookies.session_key,
      eksym_pwd: targetData.password.password_session_key
    };

    axios
      .post(`${settings.extra_urls.url_charge_api}/api/getcost`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
