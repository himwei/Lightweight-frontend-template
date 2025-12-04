/**
 * 角色编码常量
 * 对应后端 sys_role 表的 role_code
 */
export enum RoleEnum {
    ADMIN = 'admin',
    DOCTOR = 'doctor',
    PATIENT = 'patient'
}

/**
 * 角色名称映射 (可选，用于 UI 展示)
 */
export const RoleNameMap: Record<string, string> = {
    [RoleEnum.ADMIN]: '管理员',
    [RoleEnum.DOCTOR]: '医生',
    [RoleEnum.PATIENT]: '患者'
}
