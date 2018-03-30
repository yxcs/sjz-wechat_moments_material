import React from 'react'
import { connect } from 'react-redux'
import {
  Tabs,
  Row,
  Col,
  Button,
  Radio,
  Input,
  Upload,
  Icon,
  Modal,
  Message,
  Table,
  Form,
  DatePicker,
  Breadcrumb,
} from 'antd'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  generateByHand,
  generateByAuto,
  getCommentList,
  getPictureList,
  getLinkList,
  getTextList,
} from '../actionCreator'
import ImageViewer from './ImageViewer'
import AutoSelectComp from './AutoSelectComp'
import ArticleViewer from './ArticleViewer'
import * as config from '../config'
const { RangePicker } = DatePicker
const FormItem = Form.Item

const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group
const Dragger = Upload.Dragger

const PaddingRow = styled(Row)`
  padding-bottom: 16px
`

const UploadBtn = styled.div`
  padding: 20px 0;
  .icon {
    color: #49a9ee;
    font-size: 80px;
  }
`

const SelectedTip = styled.p`
  margin-top: 6px
`

const CommentsWrapper = styled.div`
  margin-top: 16px
  padding: 20px 0 20px 20px
  background: #f7f7f7
`

const Comment = styled(Row)`
  margin-bottom: 16px
`

const UploadDragger = styled(Dragger)`
  .ant-upload {
    margin-bottom: 10px;
  }
`

class Creator extends React.Component {
  constructor ( props ) {
    super(props)
    this.state = {
      previewVisible: false,  // 预览框显示
      previewUrl: '',  // 预览图地址
      text: '',  // 自定义素材时的输入文案
      link: '', // 自定义文案时输入的链接
      tag: '食品', // 自动生成素材时的素材类别
      loading: false,
      taskRunning: false,
      selectedLink: [],
      selectedPicture: [],
      selectedText: [],
      selectedComment: [],
      selectedRowKeys: [],
      materialsType: 'IMAGE',
      comments: [
        // {
        //   id: Date.now(),
        //   text: ''
        // }
      ],
      modalVisible: false,
      selectPage: 0,
      operation: 'TEXT',
      dataKey: 'textList',
      title: '',
      columns: null,
      dataSource: null,
      pagination: {
        onChange: this.handlePageChange,
        size: 'small',
        showQuickJumper: true,
        pageSize: 20
      },
      textColumns: [
        {
          title: '序号',
          width: 50,
          render: (text, data, index) => {
            return index + 1
          }
        }, {
          title: '文案',
          dataIndex: 'text'
        }, {
          title: '创建时间',
          width: 160,
          dataIndex: 'createdAt',
          render: (text, data, column) => {
            if (data.createdAt) {
              return new Date(data.createdAt).toLocaleString()
            } else {
              return '----'
            }
          }
        }, {
          title: '最近更新时间',
          dataIndex: 'updatedAt',
          width: 160,
          render: (text, data, column) => {
            if (data.updatedAt) {
              return new Date(data.updatedAt).toLocaleString()
            } else {
              return '--暂未更新--'
            }
          }
        }
      ],
      pictureColumns: [
        {
          title: '序号',
          render: (text, data, index) => {
            return index + 1
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
          title: '创建时间',
          dataIndex: 'createdAt',
          render: (text, data, index) => {
            if (text) {
              return `${new Date(text).toLocaleString()}`
            } else {
              return '----'
            }
          }
        }
      ],
      linkColumns: [
        {
          title: '序号',
          width: 50,
          render: (text, data, index) => {
            return index + 1
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
          width: 140,
          dataIndex: 'createdAt',
          render: (text, data, index) => {
            return data.createdAt ?
              new Date(data.createdAt).toLocaleString() :
              '----'
          }
        }, {
          title: '最近更新时间',
          width: 140,
          dataIndex: 'updatedAt',
          render: (text, data, index) => {
            return data.updatedAt ?
              new Date(data.updatedAt).toLocaleString() :
              '----'
          }
        }
      ],
      commentColumns: [
        {
          title: '序号',
          render: (text, data, index) => {
            return index + 1
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
        }
      ],
      pager: {
        page: 0,
        size: 20
      },
      fileList: [
        // {
        //   uid: -1,
        //   name: '',
        //   staus: 'done',
        //   url: ''
        // }
      ],  // 多图上传的图片列表
      selectedStatus: 'CHECKED', // CHECKED
      times: [],
      tagIsOther: '',
      searchTag: ''
    }
  }
  componentWillReceiveProps (nextProps) {
    if (this.state.operation === 'TEXT') {
      this.setState({
        dataSource: nextProps.textList.get('data'),
        pagination: {
          ...this.state.pagination,
          total: nextProps.textList.get('total'),
          current: nextProps.textList.get('page') + 1
        }
      })
    } else if (this.state.operation === 'IMAGE') {
      this.setState({
        dataSource: nextProps.pictures.get('data'),
        pagination: {
          ...this.state.pagination,
          total: nextProps.pictures.get('total'),
          current: nextProps.pictures.get('page') + 1
        }
      })
    } else if (this.state.operation === 'LINK') {
      this.setState({
        dataSource: nextProps.linkList.get('data'),
        pagination: {
          ...this.state.pagination,
          total: nextProps.linkList.get('total'),
          current: nextProps.linkList.get('page') + 1
        }
      })
    } else if (this.state.operation === 'COMMENT') {
      this.setState({
        dataSource: nextProps.commentList.get('data'),
        pagination: {
          ...this.state.pagination,
          total: nextProps.commentList.get('total'),
          current: nextProps.commentList.get('page') + 1
        }
      })
    }
    this.setState({
      loading: false,
    })
  }

  // 图片预览
  handleImgPreview = (file) => {
    if (this.state.previewVisible) {
      this.setState({
        previewVisible: false
      })
    } else {
      this.setState({
        previewVisible: true,
        previewUrl: file.response.data || file.thumbUrl
      })
    }
  }

  // 上传图片回调
  handleUploadChange = ({ file, fileList }) => {
    this.setState({
      fileList
    })
  }

  // 上传图片之前的图片列表检查
  handleUploadCheck = (file, fileList) => {
    let left = 9 - this.state.fileList.length
    let currentIndex = 0
    if (left > 0) {
      fileList.some((item, index) => {
        if (item.uid === file.uid) {
          currentIndex = index
          return true
        } else {
          return false
        }
      })
      if (left >= currentIndex + 1) {
        return true
      } else {
        Message.error('最多只能上传9张图片,多余的图片将被丢弃！！！')
        return false
      }
    } else {
      Message.error('最多只能上传9张图片,多余的图片将被丢弃！！！')
      return false
    }
  }

  handleTextChange = (e) => {
    this.setState({
      text: e.target.value
    })
  }
  handleLinkChange = (e) => {
    this.setState({
      link: e.target.value
    })
  }

  // 添加评论
  handleCommentAdd = (e) => {
    if (this.state.comments.length >= 9) {
      Message.error('评论最多只能添加9条！')
    } else {
      let comments = Object.assign(this.state.comments)
      comments.push({
        id: Date.now(),
        text: ''
      })
      this.setState({
        comments
      })
    }
  }

  // 删除评论
  handleCommentDelete = (e) => {
    let id = parseInt(e.target.parentElement.dataset.id, 10)
    let targetIndex = -1
    let comments = Object.assign(this.state.comments)
    this.state.comments.some((item, index) => {
      if (item.id === id) {
        targetIndex = index
        return true
      } else {
        return false
      }
    })
    comments.splice(targetIndex, 1)
    this.setState({
      comments
    })
  }

  // 修改素材配置的内容类别
  handleTypeChange = (e) => {
    this.setState({
      materialsType: e.target.value
    })
  }

  // 评论文案的绑定
  handleCommentChange = (e) => {
    let id = e.target.id
    let comments = Object.assign(this.state.comments)
    comments.forEach(item => {
      if ('_' + item.id === id) {
        item.text = e.target.value
      }
    })
    this.setState({
      comments
    })
  }

  // 手动创建素材
  createByHand = _ => {
    let params = {}
    params.text = this.state.text
    params.type = this.state.materialsType
    params.comments = []

    // 自定义分类
    if(this.state.tag === 'others') {
      params.changeTag = this.state.tagIsOther
    } else {
      params.changeTag = this.state.tag
    }
    this.state.comments.forEach(item => {
      params.comments.push(item.text)
    })
    params.urls = []
    switch (this.state.materialsType) {
      case 'IMAGE':
        this.state.fileList.forEach(item => {
          params.urls.push(item.response.data)
        })
        break
      case 'LINK':
        params.urls.push(this.state.link)
        break
      default:
        break
    }
    this.props.generateByHand(params)
    this.setState({
      loading: true,
    })
  }

  // 根据参数组合素材
  createByParams = _ => {
    let resourceIds = []
    let changeTag =  this.state.tag
    if(this.state.tag === 'others') {
      changeTag = this.state.tagIsOther
    }
    if (this.state.materialsType === 'IMAGE') {
      resourceIds = this.state.selectedPicture
    } else if (this.state.materialsType === 'LINK') {
      resourceIds = this.state.selectedLink
    }
    this.props.generateByAuto({
      changeTag,
      textIds: this.state.selectedText,
      commentIds: this.state.selectedComment,
      resourceIds
    })
    this.setState({
      loading: true,
    })
  }

  handleTextChoose = () => {
    let pager = Object.assign(
      {...this.state.pager},
      {
        page: 0
      }
    )
    this.props.getTextList({
      ...pager,
      type: 'TEXT'
    })
    this.setState({
      modalVisible: true,
      title: '请选择文案资源',
      operation: 'TEXT',
      dataKey: 'textList',
      dataSource: null,
      pager,
      selectedRowKeys: this.state.selectedText,
      columns: this.state.textColumns
    })
  }

  handlePictureChoose = () => {
    let pager = Object.assign(
      {...this.state.pager},
      {
        page: 0
      }
    )
    this.props.getPictureList({
      type: 'IMAGE',
      status: this.state.selectedStatus,
      ...pager
    })
    this.setState({
      modalVisible: true,
      title: '请选择图片资源',
      operation: 'IMAGE',
      dataKey: 'pictures',
      dataSource: null,
      pager,
      selectedRowKeys: this.state.selectedPicture,
      columns: this.state.pictureColumns
    })
  }

  handleLinkChoose = () => {
    let pager = Object.assign(
      {...this.state.pager},
      {
        page: 0
      }
    )
    this.props.getLinkList({
      ...pager,
      type: 'LINK',
      status: 'CHECKED'
    })
    this.setState({
      modalVisible: true,
      title: '请选择链接资源',
      operation: 'LINK',
      dataKey: 'linkList',
      dataSource: null,
      pager,
      selectedRowKeys: this.state.selectedLink,
      columns: this.state.linkColumns
    })
  }

  handleCommentChoose = () => {
    let pager = Object.assign(
      {...this.state.pager},
      {
        page: 0
      }
    )
    this.props.getCommentList({
      ...pager,
      type: 'COMMNET',
    })
    this.setState({
      modalVisible: true,
      title: '请选择评论资源',
      operation: 'COMMENT',
      dataKey: 'commentList',
      dataSource: null,
      pager,
      selectedRowKeys: this.state.selectedComment,
      columns: this.state.commentColumns
    })
  }

  hideDialog = () => {
    this.setState({
      modalVisible: false,
    })
    // if canceled, reset the selection to []
    if (this.state.operation === 'TEXT') {
      this.setState({
        selectedRowKeys: this.state.selectedText
      })
    } else if (this.state.operation === 'IMAGE') {
      this.setState({
        selectedRowKeys: this.state.selectedPicture
      })
    } else if (this.state.operation === 'COMMENT') {
      this.setState({
        selectedRowKeys: this.state.selectedComment
      })
    } else if (this.state.operation === 'LINK') {
      this.setState({
        selectedRowKeys: this.state.selectedLink
      })
    }
  }

  // 分页
  handlePageChange = (page) => {
    this.setState({
      pager: {
        ...this.state.pager,
        page: page - 1
      }
    })
    let params = {
      size: this.state.pager.size,
      page: page - 1,
    }
    console.log(params);
    if(this.state.times.length === 2) {
      params.createdAtStart = this.state.times[0].startOf('day');
      params.createdAtEnd= this.state.times[1].startOf('day')
    }
    if (this.state.operation === 'TEXT') {
      this.props.getTextList({
        ...params,
        type: 'TEXT',
      })
    } else if (this.state.operation === 'IMAGE') {
      this.props.getPictureList({
        ...params,
        type: 'IMAGE',
        tag: this.state.searchTag,
        status: this.state.selectedStatus
      })
    } else if (this.state.operation === 'LINK') {
      this.props.getLinkList({
        ...params,
        type: 'LINK',
        status: this.state.selectedStatus
      })
    } else if (this.state.operation === 'COMMENT') {
      this.props.getCommentList({
        ...params,
        type: 'COMMENT',
      })
    }
  }

  // 确认选项
  sureChoose = _ => {
    this.setState({
      modalVisible: false
    })
    if (this.state.operation === 'TEXT') {
      this.setState({
        selectedText: this.state.selectedRowKeys
      })
    } else if (this.state.operation === 'IMAGE') {
      this.setState({
        selectedPicture: this.state.selectedRowKeys
      })
    } else if (this.state.operation === 'COMMENT') {
      this.setState({
        selectedComment: this.state.selectedRowKeys
      })
    } else if (this.state.operation === 'LINK') {
      this.setState({
        selectedLink: this.state.selectedRowKeys
      })
    }
  }

  // 类别切换
  handleTagChange = e => {
    this.setState({
      tag: e.target.value,
      tagIsOther: ''
    })
  }
  rowSelection = {
    onChange: selectedRowKeys => {
      this.setState({
        selectedRowKeys
      })
    }
  }

  handleTimeChange = (times) => {
    this.setState({
      times
    })
  }

  handleStatusChange = (selectedStatus) => {
    this.setState({
      selectedStatus
    })
  }

  handleSearchTagChange = (v) => {
    this.setState({
      searchTag: v.target.value
    })
  }

  handleSearch = () => {

    // reset pager to initial state
    this.setState({
      pager: {
        page: 0,
        size: this.state.pager.size
      }
    })
    let params = {
      page: 0,
      size: this.state.pager.size
    }
    if (this.state.times.length === 2) {
      params.createdAtStart = this.state.times[0].startOf('day');
      params.createdAtEnd =  this.state.times[1].startOf('day');
    }
    let operation = this.state.operation
    if (operation === 'TEXT') {
      this.props.getTextList(params)
    }else if (operation === 'IMAGE') {
      params.status = this.state.selectedStatus
      params.type = 'IMAGE'
      if(!!this.state.searchTag) {
        params.tag = this.state.searchTag;
      }
      this.props.getPictureList(params)
    }else if (operation === 'LINK') {
      params.status = this.state.selectedStatus
      params.type = 'LINK'
      this.props.getLinkList(params)
    }else if (operation === 'COMMENT') {
      this.props.getCommentList(params)
    }
  }

  resetParams = () => {
    let operation = this.state.operation
    this.setState({
      times: [],
      searchTag: '',
      selectedStatus: 'CHECKED'
    })
    if (operation === 'TEXT') {
      this.handleTextChoose()
    }else if (operation === 'IMAGE') {
      this.handlePictureChoose()
    }else if (operation === 'LINK') {
      this.handleLinkChoose()
    }else if (operation === 'COMMENT') {
      this.handleCommentChoose()
    }
  }

  onTagIsOther = (v) => {
    this.setState({ tagIsOther: v.target.value })
  }

  render () {
    this.rowSelection.selectedRowKeys = this.state.selectedRowKeys
    return (
      <div>
        <Breadcrumb style={{
          background: 'white',
          padding: '10px 0 10px 10px',
          borderBottom: 'solid #f7f7f7 1px',
          margin: '-8px -20px 0',
          position: 'sticky',
          top: '-16px',
          zIndex: '999'
        }}>
          <Breadcrumb.Item>
            <Link to='/lists'>素材库列表</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to='/lists/create'>创建素材</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Tabs defaultActiveKey='auto'>
          <TabPane tab='批量组合' key='auto'>
            <PaddingRow>
              <Col span={2}>
                <p>文案</p>
              </Col>
              <Col span={3}>
                <Button onClick={this.handleTextChoose}>选择文案资源</Button>
                <SelectedTip>已选择{this.state.selectedText.length}条</SelectedTip>
              </Col>
            </PaddingRow>
            <Row>
              <Col span={24} style={{fontSize: 0}}>
                <RadioGroup style={{width: '100%'}}
                  onChange={this.handleTypeChange}
                  defaultValue={this.state.materialsType}>
                  <PaddingRow>
                    <Col span={2}>
                      <Radio value='IMAGE'>图片</Radio>
                    </Col>
                    <Col span={3}>
                      <Button
                        disabled={this.state.materialsType === 'LINK'}
                        onClick={this.handlePictureChoose}>
                        选择图片资源</Button>
                      <SelectedTip>已选择{this.state.selectedPicture.length}条</SelectedTip>
                    </Col>
                  </PaddingRow>
                  <PaddingRow>
                    <Col span={2}>
                      <Radio value='LINK'>链接</Radio>
                    </Col>
                    <Col span={3}>
                      <Button
                        disabled={this.state.materialsType === 'IMAGE'}
                        onClick={this.handleLinkChoose}>
                        选择链接资源</Button>
                      <SelectedTip>已选择{this.state.selectedLink.length}条</SelectedTip>
                    </Col>
                  </PaddingRow>
                </RadioGroup>
              </Col>
            </Row>
            <PaddingRow>
              <Col span={2}>
                <p>评论</p>
              </Col>
              <Col span={3}>
                <Button onClick={this.handleCommentChoose}>选择评论资源</Button>
                <SelectedTip>已选择{this.state.selectedComment.length}条</SelectedTip>
              </Col>
            </PaddingRow>
            <PaddingRow>
              <Col span={2}>
                <p>分类</p>
              </Col>
              <Col span={22}>
                <RadioGroup value={this.state.tag}
                  onChange={this.handleTagChange}>
                  <Radio value='食品'>食品</Radio>
                  <Radio value='美妆'>美妆</Radio>
                  <Radio value='女性服饰'>女性服饰</Radio>
                  <Radio value='男性服饰'>男性服饰</Radio>
                  <Radio value='科技'>科技</Radio>
                  <Radio value='玩乐'>玩乐</Radio>
                  <Radio value='运营'>运营</Radio>
                  <Radio value='销售'>销售</Radio>
                  <Radio value='others'>
                    <span style={{paddingRight: '15px'}}>自定义</span>
                    <Input style={{width: '120px'}}
                      value={this.state.tagIsOther}
                      disabled={this.state.tag !== 'others'}
                      type='text'
                      placeholder='请输入分类内容'
                      onChange={this.onTagIsOther}/>
                  </Radio>
                </RadioGroup>
              </Col>
            </PaddingRow>
            <PaddingRow>
              <Button type='primary'
                disabled={
                  this.state.selectedText.length === 0 ||
                  (this.state.selectedPicture.length === 0 &&
                  this.state.selectedLink.length === 0)
                }
                loading={this.state.loading}
                onClick={this.createByParams}>确定</Button>
              <Link to='/lists'>
                <Button style={{marginLeft: '10px'}}>取消</Button>
              </Link>
            </PaddingRow>
          </TabPane>
          <TabPane tab='自定义单条' key='byHand'>
            <PaddingRow>
              <Col span={2}>
                <p>文案</p>
              </Col>
              <Col span={22}>
                <Input type='textarea' rows={4}
                  value={this.state.text}
                  maxLength={160}
                  onChange={this.handleTextChange}
                  placeholder='请输入素材文案，文本最大长度为160字符'></Input>
              </Col>
            </PaddingRow>
            <Row>
              <Col span={24} style={{fontSize: 0}}>
                <RadioGroup
                  value={this.state.materialsType}
                  onChange={this.handleTypeChange}
                  style={{width: '100%'}}>
                  <PaddingRow>
                    <Col span={2}>
                      <Radio value='IMAGE'>图片(最多9张)</Radio>
                    </Col>
                    <Col span={22}>
                      <UploadDragger
                        action={`${config.baseUrl}/image/upload`}
                        listType='picture-card'
                        name='file'
                        multiple={true}
                        fileList={this.state.fileList}
                        onPreview={this.handleImgPreview}
                        disabled={this.state.materialsType === 'LINK' || this.state.fileList.length >= 9}
                        beforeUpload={this.handleUploadCheck}
                        onChange={this.handleUploadChange}>
                        <UploadBtn>
                          <Icon type='inbox' className="icon" />
                          <div className="ant-upload-text">拖拽或点击上传图片（支持多选：点击上传按住Ctrl键多选；拖拽直接选择多张图片拖拽上传）</div>
                        </UploadBtn>
                      </UploadDragger>
                      <Modal visible={this.state.previewVisible}
                        footer={null}
                        onCancel={this.handleImgPreview}>
                        <img src={this.state.previewUrl}
                          style={{width: '100%'}}
                          alt="预览图加载失败"/>
                      </Modal>
                    </Col>
                  </PaddingRow>
                  <PaddingRow>
                    <Col span={2}>
                      <p>分类</p>
                    </Col>
                    <Col span={22}>
                      <RadioGroup value={this.state.tag}
                        onChange={this.handleTagChange}>
                        <Radio value='食品'>食品</Radio>
                        <Radio value='美妆'>美妆</Radio>
                        <Radio value='女性服饰'>女性服饰</Radio>
                        <Radio value='男性服饰'>男性服饰</Radio>
                        <Radio value='科技'>科技</Radio>
                        <Radio value='玩乐'>玩乐</Radio>
                        <Radio value='运营'>运营</Radio>
                        <Radio value='销售'>销售</Radio>
                        <Radio value='others'>
                          <span style={{paddingRight: '15px'}}>自定义</span>
                          <Input style={{width: '120px'}}
                            value={this.state.tagIsOther}
                            disabled={this.state.tag !== 'others'}
                            placeholder='请输入分类内容'
                            type='text'
                            onChange={this.onTagIsOther}/>
                        </Radio>
                      </RadioGroup>
                    </Col>
                  </PaddingRow>
                  <PaddingRow>
                    <Col span={2}>
                      <Radio value='LINK'>链接</Radio>
                    </Col>
                    <Col span={22}>
                      <Input placeholder='请输入文章链接'
                        style={{width: '100%'}}
                        disabled={this.state.materialsType === 'IMAGE'}
                        onChange={this.handleLinkChange}></Input>
                    </Col>
                  </PaddingRow>
                </RadioGroup>
              </Col>
            </Row>
            <PaddingRow>
              <Col span={2}>
                <p>评论</p>
              </Col>
              <Col span={22}>
                <Row>
                  <Button onClick={this.handleCommentAdd}>添加</Button>
                  <span style={{marginLeft: '10px'}}>最多可添加9条</span>
                </Row>
                <CommentsWrapper>
                  {
                    this.state.comments.length > 0 ? this.state.comments.map((item, index) => {
                      return (
                        <Comment key={item.id}>
                          <Col span={1}>评论{index + 1}</Col>
                          <Col span={21}>
                            <Input placeholder='请输入评论内容，内容最大长度为500字符'
                              type='textarea'
                              maxLength={500}
                              onChange={this.handleCommentChange}
                              id={'_' + item.id}
                              rows={4}></Input>
                          </Col>
                          <Col span={2} data-id={item.id}>
                            <Button icon='delete' shape='circle' type='danger'
                              data-id={item.id}
                              onClick={this.handleCommentDelete}
                              style={{
                                marginLeft: '10px'
                              }} />
                          </Col>
                        </Comment>
                      )
                    }) : <p style={{color: 'rgba(0,0,0, 0.45)'}}><Icon type='frown-o'/> 暂未添加评论</p>
                  }
                </CommentsWrapper>
              </Col>
            </PaddingRow>
            <PaddingRow>
              <Button type='primary'
                disabled={
                  this.state.text.length === 0 ||
                  (this.state.materialsType === 'IMAGE' &&
                  this.state.fileList.length === 0) ||
                  (this.state.materialsType === 'LINK' &&
                  this.state.link.length === 0)
                }
                loading={this.state.loading}
                onClick={this.createByHand}>确定</Button>
              <Link to='/lists'>
                <Button style={{marginLeft: '10px'}}>取消</Button>
              </Link>
            </PaddingRow>
          </TabPane>
        </Tabs>
        <Modal
          visible={this.state.modalVisible}
          title={this.state.title}
          width={1200}
          className='modal-materials'
          onOk={this.sureChoose}
          onCancel={this.hideDialog}>
          <div style={{marginBottom: '10px'}}>
            <Form layout="inline">
              <Form.Item label='入库时间段'>
                <RangePicker
                  value={this.state.times}
                  onChange={this.handleTimeChange}
                  placeholder={['开始时间', '结束时间']}/>
              </Form.Item>
              {/*<FormItem label='状态'
                style={{display: (this.state.operation === 'LINK' ||
                  this.state.operation === 'IMAGE') ? 'inline-block' : 'none'}}>
                <Select defaultValue={this.state.selectedStatus} style={{width: '100px'}}
                  onChange={this.handleStatusChange}
                  value={this.state.selectedStatus}>
                  <Option value='CHECKED'>已审核</Option>
                  <Option value='WAIT_CHECK'>待审核</Option>
                  <Option value='USED'>已使用</Option>
                  <Option value=''>全部</Option>
                </Select>
              </FormItem>*/}
              <FormItem label='分类'
                style={{display:  this.state.operation === 'IMAGE' ? 'inline-block' : 'none'}}>
                  <Input placeholder='请输入类目名'
                    value={this.state.searchTag}
                    onChange={this.handleSearchTagChange}>
                  </Input>
              </FormItem>
              <FormItem label=''>
                <Button type='primary'
                  icon='search'
                  size='small'
                  style={{marginRight: '10px'}}
                  onClick={this.handleSearch}>搜索</Button>
                <Button type='default'
                  icon='retweet'
                  size='small'
                  onClick={this.resetParams}>重置</Button>
              </FormItem>
            </Form>
          </div>
          <AutoSelectComp
            selectAllBtnIndex={0}
            nextPageBtnIndex={0}
            selectAllBtnSelector='.modal-materials .ant-checkbox-input'
            nextPageBtnSelector='.modal-materials .ant-pagination-next'
            dataKey={this.state.dataKey}/>
          <Table
            rowSelection={this.rowSelection}
            rowKey='id'
            dataSource={this.state.dataSource}
            columns={this.state.columns}
            pagination={this.state.pagination}/>
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
    generateByHand: (params) => {
      dispatch(generateByHand(params))
    },
    generateByAuto: (params) => {
      dispatch(generateByAuto(params))
    },
    getTextList: (params) => {
      dispatch(getTextList(params))
    },
    getCommentList: (params) => {
      dispatch(getCommentList(params))
    },
    getPictureList: (params) => {
      dispatch(getPictureList(params))
    },
    getLinkList: (params) => {
      dispatch(getLinkList(params))
    }
  }
}

const MaterialsCreate = connect(
  mapStateToProps,
  mapDispatchToProps
)(Creator)

export default MaterialsCreate