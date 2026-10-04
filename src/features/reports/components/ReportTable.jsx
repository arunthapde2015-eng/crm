import { DataTable } from '@/components/DataTable';

import { formatCell } from '../utils/formatCell';
import { isNumericColumn } from '../utils/reports';
import styles from './ReportTable.module.css';

function getCellClassName(column) {
  return isNumericColumn(column) ? styles.numeric : undefined;
}

/**
 * Generic report table driven by column definitions, with an optional totals footer.
 *
 * @param {object} props
 * @param {string} props.caption
 * @param {{ key: string, label: string, type: string }[]} props.columns
 * @param {object[]} props.rows
 * @param {object | null} props.totalsRow
 */
export function ReportTable({ caption, columns, rows, totalsRow }) {
  const [firstColumn, ...otherColumns] = columns;

  return (
    <DataTable caption={caption} tableClassName={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className={getCellClassName(column)}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className={styles.empty}>
              Nothing in this period.
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row.id}>
            <th scope="row">{formatCell(row[firstColumn.key], firstColumn.type)}</th>
            {otherColumns.map((column) => (
              <td key={column.key} className={getCellClassName(column)}>
                {formatCell(row[column.key], column.type)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {totalsRow && (
        <tfoot className={styles.totals}>
          <tr>
            <th scope="row">{totalsRow[firstColumn.key]}</th>
            {otherColumns.map((column) => (
              <td key={column.key} className={getCellClassName(column)}>
                {formatCell(totalsRow[column.key], column.type)}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </DataTable>
  );
}
