/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AuthenticateSessionUtil, AuthenticateUserKeys } from "@wso2is/authentication";
import { AxiosHttpClient } from "@wso2is/http";
import { ConsentReceiptInterface, ConsentState, HttpMethods, UpdateReceiptInterface } from "../models";
import { store } from "../store";

/**
 * Initialize an axios Http client.
 * @type {AxiosHttpClientInstance}
 */
const httpClient = AxiosHttpClient.getInstance();

/**
 * Fetches a list of consented applications of the currently authenticated user.
 *
 * @return {Promise<any>} A promise containing the response.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchConsentedApps = (state: ConsentState): Promise<any> => {
    const userName = AuthenticateSessionUtil.getSessionParameter(AuthenticateUserKeys.USERNAME).split("@");

    if (userName.length > 1) {
        userName.pop();
    }

    const requestConfig = {
        headers: {
            "Accept": "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            piiPrincipalId: userName.join("@"),
            state
        },
        url: store.getState().config.endpoints.consents
    };

    return httpClient
        .request(requestConfig)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

/**
 * Fetch the consent receipt.
 *
 * @return {Promise<any>} A promise containing the response.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchConsentReceipt = (receiptId: string): Promise<any> => {
    const requestConfig = {
        headers: {
            "Accept": "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.receipts + `/${receiptId}`
    };

    return httpClient
        .request(requestConfig)
        .then((response) => {
            return response.data as ConsentReceiptInterface;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

/**
 * Revoke the consent given to an application.
 *
 * @return {Promise<any>} A promise containing the response.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const revokeConsentedApp = (appId: string): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json"
        },
        method: HttpMethods.DELETE,
        url: store.getState().config.endpoints.receipts + `/${appId}`
    };

    return httpClient
        .request(requestConfig)
        .then((response) => {
            // TODO: change the return type
            return response.data as ConsentReceiptInterface;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

/**
 * Intercepts and handles actions of type `UPDATE_CONSENTED_CLAIMS`.
 *
 * @param {any} dispatch - `dispatch` function from redux.
 * @returns {(next) => (action) => any} Passes the action to the next middleware
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const updateConsentedClaims = (receipt: ConsentReceiptInterface): Promise<any> => {
    const body: UpdateReceiptInterface = {
        collectionMethod: "Web Form - User Portal",
        jurisdiction: receipt.jurisdiction,
        language: receipt.language,
        policyURL: receipt.policyUrl,
        services: receipt.services.map((service) => ({
            purposes: service.purposes.map((purpose) => ({
                consentType: purpose.consentType,
                piiCategory: purpose.piiCategory.map((category) => ({
                    piiCategoryId: category.piiCategoryId,
                    validity: category.validity
                })),
                primaryPurpose: purpose.primaryPurpose,
                purposeCategoryId: [1],
                purposeId: purpose.purposeId,
                termination: purpose.termination,
                thirdPartyDisclosure: purpose.thirdPartyDisclosure,
                thirdPartyName: purpose.thirdPartyName
            })),
            service: service.service,
            serviceDescription: service.serviceDescription,
            serviceDisplayName: service.serviceDisplayName,
            tenantDomain: service.tenantDomain
        }))
    };

    const requestConfig = {
        data: body,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.consents
    };

    return httpClient
        .request(requestConfig)
        .then((response) => {
            return response.data as ConsentReceiptInterface;
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};
