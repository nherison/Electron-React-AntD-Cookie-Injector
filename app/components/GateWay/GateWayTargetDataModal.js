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
  RuleInforModel
} from '../../reducers/types';
import styles from './GateWayTargetDataModal.scss';

import {
  getGateWayTarget,
  getRevProxyLinkByID,
  updateRule,
  getGateWayTargetByID
} from '../../actions/links';
// import { getCountryName, encodedUrl } from '../utils';
import {
  openNotificationWithIcon,
  RuleTable,
  RuleEditDialog
} from '../Extra_components';

const { TabPane } = Tabs;
const { BrowserWindow, dialog } = remote;

const antIcon = <Icon type="loading" style={{ fontSize: 48 }} spin />;
const columns: ColumnProps<LinkInforModel>[] = [
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'is_active',
    render: is_active => {
      if (is_active) return <span style={{ color: 'lightgreen' }}>Active</span>;
      return <span style={{ color: 'lightred' }}>Inactive</span>;
    }
  },
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id'
  },
  {
    key: 'created',
    title: 'Created',
    dataIndex: 'created'
  },
  {
    key: 'access_urls',
    title: 'URL',
    dataIndex: 'access_urls',
    render: access_urls => <a>{access_urls}</a>
  },
  {
    key: 'on_error_redirect',
    title: 'Error Redirect URL',
    dataIndex: 'on_error_redirect'
  },
  {
    key: 'description',
    title: 'Description',
    dataIndex: 'description'
  },
  {
    key: 'action',
    title: 'Disable',
    render: record => {
      if (record.is_active)
        return (
          <Button className="deactiveButton">
            <Icon type="eye" />
          </Button>
        );
      return (
        <Button className="deactiveButton">
          <Icon type="eye-visible" />
        </Button>
      );
    }
  }
];
// GateWayTargetDataModal Modal
type GateWayTargetDataModalProps = {
  title: string,
  visible: boolean,
  linkID: number,
  // function
  onOk: any,
  onCancel: any,
  settings: SettingModel
};

type GateWayTargetDataModalState = {
  targetDataArray: TargetModel[],
  count: number,
  selectedDetail: number,
  pagestatus: PageStatusModel,
  isGoingtoModify: boolean,
  linksArray: LinkInforModel[],
  visibleRuleEditModal: boolean,
  updatingRuleData: boolean,
  selectedRule: RuleInforModel
};

const convertText = data => {
  if (!data) return 'Null';
  return data.toString();
};

export default class GateWayTargetDataModal extends Component<
  GateWayTargetDataModalProps,
  GateWayTargetDataModalState
> {
  props: GateWayTargetDataModalProps;

  state: GateWayTargetDataModalState;

  constructor(props: GateWayTargetDataModalProps) {
    super(props);
    this.state = {
      targetDataArray: [],
      count: 0,
      selectedDetail: 1,
      pagestatus: { status: 0, type: '', description: '' },
      isGoingtoModify: false,
      linksArray: [],
      visibleRuleEditModal: false,
      updatingRuleData: false,
      selectedRule: {}
    };

    this.onSelectDetail = this.onSelectDetail.bind(this);
    this.onShowRuleEditDlg = this.onShowRuleEditDlg.bind(this);
    this.onUpdateRuleData = this.onUpdateRuleData.bind(this);
  }

  componentDidMount = async () => {
    const { linkID, settings } = this.props;
    try {
      const { pagestatus } = this.state;
      pagestatus.status = 1;
      this.setState({
        pagestatus
      });

      // BEGIN: GET Proxy Detail
      console.log('BEGIN: GET Proxy Target');
      const results = [];
      const simpleTarget = await getGateWayTarget(settings, linkID);

      const { count, total_pages } = simpleTarget;
      for (let i = 0; i < simpleTarget.results.length; i += 1) {
        results.push(
          await getGateWayTargetByID(settings, simpleTarget.results[i].id)
        );
      }

      for (let i = 2; i <= total_pages; i += 1) {
        const newSimpleTarget = await getGateWayTarget(settings, linkID, i);
        for (let j = 0; j < newSimpleTarget.results.length; j += 1) {
          results.push(
            await getGateWayTargetByID(settings, simpleTarget.results[i].id)
          );
        }
      }
      // END: GET Proxy Detail

      pagestatus.status = 0;
      this.setState({
        targetDataArray: results,
        count,
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

  onSelectDetail = (pageNum: number) => {
    this.setState({
      selectedDetail: pageNum
    });
  };

  onShowRuleEditDlg = (record: RuleInforModel, rowIndex: number) => ({
    onClick: event => {
      console.log(record);
      this.setState({ selectedRule: record, visibleRuleEditModal: true });
    }
  });

  onUpdateRuleData = async (newRuleData: RuleInforModel) => {
    const { settings } = this.props;
    console.log(newRuleData);
    this.setState({ updatingRuleData: true });
    try {
      const res = await updateRule(settings, newRuleData);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
    this.setState({ updatingRuleData: false });
  };

  render() {
    const { title, visible, onOk, onCancel, linkID } = this.props;
    const {
      targetDataArray,
      pagestatus,
      count,
      selectedDetail,
      visibleRuleEditModal,
      updatingRuleData,
      selectedRule
    } = this.state;
    console.log(linkID, targetDataArray);
    if (!linkID || pagestatus.status === 1) {
      return (
        <Modal title={title} onOk={onOk} onCancel={onCancel} visible={visible}>
          <div style={{ textAlign: 'center' }} key="1">
            <Spin indicator={antIcon} />
          </div>
        </Modal>
      );
    }

    if (targetDataArray.length === 0) {
      return (
        <Modal
          title={[
            <React.Fragment key="title">
              <Row style={{ fontSize: '24px', color: 'rgb(0, 0, 0, 0.5)' }}>
                {title}
              </Row>
            </React.Fragment>
          ]}
          onOk={onOk}
          onCancel={onCancel}
          visible={visible}
          width="90vw"
          footer={[
            <Button key="back" onClick={onOk}>
              Close
            </Button>
          ]}
        >
          <React.Fragment>
            {visibleRuleEditModal && (
              <RuleEditDialog
                visible={visibleRuleEditModal}
                loading={updatingRuleData}
                ruleData={selectedRule}
                onClose={() => {
                  this.setState({ visibleRuleEditModal: false });
                }}
                onUpdate={this.onUpdateRuleData}
              />
            )}
          </React.Fragment>
        </Modal>
      );
    }

    const { cookies } = targetDataArray[selectedDetail - 1];
    const {
      ip_address,
      user_agent,
      other,
      is_cscript,
      is_bot,
      created,
      modified
    } = targetDataArray[selectedDetail - 1].session;

    return (
      <Modal
        title={[
          <React.Fragment key={selectedDetail}>
            <Row style={{ fontSize: '24px', color: 'rgb(0, 0, 0, 0.5)' }}>
              {title}
            </Row>
            <Row>
              <Pagination
                key={selectedDetail}
                showQuickJumper
                defaultCurrent={selectedDetail}
                total={count}
                pageSize={1}
                onChange={this.onSelectDetail}
                style={{ float: 'right' }}
              />
            </Row>
          </React.Fragment>
        ]}
        onOk={onOk}
        onCancel={onCancel}
        visible={visible}
        width="90vw"
        footer={[
          <Button key="back" onClick={onOk}>
            OK
          </Button>
        ]}
      >
        <React.Fragment>
          {visibleRuleEditModal && (
            <RuleEditDialog
              visible={visibleRuleEditModal}
              loading={updatingRuleData}
              ruleData={selectedRule}
              onClose={() => {
                this.setState({ visibleRuleEditModal: false });
              }}
              onUpdate={this.onUpdateRuleData}
            />
          )}
          <Tabs tabPosition="left">
            <TabPane tab="Global" key="2">
              <span>is_cscript:</span> {convertText(is_cscript)}
              <br />
              <span>is_bot:</span> {convertText(is_bot)}
              <br />
              <span>created:</span> {convertText(created)}
              <br />
              <span>modified:</span> {convertText(modified)}
            </TabPane>
            <TabPane tab="IP Address" key="3">
              <span>IP Address:</span> {convertText(ip_address.ip_address)}
              <br />
              <span>Created Date:</span> {convertText(ip_address.created)}
              <br />
              <span>Modified Date:</span> {convertText(ip_address.modified)}
              <br />
              <span>Country:</span> {convertText(ip_address.country_code)}
              <br />
              <span>Region:</span> {convertText(ip_address.region_code)}
              <br />
              <span>City:</span> {convertText(ip_address.city)}
              <br />
              <span>Zip Code:</span> {convertText(ip_address.zip_code)}
              <br />
              <span>Time Zone:</span> {convertText(ip_address.time_zone)}
              <br />
              <span>Latitude:</span> {convertText(ip_address.latitude)}
              {'        '}
              <span>Longitude:</span> {convertText(ip_address.longitude)}
              <br />
              <span>Metro Code:</span> {convertText(ip_address.metro_code)}
              <br />
              <span>Organization:</span> {convertText(ip_address.organization)}
              <br />
              <span>Autonomous System Organization:</span>{' '}
              {convertText(ip_address.autonomous_system_organization)}
              <br />
              <span>Autonomous System Number:</span>{' '}
              {convertText(ip_address.autonomous_system_number)}
              <br />
              <span>ISP:</span> {convertText(ip_address.isp)}
              <br />
              <span>Blocked?:</span> {convertText(ip_address.is_blocked)}
            </TabPane>
            <TabPane tab="User Agent" key="4">
              <span>User Agent:</span> {convertText(user_agent.user_agent)}
              <br />
              <span>Created Date:</span> {convertText(user_agent.created)}
              <br />
              <span>Modified Date:</span> {convertText(user_agent.modified)}
              <br />
              <span>Bot?:</span> {convertText(user_agent.is_bot)}
              <br />
              <span>Device Brand:</span> {convertText(user_agent.device_brand)}
              <br />
              <span>Device Family:</span>{' '}
              {convertText(user_agent.device_family)}
              <br />
              <span>Device Model:</span> {convertText(user_agent.device_model)}
              <br />
              <span>OS Family:</span> {convertText(user_agent.os_family)}
              <br />
              <span>OS Major:</span> {convertText(user_agent.os_major)}
              <br />
              <span>OS Minor:</span> {convertText(user_agent.os_minor)}
              <br />
              <span>OS Patch:</span> {convertText(user_agent.os_patch)}
              <br />
              <span>OS Patch Minor:</span>{' '}
              {convertText(user_agent.os_patch_minor)}
              <br />
              <span>Browser Family:</span>{' '}
              {convertText(user_agent.browser_family)}
              <br />
              <span>Browser Major:</span>{' '}
              {convertText(user_agent.browser_major)}
              <br />
              <span>Browser Minor:</span>{' '}
              {convertText(user_agent.browser_minor)}
              <br />
              <span>Browser Patch:</span>{' '}
              {convertText(user_agent.browser_patch)}
              <br />
              <span>Mobile?:</span> {convertText(user_agent.is_mobile)}
              <br />
              <span>Tablet?:</span> {convertText(user_agent.is_tablet)}
              <br />
              <span>PC?:</span> {convertText(user_agent.is_pc)}
              <br />
              <span>Touch Capable:</span>{' '}
              {convertText(user_agent.is_touch_capable)}
            </TabPane>
            {other && (
              <TabPane tab="Other" key="6">
                <span>Timezone</span> {convertText(other.timezone)}
                <br />
                <span>BrowserLanguage</span>{' '}
                {convertText(other.browserLanguage)}
                <br />
                <span>BrowserPlatform</span>{' '}
                {convertText(other.browserPlatform)}
                <br />
                <span>BrowserScreenWidth</span>{' '}
                {convertText(other.browserScreenWidth)}
                <br />
                <span>BrowserScreenHeight:</span>{' '}
                {convertText(other.browserScreenHeight)}
              </TabPane>
            )}
          </Tabs>
        </React.Fragment>
      </Modal>
    );
  }
}
