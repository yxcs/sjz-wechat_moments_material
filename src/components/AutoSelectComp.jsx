import React from 'react'
import {
  Button,
  Row,
  Input,
} from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { is } from 'immutable'

class AutoSelect extends React.Component {
  constructor ( props ) {
    super(props);
    this.state = {
      taskRunning: false,  // 自动全选任务是否执行中
      selectePage: 0,  // 自动全选的任务数
      current: 0
    }
    console.log(props);
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props.dataKey);
    if (this.props.dataKey) {
      if (
        !is(
          nextProps[this.props.dataKey].get('data'),
          this.props[this.props.dataKey].get('data')
        ) &&
        this.state.taskRunning) {
        console.log(this.state.current);
        if (this.state.current < this.state.selectPage - 1) {
          setTimeout(_ => {
            document.querySelectorAll(
              this.props.selectAllBtnSelector
            )[this.props.selectAllBtnIndex].click()
          }, 300)
          setTimeout(_ => {
            document.querySelectorAll(
              this.props.nextPageBtnSelector
            )[this.props.nextPageBtnIndex].click()
            this.setState({
              current: this.state.current + 1
            })
          }, 700)
        } else {
          setTimeout(_ => {
            document.querySelectorAll(
              this.props.selectAllBtnSelector
            )[this.props.selectAllBtnIndex].click()
          }, 300)
          this.setState({
            taskRunning: false,
            current: 0
          })
        }
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    console.log('dakgs');
    return true;
  }


  sleep = (timeLog) => {
    return new Promise((resolve, reject) => {
      setTimeout(_ => {
        resolve()
      }, timeLog)
    })
  }

  handleSelect = e => {
    this.setState({
      selectPage: e.target.value
    })
  }

  startAutoSelect = _ => {
    setTimeout(_ => {
      document.querySelectorAll(
        this.props.selectAllBtnSelector
      )[this.props.selectAllBtnIndex].click()
    }, 500)
    setTimeout(_ => {
      document.querySelectorAll(
        this.props.nextPageBtnSelector
      )[this.props.nextPageBtnIndex].click()
      this.setState({
        current: this.state.current + 1,
      })
    }, 1000)
    this.setState({
      taskRunning: true
    })
  }

  stopTask = _ => {
    this.setState({
      taskRunning: false,
      current: 0
    })
  }

  render () {
    return (
      <Row gutter={10} style={{marginBottom: '10px'}}>
        <span>从当前页开始往后</span>
        <Input
          style={{
            width: '60px'
          }}
          type='number'
          value={this.state.selectPage}
          onChange={this.handleSelect} />
        <span>页</span>
        <Button
          loading={this.state.taskRunning}
          onClick={this.startAutoSelect}
        >{this.state.taskRunning ? 'Running...' : 'Start'}</Button>
        {
          this.state.taskRunning ?
            <Button onClick={this.stopTask}
              style={{marginLeft: '8px'}}
              size='small'>Cancel</Button> : null
        }
      </Row>
    )
  }
}

AutoSelect.defaultProps = {
  selectAllBtnSelector: '.ant-checkbox-input',
  selectAllBtnIndex: 1,
  nextPageBtnSelector: '.ant-pagination-next',
  nextPageBtnIndex: 0
}

AutoSelect.propTypes = {

  // 全选当前页的页面dom选择器
  selectAllBtnSelector: PropTypes.string,

  // 对应选择器的索引，会使用document.querySelectorAll，因此
  // 需要知道页面全选按钮框
  selectAllBtnIndex: PropTypes.number,

  // "下一页"按钮的页面dom选择器
  nextPageBtnSelector: PropTypes.string,

  // "下一页"按钮的dom索引
  nextPageBtnIndex: PropTypes.number,

  // 用来校验普通渲染还是翻页的操作的key，
  // key作为全局store中的类型为immutable的数据索引
  // 主要用来在componentWillReceiveProps中鉴定是否
  // 有无效渲染导致翻页异常
  dataKey: PropTypes.string,
}

const mapStateToProps = (state, ownProps) => {
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

const AutoSelectComp = connect(
  mapStateToProps,
  mapDispatchToProps
)(AutoSelect)

export default AutoSelectComp