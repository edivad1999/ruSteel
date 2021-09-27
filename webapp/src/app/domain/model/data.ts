export interface ErrorMessageResponse {
  error: string;
}

export type AuthState = 'AUTHENTICATING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';


export interface Order {
  id: number;//when creating or editing id will be ignored
  product: string;
  requestedDate: number;
  requestedQuantity: number;
  commission: string;
  client: string;
  clientOrderCode: string;
  startDate: number;
  endDate: number;
  expectedEndDate: number;
  internalOrders: InternalOrder[];
}

export interface InternalOrder {
  id: number; //when creating or editing id will be ignored
  productCode: string
  productQuantity: number,
  rawCode: string,
  rawQuantity: number,
  operator: string,
  processes: string[],
  externalTreatments: string,


}
