import React from 'react';
import { connect } from 'react-redux';
import {
  Layout,
  Table,
  Pagination,
  Checkbox,
  Message,
  Button,
  Input,
  Modal,
  Form,
  Switch,
  Radio,
  Row,
  Col,
} from 'antd';
import {
  deleteSelectedList,
  getAllMaterials,
  checkResourceByParams,
  checkResourceByIds,
  deleteResourceByParams,
  deleteResourceByIds,
} from '../actionCreator';
import styled from 'styled-components';
import * as config from '../config';

const ToolBox = styled(Row)`
  margin: 10px 0;
`;

// hidden类型Input
const HiddenInput = styled(Input)`
  &.ant-input {
    display: none;
  }
`;

// set table width to 100%
const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const MaterialImg = styled.img`
  width: 250px;
`;

class Materials extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentSelectedData: [],  // 当前页已选择的数据
      sysSelectAll: false,
      materials: [],
      checkDialogVisible: false,
      tag: '食品',  // 审查素材时的素材类别
      addText: false,  // 审核素材时是否组合文案
      columns: [
        {
          title: '素材内容',
          dataIndex: 'sourcePublish',
          render: (text, record, index) => {
            switch (record.type) {
              case 'LINK':
                return <a href={record.url} title={record.url} target='_blank'>文章链接</a>;
              case 'IMAGE':
                return <MaterialImg src={`http://${record.url}`} alt=''/>;
              default:
                return '未知格式';
            }
          }
        }, {
          title: '文案',
          render: (text, data, index) => {
            if (data && data.resourcePublish && data.resourcePublish.text) {
              return data.resourcePublish.text
            } else {
              return '--暂无文案--'
            }
          }
        }, {
          title: '类型',
          dataIndex: 'type',
          width: 86,
          render: (text, data, index) => {
            if (data.type === 'IMAGE') {
              return '图片';
            } else if (data.type === 'LINK') {
              return '链接';
            } else if (data.type === 'VIDEO') {
              return '视频';
            }
          }
        }, {
          title: '分类',
          dataIndex: 'tagName'
        }, {
          title: '状态',
          dataIndex: 'status',
          width: 86,
          render: (text, data, index) => {
            if (data.status === 'WAIT_CHECK') {
              return '待审核'
            } else if (data.status === 'CHECKED') {
              return '已审核'
            } else if (data.status === 'EXPORTED') {
              return '已导出'
            }
          }
        }, {
          title: '最近更新时间',
          dataIndex: 'updatedAt',
          render: (text, data, index) => {
            return data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '----'
          }
        }
      ],
      tagsOptions: [{
        label: '食品',
        value: '食品'
      }, {
        label: '美妆',
        value: '美妆'
      }, {
        label: '女性服饰',
        value:'女性服饰'
      }, {
        label: '男性服饰',
        value: '男性服饰'
      }, {
        label: '科技',
        value: '科技'
      }, {
        label: '玩乐',
        value: '玩乐'
      }],
      isLoading: true,
      pager: {
        page: 0,
        size: 20
      }
    }
  }
  componentWillMount () {
    this.props.getAllMaterials({page: 0, size: this.state.pager.size});
  }
  // 单条记录的选择、反选操作
  handleSelectChange = {
    onChange: (selectedRowKeys, selectedRows) => {
      let dataList = Object.assign([], selectedRows);
      let exportIds = Object.assign([], selectedRowKeys);
      this.setState({
        currentSelectedData: dataList,
        exportIds,
      })
    }
  }
  // 标签分类切换
  handleTagChange = e => {
    this.setState({tag: e.target.value})
  }
  // 翻页操作
  handlePageChange = (page) => {
    this.setState({
      page: page - 1,
      isLoading: true
    })
    this.props.getAllMaterials({
      ...this.props.searchParams,
      page: page - 1,
      size: this.state.pager.size
    })
  }
  // 系统级全选
  handleSysSelectAll = (e) => {
    if (e.target.checked) {
      this.setState({
        sysSelectAll: true
      });
    } else {
      this.setState({
        sysSelectAll: false
      })
    }
  }
  // 是否组合文案的switch
  handleCombineTextChange = (value) => {
    this.setState({
      addText: value
    })
  }
  // 批量删除
  handleDelecteSelected = () => {
    let searchParams = this.props.searchParams;
    let ids = [];
    let currentSelectedData = this.state.currentSelectedData;
    if (this.state.sysSelectAll) {
      this.props.deleteResourceByParams(searchParams)
    } else {
      currentSelectedData.forEach(item => {
        if (ids.indexOf(item.id) === -1) {
          ids.push(item.id);
        }
      })
      if (ids.length > 0) {
        this.props.deleteResourceByIds(
          ids,
          this.props.searchParams
        )
      }
    }
  };

  toggleDialogDisplay = () => {
    this.setState({
      checkDialogVisible: !this.state.checkDialogVisible
    })
  }

  // 批量审核
  handleCheckSelectedSubmit = () => {
    let searchParams = this.props.searchParams;
    let currentSelectedData = this.state.currentSelectedData;
    let ids = [];
    let allGood = true;

    this.setState({
      checkDialogVisible: false
    })
    if (this.state.sysSelectAll) {
      if (searchParams.status === 'WAIT_CHECK') {
        this.props.checkResourceByParams(Object.assign({
          addText: this.state.addText,
          changeTag: this.state.tag
        }, searchParams))
      } else {
        Message.error(
          '只能对系统中所有未审核的素材进行批量审核！请重新选择筛选条件。'
        )
      }
    } else {
      currentSelectedData.forEach(item => {
        if (ids.indexOf(item.id) === -1) {
          ids.push(item.id);
        }
        if (item.status !== 'WAIT_CHECK') {
          allGood = false;
        }
      });
      if (!allGood) {
        Message.error('只能对未审核的素材进行审核！');
        return -1;
      }
      if (ids.length > 0) {
        this.props.checkResourceByIds(
          ids,
          this.props.searchParams,
          this.state.addText,
          this.state.tag,
        )
      } else {
        Message.error('未选择需要导出的素材！');
      }
    }
  };
  // 批量导出
  handleExportSelected = (e) => {
    e.preventDefault();
    let form = e.target;
    let allGood = true;
    if (this.state.sysSelectAll) {

      // 只能批量导出已审核的素材
      if (this.props.searchParams.status === 'CHECKED') {
        form.submit();
      } else {
        Message.error('只能导出已审核且未导出过的素材！');
      }
    } else {
      if (this.state.exportIds.length) {
        this.state.currentSelectedData.forEach(item => {
          if (item.status !== 'CHECKED') {
            allGood = false;
          }
        });
        if (!allGood) {
          Message.error('只能导出已审核且未导出过的素材！');
        } else {
          form.submit();
          // 要加延迟，否则拉取的数据不是最新
          setTimeout(_ => {
            this.props.getAllMaterials(this.props.searchParams);
          }, 500);
        }
      } else {
        Message.error('未选择需要导出的素材，请选择导出数据！');
      }
    }
  };
  componentWillReceiveProps (nextProps) {

    // 数据变更需要清空已选
    this.setState({
      materials: nextProps.materials,
      currentSelectedData: [],
      exportIds: [],
      isLoading: false
    })
  }
  render () {
    return (
      <div>
        <ToolBox>
          <Col span='3'>
            <Checkbox checked={this.state.sysSelectAll}
              onChange={this.handleSysSelectAll}>全选</Checkbox>
            {
              this.state.sysSelectAll ?
                <span>已选：{this.props.materialsTotal}</span> :
                null
            }
          </Col>
          <Col span='2' offset='12'>
            <Button size='small'
              onClick={this.toggleDialogDisplay}>批量审核</Button>
          </Col>
          <Col span='2'>
            <Button size='small'
              onClick={this.handleDelecteSelected}>批量删除</Button>
          </Col>
          <Col span='2'>
            <form method='post'
              action={
                this.state.sysSelectAll ?
                  `${config.baseUrl}/resource/exportResourceByParam` :
                  `${config.baseUrl}/resource/exportResourceByIds`
              }
              encType='multipart/form-data'
              onSubmit={this.handleExportSelected}
            >
              {
                !this.state.sysSelectAll ?
                  <HiddenInput name='ids' defaultValue={this.state.exportIds} /> :
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
              <Input type='submit' size='small' value='批量导出'
                style={{width: '64px', cursor: 'pointer'}}/>
            </form>
          </Col>
        </ToolBox>
        <Row>
          <FullWidthTable
            rowKey='id'
            columns={this.state.columns}
            dataSource={this.state.materials}
            bordered={true}
            rowSelection={this.handleSelectChange}
            pagination={{
              pageSize: this.state.pager.size,
              total: this.props.materialsTotal,
              current: this.props.materialsPage + 1,
              onChange: this.handlePageChange,
              showQuickJumper: true
            }}/>
        </Row>
        <Modal
          title='审核选项'
          visible={this.state.checkDialogVisible}
          onCancel={this.toggleDialogDisplay}
          onOk={this.handleCheckSelectedSubmit}
          onCancel={this.toggleDialogDisplay}>
          <Form>
            <Form.Item
              label='文案组合'>
              <Switch
                checkedChildren={`组  合`}
                unCheckedChildren='不组合'
                width={74}
                onChange={this.handleCombineTextChange}
                defaultChecked={this.state.addText}></Switch>
            </Form.Item>
            <Form.Item
              label='素材分类'>
              <Radio.Group
                value={this.state.tag}
                onChange={this.handleTagChange}
                options={this.state.tagsOptions} />
            </Form.Item>
          </Form>
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
    deleteSelectedList: (lists) => {
      dispatch(deleteSelectedList(lists))
    },
    getAllMaterials: (payload) => {
      dispatch(getAllMaterials(payload))
    },
    checkResourceByParams: (params) => {
      dispatch(checkResourceByParams(params));
    },
    checkResourceByIds: (ids, searchParams, addText, changeTag ) => {
      dispatch(checkResourceByIds({
        ids,
        searchParams,
        addText,
        changeTag
      }))
    },
    deleteResourceByParams: (params) => {
      dispatch(deleteResourceByParams(params));
    },
    deleteResourceByIds: (ids, searchParams) => {
      dispatch(deleteResourceByIds({
        ids,
        searchParams
      }))
    }
  }
}

const DataList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Materials);

export default DataList;