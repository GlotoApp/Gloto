import React, { useState } from "react";

const formatPrice = (price) => {
  return Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function SplitPaymentModal({
  isOpen,
  onClose,
  total,
  numSplits,
  splitPayments,
  updateSplitPayment,
  initializeSplits,
  removePaymentRow,
}) {
  if (!isOpen) return null;

  const [deletingIndex, setDeletingIndex] = useState(null);

  const handleRemovePaymentRow = (index) => {
    setDeletingIndex(index);
    setTimeout(() => {
      removePaymentRow(index);
      setDeletingIndex(null);
    }, 300);
  };

  const totalAssigned = splitPayments.reduce(
    (sum, pay) => sum + (parseFloat(pay.amount) || 0),
    0,
  );
  const remaining = total - totalAssigned;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-background border border-outline shadow-2xl w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-background border-b border-outline px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase tracking-tight text-on-surface">
            Dividir Pago
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-sidebar px-6 py-6 space-y-6">
          {/* Total y Estado */}
          <div className="flex flex-col justify-between items-center gap-2">
            <div>
              <p className="text-[9px] text-center font-bold text-on-surface-variant uppercase">
                Total
              </p>
              <p className="text-3xl font-black text-primary">
                ${formatPrice(total)}
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-[9px] font-bold uppercase  ${
                  remaining === 0
                    ? "text-success"
                    : remaining > 0
                      ? "text-error"
                      : "text-success"
                }`}
              >
                {remaining === 0
                  ? "Completo"
                  : remaining > 0
                    ? "Faltante"
                    : "Cambio"}
              </p>
              <p
                className={`text-2xl font-black ${
                  remaining === 0
                    ? "text-success"
                    : remaining > 0
                      ? "text-error"
                      : "text-success"
                }`}
              >
                {remaining === 0 ? "✓" : `$${formatPrice(Math.abs(remaining))}`}
              </p>
            </div>
          </div>

          {/* Divisiones Input */}
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase mb-3">
              Divisiones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => initializeSplits(Math.max(2, numSplits - 1))}
                disabled={numSplits <= 2}
                className="bg-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed text-on-surface font-black rounded-lg p-2 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input
                type="number"
                min="2"
                max="20"
                value={splitPayments.length}
                onChange={(e) =>
                  initializeSplits(
                    Math.max(2, Math.min(20, parseInt(e.target.value) || 2)),
                  )
                }
                className="flex-1 bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface font-black text-center text-lg outline-none focus:border-primary"
              />
              <button
                onClick={() => initializeSplits(Math.min(20, numSplits + 1))}
                className="bg-surface hover:bg-surface-hover text-on-surface font-black rounded-lg p-2 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          {/* Listado de Divisiones */}
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase mb-3">
              Asigna montos
            </p>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-sidebar pr-2">
              {splitPayments.map((pay, index) => (
                <div
                  key={index}
                  className={`flex gap-2 items-end transition-opacity duration-500 ${
                    deletingIndex === index ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="text-[10px] font-black bg-primary-container text-on-surface w-7 h-7 rounded flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  <select
                    value={pay.method}
                    onChange={(e) =>
                      updateSplitPayment(index, "method", e.target.value)
                    }
                    className="flex-1 bg-surface border border-outline text-on-surface text-[9px] font-bold rounded-lg p-2 outline-none focus:border-primary"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>

                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant font-black text-xs">
                      $
                    </span>
                    <input
                      type="text"
                      value={
                        pay.amount
                          ? formatPrice(parseFloat(pay.amount) || 0)
                          : ""
                      }
                      onChange={(e) => {
                        const numValue = e.target.value.replace(/\D/g, "");
                        updateSplitPayment(index, "amount", numValue);
                      }}
                      className="w-full bg-surface border border-outline text-on-surface text-[9px] font-black rounded-lg p-2 pl-6 outline-none focus:border-primary text-right"
                      placeholder="0"
                    />
                  </div>

                  {splitPayments.length > 2 && (
                    <button
                      onClick={() => handleRemovePaymentRow(index)}
                      className="text-error hover:text-error/80 p-1 transition-all flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background border-t border-outline px-6 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-surface hover:bg-surface-hover text-on-surface font-bold py-2 rounded-lg transition-all text-[9px] uppercase"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            disabled={remaining > 0}
            className={`flex-1 font-bold py-2 rounded-lg transition-all text-[9px] uppercase ${
              remaining > 0
                ? "bg-surface text-on-surface-variant cursor-not-allowed"
                : "bg-primary-container hover:bg-success text-on-surface"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
