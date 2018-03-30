import axios from 'axios';
import * as config from './config';

/**
 * This function handle the payload boject, remove the filed which value is null or ''
 * @param {* Object} params the object will be sent to server side
 */
const filterNullParams = (params) => {
  let newParams = {};
  let isArray = false;
  Object.keys(params).forEach(key => {
    isArray = Object.prototype.toString.call(params[key]).indexOf('Array') !== -1;
    if ( (isArray &&
      params[key].length >0) ||
      (!isArray && (!!params[key] ||
      params[key] === 0 ||
      params[key] === false)) ) {
      newParams[key] = params[key];
    }
  });
  return newParams;
}

export const getAllMaterials = (params) => {
  params = filterNullParams(params);
  return axios.post(`${config.baseUrl}/material/searchByParam`, {
    ...params
  });
};

export const checkResourceByParams = (params) => {
  params = filterNullParams(params);
  delete params.page
  delete params.size
  return axios.post(`${config.baseUrl}/resource/checkByParam`, {
    ...params
  })
}

export const checkResourceByIds = (params) => {
  return axios.post(`${config.baseUrl}/resource/checkByIds`, {
    ids: params.ids,
    addText: params.addText,
    changeTag: params.changeTag
  })
}

export const deleteResourceByParams = (params) => {
  params = filterNullParams(params);
  delete params.page
  delete params.size
  return axios.post(`${config.baseUrl}/resource/deleteParam`, {
    ...params
  })
}

export const deleteResourceByIds = (ids) => {
  return axios.post(`${config.baseUrl}/resource/deleteByIds`, {
    ids
  })
}

export const getTextList = (params) => {
  return axios.post(`${config.baseUrl}/resource/text/list`, {
    ...params
  });
}

export const addText = (params) => {
  return axios.post(`${config.baseUrl}/resource/text/add`, {
    ...params
  });
}

export const updateText = (params) => {
  return axios.post(`${config.baseUrl}/resource/text/update`, {
    ...params
  });
}

// 删除文案
export const deleteText = (params) => {
  return axios.post(`${config.baseUrl}/resource/text/delete/${params.id}`);
}

// 获取数据包列表
export const getSubTextList = (params) => {
  return axios.post(`${config.baseUrl}/resource/textsub/list`, {
    ...params
  });
}

// 获取图片资源列表
export const getPictureList = (params) => {
  params = filterNullParams(params);
  return axios.post(`${config.baseUrl}/resource/searchVoList`, {
    ...params
  });
}

// 获取链接资源列表
export const getLinkList = (params) => {
  params = filterNullParams(params);
  return axios.post(`${config.baseUrl}/resource/searchVoList`, {
    ...params
  });
}

// 获取所有评论
export const getCommentList = (params) => {
  return axios.post(`${config.baseUrl}/resource/comment/list`, {
    ...params
  })
}

// 删除评论
export const deleteComment = (id) => {
  return axios.post(`${config.baseUrl}/resource/comment/delete/${id}`)
}

// 修改评论
export const updateComment = (params) => {
  return axios.post(`${config.baseUrl}/resource/comment/update`, {
    ...params
  })
}

// 添加评论
export const addComment = (params) => {
  return axios.post(`${config.baseUrl}/resource/comment/add`, {
    ...params
  })
}

// 删除素材
export const deleteMaterialsByIds = (params) => {
  return axios.post(`${config.baseUrl}/material/deleteByIds`, {
    ...params
  })
}

/** 朋友圈发布任务相关接口 */
// 获取任务列表
export const getTasksList = (params) => {
  return axios.post(`${config.baseUrl}/fct/searchList`, {
    ...params
  });
}

// 获取任务详情
export const getTasksDetail = (params) => {
  return axios.post(`${config.baseUrl}/fct/detail/${params.id}`, {});
}

// 单个微信号任务详情
export const getRobotDetail = (params) => {
  return axios.post(`${config.baseUrl}/fct/robot/detail/${params.fctRobotId}`, {});
}

// 单个微信号单条任务取消
export const getTaskCannel = (params) => {
  return axios.post(`${config.baseUrl}/fct/robot/task/cancel`, {
    ...params
  });
}

// 单个微信号单条任务重发
export const getTaskResend = (params) => {
  return axios.post(`${config.baseUrl}/fct/robot/task/resend`, {
    ...params
  });
}

// 单个微信号单条任务删除
export const getTaskDelete = (params) => {
  return axios.post(`${config.baseUrl}/fct/robot/task/delete`, {
    ...params
  });
}

// 创建朋友圈发布任务
export const createTarks = (params) => {
  return axios.post(`${config.baseUrl}/fct/create`, {
    ...params
  });
}

// 获取微信信息
export const getRobot = (params) => {
  return axios.post(`${config.baseUrl}/robot/searchList`, {
    ...params
  });
}

// 获取可用素材
export const getMaterialByParams = (params) => {
  params.page --;
  return axios.post(`${config.baseUrl}/material/searchByParam`, {
    ...params
  });
}

// 手动生成素材
export const generateMaterialsByHand = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/material/generateByUser`, {
    ...params
  })
}

// 自动批量生成素材
export const generateMaterialsByParams = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/material/generateByParam`, {
    ...params
  })
}

// 批量导出素材
export const exportMaterialsByParams = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/material/exportByParam`, {
    ...params
  })
}

// 根据ids导出素材
export const exportMaterialsByIds = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/material/exportByIds`, {
    ...params
  })
}

// 手动同步广州微信信息
export const SyncRobotGuangZhou = (params) => {
  return axios.post(`${config.baseUrl}/robot/guangzhou/sync`, {})
}

// 手动同步北京微信信息
export const SyncRoboBeiJing = (params) => {
  return axios.post(`${config.baseUrl}/robot/beijing/sync`, {})
}

// 微信机器人分组列表
export const getRobotTagList = (params) => {
  return axios.post(`${config.baseUrl}/robot/tag/list`, {})
}

// 微信机器人分组更新
export const updateRobotTag = (params) => {
  return axios.post(`${config.baseUrl}/robot/updateTag`, {
    ...params
  })
}

// 多选 微信机器人分组更新
export const updateRobotTags = (params) => {
  return axios.post(`${config.baseUrl}/robot/updateTags`, {
    ...params
  })
}

/* -------------------------- 朋友圈素材相关 --------------------------------- */

// 获取我的朋友圈
export const getMineMoments = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/rfc/data/mine/list`, {
    ...params
  })
}

// 获取所有朋友圈
export const getAllMoments = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/rfc/data/list`, {
    ...params
  })
}

// 点赞朋友圈操作
export const likeMoment = (params) => {
  return axios.post(`${config.baseUrl}/rfc/data/like`, {
    ...params
  })
}

// 评论朋友圈
export const commentMoment = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/rfc/data/comment`, {
    ...params
  })
}

// 取消点赞或评论操作
export const cancelLikeOrComment = (params) => {
  return axios.post(`${config.baseUrl}/rfc/data/reply/cancel`, {
    ...params
  })
}

// 删除朋友圈点赞或评论
export const deleteLikeOrComment = (params) => {
  return axios.post(`${config.baseUrl}/rfc/data/comment/delete`, {
    ...params
  })
}

// 获取朋友圈更新通知列表
export const getUpdatedNotice = (params) => {
  return axios.post(`${config.baseUrl}/rfc/data/notice`, {
    ...params
  })
}

// 清除已查看的通知
export const removeCheckedNotice = (params) => {
  return axios.post(`${config.baseUrl}/rfc/data/notice/cancel`, {
    ...params
  })
}

// 获取更新的朋友圈的详细信息
export const getUpdatedDetails = (params) => {
  console.log(params);
  return axios.post(`${config.baseUrl}/rfc/data/details`, {
    ...params
  })
}

// 删除朋友圈
export const deleteMoment = (params) => {
  params = filterNullParams(params)
  return axios.post(`${config.baseUrl}/rfc/data/delete`, {
    ...params
  })
}

// 获取机器人素材列表
export const getRobotMaterials = (params) => {
  return axios.post(`${config.baseUrl}/fct/robotMaterial/search`, {
    ...params
  })
}