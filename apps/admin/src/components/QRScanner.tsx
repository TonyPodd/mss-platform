'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          // Предпочитаем заднюю камеру на мобильных устройствах
          const backCamera = devices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        setError('Не удалось получить доступ к камерам');
      }
    };

    loadCameras();

    return () => {
      // Cleanup: останавливаем сканер при размонтировании
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        Promise.resolve()
          .then(() => scanner.stop())
          .then(() => scanner.clear())
          .catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('Камера не выбрана');
      return;
    }

    try {
      setError(null);
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Успешно отсканировано - сначала останавливаем сканер
          await stopScanning();
          // Затем вызываем callback
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ошибки сканирования игнорируем (они постоянно идут пока нет QR в кадре)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(`Не удалось запустить сканер: ${err.message}`);
    }
  };

  const stopScanning = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      // Проверяем состояние сканера
      const state = await scanner.getState();

      // Если сканер работает, останавливаем его
      if (state === 2) { // Html5QrcodeScannerState.SCANNING
        await scanner.stop();
      }

      // Очищаем ресурсы
      await scanner.clear();
    } catch (err) {
      console.error('Error stopping scanner:', err);
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Сканировать QR-код</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {cameras.length > 1 && !isScanning && (
            <div className={styles.cameraSelect}>
              <label>Выберите камеру:</label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Камера ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.scannerContainer}>
            <div id="qr-reader" className={styles.qrReader}></div>
          </div>

          {!isScanning && cameras.length > 0 && (
            <button
              className={styles.startButton}
              onClick={startScanning}
            >
              Начать сканирование
            </button>
          )}

          {isScanning && (
            <div className={styles.scanningInfo}>
              <div className={styles.spinner}></div>
              <p>Наведите камеру на QR-код заказа</p>
              <button
                className={styles.stopButton}
                onClick={stopScanning}
              >
                Остановить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
