// 排班时段
export enum ShiftTypeEnum {
    MORNING = 1,
    AFTERNOON = 2
}

export const ShiftTypeMap: Record<number, string> = {
    [ShiftTypeEnum.MORNING]: '上午',
    [ShiftTypeEnum.AFTERNOON]: '下午'
}

// 挂号状态
export enum RegStatusEnum {
    BOOKED = 0,
    FINISHED = 1,
    CANCELED = 2
}

// 状态对应的 Tag 颜色 (Element Plus)
export const RegStatusColorMap: Record<number, string> = {
    [RegStatusEnum.BOOKED]: 'primary',   // 蓝色
    [RegStatusEnum.FINISHED]: 'success', // 绿色
    [RegStatusEnum.CANCELED]: 'info'     // 灰色
}

export const RegStatusTextMap: Record<number, string> = {
    [RegStatusEnum.BOOKED]: '已预约',
    [RegStatusEnum.FINISHED]: '已完成',
    [RegStatusEnum.CANCELED]: '已取消'
}
