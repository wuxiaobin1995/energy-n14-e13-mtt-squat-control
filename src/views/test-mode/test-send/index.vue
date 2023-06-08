<!--
 * @Author      : Mr.bin
 * @Date        : 2023-06-08 08:41:47
 * @LastEditTime: 2023-06-08 14:39:01
 * @Description : 评估数据统一发送页面
-->
<template>
  <div class="test-send" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="wrapper">
      <div>评估数据统一发送页面</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'test-send',

  data() {
    return {
      fullscreenLoading: false, // 全屏加载动效
      orderId: this.$store.state.orderId,
      data: JSON.parse(window.sessionStorage.getItem('resultArray'))
    }
  },

  created() {
    console.log(this.orderId)
    console.log(this.data)
    this.sendData()
  },

  methods: {
    /**
     * @description: 上传数据
     */
    sendData() {
      this.fullscreenLoading = true
      this.$axios
        .post(
          `192.168.1.150/energy_t6_m5_mtt/public/index.php/squatControl/sendSquatControlAssessData`,
          {
            order_id: this.orderId,
            data: JSON.stringify(this.data)
          }
        )
        .then(res => {
          console.log(res)
          const data = res.data

          if (data.status === 1) {
            /* 上传成功 */
          } else if (data.status === 0) {
            /* 上传失败 */
            // this.$alert(
            //   '订单号有误，请重新输入订单号！',
            //   `状态码[${data.status}]`,
            //   {
            //     type: 'error',
            //     showClose: false,
            //     center: true,
            //     confirmButtonText: '确 定',
            //     callback: () => {
            //       this.resetForm()
            //     }
            //   }
            // )
          } else if (data.status === -9) {
            /* 参数有误 */
            // this.$alert(
            //   '任务不存在，请重新输入订单号！',
            //   `状态码[${data.status}]`,
            //   {
            //     type: 'error',
            //     showClose: false,
            //     center: true,
            //     confirmButtonText: '确 定',
            //     callback: () => {
            //       this.resetForm()
            //     }
            //   }
            // )
          } else if (data.status === -13) {
            /* 订单号不存在 */
            // this.$alert(
            //   '任务不存在，请重新输入订单号！',
            //   `状态码[${data.status}]`,
            //   {
            //     type: 'error',
            //     showClose: false,
            //     center: true,
            //     confirmButtonText: '确 定',
            //     callback: () => {
            //       this.resetForm()
            //     }
            //   }
            // )
          }
        })
        .catch(err => {
          this.$alert(
            `[上传测试数据-环节] ${err}。请确保网络连接正常！`,
            '网络请求错误',
            {
              type: 'error',
              center: false, // 是否居中布局
              showClose: false, // 是否显示右上角关闭按钮
              confirmButtonText: '重 试', // 确定按钮的文本内容
              callback: () => {
                this.sendData()
              }
            }
          )
        })
        .finally(() => {
          this.fullscreenLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-send {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    @include flex(column, stretch, stretch);
  }
}
</style>
