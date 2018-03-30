import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Router, Route, Redirect } from 'react-router';
import { createBrowserHistory } from 'history';
import ResourceManage from './components/ResourceManage';
import MaterialsManage from './components/MaterialsManage';
import MaterialsCreate from './components/MaterialsCreate';
import WxAccount from './components/WxAccounts';
import TasksList from './components/TasksList';
import crm from './crm.png';
import styled from 'styled-components';
import CreateTasks from './components/CreateTasks';

const browserHistory = createBrowserHistory();

const LeftMenu = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100px;
  font-size: 0;
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.65);
  z-index: 999;
  ul {
    height: 100%;
    font-size: 14px;
    line-height: 40px;
    background: white;
    a {
      display: block;
      padding: 0 10px;
      color: rgba(0, 0, 0, 0.65);
      &:focus {
        text-decoration: none;
      }
      &.active {
        background: #eee;
        color: black;
      }
      &:hover {
        background: #f7f7f7;
      }
      &.active:hover {
        background: #eee;
      }
    }
  }
`;

const RightContent = styled.div`
  position: absolute;
  left: 110px;
  right: 0;
  top: 10px;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 10px 10px 0;
  padding: 16px 20px;
  background: white;
`;

const Logo = styled.img`
  width: 100%;
`

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      delete: false
    }
  }
  handleTotalDelete = _ => {
    this.setState({
      delete: true
    })
    setTimeout(_ => {
      this.setState({
        delete: false
      })
    }, 500)
  };

  render() {
    return (
      <Router history={browserHistory}>
        <div style={{height: '100%',
          minWidth: '1360px',
          background: '#eee',
          position: 'relative',
          padding: '10px 10px 0 0',
          overflow: 'auto'}}>
          <LeftMenu>
            <Logo src={crm} alt="crm Logo"/>
            <ul>
              <li><NavLink to='/wechats' activeClassName='active'>微信号管理</NavLink></li>
              <li><NavLink to='/resources' activeClassName='active'>资源库</NavLink></li>
              <li><NavLink to='/lists' activeClassName='active'>素材库</NavLink></li>
              <li><NavLink to='/tasks' activeClassName='active'>朋友圈任务</NavLink></li>
            </ul>
          </LeftMenu>
          <RightContent className='scroll-bar'>
            <Route exact path='/' render={() => {
              return <Redirect to='/lists'/>
            }}></Route>
            <Route path='/resources' component={ResourceManage}></Route>
            <Route exact path='/lists' component={MaterialsManage}></Route>
            <Route path='/lists/create' component={MaterialsCreate}></Route>
            <Route path='/wechats' component={WxAccount}></Route>
            <Route exact path='/tasks' component={TasksList}></Route>
            <Route path='/tasks/create' component={CreateTasks}></Route>
          </RightContent>
        </div>
      </Router>
    );
  }
}

export default App;
