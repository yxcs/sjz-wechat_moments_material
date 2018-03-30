import React from 'react';
import { connect } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import {
  Radio,
  Button,
  Icon,
  Badge,
  Row,
  Col,
  Input,
  Spin,
  BackTop,
  Popconfirm,
} from 'antd';
import ImageViewer from './ImageViewer'
import {
  likeMoment,
  dislikeMoment,
  commentMoment,
  getMoments,
  getUpdatedNotice,
  getUpdatedMoment,
  getUpdatedDetails,
  deleteMoment,
  deleteMomentComment,
  cancelLikeOrComment,
  initMoment,
} from '../actionCreator'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const loadingAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: .2;
  }
`

const ToolBox = styled(Row)`
  position: sticky;
  top: 0px;
  padding: 10px 20px;
  background: white;
  z-index: 1;
  border: 1px solid #eee;
  box-shadow: 1px 0 10px 4px #eee;
`

const UpdateTip = styled(Badge)`
  vertical-align: baseline !important;
`

const Detial = styled(Row)`
  padding: 10px 15px;
  height: calc(100vh - 154px);
  overflow-x: hidden;
  overflow-y: auto;
  border: solid 1px #eee;
  .title {
    font-size: 14px;
    font-weight: bold;
    border-bottom: 1px solid #e9e9e9;
    line-height: 36px;
  }
  /* 小图标 */
  .icon-wrapper {
    display: inline-block;
    height: 18px;
    width: 18px;
    i {
      transition: .4s 0s all linear;
    }
    i:hover {
      color: black;
      cursor: pointer;
      font-size: 14px;
    }
  }
  &.waiting .icon-wrapper {
    cursor: not-allowed;
  }
  /* 状态未完成的图标 */
  i.waiting {
    color: #e2e2e2;
    animation: ${loadingAnimation} 1s linear infinite reverse;
    &:hover {
      font-size: 12px;
      color: #e2e2e2;
    }
  }
  span.waiting {
    color: #108ee9;
    animation: ${loadingAnimation} 1s linear infinite reverse;
    &:hover {
      font-size: 12px;
      color: #108ee9;
    }
  }
`

const MomentWrapper = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
`

const Moment = styled(Row)`
  padding: 10px 0;
  border-bottom: 1px dotted #eee;
  .name {
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
  }
  .textContent {
    line-height: 28px;
  }
  .link {
    padding: 5px 8px;
    background: #f7f7f7;
    line-height: 18px;
    overflow: hidden;
    .url {
      vertical-align: top;
    }
  }
  .comments {
    .like-wrapper {
      color: black;
      display: inline-block;
      .friend {
        margin-left: 4px;
        color: #108ee9;
      }
    }
    background: #f7f7f7;
    .like {
      padding: 5px 8px;
      color: #108ee9;
      border-bottom: solid 1px #f0f0f0;
    }
    .content {
      padding: 5px 8px;
      dt, dd {
        display: inline;
        .friend {
          color: #108ee9;
        }
        &.content {
          margin-right: 4px;
        }
      }
    }
    .reply {
      padding: 5px 8px;
      .reply-content {
        margin-bottom: 10px;
      }
    }
  }
  .pictures {
    margin: 8px 0;
    li {
      display: inline-block;
    }
  }
  &.waiting {
    animation: ${loadingAnimation} 1s linear infinite reverse;
  }
`

const DefaultAvatar = styled.div`
  width: 58px;
  height: 58px;
  line-height: 58px;
  border: solid 1px #eee;
  font-size: 46px;
  text-align: center;
`

const OperateBox = styled(Row)`
  position: relative;
  line-height: 26px;
  .operations {
    text-align: right;
  }
`

class Moments extends React.Component {
  state = {
    prevTarget: '',
    target: 'others',
    reply: '',
    size: 20,
    robotId: null,
    lastMomentId: null,
    currentMoments: [],
    replyTarget: null,  // 当前回复对象
    triggerHeight: 40,  // 自动加载下一页的触发高度
  }

  // onscroll节流
  hasMoreLoading = false

  componentWillReceiveProps (nextProps) {
    let currentMoments = [];
    switch (this.state.target) {
      case 'mine':
        currentMoments = nextProps.mineMoments;
        break;
      case 'others':
        currentMoments = nextProps.allMoments;
        break;
      case 'updated':
        currentMoments = nextProps.updatedMoments;
        break;
      default:
        break;
    }
    this.setState({
      replyTarget: null,
      currentMoments,
      reply: ''
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if ( nextProps.robotId !== null &&
        parseInt(nextProps.robotId, 10) !== nextState.robotId ) {
      this.setState({
        robotId: parseInt(nextProps.robotId, 10),
        robotNick: nextProps.robotNick,
        prevTarget: this.state.prevTarget,
        target: this.state.target,
        reply: '',
        lastMomentId: null,
        currentMoments: [],
        replyTarget: null,
      }, _ => {

        // 清空朋友圈
        this.props.initMoment()

        // 获取最新朋友圈
        this.getMomentList({
          target: this.state.target,
          robotId: nextProps.robotId
        })

        // 获取最新朋友圈更新条数
        this.props.getUpdatedNotice({
          robotId: nextProps.robotId
        })

        // 定时拉去更新
        // setInterval(_ => {
        //   this.getUpdatedNotice()
        // }, 10000)
      })
    }
    return true;
  }

  // 切换朋友圈源(自己、好友)
  handleTargetChange = (e) => {
    this.setState({
      target: e.target.value
    })

    // 清空朋友圈
    this.props.initMoment()

    // 获取最新朋友圈
    this.getMomentList({
      target: e.target.value
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 编辑回复或评论内容
  handleReplyChange = e => {
    this.setState({
      reply: e.target.value
    })
  }

  // 切换当前回复对象
  handleRepTargetChange = e => {
    this.setState({
      replyTarget: {
        commentId: e.target.dataset.commentId,
        momentId: parseInt(e.target.dataset.id, 10),
        name: e.target.dataset.name,
      }
    })
  }

  cancelReply = _ => {
    this.setState({
      replyTarget: null,
      reply: '',
    })
  }

  // 提交评论或回复
  submitReply = _ => {
    this.props.commentMoment({
      size: this.state.size,
      target: this.state.target,
      robotId: this.state.robotId,
      robotFcDataId: this.state.replyTarget.momentId,
      commentText: this.state.reply,
      robotFcDataCommentId: this.state.replyTarget.commentId,
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 点赞
  handleLikeMoment = e => {
    this.props.likeMoment({
      size: this.state.size,
      target: this.state.target,
      robotId: this.state.robotId,
      robotFcDataId: parseInt(e.target.dataset.id, 10)
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 删除点赞
  handleDeleteLike = e => {
    this.props.deleteMomentComment({
      robotId: this.state.robotId,
      robotFcDataId: parseInt(e.target.dataset.id, 10),
      robotFcDataCommentId: e.target.dataset.commentId,
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 取消未完成的评论或点赞操作
  cancelLikeOrComment = e => {
    this.props.cancelLikeOrComment({
      size: this.state.size,
      target: this.state.target,
      robotFcDataId: parseInt(e.target.dataset.robotFcDataId, 10),
      robotId: this.state.robotId,
      replyId: parseInt(e.target.dataset.id, 10)
    })
  }

  // 删除点赞或评论
  deleteLikeOrComment = e => {
    this.props.deleteMomentComment({
      robotId: this.state.robotId,
      robotFcDataId: parseInt(e.target.dataset.id, 10),
      robotFcDataCommentId: e.target.dataset.commentId,
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 删除朋友圈
  deleteMoment = (item, e) => {
    this.props.deleteMoment({
      robotId: this.state.robotId,
      size: this.state.size,
      target: this.state.target,
      robotFcDataId: item.id,
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 获取朋友圈列表
  getMomentList = (params) => {
    this.props.getMoments({
      target: params.target || this.state.target,
      robotId: params.robotId || this.state.robotId,
      lastRobotFcDataId: params.lastRobotFcDataId,
      size: this.state.size,
    })
  }

  // 获取更新的朋友圈信息概要列表
  getUpdatedNotice = _ => {
    this.props.getUpdatedNotice({
      robotId: this.state.robotId
    })
  }

  // 获取更新的朋友圈信息
  getUpdatedMoment = _ => {
    let prevTarget = this.state.target
    this.setState({
      prevTarget,
      target: 'updated'
    })
    let ids = [];
    let noticeIdList = [];
    this.props.noticeList.forEach(item => {
      ids.push(item.robotFcDataId)
      noticeIdList.push(item.id)
    });
    this.props.getUpdatedMoment({
      robotFcDataIdList: ids,
      noticeIdList
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 刷新朋友圈
  reloadMoment = e => {

    // 清空朋友圈
    this.props.initMoment()

    // 获取最新朋友圈
    this.getMomentList({
      target: this.state.target,
      robotId: this.state.robotId
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 刷新单条朋友圈
  refreshMoment = e => {
    let robotFcDataIdList = [parseInt(e.target.dataset.id, 10)]
    this.props.getUpdatedDetails({
      robotFcDataIdList
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 加载更多朋友圈
  getMore = _ => {
    let currentMoments = this.state.currentMoments;
    this.getMomentList({
      target: this.state.target,
      lastRobotFcDataId:
        currentMoments.get(currentMoments.size - 1).id,
    })

    // 拉取更新
    this.getUpdatedNotice()
  }

  // 返回普通朋友圈列表
  backToNormal = _ => {
    let target = this.state.prevTarget
    // 获取最新朋友圈更新条数
    this.getUpdatedNotice()

    // 清空朋友圈
    this.props.initMoment()

    // 获取最新朋友圈
    this.getMomentList({
      target,
      robotId: this.state.robotId
    })

    this.setState({
      target
    })
  }

  // 自动加载下一页
  handleAutoLoading = e => {
    // 如果没有更多，不触发
    if ( (!this.props.hasMore[this.state.target] ||
      this.state.target === 'updated') ||
      this.props.momentLoading ||
      this.state.hasMoreLoading){
      return -1
    }
    this.hasMoreLoading = true

    // 节流，300ms后继续
    setTimeout(_ => {
      this.hasMoreLoading = false
    }, 500)
    let target = e.target
    let info = target.firstChild

    // .info 元素布局上的padding + border
    let styleHeight = 22
    let leftHeight = info.offsetHeight + styleHeight - target.scrollTop - target.offsetHeight
    if (this.state.triggerHeight >= leftHeight) {
      this.getMore()
    }
    target = null
    info = null
    styleHeight = null
  }

  render () {
    let Reply = (
      <div className="reply">
        <Input type='textarea'
          className='reply-content'
          value={this.state.reply}
          onChange={this.handleReplyChange}
          placeholder={
            this.state.replyTarget ?
              (this.state.replyTarget.name ? `回复 ${this.state.replyTarget.name}:` : '请输入评论内容') :
              null
          }
          maxLength={500}
          rows={6}/>
        <Button
          type='primary'
          size='small'
          disabled={!this.state.reply}
          onClick={this.submitReply}>确定</Button>
        <Button size='small'
          style={{marginLeft: '10px'}}
          onClick={this.cancelReply}>取消</Button>
      </div>
    )

    // 修复count不准确的问题
    let likeCounts = [];
    let commentCounts = [];

    this.state.currentMoments.forEach(moment => {
      let likeCount = 0;
      let commentCount = 0;
      moment.commentList.forEach(comment => {
        if (comment.type === 1) {
          likeCount++;
        } else if (comment.type === 2) {
          commentCount++;
        }
      })
      likeCounts.push(likeCount)
      commentCounts.push(commentCount)
    })

    return (
    <MomentWrapper className="scroll-bar">
      <ToolBox>
        <Col span={8}>
          {
            this.state.target !== 'updated' ?
              (
                <RadioGroup
                  disabled={!this.state.robotId}
                  title={!this.state.robotId ? '请先选择微信号' : ''}
                  defaultValue={this.state.target}
                  onChange={this.handleTargetChange}>
                  <RadioButton value='mine'>
                    我 的
                  </RadioButton>
                  <RadioButton value='others'>
                    所有人
                  </RadioButton>
                </RadioGroup>
              ) : (
                null
              )
          }
        </Col>
        <Col span={2}>
          {
            this.state.target !== 'updated' ?
              (
                <Button title='刷新'
                  shape='circle'
                  onClick={this.reloadMoment}
                  disabled={this.props.momentLoading || !this.state.robotId}>
                  <Icon type='reload'
                    spin={this.props.momentLoading}/>
                </Button>
              ) : null
          }
        </Col>
        <Col span={6} offset={8}
          style={{textAlign: 'right'}}>
          {
            this.state.target !== 'updated' ?
              (
                <UpdateTip count={this.props.noticeList.size}>
                  <Button onClick={this.getUpdatedMoment}
                    disabled={this.props.noticeList.size === 0 ||
                      !this.state.robotId}>查看更新 &gt;&gt;</Button>
                </UpdateTip>
              ) : (
                <Button onClick={this.backToNormal}>&lt;&lt; 返 回 </Button>
              )
          }
        </Col>
      </ToolBox>
      <Spin spinning={this.props.momentLoading}>
        <Detial className="scroll-bar" onScroll={this.handleAutoLoading}>
          {
            this.state.robotId ?
            (
              <div className="info">
                <p className="title">{this.state.robotNick}的朋友圈</p>
                {
                  this.state.currentMoments.size > 0 ?
                    (
                      this.state.currentMoments.map((item, momentIndex) => {
                        let momentLoading = false;

                        // 自己是否赞过
                        let likeByMe = false;
                        let likeComment = null;
                        let likeCommentId = null;
                        let myLikeLoading = null;
                        let myLikeDeleteLoading = null;
                        let momentType = item.type

                        item.commentList.forEach(comment => {
                          if (comment.wxId === item.ownerWxId && comment.type === 1) {
                            likeByMe = true;
                            likeComment = comment;
                          }
                        })
                        if (likeComment) {
                          likeCommentId = likeComment.id ?
                            likeComment.id :
                            likeComment.robotFcDataCommentReplyId
                          myLikeDeleteLoading = (
                            likeComment.deleteStatus !== null &&
                            likeComment.deleteStatus !== 'ERROR' &&
                            likeComment.deleteStatus !== 'CANCEL'
                          )
                          myLikeLoading = (
                            likeComment.status !== null &&
                            likeComment.status !== 'ERROR' &&
                            likeComment.status !== 'CANCEL'
                          )
                        }
                        if (item.deleteStatus !== null &&
                          item.deleteStatus !== 'ERROR' &&
                          item.deleteStatus !== 'CANCEL') {
                          momentLoading = true;
                        }
                        return (
                          <Spin key={item.id}
                            spinning={!!this.props.oneLoading[item.id]}>
                            <Moment className={
                              momentLoading ?
                                'waiting' : ''}>
                              <Col span={4}>
                              {
                                item.ownerAvatar ?
                                  (
                                    <ImageViewer
                                      url={item.ownerAvatar}
                                      border={true}
                                      alt="头像加载失败"/>
                                  ) : (
                                    <DefaultAvatar title="暂未设置头像">
                                      <Icon type="user"/>
                                    </DefaultAvatar>
                                  )
                              }
                              </Col>
                              <Col span={20}>
                                <p className="name">{item.nickname}</p>
                                <p className="textContent">{item.contentDesc}</p>
                                {
                                  item.linkUrl && momentType === 3 ? (
                                    <div className="link">
                                      {
                                        item.mediaList[0] &&
                                        item.mediaList[0].previewUrls &&
                                        JSON.parse(item.mediaList[0].previewUrls) &&
                                        JSON.parse(item.mediaList[0].previewUrls)[0].url ?
                                          (
                                            <div
                                              style={{float: 'left', marginRight: '8px'}}>
                                              <ImageViewer
                                                width={50}
                                                height={50}
                                                border={true}
                                                alt="图片加载失败"
                                                url={
                                                  JSON.parse(item.mediaList[0].previewUrls)[0].url
                                                }/>
                                            </div>
                                          ) : null
                                      }
                                      <p className="url">
                                        <a href={item.linkUrl} target='_blank'>
                                          {(item.linkDesc && item.linkDesc !== 'null') ?
                                            item.linkDesc : '分享链接'}
                                        </a>
                                      </p>
                                    </div>
                                  ) : null
                                }
                                {
                                  item.mediaList.length > 0 && momentType !== 3 ?
                                  (
                                    <ul className="pictures">
                                      {
                                        item.mediaList.map(pic => {
                                          let url = JSON.parse(pic.url).url;
                                          if (momentType === 1) {
                                            return (
                                              <li key={url}>
                                                <ImageViewer
                                                  trigger='click'
                                                  width={100}
                                                  height={100}
                                                  border={true}
                                                  url={url} />
                                              </li>
                                            )
                                          } else if (momentType === 15) {
                                            return (
                                              <video
                                                key={url}
                                                width='100%'
                                                autoPlay={false}
                                                controls={true}
                                                src={url}></video>
                                            )
                                          } else {
                                            return null;
                                          }
                                        })
                                      }
                                    </ul>
                                  ) : null
                                }
                                <OperateBox>
                                  <Col span={12}>
                                    {new Date(item.createtime).toLocaleString()}
                                  </Col>
                                  <Col offset={7} span={5} className='operations'>
                                    {
                                      momentLoading ?
                                      (
                                        <div>
                                          {
                                            item.ownerWxId === item.wxId ?
                                              (
                                                <span className="icon-wrapper">
                                                  <Icon type="delete" />
                                                </span>
                                              ) : null
                                          }
                                          <span className="icon-wrapper">
                                            <Icon type="like-o"/>
                                          </span>
                                          <span className="icon-wrapper">
                                            <Icon type="message" />
                                          </span>
                                        </div>
                                      ) : (
                                        <div>
                                          <span className="icon-wrapper">
                                            <Icon type='reload'
                                              data-id={item.id}
                                              title='刷新'
                                              onClick={this.refreshMoment}></Icon>
                                          </span>
                                          {
                                            item.deleteStatus === 'ERROR' ?
                                              (
                                                <span className="icon-wrapper">
                                                  <Icon type="exclamation-circle-o"
                                                    style={{color: 'red'}}
                                                    data-id={item.id}
                                                    title={item.deleteStatusMsg} />
                                                </span>
                                              ) : null
                                          }
                                          {
                                            item.ownerWxId === item.wxId ?
                                              (
                                                <span className="icon-wrapper">
                                                  <Popconfirm
                                                    placement='top'
                                                    title='确认删除该条朋友圈？'
                                                    okText='确认'
                                                    cancelText='取消'
                                                    onConfirm={this.deleteMoment.bind(this, item)}>
                                                    <Icon type="delete"
                                                      data-id={item.id}
                                                      title='删除朋友圈'/>
                                                  </Popconfirm>
                                                </span>
                                              ) : null
                                          }
                                          <span className="icon-wrapper">
                                            {
                                              likeByMe ? (
                                                myLikeDeleteLoading || myLikeLoading ?
                                                  (
                                                    <Icon type="like"
                                                      className='waiting'
                                                      title={
                                                        (myLikeDeleteLoading ?
                                                          '删除点赞中...' :
                                                          (myLikeLoading ?
                                                            '点赞操作中...' :
                                                            '操作中')
                                                        )
                                                      }/>
                                                  ) : (
                                                    <Icon type="like"
                                                      data-id={likeComment.robotFcDataId}
                                                      title='删除点赞'
                                                      data-comment-id={likeCommentId}
                                                      onClick={this.handleDeleteLike}/>
                                                  )
                                              ) : (
                                                <Icon type="like-o" data-id={item.id}
                                                  title='赞！'
                                                  onClick={this.handleLikeMoment}/>
                                              )
                                            }
                                          </span>
                                          <span className="icon-wrapper">
                                            <Icon type="message" data-id={item.id}
                                              title='评论'
                                              onClick={this.handleRepTargetChange}/>
                                          </span>
                                        </div>
                                      )
                                    }

                                  </Col>
                                </OperateBox>
                                <div className="comments">
                                  {
                                    likeCounts[momentIndex] > 0 ?
                                      (
                                        <div className="like">
                                          <Icon type='heart-o' style={{
                                            transform: 'scale3d(0.75, 0.75, 1)'
                                          }}/>
                                          {
                                            item.commentList.map(comment => {
                                              if (comment.type === 1) {
                                                let commentId = comment.id ?
                                                  comment.id :
                                                  comment.robotFcDataCommentReplyId
                                                return (
                                                  <p className="like-wrapper"
                                                    key={commentId}>
                                                    {
                                                      comment.status !== null &&
                                                      comment.status !== 'SUCCESS' &&
                                                      comment.status !== 'ERROR' &&
                                                      comment.status !== 'CANCEL' ?
                                                        (
                                                          <span className='friend waiting'
                                                            title={comment.status === 'INIT' ?
                                                              '点击以取消' : '操作进行中，请稍等...'}
                                                            data-robot-fc-data-id={comment.robotFcDataId}
                                                            onClick={comment.status === 'INIT' ?
                                                              this.cancelLikeOrComment : null}
                                                            data-id={commentId}>{comment.nickname}</span>
                                                        ) : (
                                                          <span className='friend'
                                                            data-id={commentId}>{comment.nickname}</span>
                                                        )
                                                    },
                                                  </p>
                                                )
                                              } else {
                                                return null;
                                              }
                                            })
                                          }
                                        </div>
                                      ) : null
                                  }
                                  {
                                    commentCounts[momentIndex] > 0 ?
                                    (
                                      <div className='content'>
                                        {
                                          item.commentList.map(comment => {
                                            let commentId = comment.id ?
                                                comment.id :
                                                comment.robotFcDataCommentReplyId
                                            let commentLoading =
                                              (comment.status !== null &&
                                              comment.status !== 'SUCCESS' &&
                                              comment.status !== 'ERROR' &&
                                              comment.status !== 'CANCEL');
                                            let commentDeleteLoading =
                                              (comment.deleteStatus !== null &&
                                              comment.deleteStatus !== 'SUCCESS' &&
                                              comment.deleteStatus !== 'ERROR' &&
                                              comment.deleteStatus !== 'CANCEL');
                                            let commentByMe = (item.ownerWxId === comment.wxId);
                                            if (comment.type === 2) {
                                              return (
                                                <dl key={commentId}>
                                                  {
                                                    comment.refUserName || comment.refUserNick ?
                                                      (
                                                        <dt>
                                                          <span className="friend">{comment.nickname}</span>
                                                          <span> 回复 </span>
                                                          <span className="friend">{comment.refUserNick || comment.refUserName}</span>：
                                                        </dt>
                                                      ) :
                                                      (
                                                        <dt>
                                                          <span className="friend">{comment.nickname}</span>：
                                                        </dt>
                                                      )
                                                  }
                                                  <dd className="content">
                                                    {
                                                      comment.content
                                                    }
                                                  </dd>
                                                  <dd>
                                                    {
                                                      comment.deleteStatus === 'ERROR' ?
                                                        (
                                                          <span className="icon-wrapper">
                                                            <Icon type="exclamation-circle-o"
                                                              style={{color: 'red'}}
                                                              title={comment.deleteStatusMsg} />
                                                          </span>
                                                        ) : null
                                                    }
                                                    {
                                                      commentByMe ?
                                                        (
                                                          <span className='icon-wrapper'>
                                                            {
                                                              commentDeleteLoading ?
                                                                (
                                                                  <Icon type="delete"
                                                                    className='waiting'
                                                                    title='操作进行中，请稍等...'/>
                                                                ) :
                                                                (
                                                                  <Icon type="delete"
                                                                    data-id={comment.robotFcDataId}
                                                                    data-comment-id={commentId}
                                                                    onClick={this.deleteLikeOrComment}/>
                                                                )
                                                            }
                                                          </span>
                                                        ) : null
                                                    }
                                                    <span className='icon-wrapper'>
                                                      {
                                                        commentLoading ?
                                                          (
                                                            <Icon type="message"
                                                                data-id={commentId}
                                                                className='waiting'
                                                                data-name={comment.nickname}
                                                                title='点击以取消'
                                                                data-robot-fc-data-id={comment.robotFcDataId}
                                                                onClick={this.cancelLikeOrComment}/>
                                                          ) : (
                                                            !commentByMe ?
                                                              (
                                                                <Icon type="message"
                                                                  data-id={comment.robotFcDataId}
                                                                  data-comment-id={commentId}
                                                                  data-name={comment.nickname}
                                                                  onClick={this.handleRepTargetChange}/>
                                                              ) : null
                                                          )
                                                      }
                                                    </span>
                                                  </dd>
                                                </dl>
                                              )
                                            } else {
                                              return null;
                                            }
                                          })
                                        }
                                      </div>
                                    ) : null
                                  }

                                  {
                                    this.state.replyTarget &&
                                      this.state.replyTarget.momentId === item.id ?
                                      Reply :
                                      null
                                  }
                                </div>
                              </Col>
                            </Moment>
                          </Spin>
                        )
                      })
                    ) : (
                      <p style={{
                        padding: '30px 0',
                        color: '#e2e2e2'
                      }}><Icon type='smile-o'/> 最近没有朋友圈</p>
                    )
                }
                {
                  this.props.hasMore[this.state.target] &&
                  this.state.target !== 'updated' ?
                    (
                      <div style={{
                        textAlign: 'center',
                        marginTop: '10px'
                      }}>
                        <a href='#'>加载中...</a>
                      </div>
                    ) : <p style={{
                      marginTop: '10px',
                      textAlign: 'center',
                      color: '#ddd'
                    }}>----没有更多啦----</p>
                }
              </div>
            ) :
            (
              <p style={{
                padding: '30px 0',
                color: '#e2e2e2'
              }}><Icon type='smile-o'/> 选择微信号以查看朋友圈</p>
            )
          }
          <BackTop />
        </Detial>
      </Spin>
    </MomentWrapper>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    // 点赞
    likeMoment: (params) => {
      dispatch(likeMoment(params))
    },

    dislikeMoment: (params) => {
      dispatch(dislikeMoment(params))
    },

    // 评论
    commentMoment: (params) => {
      dispatch(commentMoment(params))
    },

    // 取消朋友圈评论或点赞
    cancelLikeOrComment: (params) => {
      dispatch(cancelLikeOrComment(params))
    },

    // 删除朋友圈评论或点赞
    deleteMomentComment: (params) => {
      dispatch(deleteMomentComment(params))
    },

    // 删除朋友圈
    deleteMoment: (params) => {
      dispatch(deleteMoment(params))
    },

    // 获取朋友圈信息
    getMoments: (params) => {
      dispatch(getMoments(params))
    },

    getUpdatedNotice: (params) => {
      dispatch(getUpdatedNotice(params))
    },

    // 刷新朋友圈信息
    getUpdatedMoment: (params) => {
      dispatch(getUpdatedMoment(params))
    },

    // 获取更新的朋友圈详细信息
    getUpdatedDetails: (params) => {
      dispatch(getUpdatedDetails(params))
    },

    // 切换个人号之前清空朋友圈，初始化参数
    initMoment: (params) => {
      dispatch(initMoment(params))
    }
  }
}

const WechatMoments = connect(
  mapStateToProps,
  mapDispatchToProps
)(Moments)

export default WechatMoments