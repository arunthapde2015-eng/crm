import { DataTable } from '@/components/DataTable';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMobile } from '@/utils/formatPhone';

import styles from './Purchases.module.css';

/**
 * @param {object} props
 * @param {object[]} props.vendors - Rows from `getVendorRows`, with bill totals.
 */
export function VendorsTable({ vendors }) {
  return (
    <DataTable caption="Vendors" tableClassName={styles.table}>
      <thead>
        <tr>
          <th scope="col">Vendor</th>
          <th scope="col">Contact</th>
          <th scope="col">State</th>
          <th scope="col" className={styles.numeric}>
            Bills
          </th>
          <th scope="col" className={styles.numeric}>
            Purchased
          </th>
          <th scope="col" className={styles.numeric}>
            Payable
          </th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((vendor) => (
          <tr key={vendor.id}>
            <th scope="row">
              {vendor.name}
              <span className={styles.subtext}>{vendor.gstin || 'No GSTIN'}</span>
            </th>
            <td>
              {vendor.contactName || '—'}
              <span className={styles.subtext}>
                {[vendor.mobile && formatMobile(vendor.mobile), vendor.email]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </td>
            <td>{vendor.state}</td>
            <td className={styles.numeric}>{vendor.billCount}</td>
            <td className={styles.numeric}>{formatCurrency(vendor.purchased)}</td>
            <td className={styles.numeric}>{formatCurrency(vendor.payable)}</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
