import React from 'react';
import { connect } from 'react-redux';
import {
  getLinkList
} from '../actionCreator';
import {
  Table,
  Button,
  Row,
  Col,
} from 'antd';
import styled from 'styled-components';
import {
  deleteResourceByIds,
  checkResourceByIds,
} from '../actionCreator';
import ImageViewer from './ImageViewer'
import ArticleViewer from './ArticleViewer'

const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const ToolBox = styled(Row)`
  position: sticky;
  top: -10px;
  padding: 16px 0;
  border-top: 1px solid #f7f7f7;
  border-bottom: 1px solid #f7f7f7;
  z-index: 1;
  background: white;
`

class Links extends React.Component {
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
          width: 50,
          render: (text, data, index) => {
            return index + 1;
          }
        }, {
          title: '文章头图',
          dataIndex: 'articleImg',
          render: (text, data, index) => {
            return <ImageViewer
              url={text}/>
          }
        }, {
          title: '文章标题',
          dataIndex: 'title'
        }, {
          title: '文章链接',
          dataIndex: 'sourcePublish',
          render: (text, data, index) => {
            if (data.type === 'LINK') {
              return <ArticleViewer url={data.url} />
            }
          }
        }, {
          title: '状态',
          width: 60,
          dataIndex: 'status',
          render: status => {
            if (status === 'WAIT_CHECK') {
              return '待审核'
            } else if (status === 'CHECKED') {
              return '已审核'
            } else if (status === 'USED') {
              return '已使用'
            }
          }
        }, {
          title: '来源',
          width: 120,
          dataIndex: 'origin'
        }, {
          title: '创建时间',
          width: 150,
          dataIndex: 'createdAt',
          render: (text, data, index) => {
            return data.createdAt ?
              new Date(data.createdAt).toLocaleString() :
              '----'
          }
        }, {
          title: '最近更新时间',
          width: 150,
          dataIndex: 'updatedAt',
          render: (text, data, index) => {
            return data.updatedAt ?
              new Date(data.updatedAt).toLocaleString() :
              '----'
          }
        }, {
          title: '操作',
          dataIndex: 'id',
          width: 80,
          render: (id, data) => {
            return (
              <div data-id={id}>
                <Button data-id={id} icon='check' shape='circle'
                  type='primary'
                  onClick={this.handleCheck}
                  disabled={
                    data.status !== 'WAIT_CHECK'
                  }
                  style={{marginRight: '5px'}}
                  title={
                    data.status === 'WAIT_CHECK' ?
                      '点击以审核' :
                      '素材已审核'
                  }/>
                <Button data-id={id} icon='delete' shape='circle'
                  onClick={this.handleDelete}/>
              </div>
            )
          }
        }
      ],
      loading: true,
      selectedKeys: []
    }
  }
  componentWillMount () {
    this.props.getLinkList({
      ...this.props.searchParams,
      page: this.state.pager.page,
      size: this.state.pager.size,
      type: 'LINK'
    })
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      loading: false
    })
  }
  handlePageChange = (page) => {
    this.setState({
      pager: {
        page: page - 1,
        size: this.state.pager.size
      },
      loading: true
    })
    this.props.getLinkList({
      ...this.props.searchParams,
      page: page - 1,
      type: 'LINK',
      size: this.state.pager.size
    })
  }
  rowSelection = {
    onChange: (selectedKeys, selectedRows) => {
      this.setState({
        selectedKeys
      })
    }
  }

  // 批量审核
  handleCheckSelected = _ => {
    this.props.checkResourceByIds({
      ids: this.state.selectedKeys,
      searchParams: Object.assign(
        {
          status: 'WAIT_CHECK',
          ...this.props.searchParams
        },
        {
          page: this.props.linkList.get('page'),
          size: this.state.pager.size,
          type: 'LINK',
        }
      ),
      type: 'LINK'
    })
    this.setState({
      loading: true,
      selectedKeys: []
    })
  }

  handleCheck = e => {
    this.props.checkResourceByIds({
      ids: [parseInt(e.target.parentElement.dataset.id, 10)],
      searchParams: Object.assign(
        {
          status: 'WAIT_CHECK',
          ...this.props.searchParams
        },
        {
          page: this.props.linkList.get('page'),
          size: this.state.pager.size,
          type: 'LINK',
        }
      ),
      type: 'LINK'
    })
    this.setState({
      loading: true
    })
  }

  // 批量删除资源
  handleDelete = (e) => {
    this.props.deleteResourceByIds({
      ids: [e.target.parentElement.dataset.id],
      searchParams: Object.assign(
        {...this.props.searchParams},
        {
          page: this.props.pictures.get('page'),
          size: this.state.pager.size,
          type: 'LINK',
        }
      ),
      type: 'LINK'
    })
  }

  handleDelecteSelected = _ => {
    this.props.deleteResourceByIds({
      ids: this.state.selectedKeys,
      searchParams: Object.assign(
        {...this.props.searchParams},
        {
          page: this.props.pictures.get('page'),
          size: this.state.pager.size,
          type: 'LINK',
        }
      ),
      type: 'LINK'
    })
  }
  render () {
    return (
      <div>
        <ToolBox>
          {/*<Col span='3'>
            <Checkbox checked={this.state.sysSelectAll}
              onChange={this.handleSysSelectAll}>全选</Checkbox>
            {
              this.state.sysSelectAll ?
                <span>已选：{this.props.materials.get('total')}</span> :
                null
            }
          </Col>*/}
          <Col span='3' offset='21' style={{
            textAlign: 'right'
          }}>
            <Button size='small' type='primary' style={{
              marginRight: '10px'
            }} onClick={this.handleCheckSelected}
            disabled={
              this.state.selectedKeys.length === 0 ||
              this.props.searchParams.status !== 'WAIT_CHECK'
            }>批量审核</Button>
            <Button size='small' type='danger' style={{
              marginRight: '10px'
            }} onClick={this.handleDelecteSelected}
            disabled={this.state.selectedKeys.length === 0}>批量删除</Button>
          </Col>
        </ToolBox>
        <FullWidthTable
          rowKey='id'
          loading={this.state.loading}
          rowSelection={this.rowSelection}
          dataSource={this.props.linkList.get('data')}
          pagination={{
            current: this.props.linkList.get('page') + 1,
            pageSize: this.state.pager.size,
            total: this.props.linkList.get('total'),
            onChange: this.handlePageChange
          }}
          columns={this.state.columns}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getLinkList: params => {
      dispatch(getLinkList(params))
    },
    deleteResourceByIds: params => {
      dispatch(deleteResourceByIds(params))
    },
    checkResourceByIds: params => {
      dispatch(checkResourceByIds(params))
    }
  }
}

const LinkList = connect(
  mapStateToProps,
  mapDispatchToProps
  )(Links)

export default LinkList