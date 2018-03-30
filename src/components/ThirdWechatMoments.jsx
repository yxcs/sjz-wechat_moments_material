import React from 'react'
import styled from 'styled-components'
import fetchJsonp from 'fetch-jsonp'
import * as config from '../config'
import {
  Message,
  Button
} from 'antd';

const ThirdMomentWrapper = styled.div`
  border: solid 1px #eee;
  width: 100%;
  height: calc(100vh - 104px);
  .tip {
    margin-left: 30px;
    padding: 20px;
  }
`

const ReLogin = styled(Button)`
  position: absolute;
  right: 84px;
  margin: 11px 10px;
  font-weight: bold;
  &.login {
    background: black;
    color: white;
  }
`

const OpenNew = styled.a`
  position: absolute;
  right: 140px;
  line-height: 50px;
  &.login button {
    background: black;
    color: white;
  }
`

export default class ThirdWechatComponents extends React.Component {
  state = {
    robotId: null,
    login: true,
    status: ''
  }
  componentWillMount () {
    this.loginAction();
  }
  loginAction = async _ => {
    this.setState({
      login: false
    })

    // 获取token
    try {
      let res = await fetchJsonp(`${config.thirdUrl}/index.php?r=timeline/valid-token&type=timeline`, {
        timeout: 60000
      })
      let token = await res.json()
      console.log(token);
      // 登录
      let loginRes = await fetchJsonp(`${config.thirdUrl}/index.php?r=timeline/login&LoginForm[username]=timeline&LoginForm[password]=0eb443de2c21&_csrf-backend=${token.data}&referrer=friends-gp-rs.mdscj.com`, {
        timeout: 60000
      })
      console.log(loginRes);
      let loginResult = await loginRes.json()

      if (loginResult.data === 'success') {
        this.setState({
          login: true
        })
      } else {
        Message.error('登录异常！')
        this.setState({
          status: 'FAILED'
        })
      }
      console.log(loginResult)
    } catch (error) {
      Message.info('第三方服务器异常，暂无法查看朋友圈，请稍后重试！')
      console.log(error)
      console.log('http://crm.alichat.loveutips.com/index.php?r=timeline/browser-foreign');
      this.setState({
        status: 'ERROR'
      })
    }
  }
  render () {
    return (
      <ThirdMomentWrapper>
        <ReLogin shape='circle' icon='reload' title="刷新登陆状态"
          className={this.state.login ? 'login' : ''}
          onClick={this.loginAction}/>
        <OpenNew
          className={this.state.login ? 'login' : ''}
          href="http://crm.alichat.loveutips.com/index.php?r=timeline/browser-foreign"
          target="_blank">
          <Button shape='circle' icon='windows-o'
            title="新窗口打开" />
        </OpenNew>
        {
          this.state.login ?
            (
              <iframe
                width='100%'
                height='100%'
                frameBorder={0}
                src='http://crm.alichat.loveutips.com/index.php?r=timeline/browser-foreign'></iframe>
            ) : (
              <p className='tip'>
                {
                  this.state.status === 'FAILED' ?
                    '登录失败，请刷新重试！' :
                    (
                      this.state.status === 'ERROR' ?
                        '第三方服务器异常，请稍后重试！' :
                        '账号登陆中，请稍等...'
                    )
                }
              </p>
            )
        }
      </ThirdMomentWrapper>
    )
  }
}