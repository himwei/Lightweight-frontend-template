/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseIPageTDepartment } from '../models/BaseResponseIPageTDepartment';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { DepartmentAddDTO } from '../models/DepartmentAddDTO';
import type { DepartmentQueryDTO } from '../models/DepartmentQueryDTO';
import type { DepartmentUpdateDTO } from '../models/DepartmentUpdateDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DepartmentControllerService {
    /**
     * 修改科室
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateDepartment(
        requestBody: DepartmentUpdateDTO,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dept/update',
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
    /**
     * 删除科室
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static deleteDepartment(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dept/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 新增科室
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static addDepartment(
        requestBody: DepartmentAddDTO,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/dept/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
