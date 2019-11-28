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
  Card
} from 'antd';
// eslint-disable-next-line no-unused-vars

import type {
  SettingModel,
  ProxyProvider,
  ProxyServer
} from '../reducers/types';
import { getProxyProviders, getProxyServers } from '../actions/proxy';
import { Requriedalert, openNotificationWithIcon } from './Extra_components';

// eslint-disable-next-line no-unused-vars
const { Header, Sider, Content } = Layout;
const { Option } = Select;

type Props = {
  settings: SettingModel,
  setProxy: (providerID: number, proxyHost: string[]) => void,
  isEnabledProxy: boolean
};

type State = {
  isProviderLoading: boolean,
  isProxiesLoading: boolean,
  providerList: Array<ProxyProvider>,
  proxyList: Array<ProxyServer>,
  selectedProvider: number
  // selectedProxy: ProxyServer
};
const notNone = (value: string) => value !== '';

export default class ProxyList extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      isProviderLoading: false,
      isProxiesLoading: false,
      providerList: [],
      proxyList: [],
      selectedProvider: -1
      // selectedProxy: null
    };

    this.onProviderChange = this.onProviderChange.bind(this);
    this.onProxyChange = this.onProxyChange.bind(this);
  }

  componentDidMount = async () => {
    const { settings } = this.props;
    this.setState({ isProviderLoading: true });

    try {
      const providerList: Array<ProxyProvider> = [];
      const providers = await getProxyProviders(settings);
      providerList.push(...providers.results);

      for (let i = 2; i <= providers.total_pages; i += 1) {
        const newProviders = await getProxyProviders(settings, i);
        providerList.push(...newProviders.results);
      }

      this.setState({ providerList });
    } catch (e) {
      console.log(e);
    }

    this.setState({ isProviderLoading: false });
  };

  onProviderChange = async (value: string) => {
    const { settings } = this.props;
    this.setState({ isProxiesLoading: true, selectedProvider: value });

    try {
      const proxyList: Array<ProxyServer> = [];
      const proxies = await getProxyServers(settings, value);
      proxyList.push(...proxies.results);

      for (let i = 2; i <= proxies.total_pages; i += 1) {
        const newProxies = await getProxyServers(settings, value, i);
        proxyList.push(...newProxies.results);
      }

      this.setState({ proxyList });
    } catch (e) {
      console.log(e);
    }

    this.setState({ isProxiesLoading: false });
  };

  onProxyChange = async (value: string) => {
    const { setProxy } = this.props;
    const { proxyList, selectedProvider } = this.state;
    const selectedProxy = proxyList.find(ele => ele.host === value);
    console.log(selectedProxy);
    setProxy(selectedProvider, selectedProxy);
  };

  render() {
    const { settings } = this.props;
    const {
      isProviderLoading,
      isProxiesLoading,
      providerList,
      proxyList
    } = this.state;

    if (!settings) {
      return (
        <React.Fragment>
          <p>Something Went Wrong</p>
        </React.Fragment>
      );
    }

    return (
      <Card>
        <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
          <Col span={12}>
            <span>Proxy Provider:</span>
            <Select
              id="providerSelector"
              style={{ minWidth: '180px' }}
              loading={isProviderLoading}
              onChange={this.onProviderChange}
            >
              {providerList.map(
                provider =>
                  provider.provider === 'other' && (
                    <Option value={provider.id} key={provider.id}>
                      {provider.name}
                    </Option>
                  )
              )}
            </Select>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>
      </Card>
    );
  }
}
