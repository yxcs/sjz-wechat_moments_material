import React from 'react';
import {
  connect
} from 'react-redux';
import {
  Table,
  Row,
  Col,
  Input,
  Button,
  Form,
  Modal,
  Radio,
} from 'antd';
import {
  getTextList,
  updateText,
  addText,
  deleteText,
  getSubTextList
} from '../actionCreator';
import styled from 'styled-components';

const TextTopBar = styled(Row)`
  font-size: 12px;
  line-height: 22px;
  margin-bottom: 10px;
`;

const SubTextTopBar = styled(Row)`
  font-size: 12px;
  line-height: 22px;
  margin-bottom: 10px;
`;

const FullWidthTable = styled(Table)`
  width: 100%;
  table {
    width: 100% !important;
  }
`;

const RadioGroup = Radio.Group;

class Texts extends React.Component {
  state = {
    columns: [
      {
        title: '序号',
        width: 50,
        render: (text, data, index) => {
          return index + 1;
        }
      }, {
        title: '文案',
        dataIndex: 'text'
      }, {
        title: '分类',
        dataIndex: 'tagName',
        render: text => {
          if (text) {
            return text
          } else {
            return '----暂未分类----'
          }
        }
      }, {
        title: '创建时间',
        width: 120,
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
        width: 100,
        render: (text, data, column) => {
          if (data.updatedAt) {
            return new Date(data.updatedAt).toLocaleString()
          } else {
            return '--暂未更新--'
          }
        }
      }, {
        title: '操作',
        width: 76,
        render: (data, column) => {
          return (
            <div>
              <Button size='small' icon='edit' shape='circle'
                style={{marginRight: '5px'}}
                onClick={this.handleTextEdit.bind(data, this)} />
              <Button size='small' icon='delete' shape='circle'
                onClick={this.handleTextDelete.bind(data, this)} />
            </div>
          )
        }
      }
    ],
    pgColumns: [
      {
        title: '序号',
        render: (text, data, index) => {
          return index + 1;
        }
      }, {
        title: '内容',
        width: 220,
        dataIndex: 'subText'
      }, {
        title: '最近更新时间',
        dataIndex: 'createdAt',
        width: 140,
        render: (text, data, index) => {
          return new Date(data.createdAt).toLocaleString()
        }
      }
    ],
    tag: '食品',
    tagIsOther: '',
    textOperate: 'ADD',
    currentTextId: null,
    pgList: [],
    textList: [],
    dialogVisible: false,
    textContent: '',
    textPager: {
      page: 0,
      size: 20
    },
    subTextPager: {
      page: 0,
      size: 20
    }
  }
  componentWillMount () {
    this.props.getTextList(this.state.textPager)
    this.props.getSubTextList(this.state.subTextPager)
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      textList: nextProps.textList
    })
    this.hideDialog();
  }

  // 添加文案按钮点击
  handleTextAdd = () => {
    this.setState({
      textContent: '',
      dialogVisible: true,
      textOperate: 'ADD'
    })
  };

  // 文案修改按钮点击
  handleTextEdit (componentContext) {
    let columnContext = this;
    let textContent = '';
    let tag = '';
    componentContext.props.textList.get('data').forEach(item => {
      if (item.id === columnContext.id) {
        textContent = item.text;
        tag = item.tagName;
      }
    })
    componentContext.setState({
      textContent,
      currentTextId: columnContext.id,
      dialogVisible: true,
      tag,
      textOperate: 'EDIT'
    })
  }

  // 文案删除按钮点击
  handleTextDelete (componentContext) {
    let columnContext = this;
    componentContext.props.deleteText({
      id: columnContext.id,
      textPager: componentContext.state.textPager
    })
  }

  handleTextChange = (e) => {
    this.setState({
      textContent: e.target.value
    })
  }
  hideDialog = () => {
    this.setState({
      dialogVisible: false
    })
  }
  handleResetText = () => {
    this.setState({
      textContent: ''
    })
  }
  handleTextAddSubmit = () => {
    let changeTag =
      this.state.tag === 'others' ?
      this.state.tagIsOther :
      this.state.tag;
    if (this.state.textOperate === 'ADD') {
      this.props.addText({
        text: this.state.textContent,
        textPager: this.state.textPager,
        changeTag,
      })
    } else if (this.state.textOperate === 'EDIT') {
      this.props.updateText({
        id: this.state.currentTextId,
        text: this.state.textContent,
        textPager: this.state.textPager,
        changeTag,
      })
      this.setState({
        currentTextId: null
      })
    }
  }

  // 分页操作
  handlePageChange = (page) => {
    this.setState({
      textPager: {
        ...this.state.textPager,
        page: page - 1
      }
    })
    this.props.getTextList({
      size: this.state.textPager.size,
      page: page - 1
    })
  }

  handleTextPageChange = (page) => {
    this.setState({
      subTextPager: {
        ...this.state.subTextPager,
        page: page - 1
      }
    })
    this.props.getSubTextList({
      size: this.state.subTextPager.size,
      page: page - 1
    })
  }

  // 类别切换
  handleTagChange = e => {
    this.setState({
      tag: e.target.value,
      tagIsOther: ''
    })
  }

  // 自定义tag更新
  onTagIsOther = (v) => {
    this.setState({ tagIsOther: v.target.value })
  }

  render () {
    return (
      <Row gutter={10} style={{
        paddingTop: '16px',
        borderTop: '1px solid #f7f7f7'
      }}>
        <Col span='14'>
          <TextTopBar>
            <Col span='5'>
              <p>共有{this.props.textList.get('total')}条文案</p>
            </Col>
            <Col span='2' offset='17'>
              <Button size='small' onClick={this.handleTextAdd}>添加</Button>
            </Col>
          </TextTopBar>
          <FullWidthTable
            rowKey='id'
            dataSource={this.props.textList.get('data')}
            columns={this.state.columns}
            pagination={{
              pageSize: this.state.textPager.size,
              total: this.props.textList.get('total'),
              current: this.props.textList.get('page') + 1,
              onChange: this.handlePageChange,
              size: 'small'
            }} />
          <Modal
            visible={this.state.dialogVisible}
            title={this.state.textOperate === 'ADD' ? '添加文案' : '修改文案'}
            onCancel={this.hideDialog}
            footer={
              <div>
                <Button type='danger' size='small'
                onClick={this.handleResetText}>清空</Button>
                <Button type='primary' size='small'
                  disabled={!this.state.textContent}
                  onClick={this.handleTextAddSubmit}>确定</Button>
              </div>
            }>
            <Form>
              <Form.Item label='分类'>
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
              </Form.Item>
              <Form.Item>
                <Input type='textarea' value={this.state.textContent}
                  rows={10}
                  placeholder='请输入文案内容，文本最大长度为160字符'
                  maxLength={160}
                  onChange={this.handleTextChange}></Input>
              </Form.Item>
            </Form>
          </Modal>
        </Col>
        <Col span='10'>
          <SubTextTopBar>
            <Col span='5'>
              <p>共有{this.props.subTextList.get('total')}个数据包</p>
            </Col>
          </SubTextTopBar>
          <FullWidthTable
            rowKey='id'
            columns={this.state.pgColumns}
            dataSource={this.props.subTextList.get('data')}
            pagination={{
              pageSize: this.state.subTextPager.size,
              current: this.props.subTextList.get('page') + 1,
              onChange: this.handleTextPageChange,
              total: this.props.subTextList.get('total'),
              size: 'small'
            }} />
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getTextList: (params) => {
      dispatch(getTextList(params));
    },
    updateText: (params) => {
      dispatch(updateText(params));
    },
    addText: (params) => {
      dispatch(addText(params));
    },
    deleteText: (params) => {
      dispatch(deleteText(params));
    },
    getSubTextList: (params) => {
      dispatch(getSubTextList(params))
    }
  }
}

const TextList = connect(
  mapStateToProps,
  mapDispatchToProps
)(Texts);

export default TextList;