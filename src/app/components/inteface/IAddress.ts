import { JSX } from "react";

export interface IAddress {
  ID: number;
  ClassName: string;
  RecordClassName: string;
  Title: string;
  Alamat: string;
  KodePos: string;
  Kecamatan: string;
  Kota: string;
  Provinsi: string;
  IsDefault: number;
  MemberID: number;
  ProvinceID: number;
  CityID: number;
  DistrictID: number;
  SubDistrictID: number;
  Created: string;
  LastEdited: string;
  length: number;
  map(arg0: (addr: any) => JSX.Element): import("react").ReactNode;
}