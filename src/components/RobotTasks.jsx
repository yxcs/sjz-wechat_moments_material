import React from 'react';
import { Table, Avatar, Radio, Form, DatePicker, Input } from 'antd';
import { getTasksDetail } from '../services.js';
import WxTasksDetail from './WxTasksDetail';

import { connect } from 'react-redux';
import { getTaskLists } from '../actionCreator';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const {RangePicker} = DatePicker

class RobotTasks extends React.Component {
  constructor(props) {
    super(props);
    let groupType = 'SELF';
    let type = location.search;
    if (type.indexOf('type')) {
      groupType = type.split('=')[1];
    }

    let arr = ['SELF', 'GUANGZHOU', 'BEIJING'];

    if (arr.indexOf(groupType) < 0) {
      groupType = 'SELF';
    }

    this.state = {
      loading: false,
      columns: [
        { title: '#', dataIndex: 'id', key: 'pyq_id', render: (v, r, i) => {return <span> { i+1 } </span>} },
        { title: '标题', dataIndex: 'title', key: 'pyq_title' },
        { title: '标签', dataIndex: 'tagName', key: 'pyq_tagName', render: (v, r, i) => { return !!v ? v : '--' } },
        { title: '开始时间', dataIndex: 'startAt', key: 'pyq_startAt', render: (v, r, i) => {
          let date = new Date(v);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        } },
        { title: '结束时间', dataIndex: 'endAt', key: 'pyq_endAt', render: (v, r, i) => {
          let date = new Date(v);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        } },
        { title: '微信数量', dataIndex: 'robotNum', key: 'pyq_robotNum' },
        { title: '单任务数', dataIndex: 'robotSendNum', key: 'pyq_robotSendNum' },
        { title: '发送成功数', dataIndex: 'sendSuccessNum', key: 'pyq_sendSuccessNum' },
        { title: '发送失败数', dataIndex: 'sendErrorNum', key: 'pyq_sendErrorNum' },
        { title: '总任务数量', dataIndex: 'sendNum', key: 'pyq_sendNum' }
      ],
      subColumns: [
        { title: '#', dataIndex: 'id', key: 'pyq_sub_id', render: (v, r, i) => {return <span> { i+1 } </span>} },
        { title: '头像', dataIndex: 'robotInfo', key: 'pyq_sub_avatarUrl', render: (v, r, i) => {
           return !!v.avatarUrl ? <img alt='微信头像' width="30" height="30" src={v.avatarUrl} /> : <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon="user" />;
        }},
        { title: '微信名称', dataIndex: 'robotInfo', key: 'pyq_sub_robotInfo', render: (v, r, i) => {return <span>{ v.nickName }</span> } },
        { title: '微信号', dataIndex: 'robotInfo', key: 'pyq_sub_alias', render: (v, r, i) => {return <span>{ v.alias === "" ? '--' : v.alias }</span> } },
        { title: '微信ID', dataIndex: 'robotInfo', key: 'pyq_sub_wxId', render: (v, r, i) => {return <span>{ v.wxId }</span> } },
        { title: '所属组', dataIndex: 'robotInfo', key: 'pyq_sub_group', render: (v, r, i) => {
          if(v.groupType === 'SELF') {
            return '自营'
          }else if(v.groupType === 'GUANGZHOU') {
            return '广州'
          }else {
            return '北京'
          }
        } },
        { title: '发送数量', dataIndex: 'sendNum', key: 'pyq_sub_sendNum', render: (v, r, i) => {return <span>{ v }</span> } },
        { title: '发送失败数', dataIndex: 'sendErrorNum', key: 'pyq_sub_sendErrorNum', render: (v, r, i) => {return <span>{ v }</span> } },
        { title: '发送成功数', dataIndex: 'sendSuccessNum', key: 'pyq_sub_sendSuccessNum', render: (v, r, i) => {return <span>{ v }</span> } },
        { title: '查看素材', dataIndex: 'id', key: 'pyq_sub_details', render: (v, r, i) => {return <WxTasksDetail status={this.state.groupType} wxId={v} /> } },
      ],
      dataSource: [],
      subTables: [],
      pagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      },
      groupType, // 'GUANGZHOU'
      pageSize: 20,
      tagName: null,
      taskTime: [
        moment(new Date().toString()).startOf('day'),
        moment(new Date().toString()).startOf('day')
      ]
    }
  }

  componentWillMount() {
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }
    if (this.state.taskTime.length === 2) {
      params.endTimeStart = this.state.taskTime[0].toDate().getTime();
      params.endTimeEnd = this.state.taskTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }
    let pagination = this.state.pagination;
    this.props.getTaskLists({params, pagination})
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      dataSource: nextProps.taskLists.dataSource,
      pagination: nextProps.taskLists.pagination
    })
  }

  getSubTable = (subTables) => {
    return (
      <Table
        columns={this.state.subColumns}
        dataSource={subTables}
        rowKey={record => record.id}
        pagination={false}
        bordered={true}
        size="small"/>
    );
  }

  handleTableChange = (pagination,filters, soter) => {
    const pager = this.state.pagination;
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });

    let params = {
      page: pagination.current - 1,
      size: this.state.pageSize,
      groupType: this.state.groupType
    };

    if (!!this.state.tagName) {
        params.tagName = this.state.tagName;
    }

    if (this.state.taskTime.length === 2) {
      console.log(this.state.taskTime);

      params.endTimeStart = this.state.taskTime[0].toDate().getTime();
      params.endTimeEnd = this.state.taskTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.getTaskLists({params, pagination: pager})
  }

  onRadioChange = (v) => {
    this.setState({groupType: v.target.value})
    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: v.target.value
    }

    if (!!this.state.tagName) {
      params.tagName = this.state.tagName;
    }

    if (this.state.taskTime.length === 2) {
      params.endTimeStart = this.state.taskTime[0].toDate().getTime();
      params.endTimeEnd = this.state.taskTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getTaskLists({params, pagination})
  }

  onClickExpand = (v, r) => {
    if(!v) return;
    let dataSource = this.state.dataSource;

    getTasksDetail({id: r.id}).then(data => {
      dataSource = dataSource.map(item => {
        if(item.id === r.id) {
          item.subTables = data.data.data.fctRobotList;
        }
        return item;
      })
      this.setState({ dataSource })
    })
  }

  onTagNameChange = (v) => {
    this.setState({ tagName: v.target.value });
  }

  onTagNameSelect = (v) => {
    let pagination = this.state.pagination;
    let tagName = v;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    if (!!v) {
        params.tagName = tagName;
    }

    if (this.state.taskTime.length === 2) {
      params.endTimeStart = this.state.taskTime[0].toDate().getTime();
      params.endTimeEnd = this.state.taskTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getTaskLists({params, pagination})
  }

  onTaskTimeChange = (date, dateString) => {
    console.log(date);
    console.log(dateString);

    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    if (date.length === 2) {
      date[0].startOf('day')
      date[1].startOf('day')
      params.endTimeStart = date[0].toDate().getTime();
      params.endTimeEnd = date[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.setState({
      taskTime: date
    })

    if (!!this.state.tagName) {
        params.tagName = this.state.tagName;
    }

    pagination.current = 1;
    this.props.getTaskLists({params, pagination})
  }

  render () {
    return (
      <div>
        <div style={{paddingBottom: '20px'}}>
          <Form layout="inline">
            <Form.Item label="地区">
              <Radio.Group defaultValue={this.state.groupType} size="small" onChange={this.onRadioChange}>
                <Radio.Button value="SELF">自营</Radio.Button>
                <Radio.Button value="GUANGZHOU">广州</Radio.Button>
                <Radio.Button value="BEIJING">北京</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="主题搜索">
              <Input.Search
                size="small"
                style={{ width: 200 }}
                onSearch={this.onTagNameSelect}
                onChange={this.onTagNameChange}
                value={this.state.tagName} />
            </Form.Item>
            <Form.Item label="任务时间">
              <RangePicker
                format="YYYY-MM-DD"
                size="small"
                placeholder={['开始时间', '结束时间']}
                onChange={this.onTaskTimeChange}
                value={this.state.taskTime} />
            </Form.Item>
          </Form>
        </div>
        <Table
          columns={this.state.columns}
          expandedRowRender={record => this.getSubTable(record.subTables)}
          dataSource={this.state.dataSource}
          rowKey={record => record.id}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          loading={this.state.loading}
          onExpand={this.onClickExpand}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    getTaskLists: (lists) => {
      dispatch(getTaskLists(lists))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RobotTasks);