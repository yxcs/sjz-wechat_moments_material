import React from 'react';
import { Tabs, Button } from 'antd';
import RobotTasks from './RobotTasks';
import RobotMaterial from './RobotMaterial';

import { connect } from 'react-redux';
import { changeWxTaskTab } from '../actionCreator';
import { Link } from 'react-router-dom';

class TasksList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'robotTasks'
    }
  }
  onChangeTab = (v) => {
    this.setState({ activeKey: v })
  }

  render () {
    return (
      <Tabs
        activeKey={this.state.activeKey}
        onTabClick={this.onChangeTab}
        tabBarExtraContent={(<Link to='/tasks/create'>
          <Button size='small' type='primary'>创建任务</Button></Link>)}>
        <Tabs.TabPane tab='主题任务集' key='robotTasks'>
          <RobotTasks />
        </Tabs.TabPane>
        <Tabs.TabPane tab='单条素材集' key='robotMaterials'>
          <RobotMaterial />
        </Tabs.TabPane>
      </Tabs>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    changeWxTaskTab: (lists) => {
      dispatch(changeWxTaskTab(lists))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TasksList);