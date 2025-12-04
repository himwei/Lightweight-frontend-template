/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseIPageRegistrationVO } from '../models/BaseResponseIPageRegistrationVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { CancelRegistrationRequest } from '../models/CancelRegistrationRequest';
import type { DiagnosisRequest } from '../models/DiagnosisRequest';
import type { PageDTO } from '../models/PageDTO';
import type { RegSubmitRequest } from '../models/RegSubmitRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RegistrationControllerService {
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
     * 查询挂号记录 (智能判断角色)
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
     * 取消挂号
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static cancelRegistration(
        requestBody: CancelRegistrationRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reg/cancel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
