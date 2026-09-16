# B&M STORE — متجر المشاريع البرمجية

متجر عربي لبيع المشاريع البرمجية الجاهزة مع Demo وتواصل واتساب.

## تشغيل محلي

```bash
npm install
cp .env.example .env
# عدّل WHATSAPP_NUMBER و ADMIN_PASSWORD
npm run dev
```

افتح: http://localhost:3000

## رفع على Vercel

1. ارفع المشروع على GitHub
2. Import في [vercel.com](https://vercel.com)
3. Environment Variables (مهم):

| المتغير | مثال |
|---------|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `WHATSAPP_NUMBER` | `201114342972` |
| `ADMIN_SEARCH_KEY` | مفتاح سري للدخول من البحث |
| `ADMIN_PASSWORD` | كلمة سر قوية |
| `NODE_ENV` | `production` |

4. Deploy

### ملاحظات Vercel

- **المتصفح العام (عرض المشاريع / Demo الخارجي / واتساب):** يعمل بكفاءة.
- **رفع ملفات ZIP وصور الغلاف من الأدمن:** على Vercel نظام الملفات مؤقت (`/tmp`). التعديلات أثناء التشغيل قد لا تثبت بعد إعادة التشغيل.
  - **الحل الموصى به للثبات:** ارفع المشاريع محليًا أو من جهازك، واحفظ `data/projects.json` في Git ثم اعمل Redeploy — أو اربط قاعدة PostgreSQL (Neon) لاحقًا.
- **Demo:** الأفضل وضع رابط Demo خارجي (Vercel/Netlify منفصل لكل مشروع) في حقل `demoUrl`.

## دخول الأدمن (مخفي)

1. في خانة البحث اكتب قيمة `ADMIN_SEARCH_KEY`
2. أدخل `ADMIN_PASSWORD`
3. أضف/عدّل المشاريع من اللوحة

**غيّر المفتاح والباسورد قبل أي نشر عام.**

## الأمان

- مسارات `/admin` وواجهات الكتابة في API محمية بجلسة HttpOnly
- فحص ZIP ضد Path Traversal وأنواع ملفات خطرة
- Headers أمنية (HSTS / nosniff / frame / referrer)
- لا يوجد رابط ظاهر للوحة التحكم في الواجهة العامة

## السكربتات

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```
