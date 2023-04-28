/*
 * @Author      : Mr.bin
 * @Date        : 2023-04-14 17:23:07
 * @LastEditTime: 2023-04-25 15:32:58
 * @Description : 封装axios
 */
import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://192.168.1.150/energy_t6_m5_mtt/public/index.php/base', // 局域网
  timeout: 8000
})

export { instance }
