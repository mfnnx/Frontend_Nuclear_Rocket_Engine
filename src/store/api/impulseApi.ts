import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { DsImpulseCalculationDTO } from '../../api/Api'


export const impulseCalculationApi = createApi({
  reducerPath: 'impulseCalculationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Calculation'],
  endpoints: (builder) => ({
    getImpulseCalculation: builder.query<DsImpulseCalculationDTO, number>({
      query: (id) => `/impulse_calculations/${id}`,
      providesTags: ['Calculation'],
    }),
    updateImpulseCalculation: builder.mutation<void, { id: number; temperature?: number }>({
      query: ({ id, temperature }) => ({
        url: `/impulse_calculations/${id}`,
        method: 'PUT',
        body: { temperature },
      }),
      invalidatesTags: ['Calculation'],
    }),
    deleteGasFromCalculation: builder.mutation<void, { id: number; gasId: number }>({
      query: ({ id, gasId }) => ({
        url: `/impulse_calculations/${id}/gases/${gasId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calculation'],
    }),
    updateGasInCalculation: builder.mutation<void, { id: number; gasId: number; mass: number }>({
      query: ({ id, gasId, mass }) => ({
        url: `/impulse_calculations/${id}/gases/${gasId}`,
        method: 'PUT',
        body: { mass },
      }),
      invalidatesTags: ['Calculation'],
    }),
    deleteImpulseCalculation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/impulse_calculations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calculation'],
    }),
    formImpulseCalculation: builder.mutation<void, number>({
      query: (id) => ({
        url: `/impulse_calculations/${id}/form`,
        method: 'PUT',
      }),
      invalidatesTags: ['Calculation'],
    }),
    resolveImpulseCalculation: builder.mutation<void, { id: number; status: 'COMPLETED' | 'REJECTED' }>({
      query: ({ id, status }) => ({
        url: `/impulse_calculations/${id}/resolve`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Calculation'],
    }),
  }),
})

export const {
  useGetImpulseCalculationQuery,
  useUpdateImpulseCalculationMutation,
  useDeleteGasFromCalculationMutation,
  useUpdateGasInCalculationMutation,
  useDeleteImpulseCalculationMutation,
  useFormImpulseCalculationMutation,
  useResolveImpulseCalculationMutation,
} = impulseCalculationApi

export default impulseCalculationApi
