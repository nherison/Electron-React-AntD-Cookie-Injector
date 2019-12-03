/* eslint-disable react/no-unused-state */
// @flow
/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable flowtype/no-weak-types */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */

import React, { Component } from 'react';
import { ColumnProps } from 'antd/lib/table';
import { remote } from 'electron';
import {
  Layout,
  Icon,
  Row,
  Modal,
  Table,
  Tabs,
  Select,
  Button,
  Spin,
  Pagination,
  List,
  Col
} from 'antd';
import type {
  PageStatusModel,
  TargetModel,
  SettingModel,
  LinkInforModel,
  ChargeEventDetailModel
} from '../../reducers/types';

import {
  getRevProxyTarget,
  getRevProxyLinkByID,
  getRules,
  getGateWayLinks,
  updateGateWayLink,
  updateRule,
  getRevProxyTargetByID
} from '../../actions/links';

import { getChargeEventDetail, charge } from '../../actions/charge';
// import { getCountryName, encodedUrl } from '../utils';
import {
  openNotificationWithIcon,
  RuleTable,
  RuleEditDialog
} from '../Extra_components';

const { TabPane } = Tabs;
const { BrowserWindow, dialog } = remote;

const antIcon = <Icon type="loading" style={{ fontSize: 48 }} spin />;

// ChargeEventModal Modal
type ChargeEventModalProps = {
  visible: boolean,
  eventID: string,
  onClose: any,
  // function
  settings: SettingModel
};

type ChargeEventModalState = {
  pagestatus: PageStatusModel,
  chargeEventDetail: ChargeEventDetailModel
};

const convertText = data => {
  if (!data) return 'Null';
  return data.toString();
};

export default class ChargeEventModal extends Component<
  ChargeEventModalProps,
  ChargeEventModalState
> {
  props: ChargeEventModalProps;

  state: ChargeEventModalState;

  constructor(props: ChargeEventModalProps) {
    super(props);
    this.state = {
      chargeEventDetail: {},
      pagestatus: { status: 1, type: '', description: '' }
    };
  }

  componentDidMount = async () => {
    const { eventID, settings } = this.props;
    try {
      const { pagestatus } = this.state;
      pagestatus.status = 1;
      this.setState({
        pagestatus
      });

      const chargeEventDetail: ChargeEventDetailModel = await getChargeEventDetail(
        settings,
        eventID
      );

      console.log(chargeEventDetail);
      pagestatus.status = 0;
      this.setState({
        chargeEventDetail,
        pagestatus
      });
    } catch (e) {
      const notify: PageStatusModel = {
        status: 0,
        type: 'error',
        description:
          'Something went wrong. Please check your credentials or Sproot API URL in the settings.'
      };
      openNotificationWithIcon(notify);
    }
  };

  render() {
    const { visible, onClose, eventID } = this.props;
    const { pagestatus, chargeEventDetail } = this.state;

    if (!eventID || pagestatus.status === 1 || chargeEventDetail === {}) {
      return (
        <Modal title={`${eventID} event Detail`}>
          <div style={{ textAlign: 'center' }} key="1">
            <Spin indicator={antIcon} />
          </div>
        </Modal>
      );
    }

    const { id, date, type, cost, twofactor } = chargeEventDetail;
    const { link } = chargeEventDetail;
    const { ip_address, user_agent, localisation } = chargeEventDetail.session;

    return (
      <Modal
        title={`${eventID} event Detail`}
        onOk={onClose}
        onCancel={onClose}
        visible={visible}
      >
        <React.Fragment>
          <Tabs tabPosition="left">
            <TabPane tab="Global" key="0">
              <span>ID:</span> {convertText(id)}
              <br />
              <span>Is bot?:</span> {convertText(date)}
              <br />
              <span>Type:</span> {convertText(type)}
              <br />
              <span>Cost:</span> {convertText(cost)}
              <br />
              <span>TwoFactor?:</span> {convertText(twofactor)}
              <br />
              <span>Link ShortCode:</span> {convertText(link.shortcode)}
              <br />
              <span>Service:</span> {convertText(link.original_host)}
            </TabPane>
            <TabPane tab="IP Address" key="1">
              <span>IP Address:</span> {convertText(ip_address.ip_address)}
              <br />
              <span>Country:</span> {convertText(ip_address.country_code)}
              <br />
              <span>Region:</span> {convertText(ip_address.region_code)}
              <br />
              <span>City:</span> {convertText(ip_address.city)}
            </TabPane>
            <TabPane tab="User Agent" key="2">
              <span>Device Family:</span>{' '}
              {convertText(user_agent.device_family)}
              <br />
              <span>OS Family:</span> {convertText(user_agent.os_family)}
              <br />
              <span>Browser Family:</span>{' '}
              {convertText(user_agent.browser_family)}
            </TabPane>
            {localisation && (
              <TabPane tab="Localisation" key="3">
                <span>Timezone</span> {convertText(localisation.timezone)}
                <br />
                <span>BrowserLanguage</span>{' '}
                {convertText(localisation.browserLanguage)}
                <br />
                <span>BrowserPlatform</span>{' '}
                {convertText(localisation.browserPlatform)}
              </TabPane>
            )}
          </Tabs>
        </React.Fragment>
      </Modal>
    );
  }
}
