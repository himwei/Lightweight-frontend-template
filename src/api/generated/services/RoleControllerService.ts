/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseListSysRole } from '../models/BaseResponseListSysRole';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleControllerService {
    /**
     * @returns BaseResponseListSysRole OK
     * @throws ApiError
     */
    public static listRoles(): CancelablePromise<BaseResponseListSysRole> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/role/list',
        });
    }
}
