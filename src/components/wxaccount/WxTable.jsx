import React from 'react';
import {
  Table,
  Icon,
  Avatar,
  Button,
  Form,
  Radio,
  message,
  Select,
  Input,
  Row,
  Col,
} from 'antd';
import { SyncRobotGuangZhou, SyncRoboBeiJing, getRobotTagList, updateRobotTag, updateRobotTags } from '../../services.js';
import { connect } from 'react-redux';
import { getRobots, changeWxTaskTab } from '../../actionCreator';
import WechatMoments from '../WechatMoments';
import ThirdWechatMoments from '../ThirdWechatMoments';
import styled from 'styled-components';

const ActiveBtn = styled(Button)`
  &.active {
    backgroundColor: #87d068;
    border-color: #87d068;
    color: white;
  }
`

class WxTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabs: 'GUANGZHOU',
      dataSource: [],
      pagination: {
        current: 1,
        showQuickJumper: true,
        pageSize: 20
      },
      loading: false,
      robotId: null,
      robotNick: '',
      pageSize: 20,
      status: 'ONLINE',
      tagId: 'all',
      tagLists: [],
      tagEditId: '',
      tagName: '',
      selectedRowKeys: [],
      selectedLists: [],
      selectTagName: '',
      showUpdateInput: false
    }
  }

  componentWillMount() {
    this.setState({ tabs: this.props.tabs })
    this.getTableData()
    getRobotTagList({}).then(data => {
      this.setState({ tagLists: data.data.data})
    })
  }

  componentWillReceiveProps(nextProps) {
    let pagination = this.state.pagination;
    pagination.total = nextProps.robots.get('total');

    this.setState({
      dataSource: nextProps.robots.get('data'),
      pagination,
      showUpdateInput: false,
      selectedLists: [],
      selectTagName: '',
      selectedRowKeys: []
    })
  }

  updateSelectedRobot = e => {

  }

  getTableData = () => {
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.props.tabs,
      status: this.state.status
    }

    this.props.getRobots(params)
  }

  getTableColumns = (type) => {
    const columns = [
      {
        title: '#',
        dataIndex: 'id',
        key: 'wx_id_index',
        render: (value, record, index) => <span>{index+1}</span>,
      }, {
        title: '微信头像',
        dataIndex: 'avatarUrl',
        key: 'wx_account_avatarUrl',
        render: (v,r,i) => {
          return !!v ? <img alt='微信头像' width="30" height="30" src={v} /> : <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon="user" />;
        }
      }, {
        title: '微信昵称',
        dataIndex: 'nickName',
        key: 'wx_nickName',
      }, {
        title: '微信号',
        dataIndex: 'alias',
        key: 'wx_alias',
        render: (v, r, i) => {
          return !!v ? v : '--';
        }
      }, {
        title: '微信ID',
        dataIndex: 'wxId',
        key: 'wx_account_wxId',
      }, {
        title: '在线状态',
        dataIndex: 'status',
        key: 'wx_onlineStatus',
        render: (v,r) => {
          if (v === 'ONLINE') {
            return <p><span style={{color: '#13CE66'}}><Icon type="bulb" /></span> 在线 </p>
          }else if (v === 'OFFLINE') {
            return <p><span style={{color: '#FF4949'}}><Icon type="bulb" /></span> 离线</p>
          }else if (v === 'DELETE') {
            return <p><span style={{color: '#FF4949'}}><Icon type="close-circle-o" /></span> 删除</p>
          }else if (v === 'ERROR') {
            return <p><span style={{color: '#FF4949'}}><Icon type="exclamation-circle-o" /></span> 错误</p>
          }else {
            return '--'
          }
        }
      }, {
        title: '备注',
        dataIndex: 'errorMsg',
        key: 'wx_errorMsg',
        render: (v, r, i) => {
          if(!!v) {
            return <span>{ v }</span>
          }else {
            return '--'
          }
        }
      }, {
        title: '分组',
        dataIndex: 'tagId',
        key: 'wx_tagId',
        render: (v, r, i) => {
          let tagObj = this.state.tagLists.filter(item => {
            return item.id === v;
          })
          if (this.state.tagEditId !== r.id) {
            return  (
              <p>
                <span style={{paddingRight: '10px'}}><Button type="primary" size="small" shape="circle" icon="edit" onClick={this.onEditTag.bind(this, r.id, tagObj)} /></span>
                {tagObj.length > 0 ? tagObj[0].name : ''}
              </p>
            )
          } else {
            return (
              <Form layout="inline">
                <Form.Item>
                  <Input defaultValue={tagObj.length > 0 ? tagObj[0].name : ''} type="text" size="small" style={{width: 100}} onChange={this.onChangeTagName} />
                  <span style={{paddingLeft: 10}}><Button type="primary" size="small" shape="circle" icon="check" onClick={this.onEditOK} /></span>
                  <span style={{paddingLeft: 10}}><Button size="small" shape="circle" icon="close" onClick={this.onEditCancel} /></span>
                </Form.Item>
              </Form>
            )
          }
        }
      }
    ];
    if (type === 'SELF') {
      columns.push(
        {
          title: '朋友圈',
          render: (text, data, index) => {
            return (
              <span
                data-robot-id={data.id}
                data-robot-nick-name={data.nickName} >
                <ActiveBtn icon='team' shape='circle' size='small'
                  data-robot-id={data.id}
                  data-robot-nick-name={data.nickName}
                  className={this.state.robotId === parseInt(data.id, 10) ? 'active' : ''}
                  onClick={this.viewMoment} />
              </span>
            )
          }
        }
      )
    }
    return columns
  }

  // 查看微信朋友圈
  viewMoment = e => {
    this.setState({
      robotId: parseInt(e.target.parentElement.dataset.robotId, 10),
      robotNick: e.target.parentElement.dataset.robotNickName,
    })
  }

  onEditTag = (id, tagObj) => {
    let tagName = '';
    if (tagObj.length > 0) {
      tagName = tagObj[0].name;
    }
    this.setState({ tagEditId: id, tagName })
  }

  onChangeTagName = (v) => {
    this.setState({ tagName: v.target.value })
  }

  onEditOK = () => {
    let params = {
      id: parseInt(this.state.tagEditId, 10, 10),
      tagName: this.state.tagName
    }

    if (!!params.tagName) {
      updateRobotTag(params).then(data => {
        if (data.data.status === 1) {
          message.success('更新微信分组成功');
          getRobotTagList({}).then(data => {
            this.setState({ tagLists: data.data.data});
          })
          this.getRobotTagChange()
        } else {
          message.error(data.data.details);
        }
      })
    } else {
      message.warning('分组名不可为空');
    }

    this.onEditCancel();
  }

  onEditCancel = () => {
    this.setState({
      tagEditId: '',
      tagName: ''
    })
  }

  getRobotTagChange = () => {
    let pagination = this.state.pagination;
    let params = {
      page: pagination.current - 1,
      size: this.state.pageSize,
      groupType: this.props.tabs
    };

    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if(this.state.tagId !== 'all') {
      params.tagId = parseInt(this.state.tagId, 10);
    }

   this.props.getRobots(params);
  }

  onRadioChange = (v) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    let status = v.target.value
    this.setState({ status, pagination })
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.props.tabs
    }

    if(status !== 'ALL') {
      params.status = status
    }

    if(this.state.tagId !== 'all') {
      params.tagId = parseInt(this.state.tagId, 10);
    }

    this.props.getRobots(params);

    let saveParams = {
      [this.state.tabs + '_status']: v.target.value,
      [this.state.tabs + '_tagId']: this.state.tagId,
      tabs: this.state.tabs
    }

    this.props.changeWxTaskTab(saveParams)

  }

  handleTableChange = (pagination, filters, soter) => {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      showUpdateInput: false,
      selectedLists: [],
      selectTagName: '',
      selectedRowKeys: []
    });

    let params = {
      page: pagination.current - 1,
      size: this.state.pageSize,
      groupType: this.props.tabs
    };

    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if(this.state.tagId !== 'all') {
      params.tagId = parseInt(this.state.tagId, 10);
    }

    this.props.getRobots(params);

  };

  onStateLoading = () => {
    const pager = this.state.pagination;

    let params = {
      page: pager.current - 1,
      size: this.state.pageSize,
      groupType: this.props.tabs
    };

    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if(this.state.tagId !== 'all') {
      params.tagId = parseInt(this.state.tagId, 10);
    }

    this.props.getRobots(params);
  }

  onSyncData = () => {
    if (this.props.tabs === 'GUANGZHOU') {
      SyncRobotGuangZhou({}).then(data => {
        if (data.status !== 200) {
          message.error('同步出错请重试！');
        } else if (data.data.status !== 1) {
          message.error(data.data.details)
        } else {
          this.onStateLoading()
        }
      })
    }else if (this.props.tabs === 'BEIJING') {
      SyncRoboBeiJing({}).then(data => {
        if (data.status !== 200) {
          message.error('同步出错请重试！');
        } else if (data.data.status !== 1) {
          message.error(data.data.details)
        } else {
          this.onStateLoading()
        }
      })
    }
  }

  onTagsChange = (v) => {
    let pagination = this.state.pagination;
    pagination.current = 1;
    let params = {
      groupType: this.props.tabs,
      page: 0,
      size: this.state.pageSize
    }

    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if(v !== 'all') {
      params.tagId = parseInt(v, 10);
    }

    this.setState({ tagId: v, pagination })

    this.props.getRobots(params);

    let saveParams = {
      [this.state.tabs + '_status']: this.state.status,
      [this.state.tabs + '_tagId']: v,
      tabs: this.state.tabs
    }

    this.props.changeWxTaskTab(saveParams)
  }

  onTagsFocus = () => {
    getRobotTagList({}).then(data => {
      this.setState({ tagLists: data.data.data})
    })
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys })
  }

  onSelect = (record, selected, selectedRows) => {
    let selectedLists = this.state.selectedLists;
    if (selected) {
      selectedLists.push(record);
    }else {
      selectedLists = selectedLists.filter(function(item) {
        return item.id = record.id;
      })
    }

    this.setState({ selectedLists });
  }

  onSelectAll = (selected, selectedRows, changeRows) => {
    let selectedLists = this.state.selectedLists;
    selectedLists = selectedRows;
    this.setState({ selectedLists });
  }

  onUpdateTags = () => {
    this.setState({ showUpdateInput: true })
  }

  onSelectInputChange = (v) => {
    this.setState({ selectTagName: v.target.value })
  }

  onSelectEditOK = () => {
    let selectedLists = this.state.selectedLists;
    let ids = selectedLists.map(item => {
      return item.id;
    })
    let params = {
      tagName: this.state.selectTagName,
      ids
    }

    if (!!params.tagName) {
      updateRobotTags(params).then(data => {
        this.setState({
          showUpdateInput: false,
          selectedLists: [],
          selectTagName: '',
          selectedRowKeys: []
        })
        if (data.data.status === 1) {
          message.success('批量更新微信分组成功');
          getRobotTagList({}).then(data => {
            this.setState({ tagLists: data.data.data});
          })
          this.getRobotTagChange()
        } else {
          message.error(data.data.details);
        }
      })
    } else {
      message.warning('分组名不可为空');
    }

  }

  onSelectEditCancel = () => {
    this.setState({
      showUpdateInput: false,
      selectTagName: ''
    })
  }

  render () {
    const { tabs } = this.props;
    return (
      <Row gutter={10} style={{height: '100%'}}>
        <Col span={14} style={{height: '100%'}}>
          <Form layout="inline">
            <Form.Item>
              <Radio.Group defaultValue="ONLINE" size="small" onChange={this.onRadioChange}>
                <Radio.Button value="ALL">全部</Radio.Button>
                <Radio.Button value="ONLINE">在线</Radio.Button>
                <Radio.Button value="OFFLINE">离线</Radio.Button>
                <Radio.Button value="DELETE">删除</Radio.Button>
                <Radio.Button value="ERROR">错误</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="分组">
              <Select
                showSearch
                style={{width: '100px'}}
                size="small"
                optionFilterProp="children"
                onChange={this.onTagsChange}
                onFocus={this.onTagsFocus}
                defaultValue="all"
                value={this.state.tagId}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                <Select.Option value="all">全部</Select.Option>
                {
                  this.state.tagLists.map(item => {
                    return <Select.Option key={'key'+item.id} value={''+item.id}>{item.name}</Select.Option>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button style={{display: tabs === 'SELF' ? 'inline-block' : 'none'}}
                size="small"
                type="primary"
                loading={this.state.stateLoading}
                onClick={this.onStateLoading}>
                刷新状态
              </Button>
              <Button style={{display: tabs !== 'SELF' ? 'inline-block' : 'none'}}
                size="small"
                type="primary"
                loading={this.state.stateLoading}
                onClick={this.onSyncData}>
                手动同步
              </Button>
            </Form.Item>
            <Form.Item label="标签名" style={{float: 'right', display: this.state.showUpdateInput ? 'inline-block' : 'none'}}>
              <Input type="text" size="small" style={{width: 80}} onChange={this.onSelectInputChange} />
              <span style={{paddingLeft: 10}}><Button type="primary" size="small" shape="circle" icon="check" onClick={this.onSelectEditOK} /></span>
              <span style={{paddingLeft: 10}}><Button size="small" shape="circle" icon="close" onClick={this.onSelectEditCancel} /></span>
            </Form.Item>
            <Form.Item style={{float: 'right', display: this.state.showUpdateInput ? 'none' : 'inline-block'}} >
              <Button type="primary" size="small" disabled={this.state.selectedLists.length === 0} onClick={this.onUpdateTags} > 批量更新 </Button>
            </Form.Item>
          </Form>
          <div style={{margin: "10px 0 0 0"}}>
            <Table
              columns={this.getTableColumns(this.props.tabs)}
              dataSource={this.state.dataSource}
              rowKey={record => record.id}
              pagination={this.state.pagination}
              onChange={this.handleTableChange}
              loading={this.state.loading}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: this.state.selectedRowKeys,
                onChange: this.onSelectChange,
                onSelect: this.onSelect,
                onSelectAll: this.onSelectAll
              }} />
          </div>
        </Col>
        <Col span={10}>
          {
            this.props.tabs === 'SELF' ?
              <WechatMoments
                robotId={this.state.robotId}
                robotNick={this.state.robotNick} /> :
              <ThirdWechatMoments
                robotId={this.state.robotId} />
          }
        </Col>
      </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(WxTable);