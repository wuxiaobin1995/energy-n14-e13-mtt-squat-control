<!--
 * @Author      : Mr.bin
 * @Date        : 2023-04-14 15:23:55
 * @LastEditTime: 2023-06-09 09:04:00
 * @Description : 根组件
-->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
/* 串口通信库 */
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

export default {
  name: 'App',

  data() {
    return {
      /* 串口相关 */
      usbPort: null,
      parser: null,
      scmBaudRate: 115200, // 默认波特率115200

      /* 其他 */
      leftStandard: 0, // 左负重数字量
      rightStandard: 0 // 右负重数字量
    }
  },

  created() {
    this.initLocalStorage()
    this.initSerialPort()
  },
  beforeDestroy() {
    if (this.usbPort) {
      if (this.usbPort.isOpen) {
        this.usbPort.close()
      }
    }
  },

  methods: {
    /**
     * @description: 软件启动后，初始化localStorage的一些值
     */
    initLocalStorage() {
      /* 初始化左K的值 */
      if (!window.localStorage.getItem('leftK')) {
        window.localStorage.setItem('leftK', '101.73')
      }
      /* 初始化右K的值 */
      if (!window.localStorage.getItem('rightK')) {
        window.localStorage.setItem('rightK', '99.368')
      }
      /* 初始化API的IP地址 */
      if (!window.localStorage.getItem('mttIP')) {
        window.localStorage.setItem('mttIP', '192.168.1.150')
      }
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
            this.$notify({
              title: '通知',
              message: `连接到串口：${comPath}；波特率为：${this.scmBaudRate}`,
              type: 'success',
              position: 'bottom-right',
              duration: 4000
            })

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
                '请重新连接USB线，然后点击"刷新页面"按钮！',
                '串口开启失败',
                {
                  type: 'error',
                  showClose: false,
                  center: true,
                  confirmButtonText: '刷新页面',
                  callback: () => {
                    window.location.reload()
                  }
                }
              )
            })

            this.parser = this.usbPort.pipe(new Readline({ delimiter: '\n' }))
            this.parser.on('data', data => {
              // console.log(data) // {String} 00326740032826，前两位是限位开关量（0或1）

              this.leftStandard = parseInt(data.slice(2, 7))
              this.rightStandard = parseInt(data.slice(9, 14))
              /* 数据校验 */
              if (!isNaN(this.leftStandard) && !isNaN(this.rightStandard)) {
                /* 关闭串口 */
                if (this.usbPort) {
                  if (this.usbPort.isOpen) {
                    this.usbPort.close()
                  }
                }
                /* 设置Vuex中的传感器基准值 */
                this.$store
                  .dispatch('setZeroStandard', {
                    leftStandard: this.leftStandard,
                    rightStandard: this.rightStandard
                  })
                  .then(() => {
                    this.$message({
                      message: '软件启动后，传感器调零成功。',
                      type: 'success',
                      duration: 4000
                    })
                  })
                  .catch(err => {
                    this.$alert(
                      `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
                      '软件启动后调零失败',
                      {
                        type: 'error',
                        showClose: false,
                        center: true,
                        confirmButtonText: '刷新页面',
                        callback: () => {
                          window.location.reload()
                        }
                      }
                    )
                  })
              }
            })
          } else {
            this.$getLogger('没有检测到USB连接')
            this.$alert(
              '请重新连接USB线，然后点击"刷新页面"按钮！',
              '没有检测到USB连接',
              {
                type: 'error',
                showClose: false,
                center: true,
                confirmButtonText: '刷新页面',
                callback: () => {
                  window.location.reload()
                }
              }
            )
          }
        })
        .catch(err => {
          this.$getLogger(err)
          this.$alert(
            `${err}。请重新连接USB线，然后点击"刷新页面"按钮！`,
            '初始化SerialPort.list失败',
            {
              type: 'error',
              showClose: false,
              center: true,
              confirmButtonText: '刷新页面',
              callback: () => {
                window.location.reload()
              }
            }
          )
        })
    }
  }
}
</script>

<style lang="scss" scoped></style>
