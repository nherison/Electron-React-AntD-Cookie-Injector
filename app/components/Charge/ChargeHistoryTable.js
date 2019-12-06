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
import ChargeEventModal from './ChargeEventModal';

import type {
  SettingModel,
  PageStatusModel,
  TargetModel,
  RuleInforModel,
  ChargeEventModel
} from '../../reducers/types';
import { getChargeEvents } from '../../actions/charge';
import {
  openNotificationWithIcon,
  RuleTable,
  RuleEditDialog
} from '../Extra_components';
import RevProxyTargetDataModal from '../RevProxy/RevProxyTargetDataModal';

const { Header, Footer, Sider, Content } = Layout;
const { BrowserWindow, dialog } = remote;
const { TabPane } = Tabs;

type Props = {
  settings: SettingModel
};
type State = {
  chargeEventsArray: ChargeEventModel[],
  pagestatus: PageStatusModel,
  chargeEventsCount: number,
  visibleChargeEventModal: boolean,
  selectedEventID: string
};

const columns: ColumnProps<ChargeEventModel>[] = [
  {
    key: 'type',
    title: 'Type',
    dataIndex: 'type'
  },
  {
    key: 'cost',
    title: 'Cost',
    dataIndex: 'cost'
  },
  {
    key: 'service',
    title: 'Service',
    dataIndex: 'service'
  },
  {
    key: 'shortcode',
    title: 'Shortcode',
    dataIndex: 'shortcode'
  },
  {
    key: 'date',
    title: 'Date',
    dataIndex: 'date'
  }
];

export default class ChargeHistoryTable extends Component<Props, State> {
  props: Props;

  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      chargeEventsArray: [],
      pagestatus: { status: 0, type: '', description: '' },
      chargeEventsCount: 0,
      visibleChargeEventModal: false,
      selectedEventID: ''
    };

    this.onEventsTable = this.onEventsTable.bind(this);
    this.onGetChargeEvents = this.onGetChargeEvents.bind(this);
    this.onCloseChargeEventModal = this.onCloseChargeEventModal.bind(this);
  }

  componentDidMount = async () => {
    const { pagestatus } = this.state;
    pagestatus.status = 1;
    this.setState({
      pagestatus
    });
    await this.onGetChargeEvents();
    pagestatus.status = 0;
    this.setState({
      pagestatus
    });
  };

  onGetChargeEvents = async () => {
    const { settings } = this.props;
    try {
      const { count, events } = await getChargeEvents(settings);

      const chargeEventsCount: number = count;
      const chargeEventsArray: Array<ChargeEventModel> = events;

      // count, events

      this.setState({
        chargeEventsArray,
        chargeEventsCount
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

  onEventsTable = (record: ChargeEventModel, rowIndex: number) => {
    const { settings } = this.props;
    const eventID = record.id;

    return {
      onClick: event => {
        this.setState({
          visibleChargeEventModal: true,
          selectedEventID: eventID
        });
      },
      onDrag: event => {}
    };
  };

  onCloseChargeEventModal = () => {
    this.setState({
      visibleChargeEventModal: false
    });
  };

  render() {
    const {
      chargeEventsArray,
      pagestatus,
      chargeEventsCount,
      visibleChargeEventModal,
      selectedEventID
    } = this.state;
    const { settings } = this.props;
    console.log('visibleChargeEventModal', visibleChargeEventModal);
    return (
      <Layout>
        <Content>
          <Table
            loading={pagestatus.status === 1}
            columns={columns}
            dataSource={chargeEventsArray}
            rowKey={record => record.id}
            size="small"
            onRow={this.onEventsTable}
            bordered
          />
        </Content>
        {visibleChargeEventModal && (
          <ChargeEventModal
            onClose={this.onCloseChargeEventModal}
            eventID={selectedEventID}
            settings={settings}
            visible={visibleChargeEventModal}
          />
        )}
      </Layout>
    );
  }
}
