/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
// @flow
// eslint-disable-next-line spaced-comment
//import { remote } from 'electron';
// eslint-disable-next-line import/newline-after-import
import axios from 'axios';
import { clipboard } from 'electron';
import type {
  Dispatch,
  SettingModel,
  LinkCreationModel,
  PageStatusModel,
  RuleInforModel,
  LinkInforModel
} from '../reducers/types';

export const SET_CREATE_LINK = 'SET_CREATE_LINK';

type Header = {
  'Content-Type': 'application/json',
  Authorization: string
};
// action
function setLinkSuccess(pagestatus: PageStatusModel) {
  return {
    type: SET_CREATE_LINK,
    payload: pagestatus
  };
}

// API

// Get RevProxy Link APIs
export function getRevProxyLinkByID(settings: SettingModel, linkID: number) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/revproxy/links/${linkID}`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getRevProxyLinksByPage(
  settings: SettingModel,
  pageIndex: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageIndex
      }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/revproxy/links/`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Modify proxylink by link id
export function updateRevProxyLink(
  settings: SettingModel,
  newlinkData: any,
  link_id: number
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .put(
        `${settings.sproot_config.url_sproot_api}/revproxy/links/${link_id}/`,
        newlinkData,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Begin: Get RevProxyTarge Targets
export function getRevProxyTarget(
  settings: SettingModel,
  link_id: number = -1,
  page_id: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params:
        link_id === -1
          ? { page: page_id }
          : {
              link: link_id,
              page: page_id
            }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/revproxy/targets`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getRevProxyTargetByID(
  settings: SettingModel,
  targetID: string
) {
  console.log(targetID);
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .get(
        `${
          settings.sproot_config.url_sproot_api
        }/revproxy/targets/${targetID}/`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// End: Get RevProxyTarge Targets

// Rules Operation:
//	Access_url: get rule by Access_urL
//	Rule_id: get rule by ID
export function getRules(
  settings: SettingModel,
  access_urls: string = '',
  rule_id: string = ''
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        use_human_redirect: encodeURI(access_urls)
      }
    };
    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/common/rules/${rule_id}`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// update Rule
export function updateRule(settings: SettingModel, ruleData: RuleInforModel) {
  const { id } = ruleData;
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    const body = {
      ip_address: ruleData.ip_address,
      name: ruleData.name,
      autonomous_system_number: ruleData.autonomous_system_number,
      country_code: ruleData.country_code,
      region_code: ruleData.region_code,
      device_brand: ruleData.device_brand,
      os_family: ruleData.os_family,
      browser_family: ruleData.browser_family,
      is_mobile: ruleData.is_mobile,
      is_pc: ruleData.is_pc,
      use_human_redirect: ruleData.use_human_redirect,
      use_bot_redirect: ruleData.use_bot_redirect
    };
    console.log('new rule data', body);
    axios
      .put(
        `${settings.sproot_config.url_sproot_api}/common/rules/${id}`,
        body,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// End: Rules Operation

// Get GateWayLink By Rule ID
export function getGateWayLinks(
  settings: SettingModel,
  rule_id: number = -1,
  page_id: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params:
        rule_id !== -1
          ? {
              page: page_id,
              rules: rule_id
            }
          : { page: page_id }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/gateway/links/`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// BEGIN: Link Creation Process POST 1~4
function createRuleForRevProxyLink(
  linkCreateionData: LinkCreationModel,
  config
) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${linkCreateionData.url_sproot_api}/common/rules/`,
        {
          description: linkCreateionData.description,
          is_mobile: true,
          is_pc: true,
          sfqdn: linkCreateionData.sfqdn,
          lfqdn: linkCreateionData.lfqdn,
          use_human_redirect: linkCreateionData.human_red_url,
          use_bot_redirect: linkCreateionData.bot_red_url,
          shortcode: linkCreateionData.shortcode,
          ip_address: linkCreateionData.ip_address,
          autonomous_system_number: linkCreateionData.autonomous_system_number,
          country_code: linkCreateionData.country_code,
          region_code: linkCreateionData.region_code,
          device_brand: linkCreateionData.device_brand,
          os_family: linkCreateionData.os_family,
          browser_family: linkCreateionData.browser_family,
          use_deactivate_on_success:
            linkCreateionData.use_deactivate_on_success,
          name: linkCreateionData.rule_name
        },
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function _createRevProxyLink(
  linkCreateionData: LinkCreationModel,
  config: any,
  _id: number
) {
  return new Promise((resolve, reject) => {
    const body = {
      rules: [
        {
          id: _id
        }
      ],
      domains: [
        {
          name: linkCreateionData.lfqdn
        }
      ],
      original_host: linkCreateionData.service.toLowerCase(),
      use_proxies: true,
      use_deactivate_on_success: linkCreateionData.use_deactivate_on_success,
      on_error_redirect: linkCreateionData.error_red_url,
      is_active: true,
      socks_settings: linkCreateionData.socks_settings,
      socks: linkCreateionData.socks,
      shortcode: linkCreateionData.shortcode,
      description: linkCreateionData.description,
      notification: false
    };
    axios
      .post(`${linkCreateionData.url_sproot_api}/revproxy/links/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function createRuleForGateWayLink(
  linkCreateionData: LinkCreationModel,
  config,
  human_redirect: string,
  trackingLink: boolean = false
) {
  return new Promise((resolve, reject) => {
    const body = {
      description: linkCreateionData.description,
      is_mobile: true,
      is_pc: true,
      use_human_redirect: trackingLink
        ? linkCreateionData.human_red_url
        : human_redirect,
      use_bot_redirect: linkCreateionData.bot_red_url,
      ip_address: linkCreateionData.ip_address,
      autonomous_system_number: linkCreateionData.autonomous_system_number,
      country_code: linkCreateionData.country_code,
      region_code: linkCreateionData.region_code,
      device_brand: linkCreateionData.device_brand,
      os_family: linkCreateionData.os_family,
      browser_family: linkCreateionData.browser_family,
      name: linkCreateionData.rule_name
    };

    axios
      .post(`${linkCreateionData.url_sproot_api}/common/rules/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

function createGateWayLink(
  linkCreateionData: LinkCreationModel,
  config,
  _id: number
) {
  return new Promise((resolve, reject) => {
    const body = {
      rules: [
        {
          id: _id
        }
      ],
      domains: [
        {
          name: linkCreateionData.sfqdn
        }
      ],
      on_error_redirect: linkCreateionData.error_red_url,
      description: linkCreateionData.description,
      notification: false,
      shortcode: linkCreateionData.shortcode
    };

    axios
      .post(`${linkCreateionData.url_sproot_api}/gateway/links/`, body, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
// END: Link Creation Process

// Create Link Action
export function createRevProxyLink(payload: LinkCreationModel) {
  const linkCreateionData = payload;
  return async (dispatch: Dispatch) => {
    dispatch(setLinkSuccess({ status: 1, type: '', description: '' }));
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${linkCreateionData.access_token}`
        }
      };
      console.log('going to createRuleForRevProxyLink', linkCreateionData);
      const res1 = await createRuleForRevProxyLink(linkCreateionData, config);
      console.log('going to createRevProxyLink');

      const res2 = await _createRevProxyLink(
        linkCreateionData,
        config,
        res1.id
      );
      console.log('going to createRuleForGateWayLink');
      const res3 = await createRuleForGateWayLink(
        linkCreateionData,
        config,
        res2.access_urls[0]
      );
      console.log('going to createGateWayLink');
      const res4 = await createGateWayLink(linkCreateionData, config, res3.id);
      clipboard.writeText(res4.access_urls[0]);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'success',
          description: `Link created & Copied to Clipboard. ${
            res4.access_urls[0]
          }`
        })
      );
    } catch (e) {
      console.log(e.body);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'error',
          description:
            'Please check that you provided all the domains and URLs.'
        })
      );
    }
    return dispatch(
      setLinkSuccess({
        status: 0,
        type: '',
        description: ''
      })
    );
  };
}

export function createTrackingLink(payload: LinkCreationModel) {
  const linkCreateionData = payload;
  return async (dispatch: Dispatch) => {
    dispatch(setLinkSuccess({ status: 1, type: '', description: '' }));
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${linkCreateionData.access_token}`
        }
      };
      console.log('going to createRuleForGateWayLink');
      const res3 = await createRuleForGateWayLink(
        linkCreateionData,
        config,
        '',
        true
      );
      console.log('going to createGateWayLink');
      const res4 = await createGateWayLink(linkCreateionData, config, res3.id);
      clipboard.writeText(res4.access_urls[0]);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'success',
          description: `Tracking link created & Copied to Clipboard. ${
            res4.access_urls[0]
          }`
        })
      );
    } catch (e) {
      console.log(e.body);
      dispatch(
        setLinkSuccess({
          status: 0,
          type: 'error',
          description:
            'Please check that you provided all the domains and URLs.'
        })
      );
    }
    return dispatch(
      setLinkSuccess({
        status: 0,
        type: '',
        description: ''
      })
    );
  };
}

export function getDomains(settings: SettingModel, pageIndex: number = 1) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params: {
        page: pageIndex
      }
    };

    axios
      .get(`${settings.sproot_config.url_sproot_api}/geoloc/domains`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

// Begin: Get RevProxyTarge Targets
export function getGateWayTarget(
  settings: SettingModel,
  link_id: number = -1,
  page_id: number = 1
) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      },
      params:
        link_id === -1
          ? { page: page_id }
          : {
              link: link_id,
              page: page_id
            }
    };
    axios
      .get(`${settings.sproot_config.url_sproot_api}/gateway/targets`, config)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function getGateWayTargetByID(settings: SettingModel, targetID: string) {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .get(
        `${settings.sproot_config.url_sproot_api}/gateway/targets/${targetID}/`,
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}

export function updateGateWayLink(
  settings: SettingModel,
  newlinkData: LinkInforModel,
  link_id: number
) {
  const {
    id,
    charts,
    rules,
    domains,
    access_urls,
    shortcode,
    on_error_redirect,
    description,
    notification,
    is_active
  } = newlinkData;
  console.log({
    id,
    charts,
    rules,
    domains,
    access_urls,
    shortcode,
    on_error_redirect,
    description,
    notification,
    is_active
  });
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        Authorization: `JWT ${settings.access_token}`
      }
    };
    axios
      .put(
        `${settings.sproot_config.url_sproot_api}/gateway/links/${link_id}/`,
        {
          id,
          charts,
          rules,
          domains,
          access_urls,
          shortcode,
          on_error_redirect,
          description,
          notification,
          is_active
        },
        config
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
}
// End: Get RevProxyTarge Targets
