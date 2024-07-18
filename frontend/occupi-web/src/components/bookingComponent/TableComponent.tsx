import React from "react";
import { Table, TableProps } from "@nextui-org/react";

export const TableComponent: React.FC<TableProps> = ({ children, ...props }) => {
  return <Table {...props}>{children}</Table>;
};