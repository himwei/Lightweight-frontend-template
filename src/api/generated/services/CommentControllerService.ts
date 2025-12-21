/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseIPageCommentVO } from '../models/BaseResponseIPageCommentVO';
import type { CommentAddDTO } from '../models/CommentAddDTO';
import type { PageDTO } from '../models/PageDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommentControllerService {
    /**
     * 医生查看收到的评价
     * @param requestBody
     * @returns BaseResponseIPageCommentVO OK
     * @throws ApiError
     */
    public static getMyComments(
        requestBody: PageDTO,
    ): CancelablePromise<BaseResponseIPageCommentVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/comment/my-list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 提交评价
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static addComment(
        requestBody: CommentAddDTO,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/comment/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
