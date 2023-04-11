export type DynamicContractAbiEntry = {
  readonly address: string;
  readonly supertype: string;
  readonly level: string;
};

export interface IAbisDynamicContractsStorage {
  findAbi(address: string): Promise<DynamicContractAbiEntry | null>;
}
