/**
 * @desc 图片查看器，通过控制触发方式展现缩略图的原图
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const RootWrapper = styled.div`
  display: inline-block;
  margin: 0 5px 5px 0;
  .container {
    display: none;
  }
  &:hover .container {
    display: inline-block;
  }
`

const ImageWrapper = styled.div`
  overflow: hidden;
  position: relative;
  cursor: zoom-in;
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ImageZoomer = styled.div`
  position: fixed;
  padding: 10px;
  background: white;
  border-radius: 8px;
  width: 460px;
  height: auto;
  box-shadow: 0 0 6px 1px #aaa;
  img {
    width: 100%;
  }
  z-index: 1;
`

class ImageViewer extends React.Component {
  state = {
    modalVisible: false
  }

  toggleDisplay = _ => {
    this.setState({
      modalVisible: !this.state.modalVisible
    })
  }
  render () {
    return (
      <RootWrapper style={{
        width: this.props.width + 'px',
        height: this.props.height + 'px',
        border: this.props.border ? '1px solid #e9e9e9' : 'none'}}>
      {
        this.props.trigger === 'hover' ?
        (
          <div style={{width: '100%', height: '100%'}}>
            <ImageWrapper>
              <img src={this.props.url} alt="图片加载失败"/>
            </ImageWrapper>
            <ImageZoomer className='container' style={{
              left: '50%',
              top: '50%',
              transform: 'translate3d(-50%, -50%, 0)'}}>
              <img src={this.props.url} alt="图片加载失败"/>
            </ImageZoomer>
          </div>
        ) : null
      }
      {
        this.props.trigger === 'click' ?
        (
          <div style={{width: '100%', height: '100%'}}>
            <ImageWrapper>
              <img src={this.props.url} alt="图片加载失败"
                onClick={this.toggleDisplay}
                title="点击查看大图"/>
            </ImageWrapper>
            <Modal
              title="查看大图"
              visible={this.state.modalVisible}
              footer={null}
              width={520}
              onCancel={this.toggleDisplay}
              onOk={this.toggleDisplay}>
              <ImageWrapper>
                <img src={this.props.url} alt="图片加载失败"/>
              </ImageWrapper>
            </Modal>
          </div>
        ) : null
      }
      </RootWrapper>
    )
  }
}

ImageViewer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  url: PropTypes.string,
  border: PropTypes.bool,
  trigger: PropTypes.string,
}

ImageViewer.defaultProps = {
  width: 60,
  height: 60,
  border: false,
  trigger: 'hover'
}

export default ImageViewer;