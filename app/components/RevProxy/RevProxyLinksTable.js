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

import styles from './RevProxyLinksTable.scss';

import type {
  LinkInforModel,
  SettingModel,
  PageStatusModel,
  TargetModel,
  RuleInforModel,
  CostModel
} from '../../reducers/types';
import {
  getRevProxyLinksByPage,
  getRevProxyTarget,
  getRules,
  getRevProxyLinkByID,
  updateRevProxyLink,
  updateRule
} from '../../actions/links';
import {
  openNotificationWithIcon,
  RuleTable,
  RuleEditDialog
} from '../Extra_components';
import RevProxyTargetDataModal from './RevProxyTargetDataModal';

const { Header, Footer, Sider, Content } = Layout;
const { BrowserWindow, dialog } = remote;
const { TabPane } = Tabs;

type Props = {
  settings: SettingModel
};
type State = {
  linksArray: LinkInforModel[],
  pagestatus: PageStatusModel,
  isInjecting: boolean,
  linkscount: number,
  pageIndex: number,
  pageSize: number,
  RevProxyTargetDataModalVisible: boolean,
  selectedLinkID: number,
  isGoingtoModify: boolean,
  visibleRuleEditModal: boolean,
  updatingRuleData: boolean,
  selectedRule: RuleInforModel
};

const columns: ColumnProps<LinkInforModel>[] = [
  {
    key: 'containingStatus',
    title: '',
    dataIndex: 'link_detail_status',
    render: link_detail_status => {
      switch (link_detail_status) {
        case 2:
          return <Badge status="success" />;
        case 1:
          return <Badge status="default" />;
        default:
          return <Badge status="error" />;
      }
    }
  },
  {
    key: 'id',
    title: 'ID',
    dataIndex: 'id'
  },
  {
    key: 'service',
    title: 'Service',
    dataIndex: 'service'
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

// check Containing Cookies.....
const isContainCookies = (linkDetail: TargetModel[]) => {
  for (let i = 0; i < linkDetail.length; i += 1)
    if (linkDetail[i].cookies !== null) return true;

  return false;
};

export default class RevProxyLinksTable extends Component<Props, State> {
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
      isInjecting: false,
      isGoingtoModify: false,
      RevProxyTargetDataModalVisible: false,
      selectedLinkID: -1,
      visibleRuleEditModal: false,
      updatingRuleData: false,
      selectedRule: null
    };

    this.onChagePagination = this.onChagePagination.bind(this);
    this.onLinksTable = this.onLinksTable.bind(this);
    this.onCloseRevProxyTargetDataModal = this.onCloseRevProxyTargetDataModal.bind(
      this
    );
    this.onGetAllProxyLinks = this.onGetAllProxyLinks.bind(this);
    this.onInjection = this.onInjection.bind(this);
    this.onUpdateRuleData = this.onUpdateRuleData.bind(this);
    this.onShowRuleEditDlg = this.onShowRuleEditDlg.bind(this);
  }

  componentDidMount = async () => {
    const { pagestatus } = this.state;
    pagestatus.status = 1;
    this.setState({
      pagestatus
    });
    await this.onGetAllProxyLinks(1);
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
    await this.onGetAllProxyLinks(page);
    pagestatus.status = 0;
    this.setState({
      pagestatus
    });
  };

  onGetAllProxyLinks = async (curPage: number) => {
    const { settings } = this.props;
    try {
      const linksData = await getRevProxyLinksByPage(settings, curPage);

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

        // get all link details

        // checking the if the targets are cotainning cookies for each proxy link
        const { count, results } = await getRevProxyTarget(settings, item.id);

        let link_detail_status = 0;
        if (count !== 0) {
          link_detail_status = 1 + isContainCookies(results);
        }

        // preparing the Proxy link table data
        const newLinkInforModel: LinkInforModel = {
          id: item.id,
          service: item.original_host,
          created: item.created,
          modified: item.modified,
          is_active: item.is_active,
          shortcode: item.shortcode,
          description: item.description,
          rules: item.rules,
          rule_data: RuleTable(ruleData, this.onShowRuleEditDlg),
          link_detail_status
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
          'Something went wrong. Please check your credentials and API URLs in the settings.'
      };
      openNotificationWithIcon(notification);
    }
  };

  onLinksTable = (record: LinkInforModel, rowIndex: number) => {
    const { settings } = this.props;
    const link_id = record.id;
    return {
      onClick: event => {
        if (event.target.getAttribute('class') === 'ant-btn deactiveButton') {
          if (record.is_active) {
            const options = {
              buttons: ['Yes', 'No'],
              message: `Confirm deactivation of link ${link_id} `
            };
            dialog.showMessageBox(options, async response => {
              if (response === 0) {
                this.setState({ isGoingtoModify: true });
                await this.onUpdateRevProxyLink(link_id, rowIndex);
              }
            });
          } else {
            const options = {
              buttons: ['Yes', 'No'],
              message: `Confirm activation of link ${link_id} `
            };
            dialog.showMessageBox(options, async response => {
              if (response === 0) {
                this.setState({ isGoingtoModify: true });
                await this.onUpdateRevProxyLink(link_id, rowIndex, true);
              }
            });
          }
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
            RevProxyTargetDataModalVisible: true,
            selectedLinkID: link_id
          });
        }
      },
      onDrag: event => {}
    };
  };

  onCloseRevProxyTargetDataModal = () => {
    this.setState({
      RevProxyTargetDataModalVisible: false,
      selectedLinkID: -1
    });
  };

  onInjection = async (targetData: TargetModel, cost: CostModel) => {
    this.setState({
      isInjecting: true
    });
    const { settings } = this.props;
    const { linksArray, selectedLinkID } = this.state;
    const currenLink: LinkInforModel = linksArray.filter(
      ele => ele.id === selectedLinkID
    )[0];

    console.log('Inject cookies?', targetData);
    ipcRenderer.send(
      'runCommand',
      settings,
      targetData,
      currenLink.service,
      cost ? cost.cost : 0
    );
    this.setState({
      isInjecting: false
    });
  };

  onUpdateRevProxyLink = async (
    removeId: number,
    index: number,
    isActive: boolean = false
  ) => {
    const { settings } = this.props;
    const { linksArray } = this.state;

    linksArray[index].is_active = isActive;
    this.setState({ isGoingtoModify: true, linksArray });
    const proxyLinkData = await getRevProxyLinkByID(settings, removeId);
    const {
      rules,
      domains,
      original_host,
      on_error_redirect,
      is_active,
      shortcode
    } = proxyLinkData;

    console.log(proxyLinkData);
    const newLinkData = {
      rules,
      domains,
      original_host,
      on_error_redirect,
      shortcode,
      is_active: !is_active
    };
    await updateRevProxyLink(settings, newLinkData, removeId);
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
      RevProxyTargetDataModalVisible,
      selectedLinkID,
      isInjecting,
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
              onRow={this.onLinksTable}
              bordered
              className={styles.linksTable}
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
              onRow={this.onLinksTable}
              bordered
              className={styles.linksTable}
            />
          </Content>
        </TabPane>
        {RevProxyTargetDataModalVisible && (
          <RevProxyTargetDataModal
            key={selectedLinkID}
            link={linksArray.filter(ele => ele.id === selectedLinkID)[0]}
            title={`Link ${selectedLinkID} Details`}
            visible={RevProxyTargetDataModalVisible}
            onOk={this.onCloseRevProxyTargetDataModal}
            onCancel={this.onCloseRevProxyTargetDataModal}
            linkID={selectedLinkID}
            onInjection={this.onInjection}
            settings={settings}
            isInjecting={isInjecting}
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
