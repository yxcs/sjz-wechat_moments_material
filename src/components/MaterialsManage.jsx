import React from 'react';
import { connect } from 'react-redux';
import SearchBox from './SearchBox';
import ImageViewer from './ImageViewer';
import ArticleViewer from './ArticleViewer'
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Table,
  Row,
  Col,
  // Checkbox,
  Button,
  Input,
} from 'antd';
import {
  getAllMaterials,
  deleteMaterialsByIds,
  exportByParams,
  exportByIds,
} from '../actionCreator';
import * as config from '../config';

const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const DownloadForm = styled.form`
  display: inline;
`

const ToolBox = styled(Row)`
  position: sticky;
  top: -16px;
  padding: 16px 0;
  border-top: 1px solid #f7f7f7;
  border-bottom: 1px solid #f7f7f7;
  z-index: 1;
  background: white;
`

// hidden类型Input
const HiddenInput = styled(Input)`
  &.ant-input {
    display: none;
  }
`;

class Materials extends React.Component {
  constructor ( props ) {
    super(props);
    this.state = {
      columns: [
        {
          title: '序号',
          width: 50,
          render: (text, data, index) => {
            return index + 1;
          }
        }, {
          title: '素材内容',
          width: 200,
          dataIndex: 'materialResourceList',
          render: (resourceList, data, index) => {
            if (data.type === 'IMAGE') {
              const ImageList = resourceList.map(item => {
                return <ImageViewer key={item.id} url={
                  item.resource.url.indexOf('imageMogr2') === -1 ?
                    `${item.resource.url}?imageMogr2/thumbnail/200x` :
                    `${item.resource.url}/thumbnail/200x`
                } />
              })
              return ImageList;
            } else {
              if (data.type === 'LINK') {
                let urlResource = resourceList[0].resource;
                return <ArticleViewer url={urlResource.url} />
              }
            }
          }
        }, {
          title: '文案',
          width: 200,
          dataIndex: 'text',
          render: text => {
            if (text) {
              return text;
            } else {
              return '--暂无--'
            }
          }
        }, {
          title: '评论',
          width: 200,
          dataIndex: 'materialCommentList',
          render: (materialCommentList, data, index) => {
            const comments = materialCommentList.map((item, index) => {
              return <p key={item.id}>评论{index + 1}：{item.commentText}</p>
            })
            return comments;
          }
        }, {
          title: '分类',
          width: 50,
          dataIndex: 'tagName'
        }, {
          title: '类型',
          width: 50,
          dataIndex: 'type',
          render: (type, data, index) => {
            if (type === 'IMAGE') {
              return '图片'
            } else if (type === 'LINK') {
              return '链接'
            } else {
              return type;
            }
          }
        }, {
          title: '使用次数',
          width: 70,
          dataIndex: 'useCount'
        }, {
          title: '创建时间',
          width: 150,
          dataIndex: 'createdAt',
          render: (text, data, index) => {
            return new Date(text).toLocaleString();
          }
        }
      ],
      loading: true,
      pager: {
        page: 0,
        size: 20
      },
      selectedRowKeys: [],
      sysSelectAll: false, // 系统级全选
    }
  }
  componentWillMount () {
    this.props.getAllMaterials({
      page: 0,
      size: this.state.pager.size
    })
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      loading: false
    })
  }
  rowSelection = {
    onChange: (selectedKeys, selectedRows) => {
      this.setState({
        selectedRowKeys: selectedKeys
      })
    }
  }
  handleSysSelectAll = (e) => {
    this.setState({
      sysSelectAll: e.target.checked
    })
  }

  // 素材分页
  handlePageChange = (page) => {
    this.setState({
      loading: true,
      pager: {
        ...this.state.pager,
        page: page - 1
      }
    })
    this.props.getAllMaterials({
      ...this.props.searchParams,
      size: this.state.pager.size,
      page: page - 1
    })
  }

  // 批量删除
  handleDelecteSelected = () => {
    if (this.state.sysSelectAll) {

    } else {
      this.setState({
         loading: true,
      })
      this.props.deleteMaterialsByIds({
        ids: this.state.selectedRowKeys,
        searchParams: {
          page: this.state.pager.page,
          size: this.state.pager.size,
        }
      })
    }
  }

  // 批量导出
  handleExport = () => {
    if (this.state.sysSelectAll) {
      this.props.exportByParams({
        ...this.props.searchParams,
        size: this.state.pager.size,
        page: this.state.pager.size
      })
    } else {
      this.props.exportByIds({
        ids: this.state.selectedRowKeys
      })
    }
  }
  render () {
    return (
      <div>
        <SearchBox
          target='materials'
          useInTime={false}
          useUpdatedTime={true}
          useType={true}
          useTag={true} />
        <ToolBox>
          <Col span='3'>
            {/* 暂时隐藏素材的系统级全选按钮
            <Checkbox checked={this.state.sysSelectAll}
              onChange={this.handleSysSelectAll}>全选</Checkbox>
            {
              this.state.sysSelectAll ?
                <span>已选：{this.props.materials.get('total')}</span> :
                null
            }*/}
          </Col>
          <Col span='5' offset='16' style={{
            textAlign: 'right'
          }}>
            <DownloadForm action={
              this.state.sysSelectAll ?
                `${config.baseUrl}/material/exportByParam` :
                `${config.baseUrl}/material/exportByIds`
            } method='POST' encType='multipart/form-data'>
              {
                !this.state.sysSelectAll ?
                  <HiddenInput name='ids'
                    defaultValue={this.state.selectedRowKeys} /> :
                  (
                    <div>
                      {
                        this.props.searchParams.type ?
                          <HiddenInput name='type'
                            defaultValue={this.props.searchParams.type} /> :
                            null
                      }
                      {
                        this.props.searchParams.tag ?
                          <HiddenInput name='tag'
                            defaultValue={this.props.searchParams.tag} /> :
                            null
                      }
                      {
                        this.props.searchParams.origin ?
                          <HiddenInput name='origin'
                            defaultValue={this.props.searchParams.origin} /> :
                            null
                      }
                      {
                        this.props.searchParams.createdAtStart ?
                          <HiddenInput name='createdAtStart'
                            defaultValue={this.props.searchParams.createdAtStart} /> :
                            null
                      }
                      {
                        this.props.searchParams.createdAtEnd ?
                          <HiddenInput name='createdAtEnd'
                            defaultValue={this.props.searchParams.createdAtEnd} /> :
                            null
                      }
                      {
                        this.props.searchParams.status ?
                          <HiddenInput name='status'
                            defaultValue={this.props.searchParams.status} /> :
                            null
                      }
                    </div>
                  )
              }
              {/* 暂时隐藏，目前不允许批量导出，前端隐藏入口保留功能实现
                <Button size='small' style={{
                  marginRight: '10px'
              }} htmlType='submit'>批量导出</Button>*/}
            </ DownloadForm>
            <Button size='small' type='danger' style={{
              marginRight: '10px'
            }} onClick={this.handleDelecteSelected}
            disabled={this.state.selectedRowKeys.length === 0}>批量删除</Button>
            <Link to='/lists/create'>
              <Button size='small' type='primary'>创建素材</Button>
            </Link>
          </Col>
        </ToolBox>
        <FullWidthTable
          loading={this.state.loading}
          rowKey='id'
          columns={this.state.columns}
          dataSource={this.props.materials.get('data')}
          rowSelection={this.rowSelection}
          pagination={{
            pageSize: this.state.pager.size,
            current: this.props.materials.get('page') + 1,
            total: this.props.materials.get('total'),
            showQuickJumper: true,
            onChange: this.handlePageChange
          }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getAllMaterials: (params) => {
      dispatch(getAllMaterials(params))
    },
    deleteMaterialsByIds: (params) => {
      dispatch(deleteMaterialsByIds(params))
    },
    exportByParams: (params) => {
      dispatch(exportByParams(params))
    },
    exportByIds: (params) => {
      dispatch(exportByIds(params))
    }
  }
}

const MaterialManage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Materials)

export default MaterialManage