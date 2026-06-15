/** يُستخدم رسالة المزوّد فقط إذا كانت بالعربية، وإلا الرسالة الاحتياطية */
export function resolveProviderMessage(upstreamMessage, fallback) {
  if (typeof upstreamMessage === 'string' && /[\u0600-\u06FF]/.test(upstreamMessage)) {
    return upstreamMessage;
  }
  return fallback;
}
