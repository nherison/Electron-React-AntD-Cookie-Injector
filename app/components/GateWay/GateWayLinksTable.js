// @flow
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */

import React, { Component } from 'react';
import {
  Layout,
  Table,
  Badge,
  Menu,
  Dropdown,
  Icon,
  Row,
  Col,
  Button,
  Alert,
  Popconfirm,
  Tabs
} from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { remote, ipcRenderer } from 'electron';

import { configureRequestOptions } from 'builder-util-runtime';
import styles from './GateWayLinksTable.scss';

import type {
  LinkInforModel,
  SettingModel,
  PageStatusModel,
  TargetModel,
  RuleInforModel
} from '../../reducers/types';
import {
  getGateWayLinks,
  getGateWayTarget,
  getRules,
  getRevProxyLinkByID,
  updateRule,
  updateGateWayLink
} from '../../actions/links';
import {
  openNotificationWithIcon,
  RuleTable,
  RuleEditDialog
} from '../Extra_components';
import GateWayTargetDataModal from './GateWayTargetDataModal';

const { Header, Footer, Sider, Content } = Layout;
const { BrowserWindow, dialog } = remote;
const { TabPane } = Tabs;

type Props = {
  settings: SettingModel
};

type State = {
  linksArray: LinkInforModel[],
  pagestatus: PageStatusModel,
  linkscount: number,
  pageIndex: number,
  pageSize: number,
  TargetDataModalVisible: boolean,
  selectedLinkID: number,
  isGoingtoModify: boolean,
  visibleRuleEditModal: boolean,
  updatingRuleData: boolean,
  selectedRule: RuleInforModel
};

const columns: ColumnProps<LinkInforModel>[] = [
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id'
  },
  {
    key: 'url',
    title: 'URL',
    dataIndex: 'access_urls',
    render: access_urls => <a className="GateWayLink">{access_urls[0]}</a>
  },
  {
    key: 'shortcode',
    title: 'Short Code',
    dataIndex: 'shortcode'
  },
  {
    key: 'description',
    title: 'Description',
    dataIndex: 'description'
  },
  {
    key: 'created',
    title: 'Created',
    dataIndex: 'created'
  },
  {
    key: 'modified',
    title: 'Modified',
    dataIndex: 'modified'
  },

  {
    key: 'action',
    title: 'Activation',
    render: record => {
      if (record.is_active)
        return (
          <Button className="deactiveButton">
            <Icon type="eye-invisible" />
          </Button>
        );
      return (
        <Button className="deactiveButton">
          <Icon type="eye" />
        </Button>
      );
    }
  }
];

export default class GateWayLinksTable extends Component<Props, State> {
  props: Props;

  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      linksArray: [],
      pagestatus: { status: 0, type: '', description: '' },
      linkscount: 0,
      pageIndex: 0,
      pageSize: 0,
      isGoingtoModify: false,
      TargetDataModalVisible: false,
      selectedLinkID: -1,
      visibleRuleEditModal: false,
      updatingRuleData: false,
      selectedRule: null
    };

    this.onChagePagination = this.onChagePagination.bind(this);
    this.onGateWayLinksTable = this.onGateWayLinksTable.bind(this);
    this.onCloseTargetDataModal = this.onCloseTargetDataModal.bind(this);
    this.onGetAllGateWayLinks = this.onGetAllGateWayLinks.bind(this);
    this.onModifyGateWayLink = this.onModifyGateWayLink.bind(this);
    this.onUpdateRuleData = this.onUpdateRuleData.bind(this);
    this.onShowRuleEditDlg = this.onShowRuleEditDlg.bind(this);
  }

  componentDidMount = async () => {
    console.log('Gateway links table');
    const { pagestatus } = this.state;
    pagestatus.status = 1;
    this.setState({
      pagestatus
    });
    await this.onGetAllGateWayLinks(1);
    pagestatus.status = 0;
    this.setState({
      pagestatus
    });
  };

  onChagePagination = async (page: number, _pageSize: number) => {
    const { pagestatus } = this.state;
    pagestatus.status = 1;
    this.setState({
      pagestatus
    });
    await this.onGetAllGateWayLinks(page);
    pagestatus.status = 0;
    this.setState({
      pagestatus
    });
  };

  onGetAllGateWayLinks = async (curPage: number) => {
    const { settings } = this.props;
    try {
      const linksData = await getGateWayLinks(settings, -1, curPage);

      console.log("I'm GateWay Links Table:", linksData);
      const linkscount: number = linksData.count;
      const pageIndex: number = linksData.current_page;
      const pageSize: number = linksData.page_size;
      const linksArray: Array<LinkInforModel> = [];

      for (let i = 0; i < linksData.results.length; i += 1) {
        const item = linksData.results[i];

        const ruleData = [];

        item.rules.forEach(async rule => {
          const rule_data = await getRules(settings, '', rule.id);
          ruleData.push(rule_data);
        });

        // preparing the Proxy link table data

        const newLinkInforModel: LinkInforModel = {
          id: item.id,
          domains: item.domains,
          charts: item.charts,
          access_urls: item.access_urls,
          created: item.created,
          modified: item.modified,
          is_active: item.is_active,
          shortcode: item.shortcode,
          on_error_redirect: item.on_error_redirect,
          description: item.description,
          notification: item.notification,
          rules: item.rules,
          rule_data: RuleTable(ruleData, this.onShowRuleEditDlg)
        };

        linksArray.push(newLinkInforModel);
      }

      this.setState({
        linkscount,
        pageIndex,
        pageSize,
        linksArray
      });
    } catch (e) {
      const notification: PageStatusModel = {
        status: 0,
        type: 'error',
        description:
          'Something went wrong. Please check your credentials or Charge API URLs in the settings.'
      };
      openNotificationWithIcon(notification);
    }
  };

  onGateWayLinksTable = (record: LinkInforModel, rowIndex: number) => {
    const { settings } = this.props;
    const link_id = record.id;
    return {
      onClick: event => {
        console.log(event.target);
        if (event.target.getAttribute('class') === 'ant-btn deactiveButton') {
          if (record.is_active) {
            const options = {
              buttons: ['Yes', 'No'],
              message: `Confirm deactivation ${link_id} `
            };
            dialog.showMessageBox(options, async response => {
              if (response === 0) {
                this.setState({ isGoingtoModify: true });
                await this.onModifyGateWayLink(link_id, rowIndex);
              }
            });
          } else {
            const options = {
              buttons: ['Yes', 'No'],
              message: `Confirm activation ${link_id} `
            };
            dialog.showMessageBox(options, async response => {
              if (response === 0) {
                this.setState({ isGoingtoModify: true });
                await this.onModifyGateWayLink(link_id, rowIndex, true);
              }
            });
          }
        } else if (
          event.target.getAttribute('class') === 'GateWayLink' ||
          event.target.innerText.includes('http')
        ) {
          event.preventDefault();
        }
        // else if (record.link_detail_status === 0) {
        //   const notification: PageStatusModel = {
        //     status: 0,
        //     type: 'error',
        //     description: `No data available. Link hasn't been accessed`
        //   };
        //   openNotificationWithIcon(notification);
        // }
        else {
          this.setState({
            TargetDataModalVisible: true,
            selectedLinkID: link_id
          });
        }
      },
      onDrag: event => {
        console.log('dragging...');
      }
    };
  };

  onCloseTargetDataModal = () => {
    this.setState({
      TargetDataModalVisible: false,
      selectedLinkID: -1
    });
  };

  onModifyGateWayLink = async (
    removeId: number,
    index: number,
    active: boolean = false
  ) => {
    console.log('deactivating gateway link', removeId, index);
    const { settings } = this.props;
    const { linksArray } = this.state;

    linksArray[index].is_active = active;
    this.setState({ isGoingtoModify: true, linksArray });
    const gateWayLinkData = await updateGateWayLink(
      settings,
      linksArray[index],
      removeId
    );
    this.setState({ isGoingtoModify: false });
    this.forceUpdate();
  };

  // Rule Edit Dialog Action

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
    const {
      pagestatus,
      linksArray,
      pageSize,
      linkscount,
      pageIndex,
      TargetDataModalVisible,
      selectedLinkID,
      isGoingtoModify,
      visibleRuleEditModal,
      updatingRuleData,
      selectedRule
    } = this.state;

    const { settings } = this.props;
    return (
      <Tabs defaultActiveKey="Enabled">
        <TabPane tab="Enabled" key="Enabled">
          <Content>
            <Table
              loading={pagestatus.status === 1 || isGoingtoModify}
              columns={columns}
              dataSource={linksArray.filter(ele => ele.is_active)}
              rowKey={record => record.id}
              pagination={{
                pageSize,
                total: linkscount,
                current: pageIndex,
                onChange: this.onChagePagination
              }}
              expandedRowRender={record => record.rule_data}
              size="small"
              onRow={this.onGateWayLinksTable}
              bordered
              // className={styles.GateWayLinksTable}
            />
          </Content>
        </TabPane>
        <TabPane tab="Disabled" key="Disabled">
          <Content>
            <Table
              loading={pagestatus.status === 1 || isGoingtoModify}
              columns={columns}
              dataSource={linksArray.filter(ele => !ele.is_active)}
              rowKey={record => record.id}
              pagination={{
                pageSize,
                total: linkscount,
                current: pageIndex,
                onChange: this.onChagePagination
              }}
              expandedRowRender={record => record.rule_data}
              size="small"
              onRow={this.onGateWayLinksTable}
              bordered
              // className={styles.GateWayLinksTable}
            />
          </Content>
        </TabPane>
        {TargetDataModalVisible && (
          <GateWayTargetDataModal
            key={selectedLinkID}
            title={`Gateway Link ${selectedLinkID} Target`}
            visible={TargetDataModalVisible}
            onOk={this.onCloseTargetDataModal}
            onCancel={this.onCloseTargetDataModal}
            linkID={selectedLinkID}
            settings={settings}
          />
        )}
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
      </Tabs>
    );
  }
}
