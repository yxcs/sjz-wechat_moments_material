import React from 'react';
import { Tabs } from 'antd';
import SearchBox from './SearchBox';
import TextList from './TextList';
import PictureList from './PictureList';
import LinkList from './LinkList';
import CommentList from './CommentList';
import styled from 'styled-components';

const TabPane = Tabs.TabPane;

const ResoruceTabsWrapper = styled(Tabs)`
  position: absolute;
  padding-right: 20px;
  top: 0;
  bottom: 0;
  left: 20px;
  right: 0;
  overflow-y: auto;
  overflow-x: hidden;
  .ant-tabs-tabpane-inactive {
    overflow: hidden;
  }
`

class ResourceManage extends React.Component {
  render () {
    return (
      <div>
        <ResoruceTabsWrapper
          className='scroll-bar'
          defaultActiveKey='picture'>
          <TabPane tab='文案' key='text'>
            <SearchBox type='TEXT' />
            <TextList />
          </TabPane>
          <TabPane tab='图片' key='picture'>
            <SearchBox type='IMAGE'
              useTag={true}
              useTaskStatus={true}/>
            <PictureList target='source' />
          </TabPane>
          <TabPane tab='链接' key='link'>
             <SearchBox type='LINK'
              useTag={true}
              useTaskStatus={true}/>
            <LinkList />
          </TabPane>
          <TabPane tab='评论' key='comments'>
             <SearchBox type='COMMENTS' />
            <CommentList />
          </TabPane>
        </ResoruceTabsWrapper>
      </div>
    )
  }
}

export default ResourceManage;
