import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Modal
} from 'antd'

const Wrapper = styled.div`
  &:hover {
    .frame-page {
      display: block;
    }
  }
`

const PageFrame = styled.iframe`
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  box-shadow: 0 0 6px 1px #aaa;
  border-radius: 8px;
  z-index: 2;
`

export class ArticleViewer extends React.Component {
  state = {
    modalVisible: false
  }
  handleView = (e) => {
    e.preventDefault()
    this.setState({
      modalVisible: true
    })
  }
  hideModal = () => {
    this.setState({
      modalVisible: false
    })
  }
  render () {
    return(
      <Wrapper>
        {
          this.props.trigger === 'hover' ?
          (
            <div>
              <PageFrame src={this.props.url} frameBorder="0"
                className="frame-page"
                width={this.props.width}
                height={this.props.height} />
              <a href={this.props.url} target='_blank'>
                {this.props.cover ? this.props.cover : ''}
                {this.props.title ? this.props.title : this.props.url}</a>
            </div>
          ) :
          (
            <div>
              <Modal
                title='文章预览'
                footer={null}
                width={this.props.width + 30} // 30是纵向滚动条的宽度
                onCancel={this.hideModal}
                visible={this.state.modalVisible}>
                <iframe src={this.props.url} frameBorder="0"
                  className="frame-page"
                  width={this.props.width}
                  height={this.props.height} />
              </Modal>
              <a href={this.props.url} onClick={this.handleView}>{this.props.url}</a>
            </div>
          )
        }
      </Wrapper>
    )
  }
}

ArticleViewer.propTypes = {

  // 文章链接
  url: PropTypes.string,

  // 激活方式，支持click和hover
  trigger: PropTypes.string,

  // 预览框宽度
  width: PropTypes.number,

  // 预览框高度
  height: PropTypes.number,

  // 文章标题
  title: PropTypes.object || PropTypes.string,

  // 文章封面
  cover: PropTypes.element
}

ArticleViewer.defaultProps = {
  width: 600,
  height: 400,
  trigger: 'hover'
}

export default ArticleViewer