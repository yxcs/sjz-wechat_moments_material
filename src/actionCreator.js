import types from './types.js';

export const getAllMaterials = (payload) => {
  return {
    type: types.GET_MATERIALS,
    payload
  }
}

export const deleteSelectedList = (payload) => {
  return {
    type: types.DELETE_SELECTED_LISTS,
    payload
  }
}

export const checkResourceByParams = (payload) => {
  return {
    type: types.CHECK_RESOURCE_BY_PARAMS,
    payload
  }
}

export const checkResourceByIds = (payload) => {
  return {
    type: types.CHECK_RESOURCE_BY_IDS,
    payload
  }
}

export const deleteResourceByParams = (payload) => {
  return {
    type: types.DELETE_RESOURCE_BY_PARAMS,
    payload
  }
}

export const deleteResourceByIds = (payload) => {
  return {
    type: types.DELETE_RESOURCE_BY_IDS,
    payload
  }
}

export const getTextList = (payload) => {
  return {
    type: types.GET_TEXT_LIST,
    payload
  }
}

export const addText = (payload) => {
  return {
    type: types.ADD_TEXT,
    payload
  }
}

export const deleteText = (payload) => {
  return {
    type: types.DELETE_TEXT,
    payload
  }
}

export const updateText = (payload) => {
  return {
    type: types.UPDATE_TEXT,
    payload
  }
}

export const getSubTextList = (payload) => {
  return {
    type: types.GET_SUBTEXT_LIST,
    payload
  }
}

export const getPictureList = (payload) => {
  return {
    type: types.GET_PICTURE,
    payload
  }
}

export const getLinkList = (payload) => {
  return {
    type: types.GET_LINKLIST,
    payload
  }
}

export const getCommentList = (payload) => {
  return {
    type: types.GET_COMMENTLIST,
    payload
  }
}

export const deleteMaterialsByIds = (payload) => {
  return {
    type: types.DELETE_MATERIALS,
    payload
  }
}

export const settingMaterial2Wx = (payload) => {
  return {
    type: types.MATERIAL_2_WX_SETTING,
    payload
  }
}

export const generateByHand = (payload) => {
  return {
    type: types.GENERATE_BY_HAND,
    payload
  }
}

export const getRobotTask = (payload) => {
  return {
    type: types.GET_WX_TASK,
    payload
  }
}

export const generateByAuto = (payload) => {
  return {
    type: types.GENERATE_BY_AUTO,
    payload
  }
}

export const deleteRobotTask = (payload) => {
  return {
    type: types.DELETE_WX_TASK,
    payload
  }
}

export const addComment = (payload) => {
  return {
    type: types.ADD_COMMENT,
    payload
  }
}

export const cancelRobotTask = (payload) => {
  return {
    type: types.CANCEL_WX_TASK,
    payload
  }
}

export const deleteComment = (payload) => {
  return {
    type: types.DELETE_COMMENT,
    payload
  }
}

export const resendRobotTask = (payload) => {
  return {
    type: types.RESEND_WX_TASK,
    payload
  }
}


export const updateComment = (payload) => {
  return {
    type: types.UPDATE_COMMENT,
    payload
  }
}

export const exportByParams = (payload) => {
  return {
    type: types.EXPORT_RESOURCE_BY_PARAMS,
  }
}

export const exportByIds = (payload) => {
  return {
    type: types.EXPORT_RESOURCE_BY_IDS,
    payload
  }
}

export const changeWxTaskTab = (payload) => {
  return {
    type: types.WX_TASK_ACTIVE_TAB,
    payload
  }
}

export const getTaskLists = (payload) => {
  return {
    type: types.GET_TASK_LISTS,
    payload
  }
}

export const getRobots = (payload) => {
  return {
    type: types.GET_ROBOT,
    payload
  }
}

// 朋友圈点赞
export const likeMoment = (payload) => {
  return {
    type: types.LIKE_MOMENT,
    payload
  }
}

// 删除朋友圈点赞
export const dislikeMoment = (payload) => {
  return {
    type: types.DISLIKE_MOMENT,
    payload
  }
}

// 评论朋友圈
export const commentMoment = (payload) => {
  return {
    type: types.COMMENT_MOMENT,
    payload
  }
}

// 取消发送评论或点赞的请求
export const cancelMomentComment = (payload) => {
  return {
    type: types.CANCEL_MOMENT,
    payload
  }
}

// 取消点赞或评论
export const cancelLikeOrComment = (payload) => {
  return {
    type: types.CANCEL_MOMENT_COMMENT,
    payload
  }
}

// 删除点赞或者评论
export const deleteMomentComment = (payload) => {
  return {
    type: types.DELETE_MOMENT_COMMENT,
    payload
  }
}

// 获取朋友圈列表
export const getMoments = (payload) => {
  return {
    type: types.GET_MOMENTS,
    payload
  }
}

// 获取更新的朋友圈数据
export const getUpdatedMoment = (payload) => {
  return {
    type: types.GET_UPDATED_MOMENT,
    payload
  }
}

// 获取推送的更新消息
export const getUpdatedNotice = (payload) => {
  return {
    type: types.GET_UPDATED_NOTICE,
    payload
  }
}

// 获取最近更新的朋友圈数据详情
export const getUpdatedDetails = (payload) => {
  return {
    type: types.GET_UPDATED_DETAILS,
    payload
  }
}

// 删除朋友圈
export const deleteMoment = (payload) => {
  return {
    type: types.DELETE_MOMENT,
    payload
  }
}

export const getRobotMaterials = (payload) => {
  return {
    type: types.GET_ROBOT_MATERIAL,
    payload
  }
}

// 初始化朋友圈
export const initMoment = (payload) => {
  return {
    type: types.INIT_MOMENT,
    payload
  }
}