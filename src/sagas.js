import { take, fork, put, call, takeLatest } from 'redux-saga/effects'
import types from './types'
import * as services from './services'
import {
  Message
} from 'antd'

function *log () {
  while (true) {
    try {
      yield take(action => {
        console.log(action);
        return true;
      })
    } catch (error) {

    }
  }
}

function *getAllMaterials () {
  while(true) {
    try {
      let action = yield take(types.GET_MATERIALS)
      let searchParams = action.payload
      let res = yield call(services.getAllMaterials, action.payload)
      if (res.data.status === 1) {
        yield put({
          type: types.GET_MATERIALS_SUCCEED,
          payload: {
            data: res.data.data.data,
            total: res.data.data.totalItem,
            page: searchParams.page
          }
        })

        // set search params
        yield put({type: types.SET_SEARCH_PARAMS,
          payload: searchParams})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
        yield put({
          type: types.GET_MATERIALS_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
      yield put({
        type: types.GET_MATERIALS_FAILED
      })
    }
  }
}


function *deleteMaterials () {
  while (true) {
    try {
      let action = yield take(types.DELETE_MATERIALS)
      let res = yield call(
        services.deleteMaterialsByIds,
        {
          ids: action.payload.ids
        }
      )
      if (res.data.status === 1) {

        // 请求当前页数据
        yield put({
          type: types.GET_MATERIALS,
          payload: {
            ...action.payload.searchParams
          }
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
        yield put({
          type: types.DELETE_MATERIALS_FAILED
        })
      }
    } catch(error) {
      console.error(error)
      yield put({
        type: types.DELETE_MATERIALS_FAILED
      })
    }
  }
}

function *checkResourceByParams () {
  while (true) {
    try {
      let action = yield take(types.CHECK_RESOURCE_BY_PARAMS)
      let res = yield call(services.checkResourceByParams,
        action.payload)
      if (res.data.status === 1) {
        Message.success('操作成功!')

        // 审核成功了之后，请求当前搜索条件的第一页数据
        yield put({type: types.GET_MATERIALS,
          payload: action.payload})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
        yield put({
          type: types.CHECK_RESOURCE_BY_PARAMS_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
      yield put({
        type: types.CHECK_RESOURCE_BY_PARAMS_FAILED
      })
    }
  }
}

function *checkResourceByIds () {
  while (true) {
    try {
      let action = yield take(
        types.CHECK_RESOURCE_BY_IDS
      )
      let res = yield call(services.checkResourceByIds, {
        ids: action.payload.ids
      })
      let type = ''
      if (res.data.status === 1) {
        Message.success('操作成功!')

        // 审核成功了了之后，请求当前搜索条件的数据
        switch (action.payload.type) {
          case 'IMAGE':
            type = types.GET_PICTURE
            break
          case 'LINK':
            type = types.GET_LINKLIST
            break
          case 'COMMENT':
            type = types.GET_COMMENTLIST
            break
          default:
            break
        }
        yield put({
          type,
          payload: action.payload.searchParams
        })
      } else {
        switch (action.payload.type) {
          case 'IMAGE':
            type = types.GET_PICTURE_FAILED
            break
          case 'LINK':
            type = types.GET_LINKLIST_FAILED
            break
          case 'COMMENT':
            type = types.GET_COMMENTLIST_FAILED
            break
          default:
            break
        }
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *deleteResourceByParams () {
  while (true) {
    try {
      let action = yield take(
        types.DELETE_RESOURCE_BY_PARAMS
      )
      let res = yield call(
        services.deleteResourceByParams,
        action.payload
      )
      if (res.data.status === 1) {
        Message.success('删除成功！')
        yield put({
          type: types.GET_MATERIALS,
          payload: action.payload
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *deleteResourceByIds () {
  while (true) {
    try {
      let action = yield take(
        types.DELETE_RESOURCE_BY_IDS
      )
      let res = yield call(
        services.deleteResourceByIds,
        action.payload.ids
      )
      if (res.data.status === 1) {
        Message.success('删除成功！')
        let type = ''
        switch (action.payload.type) {
          case 'IMAGE':
            type = types.GET_PICTURE
            break
          case 'LINK':
            type = types.GET_LINKLIST
            break
          case 'COMMENT':
            type = types.GET_COMMENTLIST
            break
          default:
            break
        }
        yield put({
          type,
          payload: action.payload.searchParams
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *getTextList () {
  while (true) {
    try {
      let action = yield take(
        types.GET_TEXT_LIST
      )
      let res = yield call(
        services.getTextList,
        action.payload
      )
      if (res.data.status === 1) {

        // set text list data
        yield put({
          type: types.GET_TEXT_LIST_SUCCEED,
          payload: {
            data: res.data.data.data,
            total: res.data.data.totalItem,
            page: action.payload.page
          }
        })

        // set search params
        yield put({type: types.SET_SEARCH_PARAMS,
          payload: action.payload})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
        yield put({
          type: types.GET_TEXT_LIST_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *deleteText () {
  while (true) {
    try {
      let action = yield take(types.DELETE_TEXT)
      let res = yield call(
        services.deleteText,
        {id: action.payload.id}
      )
      if (res.data.status === 1) {
        Message.success('删除成功！')

        // pull the new data
        yield put({
          type: types.GET_TEXT_LIST,
          payload: action.payload.textPager
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details ||res.data.msg);
        yield put({
          type: types.DELETE_TEXT_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *updateText () {
  while (true) {
    try {
      let action = yield take(types.UPDATE_TEXT)
      let res = yield call(
        services.updateText,
        {
          text: action.payload.text,
          id: action.payload.id,
          changeTag: action.payload.changeTag,
        }
      )
      if (res.data.status === 1) {
        Message.success('更新成功！')

        // pull the new data
        yield put({
          type: types.GET_TEXT_LIST,
          payload: action.payload.textPager
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.UPDATE_TEXT_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *addText () {
  while (true) {
    try {
      let action = yield take(types.ADD_TEXT)
      let res = yield call(
        services.addText,
        {
          text: action.payload.text,
          changeTag: action.payload.changeTag,
        }
      )
      if (res.data.status === 1) {
        Message.success('添加成功！')
        yield put({
          type: types.GET_TEXT_LIST,
          payload: action.payload.textPager
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.ADD_TEXT_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *getSubTextList () {
  while (true) {
    try {
      let action = yield take(
        types.GET_SUBTEXT_LIST
      )
      let res = yield call(
        services.getSubTextList,
        action.payload
      )
      if (res.data.status === 1) {
        yield put({
          type: types.GET_SUBTEXT_LIST_SUCCEED,
          payload: {
            data: res.data.data.data,
            total: res.data.data.totalItem,
            page: action.payload.page
          }
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.GET_SUBTEXT_LIST_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *getPictureList () {
  while (true) {
    try {
      let action = yield take(types.GET_PICTURE)
      let res = yield call(
        services.getPictureList,
        action.payload
      )
      if (res.data.status === 1) {
        yield put ({
          type: types.GET_PICTURE_SUCCEED,
          payload: {
            data: res.data.data.data,
            total: res.data.data.totalItem,
            page: action.payload.page
          }
        })

        // set search params
        yield put({type: types.SET_SEARCH_PARAMS,
          payload: action.payload})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.GET_PICTURE_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *getLinkList () {
  while (true) {
    try {
      let action = yield take(types.GET_LINKLIST)
      let res = yield call(
        services.getLinkList,
        action.payload
      )
      if (res.data.status === 1) {
        yield put({
          type: types.GET_LINKLIST_SUCCEED,
          payload: {
            total: res.data.data.totalItem,
            page: action.payload.page,
            data: res.data.data.data
          }
        })

        // set search params
        yield put({type: types.SET_SEARCH_PARAMS,
          payload: action.payload})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.GET_LINKLIST_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *settingMaterial2Wx () {
  while (true) {
    try {
      let action = yield take(types.MATERIAL_2_WX_SETTING)
      yield put ({
          type: types.MATERIAL_2_WX_SETTING,
          payload: action.payload
        })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *getCommentList () {
  while (true) {
    try {
      let action = yield take(types.GET_COMMENTLIST)
      let res = yield call(
        services.getCommentList,
        action.payload
      )
      if (res.data.status === 1) {
        yield put({
          type: types.GET_COMMENTLIST_SUCCEED,
          payload: {
            page: action.payload.page,
            total: res.data.data.totalItem,
            data: res.data.data.data
          }
        })

        // set search params
        yield put({type: types.SET_SEARCH_PARAMS,
          payload: action.payload})
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.GET_COMMENTLIST_FAILED
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *operateComment () {
  while (true) {
    try {
      let action = yield take(action => {
        return action.type.indexOf('COMMENT') !== -1 &&
          action.type.indexOf('COMMENTLIST') === -1
      })
      let { type, payload } = action
      let res = null
      if (type === types.ADD_COMMENT) {
        res = yield call(
          services.addComment,
          {
            text: payload.text
          }
        )
      } else if (type === types.UPDATE_COMMENT) {
        res = yield call(
          services.updateComment,
          {
            id: payload.id,
            text: payload.text
          }
        )
      } else if (type === types.DELETE_COMMENT) {
        res = yield call(
          services.deleteComment,
          payload.id
        )
      }
      if (res) {
        if (res.data.status === 1) {
          Message.success('操作成功！')
          yield put({
            type: types.GET_COMMENTLIST,
            payload: {
              ...payload.pager
            }
          })
        } else {
          Message.error(res.data.details || res.data.msg)
          console.log(res.data.details || res.data.msg)
        }
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *generateMaterials () {
  while (true) {
    try {
      let action = yield take(action => {
        return action.type.indexOf('GENERATE_BY') !== -1
      })
      let res = null;
      if (action.type === types.GENERATE_BY_HAND) {
        res = yield call(
          services.generateMaterialsByHand,
          action.payload
        )
      } else if (action.type === types.GENERATE_BY_AUTO) {
        res = yield call(
          services.generateMaterialsByParams,
          action.payload
        )
      }
      if (res.data.status === 1) {
        Message.success('操作成功！')
        setTimeout(_ => {
          location.reload(true)
        }, 1000)
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
    }
  }
}

function *exportMaterials (params) {
  while (true) {
    try {
      let action = yield take(action => {
        return action.type.indexOf('EXPORT_RESOURCE_BY') !== -1
      })
      let res = null;
      if (action.type === types.EXPORT_RESOURCE_BY_PARAMS) {
        yield call(services.exportMaterialsByParams, action.payload)
      } else if (action.type === types.EXPORT_RESOURCE_BY_IDS) {
        yield call(services.exportMaterialsByIds, action.payload)
      }
      if (res.data.status === 1) {
        Message.success('操作成功！')
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *getRobotTask () {
  while (true) {
    try {
      let action = yield take(types.GET_WX_TASK)
      let res = yield call(
        services.getRobotDetail,
        action.payload
      )
      if (res.data.status === 1) {
        yield put({
          type: types.GET_WX_TASK_SUCCESS,
          payload: {fctRobotId: action.payload, lists: res.data.data.fctRobotMaterialList}
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *deleteRobotTask () {
  while (true) {
    try {
      let action = yield take(types.DELETE_WX_TASK)
      let res = yield call(
        services.getTaskDelete,
        {fctRobotMaterialIdList: action.payload.fctRobotMaterialIdList}
      )
      if (res.data.status === 1) {
        Message.success('删除任务成功')
        if (action.payload.type === 'single') {
          yield put({
            type: types.GET_WX_TASK,
            payload: {fctRobotId: action.payload.taskId}
          })
        } else {
          yield put({
            type: types.GET_ROBOT_MATERIAL,
            payload: {params: action.payload.params, pagination: action.payload.pagination}
          })
        }
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *cancelRobotTask () {
  while (true) {
    try {
      let action = yield take(types.CANCEL_WX_TASK)
      let res = yield call(
        services.getTaskCannel,
        {fctRobotMaterialIdList: action.payload.fctRobotMaterialIdList}
      )
      if (res.data.status === 1) {
        Message.success('取消任务成功')
        if (action.payload.type === 'single') {
          yield put({
            type: types.GET_WX_TASK,
            payload: {fctRobotId: action.payload.taskId}
          })
        } else {
          yield put({
            type: types.GET_ROBOT_MATERIAL,
            payload: {params: action.payload.params, pagination: action.payload.pagination}
          })
        }
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *resendRobotTask () {
  while (true) {
    try {
      let action = yield take(types.RESEND_WX_TASK)
      let res = yield call(
        services.getTaskResend,
        {fctRobotMaterialIdList: action.payload.fctRobotMaterialIdList}
      )
      if (res.data.status === 1) {
        Message.success('取消任务成功')
        if (action.payload.type === 'single') {
          yield put({
            type: types.GET_WX_TASK,
            payload: {fctRobotId: action.payload.taskId}
          })
        } else {
          yield put({
            type: types.GET_ROBOT_MATERIAL,
            payload: {params: action.payload.params, pagination: action.payload.pagination}
          })
        }
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *changeWxTaskTab () {
  while (true) {
    try {
      let action = yield take(types.WX_TASK_ACTIVE_TAB)
      yield put({
        type: types.WX_TASK_ACTIVE_TAB,
        payload: action.payload
      })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *getTaskLists () {
  while (true) {
    try {
      let action = yield take(types.GET_TASK_LISTS)
      let res = yield call(
        services.getTasksList,
        action.payload.params
      )
      if (res.data.status === 1) {
        let dataSource =  res.data.data.data;
        let pagination = action.payload.pagination;
        pagination.total = res.data.data.totalItem;
        dataSource = dataSource.map((item, index) => {
          item.subTables = []
          return item;
        })
        yield put({
          type: types.GET_TASK_LISTS_SUCCESS,
          payload: {dataSource, pagination}
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

function *getRobots () {
  while(true) {
    try {
      let action = yield take(types.GET_ROBOT)
      let searchParams = action.payload
      let res = yield call(services.getRobot, action.payload)
      if (res.data.status === 1) {
        yield put({
          type: types.GET_ROBOT_SUCCESS,
          payload: {
            data: res.data.data.data,
            total: res.data.data.totalItem,
            page: searchParams.page
          }
        })

      } else {
        Message.error(res.data.details || res.data.msg)
        yield put({
          type: types.GET_ROBOT_ERROR
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error)
      yield put({
        type: types.GET_ROBOT_ERROR
      })
    }
  }
}

function *getRobotMaterials () {
  while (true) {
    try {
      let action = yield take(types.GET_ROBOT_MATERIAL)
      let res = yield call(
        services.getRobotMaterials,
        action.payload.params
      )
      if (res.data.status === 1) {
        let dataSource =  res.data.data.data;
        let pagination = action.payload.pagination;
        pagination.total = res.data.data.totalItem;
        yield put({
          type: types.GET_ROBOT_MATERIAL_SUCCESS,
          payload: {dataSource, pagination}
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.log(error);
    }
  }
}

// 获取朋友圈列表
function *getMomentList (action) {
  try {
    yield put({
      type: types.CHANGE_LOADING_STATUS,
      payload: {
        loading: true
      }
    })
    let target = action.payload.target;
    let params = {
      ...action.payload
    }
    let res = null
    delete params.target
    if ( target === 'mine' ) {
      res = yield call(services.getMineMoments, params)
    } else if ( target === 'others' ) {
      res = yield call(services.getAllMoments, params)
    }
    if (target === 'mine' || target === 'others') {
      if (res.data.status === 1 ) {
        let dataList = res.data.data
        if ( target === 'mine' ) {

          // wether there are more data
          if (dataList.length < params.size) {
            yield put({
              type: types.UPDATE_HASMORE_SUCCEED,
              payload: {
                target,
                mine: false
              }
            })
          } else {
            yield put({
              type: types.UPDATE_HASMORE_SUCCEED,
              payload: {
                target,
                mine: true
              }
            })
          }
          if (dataList.length > 0) {
            yield put({
              type: types.GET_MINE_MOMENTS_SUCCEED,
              payload: dataList
            })

          } else {
            yield put({
              type: types.GET_MINE_MOMENTS_FAILED,
              payload: dataList
            })
          }
        } else if ( target === 'others' ) {

          // wether there are more data
          if (dataList.length < params.size) {
            yield put({
              type: types.UPDATE_HASMORE_SUCCEED,
              payload: {
                target,
                others: false
              }
            })
          } else {
            yield put({
              type: types.UPDATE_HASMORE_SUCCEED,
              payload: {
                target,
                others: true
              }
            })
          }
          if (dataList.length > 0) {
            yield put({
              type: types.GET_ALL_MOMENTS_SUCCEED,
              payload: dataList
            })

          } else {
            yield put({
              type: types.GET_ALL_MOMENTS_FAILED,
              payload: dataList
            })
          }
        }
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        if ( target === 'mine' ) {
          yield put({
            type: types.GET_MINE_MOMENTS_FAILED
          })
        } else if ( target === 'others' ) {
          yield put({
            type: types.GET_ALL_MOMENTS_FAILED
          })
        }
      }
    }
    yield put({
      type: types.CHANGE_LOADING_STATUS,
      payload: {
        loading: false
      }
    })
  } catch (error) {
    yield put({
      type: types.GET_MINE_MOMENTS_FAILED
    })
    yield put({
      type: types.CHANGE_LOADING_STATUS,
      payload: {
        loading: false
      }
    })
    Message.error('服务器异常，请稍后重试！')
    console.trace(error);
  }
}

// 获取朋友圈更新概况列表
function *getAllNotice () {
  while (true) {
    try {
      let action = yield take(types.GET_UPDATED_NOTICE)
      let res = yield call(services.getUpdatedNotice, action.payload)
      if ( res.data.status === 1 ) {
        yield put({
          type: types.GET_UPDATED_NOTICE_SUCCEED,
          payload: res.data.data
        })
      } else {
        yield put({
          type: types.GET_UPDATED_NOTICE_FAILED
        })
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.trace(error);
      yield put({
        type: types.GET_UPDATED_NOTICE_FAILED
      })
    }
  }
}

// 移除已查看的更新
function *removeCheckedNotice () {
  while (true) {
    try {
      let action = yield take(types.REMOVE_CHECKED_NOTICE)
      let res = yield call(services.removeCheckedNotice, action.payload)
      if (res.data.status === 1) {
        yield put({
          type: types.REMOVE_CHECKED_NOTICE_SUCCEED,
          payload: res.data.data
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.trace(error)
    }
  }
}

// 获取朋友圈更新详情
function *getUpdatedDetails () {
  while (true) {
    try {
      let action = yield take(action => {
        if (action.type === types.GET_UPDATED_DETAILS || action.type === types.GET_UPDATED_MOMENT) {
          return true;
        } else {
          return false
        }
      })
      let { noticeIdList, robotFcDataIdList } = action.payload;
      if (action.type === types.GET_UPDATED_DETAILS) {
        if (robotFcDataIdList.length > 0) {
          yield put({
            type: types.CHANGE_ONE_LOADING_STATUS,
            payload: {
              loading: true,
              id: robotFcDataIdList[0]
            }
          })
        }
      } else if (action.type === types.GET_UPDATED_MOMENT) {
        yield put({
          type: types.CHANGE_LOADING_STATUS,
          payload: {
            loading: true
          }
        })
      }
      let res = yield call(services.getUpdatedDetails, action.payload)
      let deletedList = []
      if ( res.data.status === 1 ) {

        // 校验有哪些被删除了
        robotFcDataIdList.forEach(item => {
          let inCallback = false;
          res.data.data.some(result => {
            if (item === result.id) {
              inCallback = true;
              return true;
            } else {
              return false;
            }
          })
          if (!inCallback) {
            deletedList.push(item)
          }
        })
        if (action.type === types.GET_UPDATED_DETAILS) {

          yield put({
            type: types.GET_UPDATED_DETAILS_SUCCEED,
            payload: {
              data: res.data.data,
              deletedList,
            }
          })
        } else if (action.type === types.GET_UPDATED_MOMENT) {
          yield put({
            type: types.GET_UPDATED_MOMENT_SUCCEED,
            payload: {
              data: res.data.data,
              deletedList,
            }
          })

          // 此时需要通知后端更新已被查看，清空已查看的更新通知
          yield put({
            type: types.REMOVE_CHECKED_NOTICE,
            payload: {
              noticeIdList,
            }
          })

        }
      } else {
        yield put({
          type: types.GET_UPDATED_DETAILS_FAILED
        })
      }
      if (action.type === types.GET_UPDATED_DETAILS) {
        if (robotFcDataIdList.length > 0) {
          yield put({
            type: types.CHANGE_ONE_LOADING_STATUS,
            payload: {
              loading: false,
              id: robotFcDataIdList[0]
            }
          })
        }
      } else if (action.type === types.GET_UPDATED_MOMENT) {
        yield put({
          type: types.CHANGE_LOADING_STATUS,
          payload: {
            loading: false
          }
        })
      }
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.trace(error);
      yield put({
        type: types.GET_UPDATED_DETAILS_FAILED
      })
      yield put({
        type: types.CHANGE_LOADING_STATUS,
        payload: {
          loading: false
        }
      })
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    }
  }
}

// 点赞
function *likeMoment () {
  while (true) {
    try {
      let action = yield take(types.LIKE_MOMENT)
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: true,
          id: action.payload.robotFcDataId
        }
      })
      let params = {
        robotId: action.payload.robotId,
        robotFcDataId: action.payload.robotFcDataId
      }
      let res = yield call(services.likeMoment, params)
      if (res.data.status === 1) {

        // 点赞成功之后，重新拉去对应的朋友圈详情

        // 2s后重新拉去对应的朋友圈详情
        yield delay(2000)
        yield put({
          type: types.GET_UPDATED_DETAILS,
          payload: {
            robotFcDataIdList: [params.robotFcDataId]
          }
        })
      } else {
        Message.error(res.data.details || res.datat.msg);
        console.log(res.data.details || res.data.msg);
        yield({
          type: types.LIKE_MOMENT_FAILED
        })
      }
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！')
      console.trace(error);
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    }
  }
}

// 朋友圈评论
function *commentMoment () {
  while (true) {
    try {
      let action = yield take(types.COMMENT_MOMENT)
      let { robotId } = action.payload
      let params = {};
      params.robotId = robotId;
      params.robotFcDataId = action.payload.robotFcDataId;
      params.commentText = action.payload.commentText;
      params.robotFcDataCommentId = action.payload.robotFcDataCommentId;
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: true,
          id: action.payload.robotFcDataId
        }
      })
      let res = yield call(services.commentMoment, params)
      console.log(res);
      if ( res.data.status === 1 ) {

        // 2s后重新拉去对应的朋友圈详情
        yield delay(2000)
        yield put({
          type: types.GET_UPDATED_DETAILS,
          payload: {
            robotFcDataIdList: [params.robotFcDataId]
          }
        })
      } else {
        yield put({
          type: types.COMMENT_MOMENT_FAILED
        })
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
      }
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    } catch (error) {
      yield put({
        type: types.COMMENT_MOMENT_FAILED
      })
      Message.error('服务器异常，请稍后重试！')
      console.trace(error);
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    }
  }
}

// 取消尚未执行完毕的点赞或评论请求
function *cancelLikeOrComment () {
  while (true) {
    try {
      let action = yield take(types.CANCEL_MOMENT_COMMENT)
      yield put({
        type: types.CHANGE_LOADING_STATUS,
        payload: {
          loading: true
        }
      })
      let res = yield call(services.cancelLikeOrComment, {
        replyId: action.payload.replyId
      })
      if ( res.data.status === 1 ) {
        yield put({
          type: types.GET_UPDATED_DETAILS,
          payload: {
            robotFcDataIdList: [action.payload.robotFcDataId]
          }
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
        yield put({
          type: types.CANCEL_MOMENT_COMMENT_FAILED
        })
      }
      yield put({
        type: types.CHANGE_LOADING_STATUS,
        payload: {
          loading: false
        }
      })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！');
      console.trace(error);
      yield put({
        type: types.CHANGE_LOADING_STATUS,
        payload: {
          loading: false
        }
      })
    }
  }
}

// 删除朋友圈
function *deleteMoment () {
  while (true) {
    try {
      let action = yield take(types.DELETE_MOMENT)
      let { size, target, robotId, robotFcDataId } = action.payload
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: true,
          id: robotFcDataId
        }
      })
      let res = yield call(services.deleteMoment, {
        robotId,
        robotFcDataId,
      })
      if (res.data.status === 1) {

        // 延迟2s 重新拉去对应的朋友圈详情
        yield delay(2000)

        yield put({
          type: types.GET_MOMENTS,
          payload: {
            size,
            target,
            robotId,
          }
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg);
      }
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！');
      console.trace(error);
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    }
  }
}

// 删除朋友圈评论或点赞
function *deleteLikeOrComment () {
  while (true) {
    try {
      let action = yield take(types.DELETE_MOMENT_COMMENT)
      let { robotId, robotFcDataId, robotFcDataCommentId }
        = action.payload
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: true,
          id: robotFcDataId
        }
      })
      let res = yield call(services.deleteLikeOrComment, {
        robotId,
        robotFcDataId,
        robotFcDataCommentId,
      })
      if (res.data.status === 1) {

        // 点赞成功之后，重新拉去对应的朋友圈详情
        yield delay(2000)
        yield put({
          type: types.GET_UPDATED_DETAILS,
          payload: {
            robotFcDataIdList: [robotFcDataId]
          }
        })
      } else {
        Message.error(res.data.details || res.data.msg)
        console.log(res.data.details || res.data.msg)
      }
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    } catch (error) {
      Message.error('服务器异常，请稍后重试！');
      console.trace(error);
      yield put({
        type: types.CHANGE_ONE_LOADING_STATUS,
        payload: {
          loading: false,
          id: null
        }
      })
    }
  }
}

// 初始化朋友圈
function *initMoment () {
  while (true) {
    try {
      yield take(types.INIT_MOMENT)

      // 清空朋友圈
      yield put({
        type: types.CLEAR_MOMENT
      })

      // 初始化分页
      yield put({
        type: types.INIT_HASMORE
      })

      // 清空通知
      yield put({
        type: types.CLEAR_NOTICE
      })
    } catch (error) {

    }
  }
}

function delay (timeLog) {
  return new Promise((resolve, reject) => {
    setTimeout(_ => {
      resolve()
    }, timeLog)
  })
}

function *controlTakeLatest () {
  yield takeLatest(types.GET_MOMENTS, getMomentList)
}

export default function * () {
  yield fork(getAllMaterials);
  yield fork(checkResourceByParams);
  yield fork(checkResourceByIds);
  yield fork(deleteResourceByParams);
  yield fork(deleteResourceByIds);
  yield fork(getTextList);
  yield fork(deleteText);
  yield fork(updateText);
  yield fork(addText);
  yield fork(getSubTextList);
  yield fork(getPictureList);
  yield fork(getLinkList);
  yield fork(getCommentList);
  yield fork(deleteMaterials);
  yield fork(settingMaterial2Wx);
  yield fork(generateMaterials);
  yield fork(operateComment);
  yield fork(getRobotTask);
  yield fork(deleteRobotTask);
  yield fork(cancelRobotTask);
  yield fork(resendRobotTask);
  yield fork(changeWxTaskTab);
  yield fork(getTaskLists);
  yield fork(exportMaterials);
  yield fork(log);
  yield fork(getRobots);
  yield fork(getAllNotice);
  yield fork(likeMoment);
  yield fork(commentMoment);
  yield fork(cancelLikeOrComment);
  yield fork(getUpdatedDetails);
  yield fork(deleteMoment);
  yield fork(deleteLikeOrComment);
  yield fork(getRobotMaterials);
  yield fork(removeCheckedNotice);
  yield fork(initMoment);
  yield fork(controlTakeLatest);
}