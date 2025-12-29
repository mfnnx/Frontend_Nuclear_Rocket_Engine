/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCartBadgeDTO {
  calculation_id?: number;
  count?: number;
}

export interface DsGasCreateRequest {
  description: string;
  image_url?: string;
  title: string;
  molar_mass?: number;
}

export interface DsGasDTO {
  description?: string;
  id?: number;
  image_url?: string;
  title?: string;
  molar_mass?: number;
}

export interface DsGasUpdateRequest {
  description?: string;
  image_url?: string;
  title?: string;
  molar_mass?: number;
}

export interface DsImpulseCalculationDTO {
  date_accepted?: string;
  date_created?: string;
  date_formed?: string;
  fields?: DsImpulseCalculationFieldDTO[];
  id?: number;
  moderator?: DsUserDTO;
  moderator_id?: number;
  status?: string;
  temperature?: number;
  user?: DsUserDTO;
  user_id?: number;

  // добавляем поле из ответа /impulse_calculations
  total_impulse?: number;
  gas_count?: number;
}


export interface DsImpulseCalculationFieldDTO {
  gas?: DsGasDTO;
  gas_id?: number;
  impulse?: number;
  impulse_calculation_id?: number;
  mass?: number;
}

export interface DsImpulseCalculationFieldUpdateRequest {
  impulse?: number;
  mass?: number;
}

export interface DsImpulseCalculationStatusUpdateRequest {
  /** "FORMED" | "REJECTED" | "COMPLETED" */
  status: string;
}

export interface DsImpulseCalculationUpdateRequest {
  temperature?: number;
}

export interface DsLoginRequest {
  login?: string;
  password?: string;
}

export interface DsLoginResponse {
  token?: string;
  user?: DsUserDTO;
}

export interface DsPaginatedResponse {
  items?: any;
  total?: number;
}

export interface DsUserDTO {
  id?: number;
  is_moderator?: boolean;
  login?: string;
}

export interface DsUserUpdateRequest {
  is_moderator?: boolean;
  login?: string;
  password?: string;
}

export interface HandlerRegisterReq {
  login?: string;
  password?: string;
}

export interface HandlerRegisterResp {
  ok?: boolean;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Nuclear_Rocket_Engine
 * @version 1.0
 * @license AS IS (NO WARRANTY)
 * @baseUrl https://localhost:8080/api
 * @contact API Support <bitop@spatecon.ru> (https://vk.com/bmstu_schedule)
 *
 * Bmstu Open IT Platform
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Выполняет вход пользователя в систему и возвращает JWT токен
     *
     * @tags Аутентификация
     * @name LoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/auth/login
     */
    loginCreate: (login: DsLoginRequest, params: RequestParams = {}) =>
      this.request<DsLoginResponse, object>({
        path: `/auth/login`,
        method: "POST",
        body: login,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет выход пользователя и добавляет токен в черный список
     *
     * @tags Аутентификация
     * @name LogoutCreate
     * @summary Выход из системы
     * @request POST:/auth/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  gases = {
    /**
     * @description Возвращает список газов с возможностью фильтрации по названию
     *
     * @tags Газы
     * @name GasesList
     * @summary Получить список газов с фильтрацией
     * @request GET:/gases
     * @secure
     */
    gasesList: (
      query?: {
        /** Фильтр по названию газа */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsPaginatedResponse, object>({
        path: `/gases`,
        method: "GET",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет новый газ в систему (без изображения)
     *
     * @tags Газы
     * @name GasesCreate
     * @summary Создать новый газ
     * @request POST:/gases
     * @secure
     */
    gasesCreate: (gas: DsGasCreateRequest, params: RequestParams = {}) =>
      this.request<DsGasDTO, object>({
        path: `/gases`,
        method: "POST",
        body: gas,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детальную информацию о конкретном газе
     *
     * @tags Газы
     * @name GasesDetail
     * @summary Получить информацию о газе
     * @request GET:/gases/{id}
     * @secure
     */
    gasesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsGasDTO, object>({
        path: `/gases/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет информацию о существующем газе
     *
     * @tags Газы
     * @name GasesUpdate
     * @summary Обновить информацию о газе
     * @request PUT:/gases/{id}
     * @secure
     */
    gasesUpdate: (
      id: number,
      gas: DsGasUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsGasDTO, object>({
        path: `/gases/${id}`,
        method: "PUT",
        body: gas,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет газ из системы вместе с его изображением
     *
     * @tags Газы
     * @name GasesDelete
     * @summary Удалить газ
     * @request DELETE:/gases/{id}
     * @secure
     */
    gasesDelete: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/gases/${id}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение для газа, заменяя существующее
     *
     * @tags Газы
     * @name ImageCreate
     * @summary Добавить изображение для газа
     * @request POST:/gases/{id}/image
     * @secure
     */
    imageCreate: (
      id: number,
      data: {
        /** Файл изображения */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/gases/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  impulseCalculations = {
    /**
     * @description Возвращает список расчетов импульса с фильтрацией по статусу и дате
     *
     * @tags Расчеты импульса
     * @name ImpulseCalculationsList
     * @summary Получить список расчетов с фильтрацией
     * @request GET:/impulse_calculations
     */
    impulseCalculationsList: (
      query?: {
        /** Фильтр по статусу */
        status?: string;
        /** Начальная дата (YYYY-MM-DD) */
        from?: string;
        /** Конечная дата (YYYY-MM-DD) */
        to?: string;
        
        // --- [ДОБАВИЛ page и limit] ---
        page?: number;
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      // --- [ИЗМЕНИЛ ТИП ОТВЕТА] ---
      this.request<{ items: DsImpulseCalculationDTO[], total: number, time_ms: number }, object>({
        path: `/impulse_calculations`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о черновике расчета пользователя
     *
     * @tags Расчеты импульса
     * @name CartList
     * @summary Получить иконку корзины
     * @request GET:/impulse_calculations/cart
     * @secure
     */
    cartList: (params: RequestParams = {}) =>
      this.request<DsCartBadgeDTO, object>({
        path: `/impulse_calculations/cart`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет газ в черновик расчета импульса пользователя
     *
     * @tags Расчеты импульса
     * @name DraftGasesCreate
     * @summary Добавить газ в заявку-черновик
     * @request POST:/impulse_calculations/draft/gases/{gas_id}
     * @secure
     */
    draftGasesCreate: (gasId: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/impulse_calculations/draft/gases/${gasId}`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детальную информацию о расчете импульса с газами
     *
     * @tags Расчеты импульса
     * @name ImpulseCalculationsDetail
     * @summary Получить информацию о расчете
     * @request GET:/impulse_calculations/{id}
     * @secure
     */
    impulseCalculationsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsImpulseCalculationDTO, object>({
        path: `/impulse_calculations/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет поля расчета импульса
     *
     * @tags Расчеты импульса
     * @name ImpulseCalculationsUpdate
     * @summary Обновить расчет импульса
     * @request PUT:/impulse_calculations/{id}
     * @secure
     */
    impulseCalculationsUpdate: (
      id: number,
      calculation: DsImpulseCalculationUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}`,
        method: "PUT",
        body: calculation,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет расчет (логическое удаление)
     *
     * @tags Расчеты импульса
     * @name ImpulseCalculationsDelete
     * @summary Удалить расчет
     * @request DELETE:/impulse_calculations/{id}
     * @secure
     */
    impulseCalculationsDelete: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Отмечает расчет как сформированный создателем
     *
     * @tags Расчеты импульса
     * @name FormUpdate
     * @summary Сформировать расчет
     * @request PUT:/impulse_calculations/{id}/form
     * @secure
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}/form`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет параметры газа в расчете импульса
     *
     * @tags Расчеты импульса
     * @name GasesUpdate
     * @summary Обновить газ в расчете
     * @request PUT:/impulse_calculations/{id}/gases/{gas_id}
     * @secure
     */
    gasesUpdate: (
      id: number,
      gasId: number,
      field: DsImpulseCalculationFieldUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}/gases/${gasId}`,
        method: "PUT",
        body: field,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет газ из расчета импульса
     *
     * @tags Расчеты импульса
     * @name GasesDelete
     * @summary Удалить газ из расчета
     * @request DELETE:/impulse_calculations/{id}/gases/{gas_id}
     * @secure
     */
    gasesDelete: (id: number, gasId: number, params: RequestParams = {}) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}/gases/${gasId}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обрабатывает расчет модератором (завершение или отклонение)
     *
     * @tags Расчеты импульса
     * @name ResolveUpdate
     * @summary Завершить/отклонить расчет
     * @request PUT:/impulse_calculations/{id}/resolve
     * @secure
     */
    resolveUpdate: (
      id: number,
      calculation: DsImpulseCalculationStatusUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/impulse_calculations/${id}/resolve`,
        method: "PUT",
        body: calculation,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Создает нового пользователя в системе
     *
     * @tags Пользователи
     * @name UsersCreate
     * @summary Регистрация пользователя
     * @request POST:/users
     */
    usersCreate: (user: HandlerRegisterReq, params: RequestParams = {}) =>
      this.request<HandlerRegisterResp, object>({
        path: `/users`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает информацию о пользователе для личного кабинета
     *
     * @tags Пользователи
     * @name UsersDetail
     * @summary Получить данные пользователя
     * @request GET:/users/{id}
     * @secure
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsUserDTO, object>({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменяет информацию о пользователе (личный кабинет)
     *
     * @tags Пользователи
     * @name UsersUpdate
     * @summary Обновить данные пользователя
     * @request PUT:/users/{id}
     * @secure
     */
    usersUpdate: (
      id: number,
      user: DsUserUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<object, object>({
        path: `/users/${id}`,
        method: "PUT",
        body: user,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
