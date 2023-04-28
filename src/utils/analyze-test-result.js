/*
 * @Author      : 吴晓斌
 * @Date        : 2020-10-15 08:49:09
 * @LastEditTime: 2020-12-11 10:25:27
 * @Description : 计算测试模式的结果
 */

/**
 * @description: 计算测试模式的结果
 * @param {Object} res 本次测试数据
 * @return {Object}
 */
export function analyzeTestResult(res) {
  /* 求左负重平均值 */
  let leftSum = 0
  let leftAverageWeight = 0
  if (res.leftWeightArray.length) {
    for (let i = 0; i < res.leftWeightArray.length; i++) {
      leftSum += res.leftWeightArray[i]
    }
    leftAverageWeight = parseFloat(
      (leftSum / res.leftWeightArray.length).toFixed(1)
    )
  }

  /* 求右负重平均值 */
  let rightSum = 0
  let rightAverageWeight = 0
  if (res.rightWeightArray.length) {
    for (let i = 0; i < res.rightWeightArray.length; i++) {
      rightSum += res.rightWeightArray[i]
    }
    rightAverageWeight = parseFloat(
      (rightSum / res.rightWeightArray.length).toFixed(1)
    )
  }

  /* 求左负重平均百分比 */
  let leftAverageWeightPercent = 0
  if (leftAverageWeight + rightAverageWeight) {
    leftAverageWeightPercent = parseFloat(
      (
        (leftAverageWeight / (leftAverageWeight + rightAverageWeight)) *
        100
      ).toFixed(1)
    )
  }

  /* 求右负重平均百分比 */
  let rightAverageWeightPercent = 0
  if (leftAverageWeight + rightAverageWeight) {
    rightAverageWeightPercent = parseFloat(
      (100 - leftAverageWeightPercent).toFixed(1)
    )
  }

  /* 求右负重瞬时百分比数组（用于绘制重心移动图形） */
  const rightWeightPercentArray = []
  if (res.rightWeightArray.length) {
    for (let i = 0; i < res.rightWeightArray.length; i++) {
      const rightWeight = res.rightWeightArray[i]
      const leftWeight = res.leftWeightArray[i]
      if (leftWeight + rightWeight) {
        const rightWeightPercent = parseFloat(
          ((rightWeight / (leftWeight + rightWeight)) * 100).toFixed(1)
        )
        rightWeightPercentArray.push(rightWeightPercent)
      } else {
        rightWeightPercentArray.push(50)
      }
    }
  }

  /* 返回结果 */
  return {
    leftAverageWeight,
    rightAverageWeight,
    leftAverageWeightPercent,
    rightAverageWeightPercent,
    rightWeightPercentArray
  }
}
