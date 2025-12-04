import dayjs from 'dayjs'

/**
 * 格式化为日期 (YYYY-MM-DD)
 * @param dateStr 时间字符串或Date对象
 */
export const formatDate = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('YYYY-MM-DD')
}

/**
 * 格式化为日期+时间 (YYYY-MM-DD HH:mm:ss)
 * @param dateStr 时间字符串或Date对象
 */
export const formatDateTime = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}
