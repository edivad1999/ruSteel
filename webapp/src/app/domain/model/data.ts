export interface ErrorMessageResponse {
  error: string;
}

export type AuthState = 'AUTHENTICATING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';


export interface MdsTreatParamFavoriteResponse {
  elements: FullMdsTreatParamFavorite[];
}

export interface FullMdsTreatParamFavorite {
  menu: String,
  favorite: MdsTreatParamFavorite,
}

export interface MdsTreatParamFavorite {
  key: number;
  hp: number;
  mode: string;
  fluence: number;
  pulselen: number;
  pulsesh: number;
  speed: number;
  cooler: string;
  ranking: number;
  erasable: number;
}

export interface MdsTreatParamFavoriteRequest {
  title: string;
  menu: string;
  element: MdsTreatParamFavorite
}

export interface SystemStatus {
  input1: number,
  laserWorking: boolean,
  VPNReq: boolean,
}

export type EmailPreference = 'SYSTEM_ON' | 'SYSTEM_SHUTTING_DOWN' | 'WARNING' | 'ERROR';

export interface BlobWrapper {
  fileName: string;
  blob: Blob
}

export interface EmailSetting {
  email: string;
  preferences: {
    [key: string]: boolean;
  };
}

export interface CustomError {
  timestamp: number;
  message: string;
}

export interface EpilationTable {
  rows: EpilationRow[]

}

export interface EpilationRow {
  region: string;
  skinType: string;
  hairDensity: string;
  hairThickness: string;
  HP: number;
  fluence: number;
  pulseDuration: number;
  frequency: number;
  shape: string;
  cooler: string;
  mode: string;
}

export enum LogLevelFlag {
  INFO,//blue
  WARNING,//yellow
  ERROR,// red
  TRANS,
  DATA,
  OTHER
}

export interface LogEntry {

  instant: string;
  logLevel: LogLevelFlag;
  origin: string;
  message: string;

}
