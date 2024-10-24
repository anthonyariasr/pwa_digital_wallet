// src/pages/PurchaseHistory.tsx
import { IonButton, IonContent, IonPage, IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import './PurchaseHistory.css';

const PurchaseHistory: React.FC = () => {
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    // Recupera el historial desde el almacenamiento local
    const history = localStorage.getItem('purchaseHistory');
    if (history) {
      setPurchaseHistory(JSON.parse(history));
    }
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="history-container">
          <IonText>
            <h2>Historial de Compras</h2>
          </IonText>
          <table className="history-table">
            <thead>
              <tr>
                <th>ID de Venta</th>
                <th>Monto</th>
                <th>Fecha de Venta</th>
              </tr>
            </thead>
            <tbody>
              {purchaseHistory.map((sale) => (
                <tr key={sale.sale_id}>
                  <td>{sale.sale_id}</td>
                  <td>${parseFloat(sale.amount)}</td>
                  <td>{new Date(sale.sale_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <IonButton expand="block" routerLink="/home" className="back-button">
            Volver a inicio
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PurchaseHistory;
