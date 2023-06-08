/*
 * @Author      : Mr.bin
 * @Date        : 2023-04-14 15:23:55
 * @LastEditTime: 2023-06-07 11:50:29
 * @Description : vuex
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    /* 左K、右K调零基准值 */
    zeroStandard: {
      leftStandard: null,
      rightStandard: null
    },

    /* 订单号 */
    orderId: '',

    /* 当前登录的用户及其信息 */
    currentUserInfo: {
      userId: '', // 用户id
      userName: '', // 姓名
      sex: '', // 性别（男、女）
      height: '', // 身高
      weight: '', // 体重
      birthday: '', // 出生日期
      admission: '', // 住院号
      stage: '' // MTT分期类型
    },

    /* 参数配置数组 */
    settings: [],

    /* 语音开关 */
    voiceSwitch: true
  },

  mutations: {
    /* 左K、右K调零基准值 */
    SET_ZEROSTANDARD(state, zeroStandard) {
      state.zeroStandard = zeroStandard
    },

    /* 订单号 */
    SET_ORDERID(state, orderId) {
      state.orderId = orderId
    },

    /* 当前登录的用户及其信息 */
    CHANGE_CURRENTUSERINFO(state, currentUserInfo) {
      state.currentUserInfo = currentUserInfo
    },

    /* 参数配置数组 */
    SET_SETTINGS(state, settings) {
      state.settings = settings
    },

    /* 语音开关 */
    SET_VOICESWITCH(state, voiceSwitch) {
      state.voiceSwitch = voiceSwitch
    }
  },

  actions: {
    /* 左K、右K调零基准值 */
    setZeroStandard({ commit }, zeroStandard) {
      return new Promise((resolve, reject) => {
        commit('SET_ZEROSTANDARD', zeroStandard)
        resolve()
      })
    },

    /* 订单号 */
    setOrderId({ commit }, orderId) {
      return new Promise((resolve, reject) => {
        commit('SET_ORDERID', orderId)
        resolve()
      })
    },

    /* 当前登录的用户及其信息 */
    changeCurrentUserInfo({ commit }, currentUserInfo) {
      return new Promise((resolve, reject) => {
        commit('CHANGE_CURRENTUSERINFO', currentUserInfo)
        resolve()
      })
    },

    /* 参数配置数组 */
    setSettings({ commit }, settings) {
      return new Promise((resolve, reject) => {
        commit('SET_SETTINGS', settings)
        resolve()
      })
    },

    /* 语音开关 */
    setVoiceSwitch({ commit }, voiceSwitch) {
      return new Promise((resolve, reject) => {
        commit('SET_VOICESWITCH', voiceSwitch)
        resolve()
      })
    }
  }
})
