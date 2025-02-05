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
                    תנאי השירות
                </h1>

                <p class="text-sm text-gray-600 mb-4 text-center">
                    עודכן לאחרונה: 05.02.2025
                </p>

                <p class="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                    ברוכים הבאים ל-Tsalamim, שוק מקוון המחבר בין מארחי אירועים לצלמים מתחילים. באמצעות גישה או שימוש בפלטפורמה שלנו, אתה מסכים להיות מחויב לתנאי השירות הבאים. אנא קרא אותם בעיון.
                </p>

                <div class="space-y-8">
                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">1. קבלת התנאים</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            באמצעות השימוש ב-Tsalamim, אתה מאשר כי קראת, הבנת ומסכים לתנאים אלה. אם אינך מסכים, אנא הימנע משימוש בשירותינו.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">2. השירותים המסופקים</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            Tsalamim מאפשרת חיבורים בין מארחי אירועים המחפשים שירותי צילום וצלמים המחפשים לצבור ניסיון. איננו מעסיקים צלמים אלא מספקים פלטפורמה להזמנות ותקשורת.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">3. חשבונות משתמשים</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>משתמשים חייבים ליצור חשבון כדי לגשת לתכונות מסוימות.</li>
                            <li>אתה אחראי לשמירה על סודיות פרטי ההתחברות שלך.</li>
                            <li>Tsalamim שומרת לעצמה את הזכות להשעות או לסיים חשבונות המפרים תנאים אלה.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">4. תהליך הזמנת אירוע</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>מארחי אירועים מפרסמים את פרטי האירוע שלהם ומספקים פרטי תשלום בעת ההגשה.</li>
                            <li>צלמים יכולים לסקור ולקבל עבודות זמינות.</li>
                            <li>ברגע שצלם מותאם, שני הצדדים מקבלים פרטי התקשרות.</li>
                            <li>Tsalamim מעבדת את התשלום ברקע ברגע שהעבודה מתקבלת.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">5. אחריות הצלם</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>הצלמים מסכימים לספק שירות מקצועי ובזמן.</li>
                            <li>יש להעלות תמונות תוך 24 שעות מהאירוע.</li>
                            <li>לא נדרשת עריכה או אוצרות לאחר הצילום; יש להעלות את התמונות כפי שצולמו.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">6. תשלום והחזרים</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>מארחי אירועים מחויבים ברגע שמותאם צלם.</li>
                            <li>צלמים מקבלים תשלום לאחר העלאה מוצלחת והשלמת האירוע.</li>
                            <li>החזרים ניתנים רק במקרים של כשל בשירות או ביטול לפי שיקול דעתה של Tsalamim.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">7. התנהגות משתמשים</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>משתמשים חייבים לספק מידע מדויק ולתקשר בכבוד.</li>
                            <li>כל ניסיון לעקוף את פלטפורמת Tsalamim להזמנות ישירות יגרור השעיית חשבון.</li>
                            <li>שימוש לרעה, הונאה או התנהגות פוגענית לא יתקבלו.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">8. אחריות והסתייגויות</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>Tsalamim אינה אחראית לאיכות שירותי הצילום המסופקים.</li>
                            <li>איננו מבטיחים זמינות או התאמה של צלמים.</li>
                            <li>Tsalamim אינה אחראית לכל מחלוקת העולה בין משתמשים.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">9. אחסון וגישה לתמונות</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>התמונות זמינות להורדה למשך 30 יום לאחר ההעלאה.</li>
                            <li>Tsalamim אינה אחראית לתמונות שאבדו או נמחקו מעבר לתקופה זו.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">10. ביטולים ואי-הופעה</h2>
                        <ul class="list-disc pr-6 text-gray-700 space-y-2">
                            <li>מארחי אירועים יכולים לבטל אירועים לפני התאמת צלם לקבלת החזר מלא.</li>
                            <li>אם צלם מבטל ברגע האחרון, Tsalamim תנסה למצוא מחליף.</li>
                            <li>אי-הופעה לאירוע עלולה לגרור קנסות או השעיית חשבון.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">11. שינויים בתנאים</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            Tsalamim עשויה לשנות תנאים אלה בכל עת. משתמשים יקבלו הודעה על שינויים משמעותיים, והמשך השימוש בפלטפורמה מהווה הסכמה לתנאים המעודכנים.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold text-indigo-700 mb-3">12. פרטי התקשרות</h2>
                        <p class="text-base text-gray-700 leading-relaxed">
                            לכל שאלה או בירור בנוגע לתנאים אלה, אנא צרו קשר.
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
