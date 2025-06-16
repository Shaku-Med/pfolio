import db from '@/lib/Database/Supabase/Base'

interface User {
  created_at?: string
  active?: boolean
  is_blocked?: boolean
  is_admin?: boolean
}

interface Row {
  created_at?: string
}

export const getCurrentAndPreviousMonth = () => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  return {
    currentMonth,
    currentYear,
    prevMonth,
    prevMonthYear
  }
}

export const countByMonth = (arr: Row[] = [], month: number, year: number) => {
  return arr?.filter((row: Row) => {
    if (!row.created_at) return false
    const created = new Date(row.created_at)
    return created.getMonth() === month && created.getFullYear() === year
  })?.length || 0
}

export const calculatePercentageChange = (current: number, previous: number) => {
  return previous === 0
    ? (current > 0 ? 100 : 0)
    : Number((((current - previous) / previous) * 100).toFixed(1))
}

export const fetchAdminData = async () => {
  if (!db) return null

  const { data: users, error } = await db
    .from('chat_users')
    .select('*')

  const [admin, admin_limit, admin_main, chat_messages, projects] = await Promise.all([
    db.from('admin').select('*'),
    db.from('admin_limit').select('*'),
    db.from('admin_main').select('*'),
    db.from('chat_messages').select('*'),
    db.from('projects').select('*'),
  ])

  return {
    users,
    admin,
    admin_limit,
    admin_main,
    chat_messages,
    projects
  }
}

export const calculateStats = async () => {
  const data = await fetchAdminData()
  if (!data) return null

  const { users, admin, admin_limit, admin_main, chat_messages, projects } = data
  const { currentMonth, currentYear, prevMonth, prevMonthYear } = getCurrentAndPreviousMonth()

  const totalUsers = users?.length || 0
  const activeUsers = users?.filter(user => user.active)?.length || 0
  const blockedUsers = users?.filter(user => user.is_blocked)?.length || 0
  const adminUsers = users?.filter(user => user.is_admin)?.length || 0

  // System load calculations
  const systemLoadThisMonth =
    countByMonth(admin.data ?? [], currentMonth, currentYear) +
    countByMonth(admin_limit.data ?? [], currentMonth, currentYear) +
    countByMonth(admin_main.data ?? [], currentMonth, currentYear) +
    countByMonth(chat_messages.data ?? [], currentMonth, currentYear) +
    countByMonth(users ?? [], currentMonth, currentYear) +
    countByMonth(projects.data ?? [], currentMonth, currentYear)

  const systemLoadPrevMonth =
    countByMonth(admin.data ?? [], prevMonth, prevMonthYear) +
    countByMonth(admin_limit.data ?? [], prevMonth, prevMonthYear) +
    countByMonth(admin_main.data ?? [], prevMonth, prevMonthYear) +
    countByMonth(chat_messages.data ?? [], prevMonth, prevMonthYear) +
    countByMonth(users ?? [], prevMonth, prevMonthYear) +
    countByMonth(projects.data ?? [], prevMonth, prevMonthYear)

  const systemLoad =
    (admin.data?.length || 0) +
    (admin_limit.data?.length || 0) +
    (admin_main.data?.length || 0) +
    (chat_messages.data?.length || 0) +
    (users?.length || 0) +
    (projects.data?.length || 0)

  // User statistics
  const usersThisMonth = countByMonth(users ?? [], currentMonth, currentYear)
  const usersPrevMonth = countByMonth(users ?? [], prevMonth, prevMonthYear)

  const activeUsersThisMonth = users?.filter(user => {
    const created = new Date(user.created_at)
    return user.active && created.getMonth() === currentMonth && created.getFullYear() === currentYear
  })?.length || 0

  const activeUsersPrevMonth = users?.filter(user => {
    const created = new Date(user.created_at)
    return user.active && created.getMonth() === prevMonth && created.getFullYear() === prevMonthYear
  })?.length || 0

  return {
    users: {
      total: totalUsers,
      percentage_change: calculatePercentageChange(usersThisMonth, usersPrevMonth)
    },
    active_sessions: {
      total: activeUsers,
      percentage_change: calculatePercentageChange(activeUsersThisMonth, activeUsersPrevMonth)
    },
    system_load: {
      total: systemLoad,
      percentage_change: calculatePercentageChange(systemLoadThisMonth, systemLoadPrevMonth)
    },
    security_score: {
      score: 98,
      percentage_change: 0.5
    }
  }
} 