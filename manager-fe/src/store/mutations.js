/**
 * Mutations 业务层数据提交
 */

import storage from "../utils/storage";

export default {
    // 存储用户信息
    saveUserInfo(state, userInfo) {
        state.userInfo = userInfo;
        storage.setItem('userInfo', userInfo)
    },
    sevaUserMenu(state, menuList) {
        state.menuList = menuList;
        storage.setItem('menuList', menuList)
    },
    saveUserAction(state, actionList) {
        state.actionList = actionList;
        storage.setItem('actionList', actionList)
    },
    saveNotiveCount(state, noticeCount) {
        state.noticeCount = noticeCount;
        storage.setItem('noticeCount', noticeCount)
    },
}