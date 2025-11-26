import axios from 'axios'
import { NavigateFunction } from 'react-router-dom'

/**
 * @description базовый класс для АПИ приложения
 */
class ApiInstance {
  navigate?: NavigateFunction

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate
    return this
  }

  instance = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
  })

  async callAction(requestConfig: any) {
    try {
      const { config } = requestConfig

      if (!config.params) {
        config.params = {}
      }

      const accessToken =
        localStorage.getItem('accessToken') || localStorage.getItem('token')

      console.log(
        'API call - accessToken:',
        accessToken ? 'present' : 'missing',
      )
      console.log('API call - URL:', config.url)
      console.log('API call - Method:', config.method || 'GET')

      if (accessToken && accessToken !== 'undefined') {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
      return await this.instance(config)
    } catch (error: any) {
      console.error('API Error:', error.response?.status, error.response?.data)

      if (error?.response?.status === 401) {
        console.log('Unauthorized - redirecting to auth')
        localStorage.removeItem('token')
        localStorage.removeItem('accessToken')
        if (this?.navigate) {
          this.navigate('/auth')
        } else {
          window.location.href = '/auth'
        }
      }
      throw error
    }
  }
}

const Api = new ApiInstance()

export default Api
