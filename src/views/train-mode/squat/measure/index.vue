<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-09 17:30:05
 * @LastEditTime: 2023-07-03 11:27:18
 * @Description : 下蹲动作训练-具体测量
-->
<template>
  <div class="squat-measure">
    <!-- 语音播放 -->
    <audio ref="audio" controls="controls" hidden :src="audioSrc" />

    <div class="wrapper">
      <!-- 顶部栏 -->
      <el-page-header
        class="page"
        title="退出订单"
        content="下蹲动作训练"
        @back="handleExit"
      ></el-page-header>

      <!-- 介绍说明 -->
      <div class="introduce">
        <div class="item">训练目的：形成正确的静蹲/下蹲动作模式</div>
        <div class="item">
          执行动作：用膝关节推开两侧软垫，进行静蹲/下蹲训练，使滑块保持在绿色区域内
        </div>
      </div>

      <!-- 重心偏移 -->
      <div class="center">
        <div class="center-l">
          <div>左腿<span class="unit">/kg</span></div>
          <div class="value">{{ leftWeight }}</div>
        </div>
        <div class="center-c">
          <div class="center-num">
            <div class="center-num-0">100%</div>
            <div class="center-num-50">50%</div>
            <div class="center-num-100">100%</div>
          </div>
          <div class="center-bg" :style="colorObj"></div>
          <el-slider
            class="center-core"
            v-model="core"
            :disabled="true"
            :show-tooltip="false"
          ></el-slider>
        </div>
        <div class="center-r">
          <div>右腿<span class="unit">/kg</span></div>
          <div class="value">{{ rightWeight }}</div>
        </div>
      </div>

      <!-- 倒计时 -->
      <div class="count-down">
        <div class="box">
          <el-image class="img" :src="timeBgSrc" fit="scale-down"></el-image>
          <div class="text">倒计时</div>
          <div class="value">{{ nowTime }}</div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button
          type="primary"
          @click="handleStart"
          :disabled="isStart"
          class="item"
          >开始训练</el-button
        >
        <el-button class="item" type="info" @click="handleRefresh"
          >刷新页面</el-button
        >
      </div>

      <!-- 膝盖内扣提醒 -->
      <div class="warn">
        <div class="text" v-show="this.innerBuckle ? true : false">
          <i class="el-icon-error"></i>
          请注意！膝关节已内扣！
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* 路径模块 */
import path from 'path'

/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { analyzeTrainResult } from '@/utils/analyze-train-result.js'

export default {
  name: 'squat-measure',

  data() {
    return {
      /* 语音相关 */
      audioOpen: this.$store.state.voiceSwitch,
      audioSrc: path.join(__static, `narrate/mandarin/Train/下蹲动作训练.mp3`),

      timeBgSrc: require('@/assets/img/Train/Measure/倒计时背景.png'),

      /* 串口相关变量 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 控制类 */
      isStart: false, // 是否开始
      innerBuckle: false, // 膝盖是否内扣

      /* 其他 */
      timeClock: null, // 计时器
      time: this.$store.state.settings[0].time, // 倒计时
      nowTime: this.$store.state.settings[0].time, // 实时倒计时

      leftK: 0, // 左K
      rightK: 0, // 右K
      leftStandard: 0, // 左调零值
      rightStandard: 0, // 右调零值
      affectedSide: this.$store.state.settings[0].side, // 患侧

      leftWeight: 0, // 左负重（kg），精确到0.1kg
      rightWeight: 0, // 右负重（kg），精确到0.1kg
      leftWeightArray: [], // 左负重数组
      rightWeightArray: [], // 右负重数组

      core: 50, // 重心偏移值

      colorObj: {
        'background-image': `linear-gradient(
          to right,
          rgba(255, 255, 0, 0.5),
          rgba(255, 255, 0, 0.5) 47.5%,
          rgba(0, 128, 0, 0.5) 47.5%,
          rgba(0, 128, 0, 0.5) 52.5%,
          rgba(255, 255, 0, 0.5) 52.5%,
          rgba(255, 255, 0, 0.5) 100%
        )`
      }
    }
  },

  created() {
    this.leftK = parseFloat(window.localStorage.getItem('leftK'))
    this.rightK = parseFloat(window.localStorage.getItem('rightK'))
    this.leftStandard = this.$store.state.zeroStandard.leftStandard
    this.rightStandard = this.$store.state.zeroStandard.rightStandard

    this.initSerialPort()
  },
  mounted() {
    if (this.audioOpen === true) {
      setTimeout(() => {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
      }, 500)
    }
  },
  beforeDestroy() {
    // 清除计时器
    if (this.timeClock) {
      clearInterval(this.timeClock)
    }
    // 关闭串口
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  methods: {
    /**
     * @description: 退出订单
     */
    handleExit() {
      this.$confirm(
        '订单进行中，此操作会退出该订单，之前的数据将会丢失，是否退出？',
        '警告',
        {
          type: 'warning',
          showClose: true,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          center: true,
          confirmButtonText: '退 出',
          cancelButtonText: '否'
        }
      )
        .then(() => {
          this.$router.push({
            path: '/home'
          })
        })
        .catch(() => {})
    },

    /**
     * @description: 初始化串口对象
     */
    initSerialPort() {
      SerialPort.list()
        .then(ports => {
          /* 遍历设备的USB串口，目标设备需安装驱动 */
          let comPath = ''
          for (const port of ports) {
            if (/^USB/.test(port.pnpId)) {
              comPath = port.path
              break
            }
          }

          /* 验证USB有没有连接到电脑，但不能验证有无数据发送给上位机 */
          if (comPath) {
            /**
             * @description: 创建串口实例
             * @param {String} comPath 串行端口的系统路径。例如：在Mac、Linux上的/dev/tty.XXX或Windows上的COM1
             * @param {Object} 配置项
             */
            this.usbPort = new SerialPort(comPath, {
              baudRate: this.scmBaudRate, // 默认波特率115200
              autoOpen: true // 是否自动开启串口
            })
            /* 调用 this.usbPort.open() 成功时触发（开启串口成功） */
            this.usbPort.on('open', () => {})
            /* 调用 this.usbPort.open() 失败时触发（开启串口失败） */
            this.usbPort.on('error', () => {
              this.$alert(
                `请重新连接USB线，然后点击"刷新页面"按钮，重新训练！`,
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    this.handleRefresh()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              // console.log(data) // {String} 00326740032826，前两位是限位开关量（0或1）

              /* 膝盖是否内扣警告 */
              const innerBuckleLeft = parseInt(data.slice(0, 1))
              const innerBuckleRight = parseInt(data.slice(1, 2))
              if (innerBuckleLeft === 1 && innerBuckleRight === 1) {
                this.innerBuckle = false
              } else {
                this.innerBuckle = true
              }

              /* 计算左、右负重 */
              this.leftWeight = parseFloat(
                (
                  (parseInt(data.slice(2, 7)) - this.leftStandard) /
                  -this.leftK
                ).toFixed(1)
              )
              this.rightWeight = parseFloat(
                (
                  (parseInt(data.slice(9, 14)) - this.rightStandard) /
                  -this.rightK
                ).toFixed(1)
              )
              if (this.leftWeight < 0) {
                this.leftWeight = 0
              }
              if (this.rightWeight < 0) {
                this.rightWeight = 0
              }
              /* 数据校验 */
              if (!isNaN(this.leftWeight) && !isNaN(this.rightWeight)) {
                if (this.leftWeight + this.rightWeight !== 0) {
                  this.core = parseInt(
                    (
                      (this.rightWeight /
                        (this.leftWeight + this.rightWeight)) *
                      100
                    ).toFixed(0)
                  )
                } else {
                  this.core = 50
                }

                if (this.isStart) {
                  this.leftWeightArray.push(this.leftWeight)
                  this.rightWeightArray.push(this.rightWeight)
                }
              }
            })
          } else {
            this.$getLogger('没有检测到USB连接')
            this.$alert(
              `请重新连接USB线，然后点击"刷新页面"按钮，重新训练！`,
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '刷新页面',
                callback: () => {
                  this.handleRefresh()
                }
              }
            )
          }
        })
        .catch(err => {
          this.$getLogger(err)
          this.$alert(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮，重新训练！`,
            `初始化SerialPort.list失败`,
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '刷新页面',
              callback: () => {
                this.handleRefresh()
              }
            }
          )
        })
    },

    /**
     * @description: 开始按钮
     */
    handleStart() {
      this.isStart = true
      this.nowTime = this.time
      this.leftWeightArray = []
      this.rightWeightArray = []
      this.core = 50

      this.timeClock = setInterval(() => {
        this.nowTime -= 1
        if (this.nowTime === 0) {
          this.finishData()
        }
      }, 1000)
    },

    /**
     * @description: 完成该项目
     */
    finishData() {
      // 清除计时器
      if (this.timeClock) {
        clearInterval(this.timeClock)
      }

      // 计算某些值
      const res = {
        leftWeightArray: this.leftWeightArray,
        rightWeightArray: this.rightWeightArray
      }
      const result = analyzeTrainResult(res)

      /* 删除 Vuex 参数配置数组的第一个元素 */
      let settings = JSON.parse(JSON.stringify(this.$store.state.settings))
      settings.shift()
      this.$store.dispatch('setSettings', settings).then(() => {
        /* 数据 */
        // 计算绿、黄、红的占比
        let greenArray = []
        let yellowArray = []
        let greenPercent = 0
        let yellowPercent = 0
        for (let i = 0; i < result.rightWeightPercentArray.length; i++) {
          if (
            47.5 <= result.rightWeightPercentArray[i] &&
            result.rightWeightPercentArray[i] <= 52.5
          ) {
            greenArray.push(result.rightWeightPercentArray[i])
          } else {
            yellowArray.push(result.rightWeightPercentArray[i])
          }
        }
        greenPercent = parseFloat(
          (
            (greenArray.length / result.rightWeightPercentArray.length) *
            100
          ).toFixed(1)
        )
        yellowPercent = parseFloat(
          (
            (yellowArray.length / result.rightWeightPercentArray.length) *
            100
          ).toFixed(1)
        )

        // 绘制的绿、黄、红参考曲线
        const gl = []
        const gr = []
        const yl = []
        const yr = []
        for (let i = 0; i < result.rightWeightPercentArray.length; i++) {
          gl.push(47.5)
          gr.push(52.5)
          yl.push(0)
          yr.push(100)
        }

        const obj = {
          pattern: '下蹲动作训练',
          side: this.affectedSide, // 患侧（左腿、右腿）
          leftWeightArray: this.leftWeightArray, // 左侧负重数组
          rightWeightArray: this.rightWeightArray, // 右侧负重数组
          leftAverageWeight: result.leftAverageWeight, // 左侧负重平均值
          rightAverageWeight: result.rightAverageWeight, // 右侧负重平均值
          leftAverageWeightPercent: result.leftAverageWeightPercent, // 左侧负重平均百分比
          rightAverageWeightPercent: result.rightAverageWeightPercent, // 右侧负重平均百分比
          leftWeightPercentArray: result.leftWeightPercentArray, // 左负重瞬时百分比数组（用于绘制重心移动图形）
          rightWeightPercentArray: result.rightWeightPercentArray, // 右负重瞬时百分比数组（用于绘制重心移动图形）
          greenArray: greenArray,
          yellowArray: yellowArray,
          greenPercent: greenPercent, // 绿的占比值
          yellowPercent: yellowPercent, // 黄的占比值
          gl: gl,
          gr: gr,
          yl: yl,
          yr: yr
        }

        /* 暂存至 sessionStorage */
        let resultArray = JSON.parse(
          window.sessionStorage.getItem('resultArray')
        )
        resultArray.push(obj)
        window.sessionStorage.setItem(
          'resultArray',
          JSON.stringify(resultArray)
        )

        if (this.$store.state.settings.length) {
          this.$alert(`请点击“下一项”按钮`, '完成', {
            type: 'success',
            showClose: false,
            center: true,
            confirmButtonText: '下一项',
            callback: () => {
              this.handleFinish()
            }
          })
        } else {
          this.$alert(`请点击“完成订单”按钮`, '完成', {
            type: 'success',
            showClose: false,
            center: true,
            confirmButtonText: '完成订单',
            callback: () => {
              this.handleFinish()
            }
          })
        }
      })
    },

    /**
     * @description: 完成订单或者下一项
     */
    handleFinish() {
      if (this.$store.state.settings.length) {
        // 下一项
        let route = ''
        switch (this.$store.state.settings[0].pattern) {
          case '坐站训练':
            route = 'sit-stand-measure'
            break
          case '精准负重训练':
            route = 'accurate-load-measure'
            break
          case '重心转移训练':
            route = 'barycenter-transfer-measure'
            break
          case '下蹲动作训练':
            route = 'squat-measure'
            break
          default:
            break
        }

        this.$router.push({
          path: '/' + route
        })
      } else {
        // 完成订单
        this.$router.push({
          path: '/train-send'
        })
      }
    },

    /**
     * @description: 刷新页面按钮
     */
    handleRefresh() {
      this.$router.push({
        path: '/refresh',
        query: {
          routerName: JSON.stringify('/sit-stand-measure'),
          duration: JSON.stringify(300)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.squat-measure {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    position: relative;
    @include flex(column, stretch, stretch);

    .page {
      position: absolute;
      top: 15px;
      left: 20px;
    }

    /* 介绍说明 */
    .introduce {
      margin-top: 60px;
      margin-left: 40px;
      @include flex(column, stretch, stretch);
      .item {
        font-size: 22px;
        margin-bottom: 5px;
      }
    }

    /* 重心偏移 */
    .center {
      flex: 1;
      @include flex(row, center, center);
      .center-l,
      .center-r {
        @include flex(column, center, center);
        width: 140px;
        font-size: 26px;
        .unit {
          font-size: 16px;
        }
        .value {
          margin-top: 10px;
          @include flex(row, center, center);
          width: 80px;
          padding: 4px;
          background-color: rgb(204, 204, 204);
          border-radius: 6px;
        }
      }
      .center-c {
        flex: 1;
        .center-num {
          @include flex(row, space-between, center);
          margin-bottom: 5px;
        }
        .center-bg {
          border-radius: 30px;
          float: left;
          width: 100%;
          height: 60px;
        }
        .center-core {
          padding-top: 10px;
          width: 100%;
          // 修改指针和背景的样式
          & /deep/ .el-slider__runway {
            background-color: #ffffff !important;
          }
          & /deep/ .el-slider__bar {
            background-color: #ffffff !important;
          }
          & /deep/ .el-slider__button {
            margin-top: 20px;
            border-width: 0 10px 60px;
            border-style: solid;
            border-color: transparent transparent rgb(0, 0, 0);
            border-radius: 20px;
            background-color: rgba(182, 182, 182, 0);
          }
        }
      }
    }

    /* 倒计时 */
    .count-down {
      // display: none !important;
      @include flex(row, center, center);
      margin-bottom: 40px;
      .box {
        position: relative;
        @include flex(row, center, center);
        .img {
          width: 100%;
        }
        .text {
          position: absolute;
          top: 25px;
          font-size: 20px;
          color: #ffffff;
        }
        .value {
          position: absolute;
          top: 32%;
          font-size: 60px;
        }
      }
    }

    /* 按钮组 */
    .btn {
      margin-bottom: 20px;
      @include flex(row, center, center);
      .item {
        font-size: 34px;
        margin: 0 60px;
      }
    }

    .warn {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translate(-50%);
      .text {
        font-size: 38px;
        color: red;
      }
    }
  }
}
</style>
