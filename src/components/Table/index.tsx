import React, { Key } from 'react';
import View from '../../types/View';
import cn from 'classnames';
import classes from './index.module.scss';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Table = <Row extends object>({ columns, dataSource }: Props<Row>) => {
  const { width, maxMobileWidth } = useWindowDimensions();

  const renderHeader = () => {
    return (
      <thead className={classes.table__head}>
        <tr className={classes.table__row}>
          {columns.map((column, index) => (
            <th className={cn(classes.table__headCell, classes.table__cell)} key={index}>
              {width >= maxMobileWidth && column.title}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    return (
      <tbody className={classes.table__body}>
        {dataSource.map((row: Row, index) => (
          <tr className={classes.table__row} key={index.toString()}>
            {columns.map((column, index) => (
              <td className={classes.table__cell} key={`${index}x`}>
                {isColumnDataIndex(column) ? row[column.dataIndex] : column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <table className={classes.table}>
      {renderHeader()}
      {renderBody()}
    </table>
  );
};

interface Props<Row extends object> {
  columns: Column<Row>[];
  dataSource: Row[];
  width?: number;
}

interface BaseColumn {
  key: Key;
  title?: string;
}

interface ColumnDataIndex<Row> extends BaseColumn {
  dataIndex: keyof Row;
}

interface ColumnRender<Row> extends BaseColumn {
  render: (row: Row) => View;
}

export type Column<Row extends object> = ColumnDataIndex<Row> | ColumnRender<Row>;

const isColumnDataIndex = <Row extends object>(
  column: Column<Row>,
): column is ColumnDataIndex<Row> => {
  return 'dataIndex' in column;
};

export default Table;
