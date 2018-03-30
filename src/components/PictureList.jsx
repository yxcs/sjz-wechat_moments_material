import React from 'react';
import {
  Table,
  Row,
  Col,
  Button,
} from 'antd';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  getPictureList,
  deleteResourceByIds,
  checkResourceByIds,
} from '../actionCreator';
import ImageViewer from './ImageViewer';

const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const ToolBox = styled(Row)`
  position: sticky;
  top: 0;
  padding: 16px 0;
  border-top: 1px solid #f7f7f7;
  border-bottom: 1px solid #f7f7f7;
  z-index: 1;
  background: white;
`
class Picture extends React.Component {
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
          title: '图片内容',
          dataIndex: 'sourcePublish',
          render: (text, data, index) => {
            if (data.type === 'IMAGE') {
              if (data.url.indexOf('imageMogr2') === -1) {
                return <ImageViewer url={`${data.url}?imageMogr2/thumbnail/200x`} />
              } else {
                return <ImageViewer url={`${data.url}/thumbnail/200x`} />
              }
            }
          }
        }, {
          title: '分类',
          dataIndex: 'tagName',
        }, {
          title: '状态',
          dataIndex: 'status',
          render: text => {
            if (text === 'WAIT_CHECK') {
              return '待审核';
            } else if (text === 'CHECKED') {
              return '已审核';
            } else {
              return '已使用'
            }
          }
        }, {
          title: '创建时间',
          dataIndex: 'createdAt',
          render: (text, data, index) => {
            if (text) {
              return `${new Date(text).toLocaleString()}`;
            } else {
              return '----';
            }
          }
        }, {
          title: '操作',
          dataIndex: 'id',
          render: (id, data, index) => {
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
  rowSelection = {
    onChange: (selectedKeys, selectedRows) => {
      this.setState({
        selectedKeys
      })
    }
  }
  componentWillMount () {
    this.props.getPictureList({
      ...this.state.pager,
      type: 'IMAGE',
      status: 'WAIT_CHECK'
    })
  }
  componentWillReceiveProps (nextProps) {
    console.log(nextProps);
    this.setState({
      loading: false
    })
  }
  handlePageChange = (page) => {
    this.setState({
      page: page - 1,
      loading: true
    })
    this.props.getPictureList(Object.assign(
      {...this.props.searchParams},
      {
        page: page - 1,
        type: 'IMAGE'
      }
    ))
  }

  // 批量审核
  handleCheck = (e) => {
    this.props.checkResourceByIds({
      ids: [parseInt(e.target.parentElement.dataset.id, 10)],
      searchParams: Object.assign(
        {
          status: 'WAIT_CHECK',
          ...this.props.searchParams
        },
        {
          page: this.props.pictures.get('page'),
          size: this.state.pager.size,
          type: 'IMAGE',
        }
      ),
      type: 'IMAGE'
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
          type: 'IMAGE',
        }
      ),
      type: 'IMAGE'
    })
    this.setState({
      loading: true
    })
  }

  handleCheckSelected = _ => {
    this.props.checkResourceByIds({
      ids: this.state.selectedKeys,
      searchParams: Object.assign(
        {
          status: 'WAIT_CHECK',
          ...this.props.searchParams
        },
        {
          page: this.props.pictures.get('page'),
          size: this.state.pager.size,
          type: 'IMAGE',
        }
      ),
      type: 'IMAGE'
    })
    this.setState({
      loading: true,
      selectedKeys: []
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
          type: 'IMAGE',
        }
      ),
      type: 'IMAGE'
    })
    this.setState({
      loading: true,
      selectedKeys: []
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
            }} onClick={this.handleDelecteSelected}>批量删除</Button>
          </Col>
        </ToolBox>
        <FullWidthTable
          loading={this.state.loading}
          pagination={{
            pageSize: this.state.pager.size,
            current: this.props.pictures.get('page') + 1,
            total: this.props.pictures.get('total'),
            onChange: this.handlePageChange,
            showQuickJumper: true
          }}
          rowSelection={this.rowSelection}
          dataSource={this.props.pictures.get('data')}
          columns={this.state.columns}
          rowKey='id'/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getPictureList: (params) => {
      dispatch(getPictureList(params))
    },
    deleteResourceByIds: (params) => {
      dispatch(deleteResourceByIds(params))
    },
    checkResourceByIds: params => {
      dispatch(checkResourceByIds(params))
    }
  }
}

const PictureList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Picture);

export default PictureList;