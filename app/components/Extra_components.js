/* eslint-disable react/jsx-boolean-value */
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
import {
  Layout,
  Badge,
  Menu,
  Dropdown,
  Icon,
  Row,
  Col,
  Modal,
  notification,
  Table,
  Tabs,
  Select,
  Button,
  Spin,
  Pagination,
  Popconfirm,
  Input,
  Card,
  Checkbox
} from 'antd';
import type {
  PageStatusModel,
  RuleInforModel,
  TargetModel,
  SettingModel,
  ProviderCreationModel,
  ProxyCreationModel
} from '../reducers/types';
import './Extra_components.scss';
import { getRevProxyLinkByID } from '../actions/links';
import { getCountryName, encodedUrl } from '../utils';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const antIcon = <Icon type="loading" style={{ fontSize: 48 }} spin />;
/* eslint-disable jsx-a11y/label-has-for */
// validation component
type AlertProps = {
  forId: string,
  value: string
};

export const Requriedalert = (props: AlertProps) => {
  let labeltext: string = '';
  const { forId, value } = props;
  if (value === '' || !value) labeltext = '*Required';
  return (
    <label htmlFor={forId} style={{ color: 'red' }}>
      {labeltext}
    </label>
  );
};

export const openNotificationWithIcon = (props: PageStatusModel) => {
  const { type, message, description } = props;
  let msg: string = type === 'success' ? 'Congrats!' : 'Failure!';

  if (message) msg = message;

  notification[type]({
    message: msg,
    description,
    duration: 0,
    style: {
      width: '500px',
      right: '100px'
    }
  });
};

const excolumns: ColumnProps<RuleInforModel>[] = [
  {
    title: 'IP_ADDRESS',
    dataIndex: 'ip_address',
    key: 'ip_address',
    render: ip_address => {
      let text: string = ip_address;
      if (!ip_address || ip_address === '') text = 'NULL';
      return <span className="table-operation">{text} </span>;
    }
  },
  //   {
  //     title: 'System Number',
  //     dataIndex: 'autonomous_system_number',
  //     key: 'autonomous_system_number',
  //     render: autonomous_system_number => {
  //       let text: string = autonomous_system_number;
  //       if (!autonomous_system_number || autonomous_system_number === '')
  //         text = 'NULL';
  //       return <span className="table-operation">{text} </span>;
  //     }
  //   },
  {
    title: 'Country',
    dataIndex: 'country_code',
    key: 'country_code',
    render: country_code => (
      <span className="table-operation">{getCountryName(country_code)}</span>
    )
  },
  //   {
  //     title: 'Regoin Code',
  //     dataIndex: 'region_code',
  //     key: 'region_code',
  //     render: region_code => {
  //       let text: string = region_code;
  //       if (!region_code || region_code === '') text = 'NULL';
  //       return <span className="table-operation">{text} </span>;
  //     }
  //   },
  //   {
  //     title: 'Device Brand',
  //     dataIndex: 'device_brand',
  //     key: 'device_brand',
  //     render: device_brand => {
  //       let text: string = device_brand;
  //       if (!device_brand || device_brand === '') text = 'NULL';
  //       return <span className="table-operation">{text} </span>;
  //     }
  //   },
  // {
  //   title: 'OS Family',
  //   dataIndex: 'os_family',
  //   key: 'os_family',
  //   render: os_family => {
  //     let text: string = os_family;
  //     if (!os_family || os_family === '') text = 'NULL';
  //     return <span className="table-operation">{text} </span>;
  //   }
  // },
  //   {
  //     title: 'Browser Family',
  //     dataIndex: 'browser_family',
  //     key: 'browser_family',
  //     render: browser_family => {
  //       let text: string = browser_family;
  //       if (!browser_family || browser_family === '') text = 'NULL';
  //       return <span className="table-operation">{text} </span>;
  //     }
  //   },
  {
    title: 'Mobile',
    dataIndex: 'is_mobile',
    key: 'is_mobile',
    render: is_mobile => {
      let text: string;
      if (is_mobile === true) text = 'True';
      else text = 'False';
      return <span className="table-operation">{text} </span>;
    }
  },
  {
    title: 'PC',
    dataIndex: 'is_pc',
    key: 'is_pc',
    render: is_pc => {
      let text: string;
      if (is_pc === true) text = 'True';
      else text = 'False';
      return <span className="table-operation">{text} </span>;
    }
  },
  {
    title: 'Human Redirect URL',
    dataIndex: 'use_human_redirect',
    key: 'use_human_redirect',
    render: use_human_redirect => {
      let text: string = use_human_redirect;
      if (!use_human_redirect || use_human_redirect === '') text = 'NULL';
      return <a className="table-operation">{text} </a>;
    }
  },
  {
    title: 'Bot Redirect URL',
    dataIndex: 'use_bot_redirect',
    key: 'use_bot_redirect',
    render: use_bot_redirect => {
      let text: string = use_bot_redirect;
      if (!use_bot_redirect || use_bot_redirect === '') text = 'NULL';
      return <a className="table-operation">{text} </a>;
    }
  },
  {
    title: 'Created Date',
    dataIndex: 'created',
    key: 'created',
    render: created => {
      let text: string = created;
      if (!created || created === '') text = 'NULL';
      return <span className="table-operation">{text} </span>;
    }
  },
  {
    title: 'Modified Date',
    dataIndex: 'modified',
    key: 'modified',
    render: modified => {
      let text: string = modified;
      if (!modified || modified === '') text = 'NULL';
      return <span className="table-operation">{text} </span>;
    }
  }
];

export const RuleTable = (
  data: RuleInforModel[],
  onEditRule: any = () => {},
  width: string = 'calc(100vw - 320px)'
) => (
  <Layout>
    <Content>
      <Col style={{ overflow: 'auto', width }}>
        <Table
          columns={excolumns}
          dataSource={data}
          pagination={false}
          size="small"
          scroll={{ x: '100%' }}
          rowKey={record => record.id}
          onRow={onEditRule}
        />
      </Col>
    </Content>
  </Layout>
);

// Provider Creation
export const providerCreation = (
  data: ProviderCreationModel,
  createProvider: any,
  changeProviderCreation: any
) => (
  <Row>
    <Row justify="space-around">
      <Col span={11}>
        <span>Name:</span>
        <Input
          placeholder="Input Name"
          id="providerName"
          onChange={changeProviderCreation}
          value={data.name}
        />
      </Col>
    </Row>
    <Row justify="space-around">
      {/* <Col span={11} offset={2}>
			<span>Provider:</span>
			<Input
				placeholder="Select Provider"
				defaultValue="other"
				id="providerBasic"
				onChange={changeProviderCreation}
				value={data.provider}
			/>
			</Col> */}
      <Col span={11}>
        <span>User Name:</span>
        <Input
          placeholder="Input Provider User Name"
          id="providerUsername"
          onChange={changeProviderCreation}
          value={data.username}
        />
      </Col>
      <Col span={11} offset={2}>
        <span>Password:</span>
        <Input
          placeholder="Input Provider Password"
          id="providerPassword"
          onChange={changeProviderCreation}
          value={data.password}
        />
      </Col>
    </Row>
    <Row type="flex" justify="space-around" align="middle">
      <Button onClick={createProvider}>+Add Provider</Button>
    </Row>
  </Row>
);

// Proxy Creation
export const proxyCreation = (
  data: ProxyCreationModel,
  createProxy: any,
  changeProvxyCreation: any
) => (
  <Row type="flex" justify="space-around" align="middle">
    <Col span={11}>
      <span>Host:</span>
      <Input
        placeholder="Input Host"
        id="proxyHost"
        onChange={changeProvxyCreation}
        value={data.host}
      />
    </Col>
    <Col span={11} offset={2}>
      <span>port:</span>
      <Input
        placeholder="Input Port Num"
        defaultValue="8080"
        id="proxyPort"
        onChange={changeProvxyCreation}
        value={data.port}
      />
    </Col>
    <Col>
      <Button onClick={createProxy}>+Add Proxy</Button>
    </Col>
  </Row>
);

type RuleEditDialogProps = {
  visible: boolean,
  loading: boolean,
  ruleData: RuleInforModel,
  onUpdate: any,
  onClose: any
};

type RuleEditDialogState = {
  ruleData: RuleInforModel
};

export class RuleEditDialog extends Component<RuleEditDialogProps, any> {
  props: RuleEditDialogProps;

  state: RuleEditDialogState;

  constructor(props: RuleEditDialogProps) {
    super(props);

    this.onChangeInputField = this.onChangeInputField.bind(this);
    this.onRuleUpdate = this.onRuleUpdate.bind(this);
    this.state = {
      ruleData: {}
    };
  }

  componentDidMount() {
    const { ruleData } = this.props;
    console.log(ruleData);
    this.setState({ ruleData });
  }

  onChangeInputField = (event: Event) => {
    const { ruleData } = this.state;
    const { value, id } = event.target;

    switch (id) {
      case 'is_pc':
        ruleData.is_pc = !ruleData.is_pc;
        break;
      case 'is_mobile':
        ruleData.is_mobile = !ruleData.is_mobile;
        break;
      case 'human_red_url':
        ruleData.human_red_url = value;
        break;
      case 'bot_red_url':
        ruleData.bot_red_url = value;
        break;
      case 'ip_address':
        ruleData.ip_address = value;
        break;
      case 'autonomous_system_number':
        ruleData.autonomous_system_number = value;
        break;
      case 'country_code':
        ruleData.country_code = value;
        break;
      case 'region_code':
        ruleData.region_code = value;
        break;
      case 'device_brand':
        ruleData.device_brand = value;
        break;
      case 'os_family':
        ruleData.os_family = value;
        break;
      case 'browser_family':
        ruleData.browser_family = value;
        break;
      case 'description':
        ruleData.description = value;
        break;
      default:
        break;
    }
    this.setState({
      ruleData
    });
  };

  onRuleUpdate = () => {
    const { onUpdate } = this.props;
    const { ruleData } = this.state;
    onUpdate(ruleData);
  };

  render() {
    const { visible, loading, onUpdate, onClose } = this.props;
    const { ruleData } = this.state;
    const {
      name,
      os_family,
      region_code,
      autonomous_system_number,
      browser_family,
      country_code,
      description,
      device_brand,
      id,
      ip_address,
      is_mobile,
      is_pc,
      use_bot_redirect,
      use_human_redirect
    } = ruleData;

    return (
      <div>
        <Modal
          visible={visible}
          title={`Edit rule for "${name}"`}
          onCancel={onClose}
          footer={[
            <Button key="back" onClick={onClose}>
              Back
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={this.onRuleUpdate}
            >
              Save
            </Button>
          ]}
        >
          <p>Modify only what you are sure about.</p>
          {
            /* Left conf Card */
            <Layout>
              {/* <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={12}>
                  <Row>
                    <span>Mobile:</span>
                  </Row>
                  <Checkbox
                    id="is_mobile"
                    checked={is_mobile}
                    onChange={this.onChangeInputField}
                  />
                </Col>
                <Col span={12}>
                  <Row>
                    <span>PC:</span>
                  </Row>
                  <Checkbox
                    id="is_pc"
                    checked={is_pc}
                    onChange={this.onChangeInputField}
                  />
                </Col>
              </Row> */}
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={8}>
                  <Row>
                    <span>IP Address:</span>
                  </Row>
                  <Input
                    value={ip_address}
                    id="ip_address"
                    onChange={this.onChangeInputField}
                  />
                </Col>
                <Col span={3} />
                <Col span={6}>
                  <Row>
                    <span>Country Code:</span>
                  </Row>
                  <Input
                    value={country_code}
                    id="country_code"
                    onChange={this.onChangeInputField}
                  />
                </Col>
                {/* <Col span={12}>
									<Row>
										<span>System Number:</span>
									</Row>
									<Input
										value={autonomous_system_number}
										id='autonomous_system_number'
										onChange={this.onChangeInputField}
									/>
								</Col> */}
              </Row>
              {/* <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={12}>
									<Row>
										<span>Browser Family:</span>
									</Row>
									<Input value={browser_family} id='browser_family' onChange={this.onChangeInputField} />
								</Col>
                <Col span={12}>
                  <Row>
                    <span>OS Family:</span>
                  </Row>
                  <Input
                    value={os_family}
                    id="os_family"
                    onChange={this.onChangeInputField}
                  />
                </Col> 
              </Row> */}
              {/* <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Col span={12}>
                  <Row>
                    <span>Country Code:</span>
                  </Row>
                  <Input
                    value={country_code}
                    id="country_code"
                    onChange={this.onChangeInputField}
                  />
                </Col>
                <Col span={12}>
									<Row>
										<span>Region Code:</span>
									</Row>
									<Input value={region_code} id='region_code' onChange={this.onChangeInputField} />
								</Col>
              </Row> */}
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                {/* <Col span={12}>
									<Row>
										<span>Device Brand:</span>
									</Row>
									<Input value={device_brand} id='device_brand' onChange={this.onChangeInputField} />
								</Col> */}
                <Col span={24}>
                  <Row>
                    <span>Description:</span>
                  </Row>
                  <Input
                    value={description}
                    id="description"
                    onChange={this.onChangeInputField}
                  />
                </Col>
              </Row>
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Row>
                  <span>Bot Redirect URL:</span>
                </Row>
                <Input
                  value={use_bot_redirect}
                  id="use_bot_redirect"
                  onChange={this.onChangeInputField}
                />
                <Requriedalert
                  forId="use_bot_redirect"
                  value={use_bot_redirect}
                />
              </Row>
              <Row gutter={8} style={{ marginBottom: 16, display: 'flex' }}>
                <Row>
                  <span>Human Redirect URL:</span>
                </Row>
                <Input
                  value={use_human_redirect}
                  id="use_human_redirect"
                  onChange={this.onChangeInputField}
                />
                <Requriedalert
                  forId="use_human_redirect"
                  value={use_human_redirect}
                />
              </Row>
            </Layout>
          }
        </Modal>
      </div>
    );
  }
}
