/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseDoctorVO } from '../models/BaseResponseDoctorVO';
import type { BaseResponseIPageDoctorVO } from '../models/BaseResponseIPageDoctorVO';
import type { BaseResponseIPageRegistrationVO } from '../models/BaseResponseIPageRegistrationVO';
import type { BaseResponseIPageScheduleVO } from '../models/BaseResponseIPageScheduleVO';
import type { BaseResponseIPageTDepartment } from '../models/BaseResponseIPageTDepartment';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { DepartmentQueryDTO } from '../models/DepartmentQueryDTO';
import type { DiagnosisRequest } from '../models/DiagnosisRequest';
import type { DoctorQueryDTO } from '../models/DoctorQueryDTO';
import type { PageDTO } from '../models/PageDTO';
import type { RegSubmitRequest } from '../models/RegSubmitRequest';
import type { ScheduleQueryDTO } from '../models/ScheduleQueryDTO';
import type { TSchedule } from '../models/TSchedule';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class Service {
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
     * 发布排班 (管理员)
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static addSchedule(
        requestBody: TSchedule,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 提交挂号申请
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static submitRegistration(
        requestBody: RegSubmitRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reg/submit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 查询我的挂号记录 (分页)
     * @param requestBody
     * @returns BaseResponseIPageRegistrationVO OK
     * @throws ApiError
     */
    public static getMyRegistrations(
        requestBody: PageDTO,
    ): CancelablePromise<BaseResponseIPageRegistrationVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reg/my-list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 医生录入医嘱 (接诊)
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static diagnosis(
        requestBody: DiagnosisRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reg/diagnosis',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 获取医生个人信息
     * @returns BaseResponseDoctorVO OK
     * @throws ApiError
     */
    public static getProfile(): CancelablePromise<BaseResponseDoctorVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/doctor/profile',
        });
    }
    /**
     * 分页获取医生列表 (支持按科室/姓名搜索)
     * @param requestBody
     * @returns BaseResponseIPageDoctorVO OK
     * @throws ApiError
     */
    public static listDoctors(
        requestBody: DoctorQueryDTO,
    ): CancelablePromise<BaseResponseIPageDoctorVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/doctor/list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 分页获取科室列表
     * @param requestBody
     * @returns BaseResponseIPageTDepartment OK
     * @throws ApiError
     */
    public static getDepartmentList(
        requestBody: DepartmentQueryDTO,
    ): CancelablePromise<BaseResponseIPageTDepartment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dept/list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
