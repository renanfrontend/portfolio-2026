"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { CHECKOUT_STORAGE_KEY } from "../checkout";

type Props = { orderId: string; value: number; currency: string; packageId: string; packageName: string };

/** Dispara purchase_success uma única vez por pedido (recarregar a página não duplica a venda). */
export function TrackPurchase({ orderId, value, currency, packageId, packageName }: Props) {
  useEffect(() => {
    try {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      const key = `ga-purchase-${orderId}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // Sem armazenamento: envia mesmo assim.
    }
    trackEvent("purchase_success", {
      transaction_id: orderId,
      value,
      currency,
      items: [{ item_id: packageId, item_name: packageName, price: value, quantity: 1 }],
    });
  }, [orderId, value, currency, packageId, packageName]);
  return null;
}
