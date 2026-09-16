import { generateWhatsAppUrl } from "./utils";
import { getWhatsAppNumber } from "./settings";

export function buildPurchaseMessage(params: {
  projectName: string;
  projectId: string;
  price: string | number;
  productUrl: string;
}) {
  return `مرحبًا، أريد شراء مشروع ${params.projectName}
ID: ${params.projectId}
السعر: ${params.price}
رابط المشروع: ${params.productUrl}`;
}

export function buildCustomizationMessage(params: {
  projectName: string;
  projectId: string;
}) {
  return `مرحبًا، أريد طلب تخصيص لمشروع ${params.projectName}
ID: ${params.projectId}`;
}

export function getWhatsAppLink(message: string, phone?: string): string {
  const number = (phone || getWhatsAppNumber()).replace(/\D/g, "");
  return generateWhatsAppUrl(number, message);
}

export function getPurchaseWhatsAppUrl(params: {
  projectName: string;
  projectId: string;
  price: string | number;
  productUrl: string;
}) {
  return getWhatsAppLink(buildPurchaseMessage(params));
}

export function getCustomizationWhatsAppUrl(params: {
  projectName: string;
  projectId: string;
}) {
  return getWhatsAppLink(buildCustomizationMessage(params));
}
