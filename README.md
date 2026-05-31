# בנה את הזהות המנצחת שלך — חבילת Full-Stack מלאה

חבילה זו מכילה את כל 4 המערכות:
1. 🔔 מנוע התראות Push פרו-אקטיבי (60 דק' + 10 דק' לפני משימה)
2. 📜 מערכת 1,000 ציטוטי בוקר עם סבב יומי
3. 🎟️ קופוני הנחה ויראליים (נפתח אחרי רצף 30 יום)
4. 🤖 מאמן AI מסוג RAG עם הגנה מפני הזיות

## סביבת פיתוח
הפרויקט מפותח ומורץ עם **Claude Code**.
ראה את המדריך המלא צעד-צעד: `docs/SETUP-GUIDE.html` (פתח בדפדפן).

## התחלה מהירה (מקומית)
```bash
# 1. התקנת תלויות
cd backend && npm install
cd ../frontend && npm install && npm run build && cd ..

# 2. יצירת הטבלאות (PostgreSQL מקומי)
createdb winning_identity
psql winning_identity -f backend/db/schema.sql

# 3. מילוי 1000 הציטוטים
cd backend && node db/seed-quotes.js

# 4. הרצה
npm start    # → http://localhost:8000
```

## משתני סביבה (.env בתיקיית backend)
- `DATABASE_URL` — חיבור ל-PostgreSQL המקומי
- `JWT_SECRET` — מחרוזת אקראית ארוכה
- `ANTHROPIC_API_KEY` — המפתח שלך מ-console.anthropic.com
- `PORT` — 8000

## חיבור Frontend ↔ Backend
ב-`frontend/src/App.jsx` יש דגל בראש הקובץ:
```js
const USE_BACKEND = false;  // הפוך ל-true כשהשרת רץ
```
