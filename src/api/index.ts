import { Api } from './Api'

export const api = new Api<string | null>({
  baseURL: '/api',
  secure: true,
  securityWorker: (securityData) => {
    const token = securityData || localStorage.getItem('authToken')
    if (!token) {
      return {}
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  },
})
