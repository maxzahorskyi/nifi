export type ContractTypeAbiEntry = {
  readonly longtype: string;
  readonly abiFilename: string;
};

export interface IAbisContractTypesStorage {
  findContractTypeAbi(
    longtype: string,
    level: string,
    blockchain?: string,
  ): Promise<ContractTypeAbiEntry | null>;
}

