/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable flowtype/no-weak-types */
/* eslint-disable camelcase */
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import { Layout, Menu, Icon } from 'antd';
import routes from './constants/routes';
import App from './containers/App';

import SettingsPage from './containers/SettingsPage';
import LinkCreationPage from './containers/LinkCreationPage';
import RevProxyLinksTablePage from './containers/RevProxyLinksTablePage';
import ProxyMangamentPage from './containers/ProxyMangamentPage';
import RevProxyTargetsTablePage from './containers/RevProxyTargetsTablePage';
import GateWayLinksTablePage from './containers/GateWayLinksTablePage';
import ChargeHistoryTablePage from './containers/ChargeHistoryTablePage';

import styles from './App.scss';
import 'antd/dist/antd.css';

const { Header, Sider, Content } = Layout;

type Props = { history: Object };
const pageRoute = [
  '/',
  '/proxyManage',
  '/creator',
  '/rev-proxy-table',
  '/rev-proxy-targets',
  '/gate-way-table',
  '/charge-history-table'
];

class Routes extends React.Component<Props> {
  state = {
    collapsed: false,
    selectedIndex: 1
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  // eslint-disable-next-line no-unused-vars
  onClickNavigation = ({ item, key, keyPath }) => {
    if (this.state.selectedIndex.toString() !== keyPath) {
      const { history } = this.props;
      this.setState({ selectedIndex: keyPath });
      console.log(pageRoute[keyPath - 1]);
      history.push(pageRoute[keyPath - 1]);
    }
  };

  render() {
    const title = [
      'Settings',
      'Proxies',
      'Create link',
      'RevProxy Links Table',
      'Successful Targets',
      'GateWay Links Table',
      'Charge Table'
    ];
    return (
      <Layout>
        <Sider
          trigger={null}
          className={styles.sider}
          collapsible
          collapsed={this.state.collapsed}
        >
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={['1']}
            onClick={this.onClickNavigation}
          >
            <Menu.Item key="1">
              <Icon type="setting" />
              <span>SETTINGS</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="gold" />
              <span>PROXIES</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="plus" />
              <span>CREATE LINK</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="table" />
              <span>REVPROXY LINKS</span>
            </Menu.Item>
            <Menu.Item key="5">
              <Icon type="table" />
              <span>REVPROXY TARGETS</span>
            </Menu.Item>
            <Menu.Item key="6">
              <Icon type="table" />
              <span>GATEWAY LINKS</span>
            </Menu.Item>
            <Menu.Item key="7">
              <Icon type="table" />
              <span>CHARGE HISTORY</span>
            </Menu.Item>
          </Menu>
        </Sider>

        <Content
          style={{
            margin: '24px 16px',
            background: '#fff',
            minHeight: 280,
            overflow: 'hidden'
          }}
        >
          <Header className={styles.header}>
            <Icon
              className={styles.trigger}
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
              style={{ alignItems: 'center', padding: 0 }}
            />
            <h1>{title[this.state.selectedIndex - 1]}</h1>
          </Header>
          <App>
            <Switch>
              <Route
                exact
                path={routes.SettingsPage}
                component={SettingsPage}
              />
              <Route
                path={routes.LinkCreationPage}
                component={LinkCreationPage}
              />
              <Route
                path={routes.RevProxyLinksTablePage}
                component={RevProxyLinksTablePage}
              />
              <Route
                path={routes.ProxyMangamentPage}
                component={ProxyMangamentPage}
              />
              <Route
                path={routes.RevProxyTargetsTablePage}
                component={RevProxyTargetsTablePage}
              />
              <Route
                path={routes.GateWayLinksTablePage}
                component={GateWayLinksTablePage}
              />
              <Route
                path={routes.ChargeHistoryTablePage}
                component={ChargeHistoryTablePage}
              />
            </Switch>
          </App>
        </Content>
      </Layout>
    );
  }
}
export default withRouter(Routes);
