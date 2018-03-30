import types from './types'
import { combineReducers } from 'redux'
import { Map, List } from 'immutable'

const materials = (state = Map({total: 0, data: [], page: 0}), action) => {
  switch (action.type) {
    case types.GET_MATERIALS_SUCCEED:
      let materials = state.set('page', action.payload.page)
        .set('data', action.payload.data)
        .set('total', action.payload.total)
      return materials
    default:
      return state
  }
}

const searchParams = (state = {status: 'WAIT_CHECK'}, action) => {
  switch (action.type) {
    case types.SET_SEARCH_PARAMS:
      return action.payload
    default:
      return state
  }
}

const textList = (state = Map({page: 0, data: [], total: 0}), action) => {
  switch (action.type) {
    case types.GET_TEXT_LIST_SUCCEED:
      let texts = state.set('page', action.payload.page)
        .set('total', action.payload.total)
        .set('data', action.payload.data)
      return texts
    default:
      return state
  }
}

const subTextList = (state = Map({page: 0, total: 0, data: []}), action) => {
  switch (action.type) {
    case types.GET_SUBTEXT_LIST_SUCCEED:
      let subTexts = state.set('page', action.payload.page)
        .set('total', action.payload.total)
        .set('data', action.payload.data)
      return subTexts
    default:
      return state
  }
}

const tags = (state = [], action) => {
  switch (action.type) {
    case types.GET_TAGS_SUCCEED:
      return action.payload
    default:
      return state
  }
}

const pictures = (state = Map({total: 0, data: [], page: 0}), action) => {
  switch (action.type) {
    case types.GET_PICTURE_SUCCEED:
      let total = state.set("total", action.payload.total)
      let data = total.set("data", action.payload.data)
      let page = data.set("page", action.payload.page)
      return page
    case types.GET_PICTURE_FAILED:
      return state;
    default:
      return state
  }
}

const linkList = (state = Map({total: 0, data: [], page: 0}), action) => {
  switch (action.type) {
    case types.GET_LINKLIST_SUCCEED:
      let links = state.set('total', action.payload.total)
        .set('page', action.payload.page)
        .set('data', action.payload.data)
      return links
    case types.GET_LINKLIST_FAILED:
      return state;
    default:
      return state
  }
}

const commentList = (state = Map({total: 0, data: [], page: 0}), action) => {
  switch (action.type) {
    case types.GET_COMMENTLIST_SUCCEED:
      let comments = state.set('page', action.payload.page)
        .set('data', action.payload.data)
        .set('total', action.payload.total)
      return comments
    case types.GET_COMMENTLIST_FAILED:
      return state
    default:
      return state
  }
}

const selectLists = (state = [], action) => {
  switch (action.type) {
    case types.MATERIAL_2_WX_SETTING:
      return action.payload;
    default:
      return state;
  }
}

const wxTaskList = (state = [], action) => {
  switch (action.type) {
    case types.GET_WX_TASK_SUCCESS:
      let lists = [];
      lists.push(action.payload)
      return lists;
    default:
      return state;
  }
}

const activeTab = (state = Map({
  SELF_status: 'ONLINE',
  SELF_tagId: 'all',
  GUANGZHOU_status: 'ONLINE',
  GUANGZHOU_tagId: 'all',
  BEIJING_status: 'ONLINE',
  BEIJING_tagId: 'all',
}), action) => {
  switch (action.type) {
    case types.WX_TASK_ACTIVE_TAB:
      let params = {};
      if (action.payload.tabs === 'SELF') {
        params = state.set('SELF_status', action.payload.SELF_status)
                      .set('SELF_tagId', action.payload.SELF_tagId)
      } else if (action.payload.tabs === 'GUANGZHOU') {
        params = state.set('GUANGZHOU_status', action.payload.GUANGZHOU_status)
                      .set('GUANGZHOU_tagId', action.payload.GUANGZHOU_tagId)
      } else {
        params = state.set('BEIJING_status', action.payload.BEIJING_status)
                      .set('BEIJING_tagId', action.payload.BEIJING_tagId)
      }
       
      return params;
    default:
      return state;
  }
}

const taskLists = (state = {}, action) => {
  switch (action.type) {
    case types.GET_TASK_LISTS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}

const robots = (state = Map({total: 0, data: [], page: 0}), action) => {
  switch (action.type) {
    case types.GET_ROBOT_SUCCESS:
      let robots = state.set('page', action.payload.page)
        .set('data', action.payload.data)
        .set('total', action.payload.total)
      return robots
    default:
      return state
  }
}

const lastMomentId = (state = null, action) => {
  switch (action.type) {
    case types.GET_COMMENTLIST_SUCCEED:
      return action.payload
    default:
      return state
  }
}

const robotMaterial = (state = {}, action) => {
  switch (action.type) {
    case types.GET_ROBOT_MATERIAL_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}

const noticeList = (state = List([]), action) => {
  switch (action.type) {
    case types.GET_UPDATED_NOTICE_SUCCEED:
      return List(action.payload)
    case types.GET_UPDATED_NOTICE_FAILED:
      return state;
    case types.CLEAR_NOTICE:
      return List([])
    default:
      return state;
  }
}

/**
 * @desc 合并增量更新的朋友圈
 * @param {String} mergeType 合并类型：'MERGE'表示非增量更新，不向oldMoments中追加新增的，
 *                           'ADD' 表示增量更新，向oldMoments中追加新增数据
 * @param {Array} oldMoments 当前朋友圈列表
 * @param {Array} newMoments 更新的朋友圈
 * @return {Array} 经过合并更新之后的结果，equals to oldMoments
 */
const mergeMoments = (mergeType, oldMoments, newMoments) => {
  if (mergeType === 'MERGE') {
    oldMoments.forEach((oldItem, index) => {
      newMoments.forEach(newItem => {
        if (oldItem.id === newItem.id) {
          oldMoments[index] = newItem
        }
      })
    })
  } else if (mergeType === 'ADD') {

    // 判断是增量更新还是初始化
    let type = oldMoments.length > 0 ?
      'ADD' : 'INIT'
    let mergeArr = []
    newMoments.forEach(newItem => {
      let contains = false;
      let inOldIndex = -1;
      oldMoments.some((oldItem, index) => {
        if (oldItem.id === newItem.id) {
          contains = true;
          inOldIndex = index
          return true;
        } else {
          return false;
        }
      })
      if (contains) {
        oldMoments[inOldIndex] = newItem
      } else {
        mergeArr.push(newItem)
      }
    })
    // 判断首位新增
    if (type === 'INIT') {
      oldMoments = mergeArr.concat(oldMoments)
    } else if (type === 'ADD') {
      oldMoments = oldMoments.concat(mergeArr)
    }
  }
  return oldMoments
}

const mineMoments = (state = List([]), action) => {
  switch (action.type) {
    case types.GET_MINE_MOMENTS_SUCCEED:
      return List(mergeMoments('ADD', state.toArray(), action.payload))

    // comment failed should just return the moments list
    case types.COMMENT_MOMENT_FAILED:
      return List(state.toArray())
    case types.GET_UPDATED_DETAILS_SUCCEED:
      let oldArr = state.toArray();
      let deletedList = action.payload.deletedList
      oldArr = mergeMoments('MERGE', oldArr, action.payload.data)
      oldArr = oldArr.filter(item => {
        if (deletedList.indexOf(item.id) === -1) {
          return true
        } else {
          return false
        }
      })
      return List(oldArr)
    case types.CLEAR_MOMENT:
      return List([])
    default:
      return state
  }
}

const allMoments = (state = List([]), action) => {
  switch (action.type) {
    case types.GET_ALL_MOMENTS_SUCCEED:
      return List(mergeMoments('ADD', state.toArray(), action.payload))

      // comment failed should just return the moments list
    case types.GET_ALL_MOMENTS_FAILED:
    case types.COMMENT_MOMENT_FAILED:
      return List(state.toArray())
    case types.GET_UPDATED_DETAILS_SUCCEED:
      let oldArr = state.toArray();
      let deletedList = action.payload.deletedList
      oldArr = mergeMoments('MERGE', oldArr, action.payload.data)
      oldArr = oldArr.filter(item => {
        if (deletedList.indexOf(item.id) === -1) {
          return true
        } else {
          return false
        }
      })
      return List(oldArr)
    case types.CLEAR_MOMENT:
      return List([])
    default:
      return state;
  }
}

const updatedMoments = (state = List([]), action) => {
  switch (action.type) {
    case types.GET_UPDATED_MOMENT_SUCCEED:
      return List(mergeMoments('ADD', state.toArray(), action.payload.data))

    // comment failed should just return the moments list
    case types.COMMENT_MOMENT_FAILED:
      return List(state.toArray())
    case types.GET_UPDATED_DETAILS_SUCCEED:
      let oldArr = state.toArray();
      let deletedList = action.payload.deletedList
      oldArr = mergeMoments('MERGE', oldArr, action.payload.data)
      oldArr = oldArr.filter(item => {
        if (deletedList.indexOf(item.id) === -1) {
          return true
        } else {
          return false
        }
      })
      return List(oldArr)
    case types.CLEAR_MOMENT:
      return List([])
    default:
      return state
  }
}

const initialState = {
  mine: true,
  others: true,
  updated: true,
}
const hasMore = (state = initialState, action) => {
  let payload = action.payload
  switch (action.type) {
    case types.UPDATE_HASMORE_SUCCEED:
      if (state[payload.target] === payload[payload.target]) {
        return state
      } else {
        return Object.assign(state, {
          [payload.target]: payload[payload.target]
        })
      }
    case types.INIT_HASMORE:
      return Object.assign({}, initialState)
    default:
      return state
  }
}

const momentLoading = (state = false, action) => {
  switch (action.type) {
    case types.CHANGE_LOADING_STATUS:
      return action.payload.loading
    default:
      return state
  }
}

const oneLoading = (state = {}, action) => {
  switch (action.type) {
    case types.CHANGE_ONE_LOADING_STATUS:
      if (action.payload.id) {
        if (state[action.payload.id] !== action.payload.loading) {
          return Object.assign({}, state, {
            [action.payload.id]: action.payload.loading
          })
        } else {
          return state
        }
      } else {
        return {}
      }
    default:
      return state
  }
}

const app = combineReducers({
  materials,
  searchParams,
  textList,
  subTextList,
  tags,
  pictures,
  linkList,
  commentList,
  selectLists,
  wxTaskList,
  activeTab,
  taskLists,
  robots,
  lastMomentId,
  noticeList,
  mineMoments,
  allMoments,
  updatedMoments,
  hasMore,
  robotMaterial,
  momentLoading,
  oneLoading,
})

export default app