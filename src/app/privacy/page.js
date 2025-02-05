"use client";

import React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TermsPage = () => {
    const router = useRouter();

    return (
        <DirectionProvider dir="rtl">
            <div dir="rtl" class="p-8 max-w-4xl mx-auto">
                <h1 class="text-2xl sm:text-3xl font-bold text-indigo-800 mb-6 text-center">
                    מדיניות פרטיות
                </h1>

                <p class="text-sm text-gray-600 mb-4 text-center">
                    עודכן לאחרונה: 05.02.2025
                </p>

                <p class="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                    ב-Tsalamim, אנו מחויבים להגן על פרטיותך. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגינים על המידע האישי שלך.
                </p>

                <div class="space-y-8">
                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">1. מידע שאנו אוספים</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>מידע אישי: שם, כתובת דואר אלקטרוני, מספר טלפון</li>
                            <li>פרטי אירוע: מיקום, תאריך, וסוג האירוע</li>
                            <li>מידע תשלום: פרטי כרטיס אשראי (מאובטחים באמצעות מערכת צד שלישי)</li>
                            <li>תמונות שמועלות לפלטפורמה</li>
                            <li>נתוני שימוש: כיצד אתה משתמש באתר שלנו</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">2. כיצד אנו משתמשים במידע</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>לחבר בין מארחי אירועים וצלמים</li>
                            <li>לעבד תשלומים ולנהל חשבונות</li>
                            <li>לשפר את השירותים שלנו</li>
                            <li>לתקשר עם משתמשים לגבי הזמנותיהם</li>
                            <li>לשלוח עדכונים חשובים לגבי השירות</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">3. אחסון ואבטחת מידע</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>כל המידע מאוחסן בשרתים מאובטחים</li>
                            <li>אנו משתמשים בהצפנה מתקדמת להגנה על מידע רגיש</li>
                            <li>גישה למידע מוגבלת לעובדים מורשים בלבד</li>
                            <li>בדיקות אבטחה שוטפות מתבצעות באופן קבוע</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">4. שיתוף מידע</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            אנו משתפים מידע רק כאשר:
                        </p>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>נדרש לצורך מתן השירות (למשל, שיתוף פרטי קשר בין צלם למארח)</li>
                            <li>נדרש על פי חוק או צו משפטי</li>
                            <li>קיבלנו את הסכמתך המפורשת</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">5. זכויות המשתמש</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>גישה למידע האישי שלך</li>
                            <li>תיקון מידע לא מדויק</li>
                            <li>מחיקת המידע שלך (בכפוף למגבלות חוקיות)</li>
                            <li>התנגדות לעיבוד המידע שלך</li>
                            <li>קבלת עותק של המידע שלך</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">6. קובצי Cookie</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>אנו משתמשים בקובצי Cookie לשיפור חווית המשתמש</li>
                            <li>ניתן להגדיר את הדפדפן שלך לדחות קובצי Cookie</li>
                            <li>דחיית קובצי Cookie עשויה להשפיע על פונקציונליות מסוימת</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">7. זכויות תמונה</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>הצלמים שומרים על זכויות היוצרים של התמונות שלהם</li>
                            <li>מארחי האירועים מקבלים רישיון שימוש אישי בתמונות</li>
                            <li>שימוש מסחרי בתמונות דורש הסכמה נפרדת מהצלם</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">8. אבטחת מידע של קטינים</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            השירות שלנו אינו מיועד לאנשים מתחת לגיל 18. איננו אוספים ביודעין מידע אישי מקטינים. אם התגלה שנאסף מידע מקטין, נמחק אותו מיידית.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">9. עדכונים למדיניות הפרטיות</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            אנו עשויים לעדכן מדיניות זו מעת לעת. נודיע למשתמשים על שינויים משמעותיים באמצעות הודעה באתר או דואר אלקטרוני. המשך השימוש בשירות לאחר שינויים מהווה הסכמה למדיניות המעודכנת.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">10. יצירת קשר בנושאי פרטיות</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            לשאלות או חששות בנוגע למדיניות הפרטיות שלנו או לאופן הטיפול במידע שלך, אנא צרו קשר עם ממונה הגנת הפרטיות שלנו בכתובת [הכנס דוא"ל].
                        </p>
                    </section>
                </div>

                <div class="flex justify-center mt-8">
                    <button onClick={() => router.push("/contact")} class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
                        צור קשר
                    </button>
                </div>
            </div>
        </DirectionProvider>
    );
};

export default TermsPage;
