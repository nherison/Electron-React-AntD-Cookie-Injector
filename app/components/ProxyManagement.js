/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/jsx-pascal-case */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable import/newline-after-import */
/* eslint-disable default-case */
/* eslint-disable camelcase */
/* eslint-disable object-shorthand */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */

/* eslint-disable lines-between-class-members */
// @flow
import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
// import routes from '../constants/routes';
import {
  Icon,
  Input,
  Button,
  Tooltip,
  Layout,
  Row,
  Col,
  List,
  Select,
  Card,
  Table,
  Radio,
  Badge
} from 'antd';
// eslint-disable-next-line no-unused-vars
import { ColumnProps } from 'antd/lib/table';
import { remote, ipcRenderer } from 'electron';
import type {
  SettingModel,
  ProxyProvider,
  ProxyServer,
  ProxyState,
  ProviderCreationModel,
  ProxyCreationModel
} from '../reducers/types';
import {
  getProxyProviders,
  getProxyServers,
  createProvider,
  createProxy
} from '../actions/proxy';
import {
  Requriedalert,
  openNotificationWithIcon,
  providerCreation,
  proxyCreation
} from './Extra_components';

// eslint-disable-next-line no-unused-vars
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { BrowserWindow, dialog } = remote;

type Props = {
  settings: SettingModel,
  proxyState: ProxyState,
  saveSettingsData: (settings: SettingModel) => void,
  setSelectedProxyProvider: (selectedProviderID: number) => void,
  loadProxies: (settings: SettingModel, selectedProviderID: number) => void
};

type State = {
  // selectedProvider: number
  // selectedProxy: ProxyServer
  providerCreationData: ProviderCreationModel,
  proxyCreationData: ProxyCreationModel
};
const notNone = (value: string) => value !== '';

const columnsProvider: ColumnProps<ProxyProvider>[] = [
  {
    key: 'status',
    title: '',
    width: '50px',
    render: record => (
      <Radio value={record.name} checked={record.is_selected}>
        {record.is_valid_credentials ? (
          <Badge status="success" />
        ) : (
          <Badge status="error" />
        )}
      </Radio>
    )
  },
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name'
  },
  {
    key: 'provider',
    title: 'Provider',
    dataIndex: 'provider'
  },
  {
    key: 'socks_count',
    title: 'Avaliable Socks',
    dataIndex: 'socks_count'
  },
  {
    key: 'action',
    title: '',
    render: record => (
      <Button className="removeProvider">
        <Icon type="stop" />
      </Button>
    )
  }
];
const columnsProxy: ColumnProps<ProxyServer>[] = [
  {
    key: 'host',
    title: 'HOST',
    render: record => (
      <span>
        {record.is_active ? (
          <Badge status="success" />
        ) : (
          <Badge status="error" />
        )}
        {record.host}
      </span>
    )
  },
  {
    key: 'port',
    title: 'PORT',
    dataIndex: 'port'
  },
  {
    key: 'action',
    title: '',
    render: record => (
      <Button className="removeProxy">
        <Icon type="stop" />
      </Button>
    )
  }
];

export default class ProxyManagement extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      providerCreationData: {
        name: '',
        provider: 'other',
        username: '',
        password: ''
      },
      proxyCreationData: {
        host: '',
        port: '8080'
      }
      // selectedProvider: -1
      // selectedProxy: null
    };

    this.onProxyChange = this.onProxyChange.bind(this);

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onCreateProvider = this.onCreateProvider.bind(this);
  }

  componentDidMount = async () => {
    const { settings, proxyState, loadProxyProvider } = this.props;

    loadProxyProvider(settings);
  };

  onProviderTable = (record: ProxyProvider, rowIndex: number) => {
    const { settings, proxyState } = this.props;
    const selectedProviderID = record.id;
    return {
      onClick: event => {
        if (event.target.getAttribute('class') === 'ant-btn removeProvider') {
          const options = {
            buttons: ['Yes', 'No'],
            message: `Are you sure you want to remove ${record.name} Provider?`
          };
          dialog.showMessageBox(options, async response => {
            if (response === 0) {
              console.log('Agreed!');
            }
          });
        } else {
          const { setSelectedProxyProvider, loadProxies } = this.props;
          setSelectedProxyProvider(selectedProviderID);
          loadProxies(settings, selectedProviderID);
        }
      }
    };
  };

  onProxyChange = (record: ProxyServer, rowIndex: number) => {
    // const { settings, proxyState } = this.props;
    // const selectedProviderID = record.id;
    // return {
    //   onClick: event => {
    //     if (event.target.getAttribute('class') === 'ant-btn removeProvider') {
    //       const options = {
    //         buttons: ['Yes', 'No'],
    //         message: `Are you sure you want to remove ${record.name} Provider?`
    //       };
    //       dialog.showMessageBox(options, async response => {
    //         if (response === 0) {
    //           console.log('Agreed!');
    //         }
    //       });
    //     } else {
    //       const { setSelectedProxyProvider, loadProxies } = this.props;
    //       setSelectedProxyProvider(selectedProviderID);
    //       loadProxies(settings, selectedProviderID);
    //     }
    //   }
    // };
  };

  onCreateProvider = async () => {
    const { providerCreationData } = this.state;
    const { settings } = this.props;
    try {
      const data = await createProvider(settings, providerCreationData);
      console.log(data);
      const notify: PageStatusModel = {
        type: 'success',
        description: `Successfully create proxy provider name is ${data.name}`
      };

      providerCreationData.name = '';
      providerCreationData.username = '';
      providerCreationData.password = '';
      this.setState({ providerCreationData });

      const { proxyState, loadProxyProvider } = this.props;

      loadProxyProvider(settings);
      openNotificationWithIcon(notify);
    } catch (e) {
      const notify: PageStatusModel = {
        type: 'error',
        description:
          'Something went wrong. Please check your provider informaton'
      };
      openNotificationWithIcon(notify);
    }
    providerCreationData.name = '';
    providerCreationData.username = '';
    providerCreationData.password = '';
    this.setState({ providerCreationData });
  };

  onCreateProxy = async () => {
    const { proxyCreationData } = this.state;
    const { settings, proxyState, loadProxyProvider } = this.props;
    const { selectedProviderID } = proxyState;
    console.log(
      'On Creation Proxy',
      settings,
      proxyCreationData,
      selectedProviderID
    );
    try {
      const data = await createProxy(
        settings,
        proxyCreationData,
        selectedProviderID
      );
      console.log(data);
      const notify: PageStatusModel = {
        type: 'success',
        description: `Successfully create proxy`
      };

      loadProxyProvider(settings);
      openNotificationWithIcon(notify);
    } catch (e) {
      const notify: PageStatusModel = {
        type: 'error',
        description:
          'Something went wrong. Please check your provider informaton or inpur valid host name or Ip address'
      };
      openNotificationWithIcon(notify);
    }
  };

  onChangeInput = event => {
    const { value, id } = event.target;

    const { providerCreationData, proxyCreationData } = this.state;
    switch (id) {
      case 'providerName':
        providerCreationData.name = value;
        break;
      case 'providerBasic':
        providerCreationData.provider = value;
        break;
      case 'providerUsername':
        providerCreationData.username = value;
        break;
      case 'providerPassword':
        providerCreationData.password = value;
        break;
      case 'proxyHost':
        proxyCreationData.host = value;
        break;
      case 'proxyPort':
        proxyCreationData.port = value;
        break;
      default:
        break;
    }

    this.setState({ providerCreationData, proxyCreationData });
  };

  render() {
    const { settings, proxyState } = this.props;
    const {
      providers,
      proxies,
      isProxyProviderLoading,
      isProxiesLoading
    } = proxyState;

    if (!settings) {
      return (
        <React.Fragment>
          <p>Something Went Wrong</p>
        </React.Fragment>
      );
    }

    const { providerCreationData, proxyCreationData } = this.state;
    return (
      <Layout>
        <Content>
          <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
            <Col span={10}>
              <span>Proxy Provider:</span>
              <Table
                columns={columnsProvider}
                dataSource={providers}
                rowKey={record => record.id}
                size="small"
                pagination={false}
                loading={isProxyProviderLoading}
                onRow={this.onProviderTable}
                title={() =>
                  providerCreation(
                    providerCreationData,
                    this.onCreateProvider,
                    this.onChangeInput
                  )
                }
              />
            </Col>
            <Col span={12} offset={2}>
              <span>Proxy Server:</span>
              <Table
                columns={columnsProxy}
                dataSource={proxies}
                rowKey={record => record.id}
                size="small"
                pagination={false}
                loading={isProxiesLoading}
                expandedRowRender={record => {
                  if (record.ip_address)
                    return (
                      <p style={{ margin: 0, fontSize: '12px' }}>
                        <span
                          style={{
                            color: 'blue',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          IP Address:
                        </span>
                        {record.ip_address.ip_address}
                        <br />
                        <span
                          style={{
                            color: 'blue',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          Country:
                        </span>
                        {record.ip_address.country_code}
                        <br />
                        <span
                          style={{
                            color: 'blue',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          Region:
                        </span>
                        {record.ip_address.region_code}
                        <br />
                        <span
                          style={{
                            color: 'blue',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          City:
                        </span>
                        {record.ip_address.city}
                      </p>
                    );
                  return (
                    <p style={{ margin: 0, fontSize: '12px' }}>
                      <span
                        style={{
                          color: 'blue',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        IP Address:
                      </span>
                      NaN
                    </p>
                  );
                }}
                onRow={this.onProxyChange}
                title={() =>
                  proxyCreation(
                    proxyCreationData,
                    this.onCreateProxy,
                    this.onChangeInput
                  )
                }
              />
            </Col>
            {/* <Col span={12}>
              <span>Proxy Server:</span>
              <Select
                id="proxySelector"
                style={{ minWidth: '180px' }}
                loading={isProxiesLoading}
                onChange={this.onProxyChange}
              >
                {proxyList.map(proxy => (
                  <Option value={proxy.host} key={proxy.host}>
                    {proxy.host}
                  </Option>
                ))}
              </Select>
            </Col> */}
          </Row>
        </Content>
      </Layout>
    );
  }
}
