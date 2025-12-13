/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseIPageScheduleVO } from '../models/BaseResponseIPageScheduleVO';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { ScheduleAddDTO } from '../models/ScheduleAddDTO';
import type { ScheduleQueryDTO } from '../models/ScheduleQueryDTO';
import type { ScheduleUpdateDTO } from '../models/ScheduleUpdateDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleControllerService {
    /**
     * 更新排班 (管理员)
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateSchedule(
        requestBody: ScheduleUpdateDTO,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 分页查询排班列表
     * @param requestBody
     * @returns BaseResponseIPageScheduleVO OK
     * @throws ApiError
     */
    public static listSchedules(
        requestBody: ScheduleQueryDTO,
    ): CancelablePromise<BaseResponseIPageScheduleVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 删除排班 (管理员)
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static deleteSchedule(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 发布排班 (管理员)
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static addSchedule(
        requestBody: ScheduleAddDTO,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
