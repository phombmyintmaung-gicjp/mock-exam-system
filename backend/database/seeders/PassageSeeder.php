<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PassageSeeder extends Seeder
{
    public function run(): void
    {
        $passages = [
            // ── N5 standalone reading ───────────────────────────────────────────
            [
                'level' => 'N5',
                'title' => 'My Daily Routine',
                'content' => "My name is Tanaka Yuki. I wake up at 7 o'clock every morning. First, I wash my face and brush my teeth. Then I eat breakfast. I usually eat rice and miso soup.\n\nAfter breakfast, I go to school by bus. School starts at 8:30. I study Japanese, math, and science. I eat lunch at school with my friends.\n\nI come home at 4 o'clock. I do my homework and then watch TV. I eat dinner with my family at 7 o'clock. I go to bed at 10 o'clock.",
            ],
            [
                'level' => 'N5',
                'title' => 'My Family',
                'content' => "I have a small family. There are four people: my father, my mother, my younger sister, and me.\n\nMy father is 42 years old. He works at a company in Tokyo. He comes home late every day. My mother is 40 years old. She works at a hospital as a nurse. My sister is 10 years old. She is in elementary school.\n\nWe live in Yokohama. Our house is small, but I like it very much.",
            ],
            // ── N5 文法読解 passages ─────────────────────────────────────────────
            [
                'level' => 'N5',
                'title' => '[文法読解-もんだい３-1] わたしの まいにち',
                'content' => "わたしは まいあさ 7じ Ⓐ おきます。そして、かおを あらって、あさごはん Ⓑ たべます。8じ ごろ バス で がっこうに いきます。ひるごはんは ともだち と たべます。",
            ],
            [
                'level' => 'N5',
                'title' => '[文法読解-もんだい３-2] 日本語の べんきょう',
                'content' => "わたしは 3ねん まえ Ⓐ 日本語を べんきょう はじめました。はじめは とても むずかしかった Ⓑ 、いまは すこし はなせます。まいにち れんしゅうすることが たいせつだと おもいます。",
            ],
            [
                'level' => 'N5',
                'title' => '[文法読解-もんだい４] わたしの しゅみ',
                'content' => "わたしの しゅみは しゃしんを とることです。まいしゅう こうえんや やまへ いって、きれいな けしきを とります。さいきん、あたらしい カメラを かいました。とても つかいやすくて、きにいっています。\n\nともだちに しゃしんを みせると、「じょうずだね」と いってくれます。それが とても うれしいです。これからも もっと じょうずに なりたいと おもっています。",
            ],
            [
                'level' => 'N5',
                'title' => '[文法読解-もんだい５] 日本の きせつ',
                'content' => "日本には はる・なつ・あき・ふゆの 4つの きせつが あります。それぞれの きせつに とくちょうが あります。\n\nはるには きれいな さくらが さきます。あたたかくなって、そとで あそぶのに とても いい きせつです。なつは とても あつく、うみや プールに いく ひとが おおいです。\n\nあきは たべものが おいしく、もみじが きれいです。ふゆは さむいですが、ゆきを みることが できます。\n\n日本に きたら、ぜひ すべての きせつを たのしんで みてください。",
            ],
            [
                'level' => 'N5',
                'title' => '[文法読解-もんだい６] プールの おしらせ',
                'content' => "なつ プールの おしらせ\n\nとき：7月20日（土）〜8月31日（日）\nじかん：午前10時〜午後6時\nきゅうかん：毎週月曜日\nりょうきん：おとな 500えん、こども 200えん\n\n・みずぎを きて おいでください。\n・プールの なかで たべものを たべないでください。\n・こども（6さい いか）は おとなと いっしょに はいって ください。",
            ],

            // ── N4 standalone reading ───────────────────────────────────────────
            [
                'level' => 'N4',
                'title' => 'Learning Japanese',
                'content' => "I started learning Japanese two years ago. At first, it was very difficult because the writing system was completely different from my native language. I had to learn three scripts: hiragana, katakana, and kanji.\n\nI studied for about two hours every day. I used textbooks and also watched Japanese anime with subtitles. Listening to natural Japanese conversations helped me understand the language better.\n\nNow I can read simple newspapers and have basic conversations with Japanese people. My goal is to pass the JLPT N3 exam next year.",
            ],
            [
                'level' => 'N4',
                'title' => 'A Trip to Kyoto',
                'content' => "Last spring, I visited Kyoto with my family. Kyoto is an old city in western Japan and is famous for its temples, shrines, and traditional culture.\n\nWe stayed there for three days. On the first day, we visited Kinkaku-ji, the Golden Pavilion. We also walked around Arashiyama, where there is a famous bamboo forest.\n\nOn the second day, we went to Fushimi Inari Shrine. There are thousands of red torii gates, and it took about two hours to walk to the top of the mountain.",
            ],
            // ── N4 文法読解 passages ─────────────────────────────────────────────
            [
                'level' => 'N4',
                'title' => '[文法読解-もんだい３-1] 図書館の りようほうほう',
                'content' => "このとしょかんでは、だれでも本を かりること Ⓐ できます。かりるには、としょかんカードが ひつようです。カード Ⓑ つくりかたは、うけつけで きいてください。",
            ],
            [
                'level' => 'N4',
                'title' => '[文法読解-もんだい４] けんこうのための うんどう',
                'content' => "けんこうを たもつために、まいにち すこしの うんどうを することが すすめられています。たとえば、エレベーターの かわりに かいだんを つかったり、ひとつ まえの えきで おりて あるいたりする だけでも、ずいぶん ちがいます。\n\nむりをせず、つづけることが たいせつです。",
            ],
            [
                'level' => 'N4',
                'title' => '[文法読解-もんだい５] アルバイトの けいけん',
                'content' => "わたしは だいがくに はいってから、カフェで アルバイトを はじめました。さいしょは ミスが おおくて、せんぱいに よく おこられました。\n\nしかし、3かげつ たつと だいぶ なれてきて、きゃくさんに ほめられることも ふえました。アルバイトを とおして、しごとの たいへんさと、ひとと はなすことの たのしさを まなびました。この けいけんは わたしの たからものです。",
            ],
            [
                'level' => 'N4',
                'title' => '[文法読解-もんだい６] カルチャーセンターのおしらせ',
                'content' => "カルチャーセンター　秋のこうざ　ご案内\n\n【料理こうざ】毎週水曜日　午後2時〜4時　月4回　5,000円\n【えいかいわ】毎週金曜日　午前10時〜12時　月4回　6,000円\n【水彩画】毎週土曜日　午後1時〜3時　月4回　4,000円\n\n※10月1日（月）〜申し込み受付開始\n※定員になり次第、締め切ります\n※お問い合わせ：TEL 045-XXX-XXXX",
            ],

            // ── N3 standalone reading ───────────────────────────────────────────
            [
                'level' => 'N3',
                'title' => 'The Importance of Sleep',
                'content' => "In recent years, research has shown that sleep is essential not only for physical health but also for mental performance. During sleep, the brain processes and stores the information gathered throughout the day. A lack of sleep can lead to decreased concentration, poor memory, and slower reaction times.\n\nHealth experts recommend that adults get between seven and nine hours of sleep per night. Simple habits such as setting a regular sleep schedule, avoiding screens before bedtime, and keeping the bedroom cool and dark can significantly improve sleep quality.",
            ],
            [
                'level' => 'N3',
                'title' => 'Convenience Stores in Japan',
                'content' => "Convenience stores, known as konbini in Japanese, are a fundamental part of daily life in Japan. There are over 55,000 convenience stores across the country. In addition to food and beverages, customers can pay utility bills, buy concert tickets, send packages, use ATMs, and even print documents.\n\nThe food selection is particularly impressive. Fresh onigiri, sandwiches, hot soups, and bento boxes are prepared daily. Convenience stores are open 24 hours a day, 365 days a year.",
            ],

            // ── N2 standalone reading ───────────────────────────────────────────
            [
                'level' => 'N2',
                'title' => 'Remote Work and Urban Migration',
                'content' => "The widespread adoption of remote work during the pandemic triggered a significant shift in residential patterns across Japan. As employees were no longer required to commute to offices in major metropolitan areas, many chose to relocate to suburban or rural regions.\n\nThis movement had complex consequences for both urban and rural communities. Cities like Tokyo initially experienced a decline in population. Rural municipalities that had been struggling with depopulation found new opportunities in attracting remote workers through subsidies and incentives.",
            ],
            [
                'level' => 'N2',
                'title' => 'The Revival of Traditional Crafts',
                'content' => "Japan\'s traditional crafts faced extinction in the postwar period as mass production made handmade goods economically uncompetitive. In recent years, a counter-movement has emerged with young artisans reviving traditional techniques, often combining them with contemporary aesthetics.\n\nOnline platforms and social media have played a crucial role by connecting craftspeople directly with customers both domestically and internationally. Government programmes have also provided support through subsidies for training and international exhibitions.",
            ],

            // ── N1 standalone reading ───────────────────────────────────────────
            [
                'level' => 'N1',
                'title' => 'The Ethics of Artificial Intelligence',
                'content' => "The rapid advancement of artificial intelligence has raised profound ethical questions. Central among these concerns is algorithmic bias — the tendency of AI systems trained on historical data to perpetuate and amplify existing social inequities. Many state-of-the-art AI models operate as black boxes whose internal decision-making processes are opaque even to their creators.\n\nAchieving meaningful international coordination on AI governance remains elusive, as nations have divergent interests and philosophies. What remains clear is that deployment of AI systems requires ongoing engagement from ethicists, legal scholars, affected communities, and policymakers.",
            ],
            [
                'level' => 'N1',
                'title' => 'Demographic Decline and Economic Policy',
                'content' => "Japan\'s demographic trajectory presents one of the most formidable structural challenges in the developed world. With a total fertility rate persistently below the replacement threshold and a rapidly ageing population, the country faces compounding pressures on its labour market and social security systems.\n\nImmigration remains politically contentious. While Japan has cautiously expanded its guest worker programmes, the scale of inflows necessary to offset natural population decline far exceeds what current policy permits. Technological substitution through robotics offers a partial countermeasure, but productivity gains are unlikely to fully compensate for the contraction of the working-age population.",
            ],
        ];

        foreach ($passages as $p) {
            DB::table('passages')->insertOrIgnore(array_merge($p, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
