export interface ErrorMessageResponse {
  error: string;
}

export type AuthState = 'AUTHENTICATING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export enum Role {
  USER,
  ADMIN

}

export interface Order {
  id: string;//when creating or editing id will be ignored
  product: string;
  requestedDate: number;
  requestedQuantity: number;
  commission: string;
  client: string;
  clientOrderCode: string;
  creationTime?: number;
  internalOrders: InternalOrder[];
}

export interface InternalOrder {
  id: string; //when creating or editing id will be ignored
  productCode: string
  productQuantity: number,
  rawCode: string,
  rawQuantity: number,
  operator: string,
  processes: string[],
  externalTreatments: string,
  startDate: number | null;
  endDate: number | null;
  expectedEndDate: number | null;
  priority: number | null


}

export interface EditProductionDate {
  id: string,
  action: string
}

export interface CreateOrderRequest {
  product: string;
  requestedDate: number;
  requestedQuantity: number;
  commission: string;
  client: string;
  clientOrderCode: string;

  internalOrders: CreateInternalOrderRequest[];
}

export interface CreateInternalOrderRequest {
  productCode: string
  productQuantity: number,
  rawCode: string,
  rawQuantity: number,
  operator: string,
  processes: string[],
  externalTreatments: string,
  startDate: number | null;
  endDate: number | null;
  expectedEndDate: number | null;
  priority: number | null

}

export interface QrResponse {
  id: string,
  action: string
}

export interface PasswordChangeRequest {
  old: string,
  new: string
}

export interface Completion {
  productColumn: string[]
  commissionColumn: string[]
  clientColumn: string[]
  clientOrderCodeColumn: string[]
  productCodeColumn: string[]
  rawCodeColumn: string[]
  operatorColumn: string[]
  externalTreatmentsColumn: string[]
}


export interface OperatorRequest {
  username: string,
  password: string,
}


export interface OperatorPasswordChangeRequest {
  username: string,
  new: string,
}

export interface OperatorData {
  name: string,
  assignedOrders: number,
  completedOrders: number,
  inProgressOrders: number,
  notStartedOrders: number,

}
