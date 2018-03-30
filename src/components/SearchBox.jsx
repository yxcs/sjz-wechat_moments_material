import React from 'react';
import {
  Row,
  Col,
  Select,
  Form,
  DatePicker,
  Button,
  Input,
  Icon,
} from 'antd';
import {
  getAllMaterials,
  getPictureList,
  getLinkList,
  getTextList,
  getCommentList,
} from '../actionCreator';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const { Option } = Select;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

const SearchForm = styled(Form)`
  margin-bottom: 16px;
  margin-top: -16px;
  padding-top: 16px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e9e9e9;
  transition: 1s 0s all ease;
  padding-bottom: 0px;
  margin-bottom: 0px;
  &.visible {
    margin-bottom: 16px;
  }
  &.hidden {
    height: 0;
  }
  overflow: hidden;
`

const FormSwitcher = styled.span`
  position: absolute;
  left: 50%;
  transform: translate3d(-50%, 0, 0) rotate(90deg);
  font-size: 16px;
  cursor: pointer;
  margin-top: -20px;
  &:hover i {
    color: black;
  }
  i {
    color: #e9e9e9;
    transition: .6s 0s all ease;
  }
  &.hidden i {
    margin-left: 14px;
    transform: translate3d(-50%, 0, 0) rotate(180deg);
  }
`

class Search extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      statusOptions: [
        {
          label: '待审核',
          value: 'WAIT_CHECK'
        }, {
          label: '已审核',
          value: 'CHECKED'
        }, {
          label: '全部',
          value: ''
        }
      ],
      selectedStatus: 'WAIT_CHECK',
      typeOptions: [
        {
          label: '图片',
          value: 'IMAGE'
        }, {
          label: '链接',
          value: 'LINK'
        }, {
          label: '全部',
          value: ''
        }
      ],
      type: '',
      origin: '',
      visible: true,
      searchLoading: false,
      resetLoading: false,
      times: [],
      updateTimes: [],
      tag: '',
      pager: {
        size: 20,
        page: 0
      }
    };
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      searchLoading: false,
      resetLoading: false
    })
  }
  handleSearch = () => {
    let params = {
      type: this.props.type,
      tag: this.state.tag,
      origin: this.state.origin,
      createdAtStart: this.state.times[0] ?
        this.state.times[0].startOf('day') :
        this.state.times[0],
      createdAtEnd: this.state.times[1] ?
        this.state.times[1].startOf('day') :
        this.state.times[1],
      status: this.state.selectedStatus,
      page: this.state.pager.page,
      size: this.state.pager.size
    };
    if (this.props.target === 'source') {
      this.props.type === 'IMAGE' && this.props.getPictureList(params);
      this.props.type === 'LINK' && this.props.getLinkList(params);
      this.props.type === 'TEXT' && this.props.getTextList(params);
      this.props.type === 'COMMENTS' && this.props.getCommentList(params);
    } else {
      params.type = this.state.type;
      params.updatedAtStart = this.state.updateTimes[0] ?
        this.state.updateTimes[0].startOf('day') :
        this.state.updateTimes[0];
      params.updatedAtEnd = this.state.updateTimes[1] ?
        this.state.updateTimes[1].startOf('day') :
        this.state.updateTimes[1];
      params.status = this.state.selectedStatus;
      if('status' in params) {
        delete params.status;
      }
      this.props.getAllMaterials(params)
    }
    this.setState({
      searchLoading: true
    })
  };
  resetParams = () => {
    let params = {
      tag: '',
      origin: '',
      createdAtStart: null,
      createdAtEnd: null,
      updatedAtStart: null,
      updatedAtEnd: null,
      status: '',
      page: 0,
      size: this.state.pager.size
    };
    this.setState({
      tag: params.tag,
      origin: params.origin,
      times: [],
      updateTimes: [],
      selectedStatus: params.status,
      page: 0,
    });
    if (this.props.target === 'source') {
      this.props.type === 'IMAGE' && this.props.getPictureList(params);
      this.props.type === 'LINK' && this.props.getLinkList(params);
      this.props.type === 'TEXT' && this.props.getTextList(params);
      this.props.type === 'COMMENTS' && this.props.getCommentList(params);
    } else {
      params.type = '';
      params.status = 'WAIT_CHECK';
      this.setState({
        type: '',
        selectedStatus: 'WAIT_CHECK'
      })
      this.props.getAllMaterials(params)
    }
    this.setState({
      resetLoading: true
    })
  }
  handleTimeChange = (times) => {
    this.setState({
      times
    });
  };
  handleUpdatedChange = (updateTimes) => {
    this.setState({
      updateTimes
    })
  }
  handleSourceChange = (e) => {
    this.setState({
      origin: e.target.value
    });
  };
  handleTagChange = (e) => {
    this.setState({
      tag: e.target.value
    });
  };
  handleMaterialTypeChange = (type) => {
    this.setState({
      type
    })
  }
  handleStatusChange = (selectedStatus) => {
    this.setState({
      selectedStatus
    })
  };
  toggleVisible = (e) => {
    this.setState({
      visible: !this.state.visible
    })
  }
  render () {
    return (
      <div>
        <SearchForm layout='inline' className={
          this.state.visible ? 'visible' : 'hidden'}>
          {
            this.props.useOrigin || this.props.useInTime || this.props.useUpdatedTime ?
              (
                <Row gutter={30} style={{marginBottom: '16px'}}>

                  {
                    this.props.useOrigin ?
                      (
                        <Col span='5'>
                          <FormItem label='来源'>
                            <Input placeholder='请输入素材来源'
                              value={this.state.origin}
                              style={{width: '160px'}}
                              onChange={this.handleSourceChange}></Input>
                          </FormItem>
                        </Col>
                      ) : null
                  }
                  {
                    this.props.useInTime ?
                      (
                        <Col span='16'>
                          <FormItem label='入库时间段'>
                            <RangePicker
                              value={this.state.times}
                              onChange={this.handleTimeChange}
                              placeholder={['开始时间', '结束时间']}/>
                          </FormItem>
                        </Col>
                      ) : null
                  }
                  {
                    this.props.useUpdatedTime ?
                      (
                        <Col span='16'>
                          <FormItem label='最近更新时间'>
                            <RangePicker
                              value={this.state.updateTimes}
                              onChange={this.handleUpdatedChange}
                              placeholder={['开始时间', '结束时间']}/>
                          </FormItem>
                        </Col>
                      ) : null
                  }
                </Row>
              ) : null
          }
          {
            this.props.useType || this.props.useTag || this.props.useTaskStatus ?
              (
                <Row style={{marginBottom: '16px'}}>
                  {
                    this.props.useType ?
                      (
                          <Col span='3'>
                            <FormItem label='类型'>
                              <Select
                                defaultValue=''
                                style={{width: '100px'}}
                                value={this.state.type}
                                onChange={this.handleMaterialTypeChange}>
                                <Option value='IMAGE'>图片</Option>
                                <Option value='LINK'>链接</Option>
                                <Option value=''>全部</Option>
                              </Select>
                            </FormItem>
                          </Col>
                      ) : null
                  }
                  {
                    this.props.useTag ?
                      (
                          <Col span='4'>
                            <FormItem label='分类'>
                              <Input placeholder='请输入类目名'
                                value={this.state.tag}
                                onChange={this.handleTagChange}></Input>
                            </FormItem>
                          </Col>
                      ) : null
                  }
                  {
                    this.props.useTaskStatus ?
                      (
                          <Col span='4'>
                            <FormItem label='状态'>
                              <Select defaultValue='WAIT_CHECK' style={{width: '100px'}}
                                onChange={this.handleStatusChange}
                                value={this.state.selectedStatus}>
                                <Option value='CHECKED'>已审核</Option>
                                <Option value='WAIT_CHECK'>待审核</Option>
                                <Option value='USED'>已使用</Option>
                                <Option value=''>全部</Option>
                              </Select>
                            </FormItem>
                          </Col>
                      ) : null
                  }
                </Row>
              ) : null
          }
          <Row style={{marginBottom: '16px'}}>
            <Button type='primary' icon='search' size='small'
              style={{marginRight: '10px'}}
              loading={this.state.searchLoading}
              onClick={this.handleSearch}>搜索</Button>
            <Button type='default' icon='retweet' size='small'
              loading={this.state.resetLoading}
              onClick={this.resetParams}>重置</Button>
          </Row>
        </SearchForm>
        <FormSwitcher onClick={this.toggleVisible} className={
          this.state.visible ? 'visible' : 'hidden'}>
          <Icon type='double-left' title={
            this.state.visible ? '收起搜索面板' : '展开搜索面板'
          }/>
        </FormSwitcher>
      </div>
    )
  }
};

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getAllMaterials: (payload) => {
      dispatch(getAllMaterials(payload))
    },
    getPictureList: (payload) => {
      dispatch(getPictureList(payload))
    },
    getLinkList: (payload) => {
      dispatch(getLinkList(payload))
    },
    getTextList: (payload) => {
      dispatch(getTextList(payload))
    },
    getCommentList: (payload) => {
      dispatch(getCommentList(payload))
    }
  }
}

const SearchBox = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

SearchBox.defaultProps = {
  useTag: false,
  useOrigin: false,
  useTaskStatus: false,
  target: 'source',
  useInTime: true,
  useUpdatedTime: false,
}
SearchBox.propTypes = {
  type: PropTypes.string,
  useTag: PropTypes.bool,
  useOrigin: PropTypes.bool,
  useTaskStatus: PropTypes.bool,
  target: PropTypes.string,
  useInTime: PropTypes.bool,
  useUpdatedTime: PropTypes.bool,
}

export default SearchBox;