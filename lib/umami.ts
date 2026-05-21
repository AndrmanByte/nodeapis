// Umami 事件追踪工具

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void
    }
  }
}

/**
 * 追踪自定义事件
 * @param eventName 事件名称
 * @param eventData 事件数据
 */
export function trackEvent(eventName: string, eventData?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData)
  }
}

// 预定义的事件追踪函数
export const umamiEvents = {
  // 用户行为
  userLogin: (method: 'google' | 'discord' | 'email') => 
    trackEvent('user_login', { method }),
  
  userRegister: (method: 'google' | 'discord' | 'email') => 
    trackEvent('user_register', { method }),
  
  userLogout: () => 
    trackEvent('user_logout'),

  // 签到相关
  checkin: (consecutive_days: number, points_earned: number) => 
    trackEvent('checkin', { consecutive_days, points_earned }),

  // 中转站相关
  providerView: (providerId: string, providerName: string) => 
    trackEvent('provider_view', { provider_id: providerId, provider_name: providerName }),
  
  providerVisit: (providerId: string, providerName: string) => 
    trackEvent('provider_visit', { provider_id: providerId, provider_name: providerName }),
  
  providerSubmit: () => 
    trackEvent('provider_submit'),

  // 抽奖相关
  lotteryView: (lotteryId: string, lotteryTitle: string) => 
    trackEvent('lottery_view', { lottery_id: lotteryId, lottery_title: lotteryTitle }),
  
  lotteryParticipate: (lotteryId: string, pointsCost: number) => 
    trackEvent('lottery_participate', { lottery_id: lotteryId, points_cost: pointsCost }),

  // 搜索
  search: (keyword: string, category?: string) => 
    trackEvent('search', { keyword, category: category || 'all' }),

  // 页面浏览
  pageView: (pageName: string) => 
    trackEvent('page_view', { page: pageName }),

  // 建议
  suggestionSubmit: (category: string) => 
    trackEvent('suggestion_submit', { category }),

  // 公告
  announcementView: (announcementId: string) => 
    trackEvent('announcement_view', { announcement_id: announcementId }),

  // 点击事件
  buttonClick: (buttonName: string, location: string) => 
    trackEvent('button_click', { button: buttonName, location }),

  // 错误追踪
  error: (errorType: string, errorMessage: string) => 
    trackEvent('error', { type: errorType, message: errorMessage }),
}
