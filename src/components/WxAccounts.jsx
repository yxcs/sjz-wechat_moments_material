import React from 'react';
import { Tabs } from 'antd';
import WxTable from './wxaccount/WxTable';

import { connect } from 'react-redux';
import { getRobots, changeWxTaskTab } from '../actionCreator';

class WxAccounts extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      SELF_status: 'ONLINE',
      SELF_tagId: 'all',
      GUANGZHOU_status: 'ONLINE',
      GUANGZHOU_tagId: 'all',
      BEIJING_status: 'ONLINE',
      BEIJING_tagId: 'all'
    }
  }

  onTabsChange = (v) => {
    let params = {
      page: 0,
      size: 20,
      groupType: v
    }
    
    let status = this.state[v+"_status"];
    let tagId = this.state[v+"_tagId"];

    if (status !== 'ALL') {
      params.status = status;
    }

    if (tagId !== 'all') {
      params.tagId = tagId;
    }

    this.props.getRobots(params);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      SELF_status: nextProps.activeTab.get('SELF_status'),
      SELF_tagId: nextProps.activeTab.get('SELF_tagId'),
      GUANGZHOU_status: nextProps.activeTab.get('GUANGZHOU_status'),
      GUANGZHOU_tagId: nextProps.activeTab.get('GUANGZHOU_tagId'),
      BEIJING_status: nextProps.activeTab.get('BEIJING_status'),
      BEIJING_tagId: nextProps.activeTab.get('BEIJING_tagId')
    })
  }

  render () {
    return (
      <Tabs defaultActiveKey='SELF' onChange={this.onTabsChange}>
        <Tabs.TabPane tab='自营' key='SELF'>
          <WxTable tabs="SELF" />
        </Tabs.TabPane>
        <Tabs.TabPane tab='广州' key='GUANGZHOU'>
          <WxTable tabs="GUANGZHOU" />
        </Tabs.TabPane>
        {/*<Tabs.TabPane tab='北京' key='BEIJING'>
          <WxTable tabs="BEIJING" />
        </Tabs.TabPane>*/}
      </Tabs>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    getRobots: (lists) => {
      dispatch(getRobots(lists))
    },
    changeWxTaskTab: (lists) => {
      dispatch(changeWxTaskTab(lists))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WxAccounts);