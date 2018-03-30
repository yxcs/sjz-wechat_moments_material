import React from 'react';
import { Table, Button, Avatar, Radio, Form, Select, DatePicker, Input, Popconfirm, Tooltip, Icon, message } from 'antd';
import { connect } from 'react-redux';
import { getRobotMaterials, deleteRobotTask, cancelRobotTask, resendRobotTask } from '../actionCreator';
import { getRobotTagList } from '../services.js';
import ImageViewer from './ImageViewer'
import ArticleViewer from './ArticleViewer'
import moment from 'moment';
import 'moment/locale/zh-cn';
import { SEND_STATUS } from '../config.js';

moment.locale('zh-cn');

const {RangePicker} = DatePicker

class RobotMaterial extends React.Component {
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
      columns: [
        { title: '#', dataIndex: 'id', key: 'taskd_idnex', width: '40px', render: (v, r, i) => i+1},
        { title: 'SendId', dataIndex: 'id', key: 'taskd_id', width: '60px'},
        { title: '朋友圈素材', dataIndex: 'fctRobotMaterialResourceList', key: 'taskd_pyq', render: (v, r, i) => {
            return (
                <ul>
                  <li><span style={{color: '#222'}}>{r.material.text}</span></li>
                  {
                    r.material.type === 'LINK'
                    ? (<li>
                        {v.map((item, index) => {
                          let cover = '';
                          let title = '';
                          if (!!item.resource.articleImg) {
                            cover = <ImageViewer
                              width={32}
                              key={item.id}
                              height={32}
                              style={{marginRight: '10px'}}
                              url={item.resource.articleImg.indexOf('imageMogr2') === -1 ?
                                `${item.resource.articleImg}?imageMogr2/thumbnail/200x` :
                                `${item.resource.articleImg}`}/>
                          } else {
                            cover = <Avatar icon="picture" shape="square" style={{ backgroundColor: '#f56a00', verticalAlign: 'middle' }}></Avatar>
                          }
                          if (!!item.resource.title) {
                            title =  <span style={{paddingLeft: 8}}>{item.resource.title}</span>;;
                          } else {
                            title = <span style={{paddingLeft: 8}}>文章{index+1}</span>;
                          }
                          return <ArticleViewer
                            key={i+'_'+index}
                            url={item.resource.url}
                            style={{paddingRight: '10px'}}
                            title={title}
                            cover={cover} />
                        })}
                      </li>)
                    : null
                  }
                  <li style={{display: r.material.type === 'IMAGE' ? 'block' : 'none'}}>
                    {v.map((item, index) => {
                      return (
                        <ImageViewer
                          width={30}
                          height={30}
                          key={item.id}
                          trigger='click'
                          border={true}
                          url={item.resource.url.indexOf('imageMogr2') === -1 ?
                            `${item.resource.url}?imageMogr2/thumbnail/200x` :
                            `${item.resource.url}`} />
                      )
                    })}
                  </li>
                  <li>
                    <p style={{color: '#324057'}}>评论：</p>
                    {
                        r.materialCommentList.map((item, index) => {
                            return (
                              <p style={{textIndent: '20px', color: '#888'}} key={`comment_${index}`}>{`${index+1}. ${item.commentText}`}</p>
                            )
                        })
                    }
                  </li>
                </ul>
            )
        }},
        { title: '状态', dataIndex: 'status', key: 'taskd_status', width: '80px', render: (v, r, i) => {
          return this.state.sendStatus[v];
        }},
        { title: '发送时间', dataIndex: 'planSendAt', key: 'taskd_planSendAt', width: '160px', render: (v, r, i) => {
          let date = new Date(v);
          const nowDate = Date.now();
          const dateUnix = date.getTime();
          const isError = nowDate > dateUnix ? (r.status === 'INIT' ? true : false) : false;
          return <p>
            <Tooltip placement="top" title="任务发送出错，请反馈">
              <Icon style={{color: '#FF6537', display:  isError ? 'inline-block' : 'none' }} type="exclamation-circle-o" />
            </Tooltip>
            &nbsp;&nbsp;{`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
          </p>;}
        },
        { title: '完成时间', dataIndex: 'status', key: 'taskd_finallSendAt', width: '160px', render: (v, r, i) => {
          let date = new Date();
          if(v === 'SUCCESS' && !!r.sendSuccessAt) {
            date = new Date(r.sendSuccessAt);
          }else if(v === 'ERROR' && !!r.sendErrorAt){
            date = new Date(r.sendErrorAt);
          }else if(v === 'CANCEL' && !!r.updatedAt) {
            date = new Date(r.updatedAt);
          }else {
            return '--';
          }
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;}
        },
        { title: '错误详情', dataIndex: 'sendErrorDetail', key: 'taskd_sendErrorDetail', render: (v, r, i) => {
          return !!v ? v : '--';
        }},
        { title: '昵称', dataIndex: 'robotInfo', key: 'taskd_nickName', width: '80px', render: (v, r, i) => { return !!v.nickName ? v.nickName : '--'}},
        { title: '头像', dataIndex: 'robotInfo', key: 'taskd_avatarUrl', width: '50px', render: (v, r, i) => {
          return !!v.avatarUrl ? <img alt='微信头像' width="30" height="30" src={v.avatarUrl} /> : <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon="user" />
        }},
        { title: '微信ID', dataIndex: 'robotInfo', key: 'taskd_wxId', width: '160px', render: (v, r, i) => {
          return <a title="点击后根据微信ID查询" href="#" onClick={this.onClickWxId.bind(this, v.wxId)}>{v.wxId}</a>
        }},
        { title: '微信号', dataIndex: 'robotInfo', key: 'taskd_alias', width: '100px', render: (v, r, i) => { return !!v.alias ? v.alias : '--' }},
        { title: '操作', dataIndex: 'id', key: 'taskd_settingId', width: 50, render: (v, r, i) => {
          if(r.status === 'CANCEL') {
            return (
              <p>
                <Popconfirm placement="left" title="你确定删除该任务嘛？" onConfirm={this.onDeleteTask.bind(this, r.id)} okText="确定" cancelText="取消">
                  <Button type="danger" size="small" ghost>删除</Button>
                </Popconfirm>
              </p>
            )
          }else if(r.status === 'ERROR') {
            return (
              <p>
                <Button type="primary" size="small" ghost onClick={this.onResendTask.bind(this, r.id)}>重发</Button>
              </p>
            )
          }else if(r.status === 'INIT') {
            return (<p><Button size="small" onClick={this.onCancelTask.bind(this, r.id)}>取消</Button></p>)
          }else {
            return '--'
          }
        }}
      ],
      dataSource: [],
      pagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      },
      status: 'ALL',
      robotId: null,
      robotTagId: 'ALL',
      tagList: [],
      updateTime: [
        moment(new Date().toString()).startOf('day'),
        moment(new Date().toString()).startOf('day')
      ],
      groupType, // 'GUANGZHOU'
      pageSize: 20,
      statusSelectKey: [],
      tagValue: {'ALL': '全部'},
      sendStatus: {},
      searchIdType: 'robotWxid'
    }
  }

  componentWillMount() {
    this.setState({
      sendStatus: SEND_STATUS[this.state.groupType]
    })
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }
    let pagination = this.state.pagination;

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.getRobotMaterials({params, pagination})

    getRobotTagList({}).then(data => {
      let tagList = data.data.data;
      let tagValue = this.state.tagValue;
      tagList.forEach(item => {
        tagValue[''+item.id] = item.name;
      })
      this.setState({ tagList, tagValue })
    })
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      dataSource: nextProps.robotMaterial.dataSource,
      pagination: nextProps.robotMaterial.pagination
    })
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

    if (!!this.state.robotId) {
      params.robotId = this.state.robotId;
    }

    if (this.state.robotTagId !== 'ALL') {
      params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.getRobotMaterials({params, pagination: pager})
  }

  onRadioChange = (v) => {
    this.setState({
      groupType: v.target.value,
      statusSelectKey: [],
      sendStatus: SEND_STATUS[v.target.value]
    })
    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: v.target.value
    }

    if (!!this.state.robotId) {
      if (this.state.searchIdType === 'robotId') {
        'robotWxid' in params && delete params.robotWxid;
        params.robotId = this.state.robotId;
      } else {
        'robotId' in params && delete params.robotId;
        params.robotWxid = this.state.robotId;
      }
    }

    if (this.state.robotTagId !== 'ALL') {
      params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getRobotMaterials({params, pagination})
  }

  onRobotIdChange = (v) => {
    this.setState({ robotId: v.target.value });
  }

  onClickWxId = (v) => {
    this.setState({
      robotId: v,
      searchIdType: 'robotWxid' },
      _ => {
        this.onRobotIdSelect(v);
    });
  }

  onRobotIdSelect = (v) => {
    this.setState({ statusSelectKey: [] })
    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    if (!!v) {
      v = v.trim();
      if (this.state.searchIdType === 'robotId') {
        'robotWxid' in params && delete params.robotWxid;
        if (new RegExp("^[0-9]*$").test(v)) {
          params.robotId = v;
        } else {
          message.warning('机器人ID有误')
          return 0;
        }
      } else {
        'robotId' in params && delete params.robotId;
        if (v.indexOf('wxid_') > -1) {
          params.robotWxid = v;
        } else {
          message.warning('微信ID有误')
          return 0;
        }
      }
    } else {
      'robotWxid' in params && delete params.robotWxid;
      'robotId' in params && delete params.robotId;
    }

    if (this.state.robotTagId !== 'ALL') {
      params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getRobotMaterials({params, pagination})
  }

  onRobotTagIdChange = (v) => {
    let robotTagId = parseInt(v, 10) || 'ALL';
    this.setState({ robotTagId, statusSelectKey: [] });

    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    if (!!this.state.robotId) {
      if (this.state.searchIdType === 'robotId') {
        'robotWxid' in params && delete params.robotWxid;
        params.robotId = this.state.robotId;
      } else {
        'robotId' in params && delete params.robotId;
        params.robotWxid = this.state.robotId;
      }
    }

    if (robotTagId !== 'ALL') {
      params.robotTagId = robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getRobotMaterials({params, pagination})
  }

  onStatusChange = (v) => {
    let status = v;
    this.setState({
      status,
      statusSelectKey: []
    });

    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    if (!!this.state.robotId) {
      if (this.state.searchIdType === 'robotId') {
        'robotWxid' in params && delete params.robotWxid;
        params.robotId = this.state.robotId;
      } else {
        'robotId' in params && delete params.robotId;
        params.robotWxid = this.state.robotId;
      }
    }

    if (this.state.robotTagId !== 'ALL') {
      params.robotTagId = this.state.robotTagId;
    }

    if (status !== 'ALL') {
      params.status = status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getRobotMaterials({params, pagination})
  }

  onUpdateTimeChange = (date, dateString) => {
    let pagination = this.state.pagination;
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }

    this.setState({
      updateTime: date,
      statusSelectKey: []
    });

    if (!!this.state.robotId) {
      if (this.state.searchIdType === 'robotId') {
        'robotWxid' in params && delete params.robotWxid;
        params.robotId = this.state.robotId;
      } else {
        'robotId' in params && delete params.robotId;
        params.robotWxid = this.state.robotId;
      }
    }

    if (this.state.robotTagId !== 'ALL') {
      params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if (date.length === 2) {
      params.updateTimeStart = date[0].toDate().getTime();
      params.updateTimeEnd = date[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    pagination.current = 1;
    this.props.getRobotMaterials({params, pagination})
  }

  onClearParams = () => {
    let updateTime = [
      moment(new Date().toString()).startOf('day'),
      moment(new Date().toString()).startOf('day')
    ]

    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType,
      updateTimeStart: updateTime[0].toDate().getTime(),
      updateTimeEnd: updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1
    }

    let pagination = this.state.pagination;
    this.props.getRobotMaterials({params, pagination})

    this.setState({
      status: 'ALL',
      robotId: null,
      robotTagId: 'ALL',
      updateTime,
      statusSelectKey: [],
      searchIdType: 'robotWxid'
    })
  }

  onDeleteTask = (v) => {
    this.setState({ statusSelectKey: [] })
    let pagination = this.state.pagination;
    let params = {
      fctRobotMaterialIdList: [],
      type: 'multiple',
      params: {
        page: pagination.current - 1,
        size: this.state.pageSize,
        groupType: this.state.groupType,
      },
      pagination
    }

    if (typeof v === 'string' || typeof v === 'number') {
      params.fctRobotMaterialIdList = [v];
    } else {
      params.fctRobotMaterialIdList = this.state.statusSelectKey;
    }

    if (!!this.state.robotId) {
      params.params.robotId = this.state.robotId;
    }

    if (this.state.robotTagId !== 'ALL') {
      params.params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.deleteRobotTask(params);
  }

  onCancelTask = (v) => {
    this.setState({ statusSelectKey: [] })
    let pagination = this.state.pagination;
    let params = {
      fctRobotMaterialIdList: [],
      type: 'multiple',
      params: {
        page: pagination.current - 1,
        size: this.state.pageSize,
        groupType: this.state.groupType,
      },
      pagination
    }

    if (typeof v === 'string' || typeof v === 'number') {
      params.fctRobotMaterialIdList = [v];
    } else {
      params.fctRobotMaterialIdList = this.state.statusSelectKey;
    }

    if (!!this.state.robotId) {
      params.params.robotId = this.state.robotId;
    }

    if (this.state.robotTagId !== 'ALL') {
      params.params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.cancelRobotTask(params);
  }

  onResendTask = (v) => {
    this.setState({ statusSelectKey: [] })
    let pagination = this.state.pagination;
    let params = {
      fctRobotMaterialIdList: [],
      type: 'multiple',
      params: {
        page: pagination.current - 1,
        size: this.state.pageSize,
        groupType: this.state.groupType,
      },
      pagination
    }

    if (typeof v === 'string' || typeof v === 'number') {
      params.fctRobotMaterialIdList = [v];
    } else {
      params.fctRobotMaterialIdList = this.state.statusSelectKey;
    }

    if (!!this.state.robotId) {
      params.params.robotId = this.state.robotId;
    }

    if (this.state.robotTagId !== 'ALL') {
      params.params.robotTagId = this.state.robotTagId;
    }

    if (this.state.status !== 'ALL') {
      params.params.status = this.state.status;
    }

    if (this.state.updateTime.length === 2) {
      params.updateTimeStart = this.state.updateTime[0].toDate().getTime();
      params.updateTimeEnd = this.state.updateTime[1].toDate().getTime() + 24 * 3600 * 1000 - 1;
    }

    this.props.resendRobotTask(params);
  }

  showMultipleSetting = () => {
    let btn = '';
    if (this.state.statusSelectKey.length > 0) {
      if (this.state.status === 'CANCEL') {
        btn = (<Popconfirm placement="right" title={`确定删除 ${this.state.statusSelectKey.length} 条数据嘛？`} onConfirm={this.onDeleteTask} okText="确定" cancelText="取消">
                  <Button type="danger" size="small">批量删除</Button>
                </Popconfirm>)
      } else if (this.state.status === 'INIT') {
        btn = (<Popconfirm placement="right" title={`确定取消 ${this.state.statusSelectKey.length} 条数据嘛？`} onConfirm={this.onCancelTask} okText="确定" cancelText="取消">
                  <Button type="default" size="small">批量取消</Button>
                </Popconfirm>)
      } else if (this.state.status === 'ERROR') {
        btn = (<Popconfirm placement="right" title={`确定重发 ${this.state.statusSelectKey.length} 条数据嘛？`} onConfirm={this.onResendTask} okText="确定" cancelText="取消">
                  <Button type="primary" size="small">批量重发</Button>
                </Popconfirm>)
      }
    }

    return btn;
  }

  onStatusSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ statusSelectKey: selectedRowKeys })
  }

  onStatusCheckbox = (r) => {
    let params = {}

    if (this.state.status === 'CANCEL' || this.state.status === 'INIT' || this.state.status === 'ERROR') {
      params.disabled = false;
    } else {
      params.disabled = true;
    }

    return params;
  }

  onSearchIdChange = (v) => {
    this.setState({ searchIdType: v })
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
            <Form.Item label="微信搜索">
              <Input.Search
                size="small"
                style={{ width: 260, marginTop: 5}}
                onSearch={this.onRobotIdSelect}
                onChange={this.onRobotIdChange}
                value={this.state.robotId}
                placeholder="输入查询ID"
                addonBefore={(
                  <Select
                    size="small"
                    defaultValue={this.state.searchIdType}
                    style={{ width: 80 }}
                    onChange={this.onSearchIdChange}
                    value={this.state.searchIdType}>
                    <Select.Option value="robotWxid">微信ID</Select.Option>
                    <Select.Option value="robotId">机器人ID</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
            <Form.Item label="分类">
              <Select
                size="small"
                defaultValue="ALL"
                style={{ width: 120 }}
                onChange={this.onRobotTagIdChange}
                value={this.state.tagValue[this.state.robotTagId]}>
                  <Select.Option value="ALL">全部</Select.Option>
                  {
                    this.state.tagList.map(item => {
                      return <Select.Option key={'tag'+item.id} value={''+item.id}>{item.name}</Select.Option>
                    })
                  }
              </Select>
            </Form.Item>
            <Form.Item label="状态">
              <Select
                size="small"
                defaultValue="ALL"
                style={{ width: 120 }}
                onChange={this.onStatusChange}
                value={this.state.status}>
                {
                  Object.keys(this.state.sendStatus).map((key, index) => {
                    return <Select.Option key={key} value={key}>{this.state.sendStatus[key]}</Select.Option>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item label="更新时间">
              <RangePicker
                size="small"
                format="YYYY-MM-DD"
                placeholder={['开始时间', '结束时间']}
                onChange={this.onUpdateTimeChange}
                value={this.state.updateTime} />
            </Form.Item>
            <Form.Item>
              <Button type="default" size="small" onClick={this.onClearParams} >重置</Button>
            </Form.Item>
            <Form.Item>{ this.showMultipleSetting() }</Form.Item>
          </Form>
        </div>
        <Table
          className='robot-materials'
          columns={this.state.columns}
          dataSource={this.state.dataSource}
          rowKey={record => record.id}
          pagination={this.state.pagination}
          bordered={true}
          onChange={this.handleTableChange}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: this.state.statusSelectKey,
            onChange: this.onStatusSelectChange,
            getCheckboxProps: this.onStatusCheckbox
          }}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    getRobotMaterials: (lists) => {
      dispatch(getRobotMaterials(lists))
    },
    deleteRobotTask: (lists) => {
      dispatch(deleteRobotTask(lists))
    },
    cancelRobotTask: (lists) => {
      dispatch(cancelRobotTask(lists))
    },
    resendRobotTask: (lists) => {
      dispatch(resendRobotTask(lists))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RobotMaterial);