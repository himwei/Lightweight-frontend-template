/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseDoctorVO } from '../models/BaseResponseDoctorVO';
import type { BaseResponseIPageDoctorVO } from '../models/BaseResponseIPageDoctorVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { DoctorAddDTO } from '../models/DoctorAddDTO';
import type { DoctorQueryDTO } from '../models/DoctorQueryDTO';
import type { DoctorUpdateDTO } from '../models/DoctorUpdateDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DoctorControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateDoctor(
        requestBody: DoctorUpdateDTO,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/doctor/update',
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
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static addDoctor(
        requestBody: DoctorAddDTO,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/doctor/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
