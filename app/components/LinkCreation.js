// @flow
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */

import React, { Component } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  Select,
  Layout,
  Divider,
  Card,
  Switch,
  Checkbox
} from 'antd';
import './LinkCreation.scss';
import type {
  SettingModel,
  LinkCreationModel,
  PageStatusModel,
  ProxyServer
} from '../reducers/types';
import { Requriedalert, openNotificationWithIcon } from './Extra_components';
import ProxyList from './ProxyList';
import { getDomains } from '../actions/links';

const { Option } = Select;
const { Content } = Layout;

type Props = {
  createRevProxyLink: (payload: LinkCreationModel) => void,
  createTrackingLink: (payload: LinkCreationModel) => void,

  settings: SettingModel,
  pagestatus: PageStatusModel
};
type State = {
  linkCreateionData: LinkCreationModel,
  isValid: boolean,
  isEnableProxy: boolean,
  isTrackingLink: boolean,
  isLoadingDomains: boolean,
  sfqdn: Array<string>,
  lfqdn: Array<string>
};

const notNone = (value: string) => value !== '';
export default class LinkCreation extends Component<Props, State> {
  props: Props;

  state: State;

  //  	 handleOnSubmit() {}
  constructor(props: Props) {
    super(props);
    this.state = {
      linkCreateionData: null,
      isValid: false,
      isTrackingLink: false,
      isEnableProxy: false,
      isLoadingDomains: false,
      sfqdn: [],
      lfqdn: []
    };

    this.onChangeInputField = this.onChangeInputField.bind(this);
    this.onChangeSelectsfqdnField = this.onChangeSelectsfqdnField.bind(this);
    this.onChangeSelectlfqdnField = this.onChangeSelectlfqdnField.bind(this);
    this.onChangeSelectServiceField = this.onChangeSelectServiceField.bind(
      this
    );
    this.onCreateLink = this.onCreateLink.bind(this);
    this.isValid = this.isValid.bind(this);
  }

  componentDidMount = async () => {
    const { settings } = this.props;
    const { sfqdn, lfqdn } = this.state;

    const linkdata: LinkCreationModel = {
      access_token: settings.access_token,
      url_sproot_api: settings.sproot_config.url_sproot_api,
      sfqdn: '',
      lfqdn: '',
      human_red_url: settings.sproot_config.default_human_red_url,
      bot_red_url: settings.sproot_config.default_bot_red_url,
      error_red_url: settings.sproot_config.default_error_red_url,
      shortcode: '',
      service: 'Google',
      description: '',
      ip_address: '',
      autonomous_system_number: '',
      region_code: '',
      country_code: '',
      device_brand: '',
      os_family: '',
      browser_family: '',
      use_deactivate_on_success: false,
      socks_settings: null,
      socks: []
    };
    this.setState({
      linkCreateionData: linkdata,
      isLoadingDomains: true
    });

    try {
      console.log(settings.access_token);
      const domains = await getDomains(settings);
      const pageSize: number = domains.total_pages;

      domains.results.forEach(element => {
        if (element.is_ph) lfqdn.push(element.name);
        if (element.is_gw) sfqdn.push(element.name);
      });

      for (let i = 2; i < pageSize; i += 1) {
        const newDomains = await getDomains(settings, i);
        newDomains.results.forEach(element => {
          if (element.is_ph) lfqdn.push(element.name);
          if (element.is_gw) sfqdn.push(element.name);
        });
      }
    } catch (error) {
      console.log(error);
      openNotificationWithIcon({
        type: 'error',
        status: 0,
        description: `Can not load domains.
			  	Your credentials are not correct or there is a server error.`
      });
    }

    this.setState({
      isLoadingDomains: false,
      sfqdn,
      lfqdn
    });
  };

  componentDidUpdate = () => {
    const { pagestatus } = this.props;
    if (pagestatus.type !== '') openNotificationWithIcon(pagestatus);
  };

  onChangeSelectServiceField = (value: string) => {
    const { linkCreateionData } = this.state;
    linkCreateionData.service = value;
    this.setState({
      linkCreateionData
    });
  };

  onChangeSelectsfqdnField = (value: string) => {
    const { linkCreateionData } = this.state;

    linkCreateionData.sfqdn = value;
    this.setState({
      linkCreateionData
    });
    const flag: boolean = this.isValid();

    this.setState({
      isValid: flag
    });
  };

  onChangeSelectlfqdnField = (value: string) => {
    const { linkCreateionData } = this.state;
    linkCreateionData.lfqdn = value;

    this.setState({
      linkCreateionData
    });
    const flag: boolean = this.isValid();

    this.setState({
      isValid: flag
    });
    console.log(this.state);
  };

  isValid = (): boolean => {
    const { linkCreateionData, isTrackingLink } = this.state;
    return (
      notNone(linkCreateionData.sfqdn) &&
      (isTrackingLink || notNone(linkCreateionData.lfqdn)) &&
      notNone(linkCreateionData.human_red_url) &&
      notNone(linkCreateionData.error_red_url) &&
      notNone(linkCreateionData.description) &&
      notNone(linkCreateionData.rule_name) &&
      notNone(linkCreateionData.bot_red_url)
    );
  };

  onChangeInputField = (event: Event) => {
    const { linkCreateionData } = this.state;
    const { value, id, checked } = event.target;

    switch (id) {
      case 'use_deactivate_on_success':
        linkCreateionData.use_deactivate_on_success = checked;
        break;
      case 'human_red_url':
        linkCreateionData.human_red_url = value;
        break;
      case 'bot_red_url':
        linkCreateionData.bot_red_url = value;
        break;
      case 'error_red_url':
        linkCreateionData.error_red_url = value;
        break;
      case 'shortcode':
        linkCreateionData.shortcode = value;
        break;
      case 'ip_address':
        linkCreateionData.ip_address = value;
        break;
      case 'autonomous_system_number':
        linkCreateionData.autonomous_system_number = value;
        break;
      case 'country_code':
        linkCreateionData.country_code = value;
        break;
      case 'region_code':
        linkCreateionData.region_code = value;
        break;
      case 'device_brand':
        linkCreateionData.device_brand = value;
        break;
      case 'os_family':
        linkCreateionData.os_family = value;
        break;
      case 'browser_family':
        linkCreateionData.browser_family = value;
        break;
      case 'rule_name':
        linkCreateionData.rule_name = value;
        break;
      case 'description':
        linkCreateionData.description = value;
        break;
      default:
        break;
    }
    this.setState({
      linkCreateionData
    });
    const flag: boolean = this.isValid();

    this.setState({
      isValid: flag
    });
  };

  onCreateLink = () => {
    const isValid = this.isValid();
    if (isValid) {
      const { linkCreateionData, isTrackingLink } = this.state;
      console.log(linkCreateionData);
      if (linkCreateionData.access_token === '') {
        openNotificationWithIcon({
          type: 'error',
          status: 0,
          description: `Invalid credentials.
			Please check your username and password in the settings page.`
        });
        return;
      }

      const { createRevProxyLink, createTrackingLink } = this.props;
      if (isTrackingLink) createTrackingLink(linkCreateionData);
      else createRevProxyLink(linkCreateionData);
    }
  };

  setProxy = (providerID: number, proxy: ProxyServer) => {
    const { linkCreateionData } = this.state;
    linkCreateionData.socks_settings = providerID;
    linkCreateionData.socks.push(proxy.host);
    console.log(proxy);
    console.log(linkCreateionData);
    this.setState({ linkCreateionData });
  };

  render() {
    const {
      linkCreateionData,
      isValid,
      isEnableProxy,
      isLoadingDomains,
      sfqdn,
      lfqdn,
      isTrackingLink
    } = this.state;
    const { pagestatus } = this.props;

    if (!linkCreateionData) {
      return (
        <React.Fragment>
          <p>Loading...</p>
        </React.Fragment>
      );
    }

    const curSetting = linkCreateionData;
    const { settings } = this.props;
    return (
      <React.Fragment>
        <Layout>
          <Content>
            {/* Basic conf Card */}
            <span>Is tracking Link</span>
            <Switch
              checked={isTrackingLink}
              onChange={() =>
                this.setState({ isTrackingLink: !isTrackingLink })
              }
            />
            <Card>
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={8} offset={1}>
                  <Row>
                    <Row>
                      <span>Short Domain:</span>
                    </Row>
                    <Select
                      onChange={this.onChangeSelectsfqdnField}
                      id="sfqdn_list"
                      defaultActiveFirstOption
                      style={{ minWidth: '180px' }}
                      loading={isLoadingDomains}
                    >
                      {sfqdn.map(e => (
                        <Option value={e} key={e}>
                          {e}
                        </Option>
                      ))}
                    </Select>
                  </Row>
                  <Requriedalert forId="sfqdn_list" value={curSetting.sfqdn} />
                </Col>
                {!isTrackingLink && (
                  <Col span={10} offset={4}>
                    <Row>
                      <Row>
                        <span>Long Domain:</span>
                      </Row>
                      <Select
                        onChange={this.onChangeSelectlfqdnField}
                        id="lfqdn_list"
                        defaultActiveFirstOption
                        style={{ minWidth: '240px' }}
                        loading={isLoadingDomains}
                      >
                        {lfqdn.map(e => (
                          <Option value={e} key={e}>
                            {e}
                          </Option>
                        ))}
                      </Select>
                    </Row>
                    <Requriedalert
                      forId="lfqdn_list"
                      value={curSetting.lfqdn}
                    />
                  </Col>
                )}
              </Row>

              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={8} offset={1}>
                  <span>Human Redirection URL:</span>
                </Col>
                <Col span={14}>
                  <Input
                    defaultValue="mysite"
                    value={curSetting.human_red_url}
                    id="human_red_url"
                    onChange={this.onChangeInputField}
                  />
                  <Requriedalert
                    forId="human_red_url"
                    value={curSetting.human_red_url}
                  />
                </Col>
              </Row>
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={8} offset={1}>
                  <span>Bot Redirection URL:</span>
                </Col>
                <Col span={14}>
                  <Input
                    defaultValue="mysite"
                    value={curSetting.bot_red_url}
                    id="bot_red_url"
                    onChange={this.onChangeInputField}
                  />
                  <Requriedalert
                    forId="bot_red_url"
                    value={curSetting.bot_red_url}
                  />
                </Col>
              </Row>
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={8} offset={1}>
                  <span>Error Redirection URL:</span>
                </Col>
                <Col span={14}>
                  <Input
                    defaultValue="mysite"
                    value={curSetting.error_red_url}
                    id="error_red_url"
                    onChange={this.onChangeInputField}
                  />
                  <Requriedalert
                    forId="error_red_url"
                    value={curSetting.error_red_url}
                  />
                </Col>
              </Row>
            </Card>
            <Divider />

            <Row>
              {
                /* Left conf Card */
                <Col span={10} offset={1}>
                  <Card>
                    <Row
                      gutter={8}
                      style={{ marginBottom: 16, display: 'flex' }}
                    >
                      {!isTrackingLink && (
                        <Col span={12}>
                          <Row>
                            <span>Service:</span>
                          </Row>
                          <Select
                            onChange={this.onChangeSelectServiceField}
                            defaultValue={curSetting.service}
                          >
                            <Option value="google">Google</Option>
                            <Option value="facebook">Facebook</Option>
                            <Option value="icloud">iCloud</Option>
                            <Option value="instagram">Instagram</Option>
                            <Option value="microsoft">Microsfot</Option>
                            <Option value="twitter">Twitter</Option>
                          </Select>
                        </Col>
                      )}
                      <Col span={12}>
                        <Row>
                          <span>Rule Name:</span>
                        </Row>
                        <Input
                          value={curSetting.rule_name}
                          id="rule_name"
                          onChange={this.onChangeInputField}
                        />
                        <Requriedalert
                          forId="rule_name"
                          value={curSetting.rule_name}
                        />
                      </Col>
                    </Row>
                    <Row
                      gutter={8}
                      style={{ marginBottom: 16, display: 'flex' }}
                    >
                      <Col span={24}>
                        <Row>
                          <span>Description:</span>
                        </Row>
                        <Input
                          value={curSetting.description}
                          id="description"
                          onChange={this.onChangeInputField}
                        />
                        <Requriedalert
                          forId="description"
                          value={curSetting.description}
                        />
                      </Col>
                    </Row>
                    <Row
                      gutter={8}
                      style={{ marginBottom: 16, display: 'flex' }}
                    >
                      <Col span={12}>
                        <Row>
                          <span>Short Code:</span>
                        </Row>
                        <Input
                          value={curSetting.shortcode}
                          id="shortcode"
                          onChange={this.onChangeInputField}
                        />
                      </Col>
                      <Col span={12}>
                        <Row>
                          <span>IP Address:</span>
                        </Row>
                        <Input
                          value={curSetting.ip_address}
                          id="ip_address"
                          onChange={this.onChangeInputField}
                        />
                      </Col>
                    </Row>

                    {/* <Row
                      gutter={8}
                      style={{ marginBottom: 16, display: 'flex' }}
                    >
                      <Col span={24}>
                        <span>Autonomous System Number:</span>
                        <Input
                          value={curSetting.autonomous_system_number}
                          id="autonomous_system_number"
                          onChange={this.onChangeInputField}
                        />
                      </Col>
                    </Row> */}
                    <Row
                      gutter={8}
                      style={{ marginBottom: 16, display: 'flex' }}
                    >
                      <Col span={8}>
                        <Row>
                          <span>Country Code:</span>
                        </Row>
                        <Input
                          value={curSetting.country_code}
                          id="country_code"
                          onChange={this.onChangeInputField}
                        />
                      </Col>
                      <Col span={4} />
                      {!isTrackingLink && (
                        <Col span={12}>
                          <Row>
                            {' '}
                            <span>&nbsp;&nbsp;</span>{' '}
                          </Row>
                          <Row>
                            <span>Deactivate on success: </span>
                            <Checkbox
                              id="use_deactivate_on_success"
                              checked={curSetting.use_deactivate_on_success}
                              onChange={this.onChangeInputField}
                            />
                          </Row>
                        </Col>
                      )}
                      {/* <Col span={10} offset={2}>
                      <Row>
                        <span>Region Code:</span>
                      </Row>
                      <Input
                        value={curSetting.region_code}
                        id="region_code"
                        onChange={this.onChangeInputField}
                      />
                    </Col> */}

                      {/* <Col span={10} offset={1}>
                      <Row>
                        <span>Device Brand:</span>
                      </Row>
                      <Input
                        value={curSetting.device_brand}
                        id="device_brand"
                        onChange={this.onChangeInputField}
                      />
                    </Col>
                    <Col span={10} offset={2}>
                      <Row>
                        <span>Browser Family:</span>
                      </Row>
                      <Input
                        value={curSetting.browser_family}
                        id="browser_family"
                        onChange={this.onChangeInputField}
                      />
                    </Col> 

                      <Col span={12}>
                        <Row>
                          <span>OS Family:</span>
                        </Row>
                        <Input
                          value={curSetting.os_family}
                          id="os_family"
                          onChange={this.onChangeInputField}
                        />
                      </Col> */}
                    </Row>
                  </Card>
                </Col>
              }
              {
                /* Proxy conf Card */
                <Col span={10} offset={2}>
                  <Row justify="space-between" type="flex">
                    <span>Use Proxy</span>
                    <Switch
                      checked={isEnableProxy}
                      onChange={() =>
                        this.setState({ isEnableProxy: !isEnableProxy })
                      }
                    />
                  </Row>
                  {isEnableProxy && (
                    <ProxyList
                      settings={settings}
                      setProxy={this.setProxy}
                      isEnabledProxy={isEnableProxy}
                    />
                  )}
                </Col>
              }
            </Row>

            <Button
              type="primary"
              style={{ float: 'right' }}
              onClick={this.onCreateLink}
              disabled={!isValid}
              loading={pagestatus.status === 1}
            >
              {pagestatus.status === 1 ? 'Creating' : 'Create'}
            </Button>
          </Content>
        </Layout>
      </React.Fragment>
    );
  }
}
