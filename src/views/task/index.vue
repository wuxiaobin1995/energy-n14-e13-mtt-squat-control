<!--
 * @Author      : Mr.bin
 * @Date        : 2023-04-26 17:18:16
 * @LastEditTime: 2023-04-28 17:18:29
 * @Description : 任务详情页
-->
<template>
  <div class="task">
    <div class="wrapper">
      <!-- 标题 -->
      <el-page-header
        title="返回首页"
        content="任务详情页"
        @back="handleToHome"
      ></el-page-header>

      <!-- 步骤条 -->
      <div class="step">
        <el-steps :active="settings.length" align-center>
          <el-step
            v-for="(item, index) in settings"
            :key="index"
            :title="item.pattern"
          ></el-step>
        </el-steps>
      </div>

      <!-- 轮播图 -->
      <div class="carousel">
        <el-card>
          <div slot="header">
            <span :style="{ 'font-weight': 700 }"
              >订单类型：{{ orderIdType }}</span
            >
            <div :style="{ float: 'right', padding: '3px 0' }">
              <span>说明</span>
              <i class="el-icon-share"></i>
            </div>
          </div>
          <el-carousel
            trigger="click"
            :interval="5000"
            :loop="true"
            height="350px"
            arrow="always"
          >
            <el-carousel-item v-for="(item, index) in settings" :key="index">
              <div class="box">
                <div class="title">({{ index + 1 }}){{ item.pattern }}</div>
                <!-- 评估 -->
                <div class="item" v-if="item.pattern === '精准负重测试'">
                  请双脚平稳站立在踏板上，将重心逐渐偏向患侧，直至患侧出现不适感
                </div>
                <div class="item" v-if="item.pattern === '站立稳定测试'">
                  <div>测试目的：是否可以在视觉反馈的指导下，维持稳定站立</div>
                  <div>
                    执行动作：根据画面提示，主动调整重心，使滑块保持在绿色区域内
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '站立平衡测试'">
                  <div>测试目的：是否可以自主维持身体重心稳定站立</div>
                  <div>
                    执行动作：凭借自身感觉保持双侧重力平衡分布，可选择睁眼/闭眼进行测试，等待倒计时结束
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '静蹲测试'">
                  <div>
                    请双脚平稳站立在踏板上，保持一定的下蹲角度，使滑块保持在绿色区域内，可选择睁眼/闭眼进行测试
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '动态下蹲测试'">
                  <div>
                    请双脚平稳站立在踏板上，进行5-10个下蹲动作，使滑块保持在绿色区域内，可选择睁眼/闭眼进行测试。完成动作后，点击结束测试
                  </div>
                </div>
                <!-- 训练 -->
                <div class="item" v-if="item.pattern === '坐站训练'">
                  <div>训练目的：可以通过座椅高低调整坐站训练难度</div>
                  <div>
                    执行动作：进行坐站训练时，尽可能调整重心使滑块保持在绿色区域
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '精准负重训练'">
                  <div>
                    执行动作：身体重量转移到患肢，将运动轨迹保持在红色曲线范围内
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '重心转移训练'">
                  <div>
                    训练目的：作为深感觉训练重要一环，加强对于重心的控制
                  </div>
                  <div>
                    执行动作：选取任意一点作为初始位置，将重心逐渐移动到绿色区域内，保持2-3秒后，回到初始位置，重复动作3-5次。训练完毕后，回到初始位置，点击“开始”，凭感觉达到目标负重
                  </div>
                </div>
                <div class="item" v-if="item.pattern === '下蹲动作训练'">
                  <div>训练目的：形成正确的静蹲/下蹲动作模式</div>
                  <div>
                    执行动作：用膝关节推开两侧软垫，进行静蹲/下蹲训练，使滑块保持在绿色区域内
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>
      </div>

      <!-- 按钮组 -->
      <div class="btn">
        <el-button class="item" type="primary" @click="handleStart"
          >正式开始</el-button
        >
        <el-button class="item" type="danger" @click="handleToHome"
          >返回首页</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'task',

  data() {
    return {
      /* 路由传参 */
      orderIdType: JSON.parse(this.$route.query.orderIdType),

      settings: this.$store.state.settings
    }
  },

  methods: {
    /**
     * @description: 返回首页
     */
    handleToHome() {
      this.$confirm('订单进行中，此操作会退出该订单，是否退出？', '提示', {
        type: 'warning',
        showClose: true,
        closeOnClickModal: true,
        closeOnPressEscape: true,
        center: true,
        confirmButtonText: '退 出',
        cancelButtonText: '否'
      })
        .then(() => {
          this.$router.push({
            path: '/home'
          })
        })
        .catch(() => {})
    },

    /**
     * @description: 正式开始
     */
    handleStart() {
      const settings = this.settings
      let settingsRouter = []

      if (this.orderIdType === '评估') {
        for (let i = 0; i < settings.length; i++) {
          const item = settings[i]
          switch (item.pattern) {
            case '精准负重测试':
              settingsRouter.push('precision-weight-measure')
              break
            case '站立稳定测试':
              settingsRouter.push('standing-stability-measure')
              break
            case '站立平衡测试':
              settingsRouter.push('standing-balance-measure')
              break
            case '静蹲测试':
              settingsRouter.push('quiet-squat-down-measure')
              break
            case '动态下蹲测试':
              settingsRouter.push('dynamic-squat-measure')
              break
            default:
              break
          }
        }
      } else if (this.orderIdType === '训练') {
        for (let i = 0; i < settings.length; i++) {
          const item = settings[i]
          switch (item.pattern) {
            case '坐站训练':
              settingsRouter.push('sit-stand-measure')
              break
            case '精准负重训练':
              settingsRouter.push('accurate-load-measure')
              break
            case '重心转移训练':
              settingsRouter.push('barycenter-transfer-measure')
              break
            case '下蹲动作训练':
              settingsRouter.push('squat-measure')
              break
            default:
              break
          }
        }
      }

      console.log(settingsRouter)
      this.$router.push({
        path: '/' + settingsRouter[0]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.task {
  width: 100%;
  height: 100%;
  @include flex(row, center, center);

  .wrapper {
    width: 96%;
    height: 96%;
    border-radius: 34px;
    background-color: #ffffff;
    box-shadow: 0 0 10px #929292;
    padding: 20px 40px;
    @include flex(column, stretch, stretch);

    .step {
      margin-top: 20px;
      margin-bottom: 20px;
    }

    .carousel {
      flex: 1;
      .el-carousel__item .box {
        @include flex(column, center, center);
        height: 350px;
        position: relative;
      }
      .el-carousel__item .box .title {
        color: #475669;
        font-size: 30px;
        font-weight: 700;
        position: absolute;
        top: 15px;
        left: 20px;
      }
      .el-carousel__item .box .item {
        width: 80%;
        color: #475669;
        font-size: 26px;
        font-weight: 700;
      }
      .el-carousel__item {
        background-color: #d3dce6;
      }
    }

    .btn {
      margin-top: 15px;
      @include flex(row, center, center);
      .item {
        font-size: 22px;
        margin: 0 50px;
      }
    }
  }
}
</style>
