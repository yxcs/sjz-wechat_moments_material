import React from 'react';
import { Modal, Button, Table, Icon, Popconfirm, Avatar } from 'antd';
import { SEND_STATUS } from '../config.js';

import { connect } from 'react-redux';
import {
  getRobotTask,
  deleteRobotTask,
  cancelRobotTask,
  resendRobotTask
} from '../actionCreator';
import ImageViewer from './ImageViewer'
import ArticleViewer from './ArticleViewer'

class WxTasksDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      sendStatus: {},
      columns: [
        { title: 'SendId', dataIndex: 'id', key: 'taskd_id', width: '80px' },
        { title: '朋友圈素材', dataIndex: 'fctRobotMaterialResourceList', key: 'taskd_pyq', width: '400px', render: (v, r, i) => {
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
                            cover = <img alt="图片加载失败" src={item.resource.articleImg} style={{width: 32, height: 32}} />;
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
        { title: '状态', dataIndex: 'status', key: 'taskd_status', width: '130px', render: (v, r, i) => {
          return this.state.sendStatus[v];
        }},
        { title: '发送时间', dataIndex: 'planSendAt', key: 'taskd_planSendAt', render: (v, r, i) => {
          let date = new Date(v);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;}
        },
        { title: '完成时间', dataIndex: 'status', key: 'taskd_finallSendAt', render: (v, r, i) => {
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
        { title: '操作', dataIndex: 'id', key: 'taskd_settingId', render: (v, r, i) => {
          if(r.status === 'CANCEL') {
            return (
              <p>
                <Popconfirm placement="top" title="你确定删除该任务嘛？" onConfirm={this.onDeleteTask.bind(this, r.id)} okText="确定" cancelText="取消">
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
      dataSource: []
    }
  }

  showModal = () => {
    this.setState({ visible: !this.state.visible })
  }

  componentWillReceiveProps (nextProps) {
    let wxTaskList = nextProps.wxTaskList
    let lists = [];
    wxTaskList.map(item => {
      if(item.fctRobotId['fctRobotId'] ===  this.props.wxId) {
        lists = item.lists
      }
      return item;
    })
    this.setState({
      dataSource: lists
    })
  }

  onShowModal = () => {
    let status = this.props.status;
    this.setState({
      sendStatus: SEND_STATUS[status]
    })
    let params = {
      fctRobotId: this.props.wxId
    }
    this.props.getRobotTask(params)
    this.showModal()
  }

  onDeleteTask = (id) => {
    let params = { fctRobotMaterialIdList: [id], taskId: this.props.wxId, type: 'single' };
    this.props.deleteRobotTask(params)
  }

  onResendTask = (id) => {
    let params = { fctRobotMaterialIdList: [id], taskId: this.props.wxId, type: 'single' };
    this.props.resendRobotTask(params)
  }

  onCancelTask = (id) => {
    let params = { fctRobotMaterialIdList: [id], taskId: this.props.wxId, type: 'single' };
    this.props.cancelRobotTask(params)
  }

  render () {
    return (
      <div>
        <Button type="primary" size="small" onClick={this.onShowModal}><Icon type="eye-o" /></Button>
        <Modal
          title="单号发布素材详情"
          visible={this.state.visible}
          onOk={this.showModal}
          onCancel={this.showModal}
          width={1000}
        >
           <Table
            columns={this.state.columns}
            dataSource={this.state.dataSource}
            rowKey={record => record.id}
            pagination={false}
            bordered={true}
            size="small"/>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    getRobotTask: (lists) => {
      dispatch(getRobotTask(lists))
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

export default connect(mapStateToProps, mapDispatchToProps)(WxTasksDetail);