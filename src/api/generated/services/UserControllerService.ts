/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseIPageUserVO } from '../models/BaseResponseIPageUserVO';
import type { BaseResponseLoginVO } from '../models/BaseResponseLoginVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponseUserVO } from '../models/BaseResponseUserVO';
import type { BaseResponseVoid } from '../models/BaseResponseVoid';
import type { LoginDTO } from '../models/LoginDTO';
import type { UserAddDTO } from '../models/UserAddDTO';
import type { UserQueryDTO } from '../models/UserQueryDTO';
import type { UserRegisterDTO } from '../models/UserRegisterDTO';
import type { UserUpdateDTO } from '../models/UserUpdateDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static updateUser(
        requestBody: UserUpdateDTO,
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static userRegister(
        requestBody: UserRegisterDTO,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static logout(): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/logout',
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponseLoginVO OK
     * @throws ApiError
     */
    public static login(
        requestBody: LoginDTO,
    ): CancelablePromise<BaseResponseLoginVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns BaseResponseVoid OK
     * @throws ApiError
     */
    public static deleteUser(
        id: number,
    ): CancelablePromise<BaseResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static addUser(
        requestBody: UserAddDTO,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/user/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param queryDto
     * @returns BaseResponseIPageUserVO OK
     * @throws ApiError
     */
    public static pageUsers(
        queryDto: UserQueryDTO,
    ): CancelablePromise<BaseResponseIPageUserVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/page',
            query: {
                'queryDTO': queryDto,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseUserVO OK
     * @throws ApiError
     */
    public static getUserDetail(
        id: number,
    ): CancelablePromise<BaseResponseUserVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/detail/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns BaseResponseUserVO OK
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<BaseResponseUserVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/current',
        });
    }
}
