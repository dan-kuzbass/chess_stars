import Api from '../../../shared/api'

export const getFenGame = async (): Promise<any> => {
  return Api.callAction({
    config: {
      url: 'game/0',
    },
  })
}

export const changeGame = async (data: any): Promise<any> => {
  return Api.callAction({
    config: {
      url: 'game/edit',
      method: 'POST',
      data,
    },
  })
}
