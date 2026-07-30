import { useState } from 'react';
import styles from './DocumentInfoBar.module.scss';

type DocumentTab = 'general' | 'source';

export function DocumentInfoBar() {
  const [activeTab, setActiveTab] = useState<DocumentTab>('general');
  const [isExpanded, setIsExpanded] = useState(false);

  function handleGeneralTab() {
    if (activeTab === 'general') {
      setIsExpanded((current) => !current);
      return;
    }

    setActiveTab('general');
    setIsExpanded(false);
  }

  function handleSourceTab() {
    setActiveTab('source');
    setIsExpanded(true);
  }

  function handleToggle() {
    if (activeTab !== 'general') {
      setActiveTab('general');
      setIsExpanded(true);
      return;
    }

    setIsExpanded((current) => !current);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={handleGeneralTab}
        >
          Belge Genel Bilgileri
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'source' ? styles.activeTab : ''}`}
          onClick={handleSourceTab}
        >
          Kaynak Belgeler
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-label={isExpanded ? 'Bilgileri kapat' : 'Bilgileri aç'}
      >
        <span className={`${styles.arrow} ${isExpanded ? styles.arrowOpen : ''}`}>⌄</span>
      </button>

      {activeTab === 'general' ? (
        <>
          <div className={styles.previewGrid}>
            <label className={styles.field}>
              <span>Belge Serisi</span>

              <select defaultValue="">
                <option value="">Seçiniz</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="FTR">FTR</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Belge No *</span>
              <input type="text" />
            </label>
          </div>

          <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
            <div className={styles.expandableInner}>
              <label className={`${styles.field} ${styles.descriptionField}`}>
                <span>Açıklama</span>

                <input type="text" placeholder="ŞABLON AÇIKLAMA" />
              </label>
              <div className={styles.detailsGrid}>
                <label className={styles.field}>
                  <span>Belge Tarihi ve Zamanı</span>

                  <input type="datetime-local" defaultValue="2026-07-29T13:19" />
                </label>

                <label className={styles.field}>
                  <span>Belge Senaryosu</span>

                  <select defaultValue="e-arsiv">
                    <option value="e-arsiv">e-Arşiv Fatura</option>
                    <option value="e-fatura">e-Fatura</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>e-Tipi</span>

                  <select defaultValue="sale">
                    <option value="sale">Satış</option>
                    <option value="return">İade</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Döviz Türü</span>

                  <select defaultValue="try">
                    <option value="try">Türk Lirası</option>
                    <option value="usd">Amerikan Doları</option>
                    <option value="eur">Euro</option>
                  </select>
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>ETTN</span>

                  <input type="text" placeholder="e84ac57c-d69d-408f-a897-18d570aa804" />
                </label>

                <label className={styles.field}>
                  <span>Kasiyer</span>

                  <select defaultValue="">
                    <option value="">Seçiniz</option>
                    <option value="1">Kasiyer 1</option>
                    <option value="2">Kasiyer 2</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Etiket</span>

                  <select defaultValue="">
                    <option value="">Seçiniz</option>
                    <option value="etiket-1">Etiket 1</option>
                    <option value="etiket-2">Etiket 2</option>
                  </select>
                </label>
              </div>

              <div className={styles.checkboxRow}>
                <label>
                  <input type="checkbox" />
                  <span>İnternet Satışı</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>İrsaliye yerine geçer</span>
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.sourceContent}>Henüz kaynak belge eklenmedi.</div>
      )}
    </section>
  );
}
