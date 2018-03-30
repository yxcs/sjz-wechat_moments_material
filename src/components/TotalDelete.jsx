import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  Button,
} from 'antd';

class DeleteBtn extends React.Component {
  constructor ( props ) {
    super(props);
    this.state = {
    }
  }
  render () {
  }
}

const mapStateToProps = (state, ownProps) => {
  return state;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      dispatch(actionCreator)
    }
  }
}

const TotalDelete = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteBtn)

export default TotalDelete