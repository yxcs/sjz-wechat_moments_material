import React from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Radio,
  Table,
  message,
  Tooltip,
  Icon,
  Tabs,
  Modal,
  Row,
  Col,
  Select,
  Breadcrumb,
  Avatar,
  Checkbox,
} from 'antd';
const { RangePicker } = DatePicker;
import moment from 'moment';

import { connect } from 'react-redux';
import {
  getAllMaterials,
  getRobots
} from '../actionCreator';
import { createTarks, getRobotTagList } from '../services.js';
import { Link } from 'react-router-dom';
import AutoSelectComp from './AutoSelectComp';
import ImageViewer from './ImageViewer';

class CreateTasks extends React.Component {
  constructor(props) {
    super(props);
    const nowStartTime= +moment();
    this.state = {
      singleNum: 'fiexd',
      distributionType: 'SYSTEM',
      groupType: 'SELF',
      status: 'ONLINE',
      robotSendNum: 3,
      title: '',
      startAt: '',
      usePackage: false,
      endAt: '',
      tagId: 'ALL',
      pageSize: 20,
      tagList: [],            // 微信分组列表
      wxLists: [],            // 微信素材列表
      wxVisible: false,
      wxPagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      },                      // 微信 素材分页
      columns: [
        { title: '#', dataIndex: 'id', width: 60, key: 'select_id', render: (v, r, i) => {return <span> { i+1 } </span>} },
        { title: '微信头像', dataIndex: 'avatarUrl', key: 'select_avatarUrl', render: (v, r, i) => {
          return !!v ? <img alt='微信头像' width="30" height="30" src={v} /> : <Avatar size="small" style={{ backgroundColor: '#87d068' }} icon="user" />;
        }},
        { title: '微信昵称', dataIndex: 'nickName', key: 'select_nickName' },
        { title: '微信ID', dataIndex: 'wxId', key: 'select_wxid' },
        { title: '微信号', dataIndex: 'alias', key: 'select_alias', render: (v, r) => { return !!v ? v : '--'; } },
        { title: '分组', dataIndex: 'tagId', key: 'select_tagId', render: (v, r) => {
          let tagObj = this.state.tagList.filter(item => {
            return item.id === v;
          })
          return tagObj.length > 0 ? tagObj[0].name : '--';
        }},
        { title: '所属组', dataIndex: 'groupType', key: 'select_groupType', render: (v, r) => {
          return v === 'SELF'? '自营' : (v === 'GUANGZHOU' ? '广州' : '北京');
        } },
        { title: '状态', dataIndex: 'status', key: 'select_onlineStatus', render: (v, r) => {
          if (v === 'ONLINE') {
            return <span style={{color: '#13CE66'}}><Icon type="bulb" /></span>
          }else if (v === 'OFFLINE') {
            return <span style={{color: '#FF4949'}}><Icon type="bulb" /></span>
          }else if (v === 'DELETE') {
            return <span style={{color: '#FF4949'}}><Icon type="close-circle-o" /></span>
          }else if (v === 'ERROR') {
            return <span style={{color: '#FF4949'}}><Icon type="exclamation-circle-o" /></span>
          }else {
            return '--'
          }
        } }
      ],
      scVisible: false,
      updatedAtStart: '',     // 查询素材开始时间
      updatedAtEnd: '',       // 查询素材结束时间
      scPagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      },
      type: 'ALL',            // 查询素材类型 IMAGE(图片) LINK(链接) VIDEO(视频)
      scLists: [],            // 素材列表
      tag: '',
      scColumns:[
        { title: '#', dataIndex: 'id',  width: 60, key: 'material_id', render: (v, r, i) => {return <span> { i+1 } </span>} },
        { title: '文案', dataIndex: 'text', key: 'material_text' },
        { title: '分类', dataIndex: 'tagName', key: 'material_tagName', width: 80 },
        { title: '图片/文案', dataIndex: 'materialResourceList', key: 'material_url', render: (v, r, i) =>
          v.map((item, index, arr) => {
            let url = item.resource.url;
            if(url.indexOf('http') < 0) {
              url = 'http://' + url;
            }
            if (url.indexOf('?imageMogr2') === -1) {
              url += '?imageMogr2/thumbnail/200x';
            } else {
              url += '/thumbnail/200x';
            }
            if(item.resource.type === 'LINK') {
              let cover = '';
              let title = '';
              if (!!item.resource.articleImg) {
                cover = <img alt="图片加载失" src={item.resource.articleImg} style={{width: 32, height: 32}} />;
              } else {
                cover = <Avatar icon="picture" shape="square" style={{ backgroundColor: '#f56a00', verticalAlign: 'middle' }}></Avatar>
              }
              if (!!item.resource.title) {
                title =  <span style={{paddingLeft: 8}}>{item.resource.title}</span>;;
              } else {
                title = <span style={{paddingLeft: 8}}>文章{index+1}</span>;
              }
              return (<a title="点击打开文章" target="_blank" key={`article_${index}`} href={item.resource.url}>
                { cover }
                { title }
              </a>)
            }else if(item.resource.type === "IMAGE") {
              return (
                <ImageViewer
                  width={30}
                  height={30}
                  key={item.id}
                  trigger='click'
                  border={true}
                  url={url} />
              )
            } else {
              return null;
            }
          })
        },
        { title: '评论', dataIndex: 'materialCommentList', key: 'material_commentList', render: (v, r, i) =>
          v.map((item,index) => {
            return <p key={`comment__${index}`}>{`评论${index+1}:${item.commentText}`}</p>
          })
        }
      ],
      subWxList: [],          // 本次选择的微信列表
      subScList: [],          // 本次选择的素材列表
      subWxLists: [],         // 已选择的全部微信列表
      subScLists: [],         // 已选择的全部素材列表
      wxSelectKey: [],        // 本次选择的微信列表 的 rowKey 值
      wxSelectKeys: [],       // 已选择的全部微信列表 的 rowKey 值
      scSelectKey: [],        // 本次选择的素材列表 的 rowKey 值
      scSelectKeys: [],       // 已选择的全部素材列表 的 rowKey 值
      wxNowKey: '',           // 当前微信的id值，系统配置时为空
      confirmBtnloading: false,
      tagName: null,          // 新增主题任务标签字段
      nowStartTime
    }
  }

  /** 初始化  */
  componentWillMount() {
    this.getWxTagList();
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('should ?')
    return true;
  }


  getWxTagList = () => {
    getRobotTagList({}).then(data => {
      this.setState({ tagList: data.data.data })
    })
  }

/** 日期范围限定 */
  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current) => {
    return current && current.valueOf() < (Date.now() - 24 * 60 * 60 * 1000);
  }

  disabledRangeTime = (_, type) => {
    const hour = moment().hour();
    const minute = moment().minute()+1;
    if (type === 'start') {
      return {
        disabledHours: () => this.range(0, 60).splice(0, hour),
        disabledMinutes: () => this.range(0, minute)
      };
    }
    return {
      disabledHours: () =>this.range(0, 60).splice(hour, 24),
      disabledMinutes: () => this.range(minute, 60)
    };
  }

  disabledHours = () => {
    const hours = this.range(0, 60);
    const nowHour = moment().hour();
    hours.splice(nowHour, 60);
    return hours;
  }

  disabledMinutes = (h) => {
    const minute = this.range(0, 61);
    const nowMinute = moment().minute();
    minute.splice(nowMinute, 61);
    return minute;
  }

  checkDateTime = (r, v, cb) => {
    if(v.length === 0) {
      cb('日期不可为空');
    }else if(v.length === 2){
      let nowTimeUnix = Date.now();
      let startAtUnix = new Date(v[0]).getTime();
      let endAtUnix = new Date(v[1]).getTime();
      if(nowTimeUnix >= startAtUnix) {
        cb('任务开始时间必须大于此刻');
      }else if(startAtUnix >= endAtUnix) {
        cb('任务时间有错，请校验');
      }
    }else {
      cb()
    }
  }

/** 表单变化 */
  onFormTitleChange = (v) => {
    this.setState({ title: v.target.value });
  }

  onFormTagNameChange = (v) => {
    this.setState({ tagName: v.target.value });
  }

  onFormTimeChange = (moment, dateString) => {
    if(dateString.length === 2) {
      this.setState({
        startAt: new Date(dateString[0]).getTime(),
        endAt: new Date(dateString[1]).getTime()
      })
    }
  }

  onFormFixNumChange = (v) => {
    this.setState({ robotSendNum: v });
  }

  onFormSettingChange = (v) => {
    let distributionType = v.target.value;
    this.setState({
      distributionType,
      subScList: [],
      subScLists: [],
      scSelectKey: [],
      scSelectKeys: []
    });
  }

/** 微信列表表格  */
  onShowWxModel = () => {
    const subWxList = this.state.subWxLists;
    const wxSelectKey = this.state.wxSelectKeys;
    this.setState({
      subWxList: [...subWxList],
      wxSelectKey: [...wxSelectKey],
      wxVisible: true,
      status: 'ONLINE',
      tagId: 'ALL',
      wxPagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      }
    }, () => {
      let params = {
        page: 0,
        size: 20,
        groupType: this.state.groupType,
        status: 'ONLINE'
      }
      this.props.getRobots(params);
    })
  }

  getWxListsTable = () => {
    return (
      <div style={{padding: '20px 0'}}>
        <Modal
          title="微信机器人选择"
          className='modal-robot'
          visible={this.state.wxVisible}
          onCancel={this.onWxModelCancel}
          width={1000}
          onOk={this.onWxSelectOK}>
            <div>
              <Form layout="inline">
                <Form.Item>
                  <Radio.Group
                    defaultValue={this.state.groupType}
                    value={this.state.groupType}
                    size="small"
                    onChange={this.onWxTypeChange}>
                    <Radio.Button value="SELF">自营</Radio.Button>
                    <Radio.Button value="GUANGZHOU">广州</Radio.Button>
                    <Radio.Button value="BEIJING">北京</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item>
                  <Radio.Group
                    defaultValue={this.state.status}
                    value={this.state.status}
                    size="small"
                    onChange={this.onWxOnlineChange}>
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
                    onChange={this.onWxTagsChange}
                    defaultValue={this.state.tagId}
                    value={this.state.tagId}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    <Select.Option value="ALL">全部</Select.Option>
                    {
                      this.state.tagList.map(item => {
                        return <Select.Option key={'key'+item.id} value={''+item.id}>{item.name}</Select.Option>
                      })
                    }
                    </Select>
                </Form.Item>
              </Form>
              </div>
              <AutoSelectComp
                selectAllBtnIndex={0}
                nextPageBtnIndex={0}
                selectAllBtnSelector='.modal-robot .ant-checkbox-input'
                nextPageBtnSelector='.modal-robot .ant-pagination-next'
                dataKey='robots' />
              <Table
                size="small"
                columns={this.state.columns}
                dataSource={this.state.wxLists}
                rowKey="id"
                pagination={this.state.wxPagination}
                onChange={this.onWxPageChange}
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys: this.state.wxSelectKey,
                  onChange: this.onWxSelectChange,
                  onSelect: this.onWxSelect,
                  onSelectAll: this.onWxSelectAll
                }}/>
          </Modal>
        </div>
      )
  }

  onWxPageChange = (pagination) => {
    const pager = this.state.wxPagination;
    pager.current = pagination.current;
    this.setState({
      wxPagination: pager
    });

    let params = {
      page: pagination.current - 1,
      size: this.state.pageSize,
      groupType: this.state.groupType
    };

    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }

    if(this.state.tagId !== 'ALL') {
      params.tagId = this.state.tagId;
    }

    this.props.getRobots(params)
  }

  onWxModelCancel = () => {
    const subWxList = this.state.subWxLists;
    const wxSelectKey = this.state.wxSelectKeys;
    this.setState({
      subWxList: [...subWxList],
      wxSelectKey: [...wxSelectKey],
      wxVisible: false
    })
  }

  onWxTypeChange = (v) => {
    let groupType = v.target.value;
    this.setState({ groupType })

    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: groupType
    }
    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }
    if(this.state.tagId !== 'ALL') {
      params.tagId = this.state.tagId;
    }
    this.props.getRobots(params)
  }

  onWxOnlineChange = (v) => {
    let status = v.target.value;
    this.setState({ status })
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }
    if(status !== 'ALL') {
      params.status = status;
    }
    if(this.state.tagId !== 'ALL') {
      params.tagId = this.state.tagId;
    }
    this.props.getRobots(params)
  }

  onWxTagsChange = (v) => {
    let tagId = v;
    this.setState({ tagId })
    let params = {
      page: 0,
      size: this.state.pageSize,
      groupType: this.state.groupType
    }
    if(this.state.status !== 'ALL') {
      params.status = this.state.status;
    }
    if(tagId !== 'ALL') {
      params.tagId = tagId;
    }
    this.props.getRobots(params)
  }

  onWxSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      wxSelectKey: selectedRowKeys
    })
  }

  onWxSelect = (r, s, sR) => {
    let subWxList = this.state.subWxList;
    if (s) {
      subWxList.push(r);
    } else {
      subWxList = subWxList.filter(item => {
        return item.id !== r.id;
      })
    }

    this.setState({ subWxList });
  }

  onWxSelectAll = (s, sr, cr) => {
    let subWxList = this.state.subWxList;
    if (s) {
      subWxList.push(...cr);
    } else {
      cr.forEach(item1 => {
        subWxList = subWxList.filter(item2 => {
          return item2.id !== item1.id;
        })
      })
    }
    this.setState({ subWxList });
  }

  onWxSelectOK = () => {
    const subWxLists = this.state.subWxList;
    const wxSelectKeys = this.state.wxSelectKey;
    this.setState({
      subWxLists: [...subWxLists],
      wxSelectKeys: [...wxSelectKeys],
      wxVisible: false
    })
  }

  /** 素材列表表格  */
  onShowScModel = (type, value) => {
    if (type === 'USER') {
      const subScLists = [...this.state.subScLists];
      const scSelectKeys = [...this.state.scSelectKeys];
      let subScList = [];
      let scSelectKey = [];

      subScLists.forEach(item => {
        if(item.id === value) {
          subScList = item.lists;
        }
      })

      scSelectKeys.forEach(item => {
        if(item.id === value) {
          scSelectKey = item.keys;
        }
      })

      this.setState({
        wxNowKey: value,
        subScList: [...subScList],
        scSelectKey: [...scSelectKey]
      });
    } else {
      const subScList = this.state.subScLists;
      const scSelectKey = this.state.scSelectKeys;
      this.setState({
        subScList: [...subScList],
        scSelectKey: [...scSelectKey]
      })
    }
    this.setState({
      scVisible: true,
      type: 'ALL',
      updatedAtStart: '',
      updatedAtEnd: '',
      scPagination: {
        current: 1,
        pageSize: 20,
        showTotal: total => `共 ${total} 条`
      }
    }, () => {
      let params = {
        page: 0,
        size: 20
      }
      this.props.getAllMaterials(params);
    })
  }
  getScListsTable = () => {
    return (
      <div style={{padding: '20px 0'}}>
        <Modal
          title="朋友圈素材绑定"
          className='modal-materials'
          visible={this.state.scVisible}
          onCancel={this.onScModelCancel}
          width={1000}
          onOk={this.onScSelectOK}>
          <div style={{marginBottom: '10px'}}>
            <Form layout="inline">
              <Form.Item label='更新时间'>
                <RangePicker
                  onChange={this.onScTimeChange}
                  placeholder={['开始时间', '结束时间']}/>
              </Form.Item>
              <Form.Item label='类型'>
                <Select
                  defaultValue='ALL'
                  style={{width: '100px'}}
                  value={this.state.type}
                  onChange={this.onScTypeChange}>
                  <Select.Option value='IMAGE'>图片</Select.Option>
                  <Select.Option value='LINK'>链接</Select.Option>
                  <Select.Option value='ALL'>全部</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label='分类'>
                <Input.Search
                  placeholder='请输入类目名'
                  onSearch={this.onScTagSearch}>
                </Input.Search>
              </Form.Item>
            </Form>
          </div>
          <AutoSelectComp
            selectAllBtnIndex={0}
            nextPageBtnIndex={0}
            selectAllBtnSelector='.modal-materials .ant-checkbox-input'
            nextPageBtnSelector='.modal-materials .ant-pagination-next'
            dataKey='materials' />
          <Table
            size="small"
            columns={this.state.scColumns}
            dataSource={this.state.scLists}
            rowKey="id"
            pagination={this.state.scPagination}
            onChange={this.onScPageChange}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: this.state.scSelectKey,
              onChange: this.onScSelectChange,
              onSelect: this.onScSelect,
              onSelectAll: this.onScSelectAll,
              /*getCheckboxProps: this.onScSelectAgain*/
            }}/>
        </Modal>
      </div>
    )
  }

  onScPageChange = (pagination) => {
    const pager = this.state.scPagination;
    pager.current = pagination.current;
    this.setState({
      scPagination: pager
    });

    let params = {
      page: pagination.current - 1,
      size: this.state.pageSize
    };

    if (!!this.state.tag) {
      params.tag = this.state.tag;
    }

    if (this.state.type !== 'ALL') {
      params.type = this.state.type;
    }

    if(this.state.updatedAtEnd !== '' && this.state.updatedAtStart !== '') {
      params.updatedAtEnd = this.state.updatedAtEnd;
      params.updatedAtStart = this.state.updatedAtStart;
    }

    this.props.getAllMaterials(params)
  }

  onScModelCancel = () => {
    this.setState({
      scVisible: false,
      wxNowKey: ''
    })
  }

  onScTimeChange = (date, dateSting) => {
    if (dateSting.length !== 2) return;
    this.setState({
      updatedAtStart: dateSting[0],
      updatedAtEnd: dateSting[1],
    })

    let params = {
      page: 0,
      size: 20,
      updatedAtStart: dateSting[0],
      updatedAtEnd: dateSting[1]
    }

    if (!!this.state.tag) {
      params.tag = this.state.tag;
    }

    if (this.state.type !== 'ALL') {
      params.type = this.state.type;
    }


    this.props.getAllMaterials(params);
  }

  onScTypeChange = (v) => {
    let type = v;
    this.setState({ type });

    let params = {
      page: 0,
      size: 20
    }

    if (!!this.state.tag) {
      params.tag = this.state.tag;
    }

    if (type !== 'ALL') {
      params.type = type;
    }

    if(this.state.updatedAtEnd !== '' && this.state.updatedAtStart !== '') {
      params.updatedAtEnd = this.state.updatedAtEnd;
      params.updatedAtStart = this.state.updatedAtStart;
    }

    this.props.getAllMaterials(params);
  }

  onScTagSearch = (v) => {
    let tag = v;
    this.setState({ tag });

    let params = {
      page: 0,
      size: 20
    }

    if (!!tag) {
      params.tag = tag;
    }

    if (this.state.type !== 'ALL') {
      params.type = this.state.type;
    }

    if(this.state.updatedAtEnd !== '' && this.state.updatedAtStart !== '') {
      params.updatedAtEnd = this.state.updatedAtEnd;
      params.updatedAtStart = this.state.updatedAtStart;
    }

    this.props.getAllMaterials(params);
  }

  onScSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      scSelectKey: selectedRowKeys
    })
  }

  onScSelect = (r, s, sR) => {
    let subScList = this.state.subScList;
    if (s) {
      subScList.push(r);
    } else {
      subScList = subScList.filter(item => {
        return item.id !== r.id;
      })
    }

    this.setState({ subScList });
  }

  onScSelectAll = (s, sr, cr) => {
    let subScList = this.state.subScList;
    if (s) {
      subScList.push(...cr);
    } else {
      cr.forEach(item1 => {
        subScList = subScList.filter(item2 => {
          return item2.id !== item1.id;
        })
      })
    }
    this.setState({ subScList });
  }

  onScSelectOK = () => {
    const subScList = [...this.state.subScList];
    const scSelectKey = [...this.state.scSelectKey];
    let subScLists = [...this.state.subScLists];
    let scSelectKeys = [...this.state.scSelectKeys];

    if (this.state.distributionType === 'USER') {
      subScLists.push({id: this.state.wxNowKey, lists: [...subScList]});
      scSelectKeys.push({id: this.state.wxNowKey, keys: [...scSelectKey]});
    } else {
      subScLists = [...subScList];
      scSelectKeys = [...scSelectKey];
    }

    this.setState({
      subScLists: [...subScLists],
      scSelectKeys: [...scSelectKeys],
      scVisible: false,
      wxNowKey: ''
    })
  }

  onScSelectAgain = (record) => {
    let params = {};
    if (this.state.distributionType === 'USER') {
      let flag = false;
      const wxId = this.state.wxNowKey;
      let subScLists = this.state.subScLists;

      for(let i = 0; i < subScLists.length; i ++) {
        if(subScLists[i].id !== wxId) {
          flag = subScLists[i].lists.some(item => {
            return item.id === record.id;
          })
        }

        if (flag) break;
      }

      params.disabled = flag;
    } else {
      params.disabled = false;
    }
    return params;
  }

  /** 已选微信表格 */

  deleteSelect = (wxId) => {
    let subWxLists = this.state.subWxLists;
    let wxSelectKeys = this.state.wxSelectKeys;
    let subScLists = this.state.subScLists;
    let scSelectKeys = this.state.scSelectKeys;

    subWxLists = subWxLists.filter(item => {
      return item.id !== wxId;
    })
    wxSelectKeys = wxSelectKeys.filter(item => {
      return item !== wxId;
    })

    if (this.state.distributionType === 'USER') {
      subScLists = subScLists.filter(item => {
        return item.id !== wxId;
      })
      scSelectKeys = scSelectKeys.filter(item => {
        return item.id !== wxId;
      })
    }

    this.setState({
      subWxLists: [...subWxLists],
      wxSelectKeys: [...wxSelectKeys],
      subScLists: [...subScLists],
      scSelectKeys: [...scSelectKeys]
    })
  }

  deleteMaterial = (mId, wxId) => {
    let subScLists = this.state.subScLists;
    let scSelectKeys = this.state.scSelectKeys;
    if (wxId > 0 && this.state.distributionType === 'USER') {
      subScLists = subScLists.map(item => {
        if (item.id === wxId) {
          item.lists = item.lists.filter(items => {
            return items.id !== mId;
          })
        }
        return item;
      })

      scSelectKeys = scSelectKeys.map(item => {
        if (item.id === wxId) {
          item.keys = item.keys.filter(items => {
            return items !== mId;
          })
        }
        return item;
      })
    } else {
      subScLists = subScLists.filter(item => {
        return item.id !== mId;
      })
      scSelectKeys = scSelectKeys.filter(item => {
        return item !== mId;
      })
    }

    this.setState({
      subScLists: [...subScLists],
      scSelectKeys: [...scSelectKeys]
    })
  }

  getSubTableSYS = () => {

    let wxSubColumns = [...this.state.columns];
    let scSubColumns2Wx = [...this.state.scColumns];

    let wxSub = { title: '删除', dataIndex: 'id', key: 'select_delete', render: (v, r, i) => {
      return <Button size="small" type="danger" shape="circle" icon="close" onClick={this.deleteSelect.bind(this, v)} />
    }};

    let suSub = { title: '操作', dataIndex: 'id', key: 'material_delete', render: (v, r, i) => {
      return <Button size="small" type="danger" shape="circle" icon="close" onClick={this.deleteMaterial.bind(this, v, -1)} />
    }};

    scSubColumns2Wx.push(suSub);
    wxSubColumns.push(wxSub)

    scSubColumns2Wx = scSubColumns2Wx.map(item => {
      item.key += '_sub';
      return item
    })

    return (
      <Row gutter={10}>
        <Col span="13">
          <Table
            columns={wxSubColumns}
            dataSource={this.state.subWxLists}
            rowKey={record => record.id+'subWx'}
            pagination={false}
            locale={{emptyText: <p><Icon type="frown-o" />请选择微信</p>}}/>
        </Col>
        <Col span="11">
          <Table
            size="small"
            columns={scSubColumns2Wx}
            dataSource={this.state.subScLists}
            rowKey={record => record.id+'subSc'}
            pagination={false}
            bordered={false}
            locale={{emptyText: <p><Icon type="frown-o" />请选择素材</p>}}/>
        </Col>
      </Row>
    )
  }

  getSubTableUSER = () => {
    let wxSubColumns = [...this.state.columns];
    let scColumns = [...this.state.scColumns];

    let suSub = { title: '操作', dataIndex: 'id', key: 'material_delete', render: (v, r, i) => {
      return <Button size="small" type="danger" shape="circle" icon="close" onClick={this.deleteMaterial.bind(this, v, r.rId)} />
    }};

    scColumns.push(suSub);

    let sub = { title: '素材', dataIndex: 'id', key: 'select_material', render: (v, r) => {
      let scItem = [];
      let subScLists = this.state.subScLists;
      subScLists.forEach(item => {
        if (item.id === v) {
          scItem = item.lists;
        }
      })
      scItem = scItem.map(item => {
        item.rId = v;
        return item;
      })
      return (
        <Table
          key={v.id+'table'}
          size="small"
          columns={scColumns}
          dataSource={scItem}
          rowKey="id"
          pagination={false}
          bordered={false}
          locale={{emptyText: <p><Icon type="frown-o" />请选择素材</p>}}/>
      )

    } };

    let wxSub = { title: '删除', dataIndex: 'id', key: 'select_delete', render: (v, r, i) => {
      return <Button size="small" type="danger" shape="circle" icon="close" onClick={this.deleteSelect.bind(this, v)} />
    }};

    let addButton = {title: '选择素材', dataIndex: 'id', key: 'select_addMaterial', render: (v, r) => {
      return <Button onClick={this.onShowScModel.bind(this, 'USER', v)} size="small" type="default">选择</Button>
    } };

    wxSubColumns.push(wxSub, addButton, sub);
    return (
        <Row>
          <Col span="24">
            <Table
              columns={wxSubColumns}
              dataSource={this.state.subWxLists}
              rowKey={record => record.id+'subWxSc'}
              pagination={false}
              locale={{emptyText: <p><Icon type="frown-o" />请选择微信</p>}}/>
          </Col>
        </Row>
      )
  }

  /** 表单提交  */
  onFormConfirm = () => {
    let { title, startAt, endAt, robotSendNum, distributionType, subWxLists, subScLists, tagName } = this.state;
    let params = {};
    let groupType = subWxLists.length > 0 ? subWxLists[0].groupType : null;
    let robotIds = [];
    let systemMaterialIds = [];
    let userMaterials = [];
    let allMaterialIds = [];
    let sameGroup = true;
    subWxLists.some(item => {
      if (item.groupType !== groupType) {
        sameGroup = false;
        return true;
      } else {
        return false;
      }
    })

    if (!sameGroup) {
      message.error('所选微信号必须是同一个组！')
      return;
    }

    if (!!groupType) {
      params.groupType = groupType;
    } else {
      message.error('创建的任务未分组');
      return ;
    }

    if (!!title) {
      params.title = title;
    } else {
      message.error('标题未填');
      return ;
    }

    if (!!tagName) {
      params.tagName = tagName;
    } else {
      message.error('主题任务标签未填');
      return ;
    }

    if (!!startAt && !!endAt) {
      params.startAt = startAt;
      params.endAt = endAt;
    } else {
       params.startAt = parseInt(+moment(), 10) + 2 * 60 * 1000;
       params.endAt = parseInt(moment().endOf('day').format('x'), 10);
    }

    if (new Date(params.startAt) > new Date(params.endAt)) {
      message.warning('请重新选择任务时间，结束时间小于开始时间');
      return ;
    }

    if ((+moment() - new Date(params.startAt)) >= 60000) {
      message.warning('请重新选择任务时间，开始时间至少大于当前时间1分钟');
      return ;
    }

    if (!!robotSendNum) {
      params.robotSendNum = robotSendNum;
    } else {
      message.error('单号发布数有误');
      return ;
    }

    if (!!distributionType && (distributionType === 'USER' || distributionType === 'SYSTEM' || distributionType === 'ALL')) {
      params.distributionType = distributionType;
    } else {
      message.error('配置类型有误');
      return ;
    }

    if (distributionType === 'SYSTEM') {
      robotIds = subWxLists.map(item =>{
        return item.id;
      })
      systemMaterialIds = subScLists.map(item => {
        return item.id;
      })

      if (robotIds.length > 0) {
        params.robotIds = robotIds;
      } else {
        message.warning('亲，记得选微信号哦');
        return ;
      }

      if (systemMaterialIds.length > 0) {
        params.systemMaterialIds = systemMaterialIds;
      } else {
        message.warning('亲，记得选素材哦');
        return ;
      }

      if (robotIds.length * systemMaterialIds.length < robotIds.length  *robotSendNum) {
        message.error(`${robotIds.length}个微信至少需要${robotIds.length  *robotSendNum}个素材`);
        return ;
      }
    } else if (distributionType === 'USER') {
      robotIds = subWxLists.map(item =>{
        return item.id;
      })

      subScLists.forEach(items => {
        let list = {};
        list.robotId = items.id;
        list.materialIds = items.lists.map(item => {
          return item.id
        })
        userMaterials.push(list);
      })

      if (robotIds.length > 0) {
        params.robotIds = robotIds;
      } else {
        message.warning('亲，记得选微信号哦');
        return ;
      }

      let flag = false;
      userMaterials.forEach(item => {
        if (item.materialIds.length !== robotSendNum) {
          flag = true;
        }
      })

      if (flag){
        message.error(`每个微信号都需要有${robotSendNum}个素材`);
        return ;
      } else {
        params.userMaterials = userMaterials;
      }
    } else {
      robotIds = subWxLists.map(item =>{
        return item.id;
      })
      allMaterialIds = subScLists.map(item => {
        return item.id;
      })

      if (robotIds.length > 0) {
        params.robotIds = robotIds;
      } else {
        message.warning('亲，记得选微信号哦');
        return ;
      }

      if (allMaterialIds.length > 0) {
        params.allMaterialIds = allMaterialIds;
      } else {
        message.warning('亲，记得选素材哦');
        return ;
      }

      if (allMaterialIds.length < robotSendNum) {
        message.error(`至少需要${robotSendNum}个素材`);
        return ;
      }
    }

    // 是否启用小尾巴
    params.addTextSub = this.state.usePackage;
    this.setState({ confirmBtnloading: true })
    createTarks(params).then(data => {
      if (data.data.status === 1) {
        message.success('创建成功')
        setTimeout(() => {
          this.props.history.push(`/tasks?type=${groupType}`);
        }, 500)
      } else {
        message.error(data.data.details)
      }
      this.setState({ confirmBtnloading: false })
    })

  }

  /** props改变时，更改页面信息  */
  componentWillReceiveProps (nextProps) {
    let wxPagination = this.state.wxPagination;
    wxPagination.total = nextProps.robots.get('total');

    let scPagination = this.state.scPagination;
    scPagination.total = nextProps.materials.get('total');

    this.setState({
      wxLists: nextProps.robots.get('data'),
      wxPagination,
      scLists: nextProps.materials.get('data'),
      scPagination
    })
  }

  // 是否启用小尾巴
  handlePackageChange = (e) => {
    this.setState({
      usePackage: e.target.checked
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Breadcrumb style={{
          background: 'white',
          padding: '10px 0 10px 10px',
          borderBottom: 'solid #f7f7f7 1px',
          margin: '-8px -20px 0',
          position: 'sticky',
          top: '-16px',
          zIndex: '999'}}>
          <Breadcrumb.Item>
            <Link to='/tasks'>任务列表</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to='/tasks/create'>创建任务</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Tabs activeKey='createTasks'>
          <Tabs.TabPane tab='创建任务' key='createTasks'>
            <Form>
              <Form.Item label="任务主题" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                {getFieldDecorator('title', {
                  rules: [
                    { required: true, message: '请输入任务标题' },
                  ],
                })(
                  <Input placeholder="请输入任务的主题" type="text" name="title" id="title" onChange={this.onFormTitleChange}/>
                )}
              </Form.Item>
              <Form.Item label="主题任务标签" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                {getFieldDecorator('tagName', {
                  rules: [
                    { required: true, message: '请输入任务标签' },
                  ],
                })(
                  <Input
                    style={{width: 200}}
                    placeholder="请输入任务主题标签，例如'美食'"
                    type="text"
                    name="tagName"
                    id="tagName"
                    onChange={this.onFormTagNameChange}/>
                )}
              </Form.Item>
              <Form.Item label="任务时间" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                {getFieldDecorator('range-picker', {
                  initialValue: [moment(this.state.nowStartTime), moment().endOf('day')],
                  rules: [
                    { validator: this.checkDateTime }
                  ]
                })(
                  <RangePicker
                    placeholder="标准为每日的6:00-23:59"
                    onChange={this.onFormTimeChange}
                    showTime={{
                      hideDisabledOptions: true,
                      defaultValue: [moment(this.state.nowStartTime, 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
                    }}
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={this.disabledDate}
                    ranges={{ '今天': [moment().add(2, 'm'), moment().endOf('day')],
                          '明天': [moment().startOf('day').add(30, 'hours'), moment().add(1, 'days').endOf('day')],
                          '后天': [moment().startOf('day').add(54, 'hours'), moment().add(2, 'days').endOf('day')]
                  }}/>
                )}
              </Form.Item>
              <Form.Item label="单号发布数" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                  <div><InputNumber defaultValue={3} min={1} max={50} onChange={this.onFormFixNumChange}/> 条</div>
              </Form.Item>
              <Form.Item label="配置选择" labelCol={{span: 3}} wrapperCol={{span: 12}}>
                <Radio.Group defaultValue={this.state.distributionType} onChange={this.onFormSettingChange}>
                  <p>
                    <Radio value="SYSTEM">系统配置</Radio><Radio value="USER">自定义配置</Radio><Radio value="ALL">重复使用素材</Radio>
                  </p>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="微信素材添加" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                <p>
                  <span style={{paddingRight: '20px'}}><Button size="small" type="primary" onClick={this.onShowWxModel}>添加微信</Button></span>
                  <span>
                    <Button
                      disabled={this.state.subWxLists.length===0 || this.state.distributionType === 'USER'}
                      size="small"
                      type="default"
                      onClick={this.onShowScModel.bind(this, 'SYSTEM')}>
                      添加素材
                    </Button>
                  </span>
                  <Tooltip placement="right" title="需要先选择‘微信号’，方可添加素材">
                      <span style={{marginLeft: '10px', cursor: 'pointer', color: '#F7BA2A'}}><Icon type="question-circle-o" /></span>
                  </Tooltip>
                  <Checkbox
                    style={{marginLeft: '10px'}}
                    checked={this.state.usePackage}
                    onChange={this.handlePackageChange}>加小尾巴</Checkbox>
                </p>
              </Form.Item>
              <Form.Item label="数量说明" labelCol={{span: 3}} wrapperCol={{span: 8}}>
                {
                  this.state.distributionType === 'SYSTEM' ? `
                    ${this.state.subWxLists.length}个微信号，至少需要${this.state.subWxLists.length * this.state.robotSendNum}个素材` : (
                      this.state.distributionType === 'USER' ? `每个微信号要有${this.state.robotSendNum}个素材` : `
                      至少选择${this.state.robotSendNum}个素材，每个素材重复使用${this.state.subWxLists.length}次`
                    )
                }
              </Form.Item>
              <div style={{borderTop: '1px solid #eee', height: '20px'}}></div>
              <Form.Item labelCol={{span: 3}} wrapperCol={{span: 8}}>
                <div>
                  <span style={{marginRight: '40px'}}>
                    <Button loading={this.state.confirmBtnloading}
                      type="primary"
                      size="default"
                      onClick={this.onFormConfirm}>确定</Button>
                  </span>
                  <Link to='/tasks'><Button type='default'>取消</Button></Link>
                </div>
              </Form.Item>
            </Form>
            <div style={{borderTop: '1px solid #eee', height: '20px'}}></div>
            { this.state.distributionType === 'USER' ? this.getSubTableUSER() : this.getSubTableSYS() }
            { this.getWxListsTable() }
            { this.getScListsTable() }
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

const createForm  = Form.create;
CreateTasks = createForm({})(CreateTasks)

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
    getAllMaterials: (params) => {
      dispatch(getAllMaterials(params))
    },
    getRobots: (lists) => {
      dispatch(getRobots(lists))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTasks);