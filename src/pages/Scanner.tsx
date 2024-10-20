import { QrReader } from '@blackbox-vision/react-qr-reader';
import React, { useEffect, useState } from 'react';

interface ScannerProps {
  onScanSuccess: (data: string | null) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (scanResult) {
      onScanSuccess(scanResult);
      setIsScanning(false); // Detiene el escáner después de un resultado exitoso
    }
  }, [scanResult, onScanSuccess]);

  const handleScan = (result: any) => {
    if (result?.text && isScanning) {
      setScanResult(result.text);
    } else if (result?.error) {
      console.error('Error al escanear el código QR:', result.error);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Escanea el código QR</h2>
      {isScanning ? (
        <QrReader
          constraints={{ facingMode: 'environment' }} 
          onResult={handleScan}
          containerStyle={{ width: '300px', margin: '0 auto' }}
          videoContainerStyle={{ width: '100%', height: 'auto' }}
        />
      ) : (
        <p>Escaneo completado.</p>
      )}
    </div>
  );
};

export default Scanner;
