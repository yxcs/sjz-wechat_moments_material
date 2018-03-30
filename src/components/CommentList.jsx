import React from 'react';
import { connect } from 'react-redux';
import {
  getCommentList
} from '../actionCreator';
import {
  Table,
  Button,
  Row,
  Input,
  Modal,
} from 'antd';
import styled from 'styled-components';
import {
  addComment,
  updateComment,
  deleteComment,
} from '../actionCreator'

const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const Toolbar = styled(Row)`
  padding-bottom: 16px;
  button {
    margin: 0 5px;
  }
`

class Comments extends React.Component {
  constructor ( props ) {
    super(props);
    this.state = {
      pager: {
        page: 0,
        size: 20
      },
      columns: [
        {
          title: '序号',
          render: (text, data, index) => {
            return index + 1;
          }
        }, {
          title: '评论内容',
          dataIndex: 'text'
        }, {
          title: '创建时间',
          dataIndex: 'createdAt',
          render: date => {
            if (date) {
              return new Date(date).toLocaleString()
            } else {
              return '----'
            }
          }
        }, {
          title: '最近更新时间',
          dataIndex: 'updatedAt',
          render: date => {
            if (date) {
              return new Date(date).toLocaleString()
            } else {
              return '--暂未更新--'
            }
          }
        }, {
          title: '操作',
          dataIndex: 'id',
          render: id => {
            return (
              <div data-id={id}>
                <Button
                  shape='circle'
                  size='small'
                  data-id={id}
                  onClick={this.handleEdit}
                  icon='edit'></Button>
                <Button
                  shape='circle'
                  size='small'
                  data-id={id}
                  type='danger'
                  onClick={this.handleDelete}
                  style={{marginLeft: '10px'}}
                  icon='delete'></Button>
              </div>
            )
          }
        }
      ],
      comment: '',
      commentId: null,
      modalVisible: false,
      operation: 'ADD',
    }
  }
  componentWillMount () {
    this.props.getCommentList({
      page: this.state.pager.page,
      size: this.state.pager.size
    })
  }
  handleCommentChange = (e) => {
    this.setState({
      comment: e.target.value
    })
  }
  toggleVisible = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
      comment: ''
    })
  }
  handleCommentSubmit = () => {
    if (this.state.operation === 'ADD') {
      this.props.addComment({
        text: this.state.comment,
        pager: {
          ...this.state.pager,
          page: this.props.commentList.get('page')
        }
      })
    } else {
      this.props.updateComment({
        text: this.state.comment,
        id: this.state.commentId,
        pager: {
          ...this.state.pager,
          page: this.props.commentList.get('page')
        }
      })
    }
    this.toggleVisible()
  }
  handleAdd = () => {
    this.setState({
      operation: 'ADD',
      modalVisible: true
    })
  }
  handleEdit = (e) => {
    let comment = '';
    let targetId = parseInt(e.target.parentElement.dataset.id, 10);
    this.props.commentList.get('data').some(item => {
      if (item.id === targetId) {
        comment = item.text;
        return true;
      } else {
        return false;
      }
    })
    this.setState({
      operation: 'EDIT',
      modalVisible: true,
      commentId: targetId,
      comment
    })
  }
  handleDelete = (e) => {
    this.props.deleteComment({
      id: parseInt(e.target.parentElement.dataset.id, 10),
      pager: {
        page: this.props.commentList.get('page'),
        size: this.state.pager.size
      }
    })
  }
  handlePageChange = page => {
    this.setState({
      pager: Object.assign(this.state.pager, {
        page: page - 1
      })
    })
    this.props.getCommentList({
      size: this.state.pager.size,
      ...this.props.searchParams,
      page
    })
  }
  render () {
    return (
      <div>
        <Toolbar>
          <Button size='small'
            onClick={this.handleAdd}>添加</Button>
        </Toolbar>
        <FullWidthTable
          rowKey='id'
          rowSelection={this.rowSelection}
          dataSource={this.props.commentList.get('data')}
          pagination={{
            current: this.props.commentList.get('page') + 1,
            pageSize: this.state.pager.size,
            total: this.props.commentList.get('total'),
            onChange: this.handlePageChange
          }}
          columns={this.state.columns}/>
          <Modal title={this.state.operation === 'ADD' ? '添加评论' : '修改评论'}
            footer={
              <div>
                <Button size='small' onClick={this.toggleVisible}>取消</Button>
                <Button size='small' type='primary'
                  disabled={!this.state.comment}
                  onClick={this.handleCommentSubmit}>确定</Button>
              </div>
            }
            onCancel={this.toggleVisible}
            visible={this.state.modalVisible}>
            <Input type='textarea'
              placeholder='请输入评论内容，内容最大长度为500字符'
              rows={6}
              maxLength={500}
              value={this.state.comment}
              onChange={this.handleCommentChange} />
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
    getCommentList: (params) => {
      dispatch(getCommentList(params))
    },
    addComment: (params) => {
      dispatch(addComment(params))
    },
    deleteComment: (params) => {
      dispatch(deleteComment(params))
    },
    updateComment: (params) => {
      dispatch(updateComment(params))
    }
  }
}

const CommentList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Comments)

export default CommentList