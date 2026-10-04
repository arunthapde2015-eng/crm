import logoUrl from '@/assets/logo.png';
import { COMPANY } from '@/constants/company';

import styles from './GstDocument.module.css';

/**
 * White document page on the company letterhead, with a faint logo watermark and a framed
 * body under a blue title. Billing documents (proforma, invoice, receipt) fill in the frame.
 *
 * @param {object} props
 * @param {string} props.label - Accessible name, e.g. "Receipt document REC-2026-0007".
 * @param {string} props.title - Printed in the frame heading, e.g. "Payment Receipt".
 * @param {string} [props.notice] - Small print under the frame.
 * @param {React.ReactNode} props.children - The frame's contents.
 */
export function DocumentPaper({ label, title, notice, children }) {
  return (
    <article className={styles.paper} aria-label={label}>
      <img src={logoUrl} alt="" className={styles.watermark} />

      <header className={styles.letterhead}>
        <img src={logoUrl} alt="" className={styles.logo} width="112" height="112" />
        <div>
          <p className={styles.companyName}>{COMPANY.legalName.toUpperCase()}</p>
          {COMPANY.registeredAddress.map((line) => (
            <p key={line} className={styles.addressLine}>
              {line}
            </p>
          ))}
        </div>
        <div className={styles.contact}>
          <p>
            <strong>Phone</strong> : {COMPANY.mobile}
          </p>
          <p>
            <strong>Email</strong> : {COMPANY.email}
          </p>
        </div>
      </header>

      <div className={styles.frame}>
        <h3 className={styles.docTitle}>{title}</h3>
        {children}
      </div>
      {notice && <p className={styles.notice}>{notice}</p>}
    </article>
  );
}
