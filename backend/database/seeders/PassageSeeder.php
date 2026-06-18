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

            // ── N3 文法読解 passages ─────────────────────────────────────────────
            [
                'level' => 'N3',
                'title' => '[文法読解-もんだい３-1] 図書館の新サービス',
                'content' => "市立図書館では、来月から新しいサービスを Ⓐ 予定です。インターネットで本を予約すると、自宅まで Ⓑ ことができるようになります。利用するには、図書館カードが必要です。",
            ],
            [
                'level' => 'N3',
                'title' => '[文法読解-もんだい３-2] 健康的な食生活',
                'content' => "最近、若い人の間でも健康に Ⓐ 関心が高まっています。野菜や果物を多く食べ、油の Ⓑ 料理を減らすことが、健康維持に大切だと言われています。",
            ],
            [
                'level' => 'N3',
                'title' => '[文法読解-もんだい４] 日本の季節と行事',
                'content' => "日本には四季があり、それぞれの季節にさまざまな行事があります。春には花見、夏には花火大会、秋には紅葉狩り、冬にはスキーなど、季節ごとに楽しみ方があります。\n\nこのような季節の行事は、家族や友人と一緒に過ごす大切な機会でもあります。近年、外国からの観光客もこれらの行事を楽しむために日本を訪れるようになりました。",
            ],
            [
                'level' => 'N3',
                'title' => '[文法読解-もんだい５] スマートフォンと現代生活',
                'content' => "スマートフォンは現代生活に欠かせない存在となっています。地図アプリで道を調べたり、SNSで友人と連絡を取り合ったり、ショッピングアプリで買い物をしたりと、様々な場面で活用されています。\n\nしかし、スマートフォンの使いすぎも問題となっています。特に、食事中や歩きながらの使用は危険であり、睡眠の質を下げることも指摘されています。\n\n便利な道具を上手に使うためには、使う時間や場所をある程度自分でコントロールすることが大切です。デジタル機器と上手に付き合っていく方法を考えることが、現代人に求められています。",
            ],
            [
                'level' => 'N3',
                'title' => '[文法読解-もんだい６] 市民プールの利用案内',
                'content' => "市民プール　夏季利用案内\n\n【開設期間】7月1日（月）〜8月31日（土）\n【開館時間】午前9時〜午後5時（最終入場は午後4時30分）\n【定休日】毎週火曜日\n\n【料金】\n・一般（中学生以上）：400円\n・小学生：150円\n・未就学児：無料（保護者同伴に限る）\n\n【注意事項】\n・水着と水泳帽の着用が必要です\n・飲食は指定エリアでのみ可能です\n・6歳以下のお子様は保護者と一緒に入場してください",
            ],

            // ── N2 文法読解 passages ─────────────────────────────────────────────
            [
                'level' => 'N2',
                'title' => '[文法読解-もんだい３-1] 環境問題への取り組み',
                'content' => "近年、地球温暖化への対策として、再生可能エネルギーの普及が Ⓐ 進められています。太陽光や風力などのエネルギーは、化石燃料と Ⓑ 異なり、使用しても二酸化炭素を排出しないため、注目を集めています。",
            ],
            [
                'level' => 'N2',
                'title' => '[文法読解-もんだい３-2] テレワークの普及',
                'content' => "コロナ禍をきっかけに、テレワークが急速に Ⓐ 広まりました。通勤時間がなくなる Ⓑ 、仕事と家庭のバランスが取りやすくなったと感じる人が増えた一方、孤独感や運動不足を訴える声もあります。",
            ],
            [
                'level' => 'N2',
                'title' => '[文法読解-もんだい４] 読書の効果',
                'content' => "読書は単に知識を得るだけでなく、さまざまな効果があると言われています。物語を読むことで、登場人物の気持ちを想像する力、いわゆる「共感力」が高まるという研究結果があります。\n\nまた、読書は集中力を養い、語彙力を増やす効果もあります。特に、多様な文体や表現に触れることで、自分の考えを表現する力も自然と身につくとされています。デジタル機器が普及した現代においても、読書の価値は変わらないと言えるでしょう。",
            ],
            [
                'level' => 'N2',
                'title' => '[文法読解-もんだい５] 地方移住の現状と課題',
                'content' => "近年、都市部から地方への移住者が増加しています。テレワークの普及により、必ずしも都市に住む必要がなくなったことや、自然豊かな環境での生活を求める人が増えたことが背景にあります。\n\n地方自治体も移住者を呼び込もうと、住宅補助や子育て支援などの施策を充実させています。しかし、実際に移住した人の中には、地域コミュニティへの溶け込みの難しさや、医療・教育施設の不足を課題として挙げる人も少なくありません。\n\n移住を成功させるためには、事前に現地を十分に体験する機会を設けることや、移住後のサポート体制を整えることが重要だと考えられています。",
            ],
            [
                'level' => 'N2',
                'title' => '[文法読解-もんだい６] 講演会のご案内',
                'content' => "【講演会のご案内】\n\nテーマ：「AI時代のキャリアデザイン」\n日時：2024年10月15日（火）18:30〜20:30（開場18:00）\n会場：市民文化センター 大ホール（定員300名）\n参加費：一般 1,000円／学生 500円\n\n【申込方法】\n公式ウェブサイトまたはお電話にて受付中\n締め切り：10月10日（木）17:00まで\n\n【注意事項】\n・定員に達し次第、申込を締め切ります\n・当日は学生証または社員証をご持参ください\n・駐車場は有料です。公共交通機関をご利用ください",
            ],

            // ── N1 文法読解 passages ─────────────────────────────────────────────
            [
                'level' => 'N1',
                'title' => '[文法読解-もんだい３-1] 少子化対策の方向性',
                'content' => "少子化を食い止めるためには、経済的支援だけでは Ⓐ 不十分であり、働き方改革や保育施設の拡充など、複合的な取り組みが Ⓑ 求められています。特に、男性の育児参加を促すための制度整備が急務とされています。",
            ],
            [
                'level' => 'N1',
                'title' => '[文法読解-もんだい３-2] 科学技術と倫理',
                'content' => "ゲノム編集技術の進歩は医療に革命をもたらす Ⓐ 可能性を持つ一方、倫理的な懸念も Ⓑ 払拭できないでいます。技術の恩恵を享受しつつ、どのように規制の枠組みを設けるかが国際社会における共通の課題となっています。",
            ],
            [
                'level' => 'N1',
                'title' => '[文法読解-もんだい４] 言語と思考の関係',
                'content' => "言語は単なるコミュニケーションの道具ではなく、思考そのものを形成するという考え方がある。「サピア＝ウォーフ仮説」として知られるこの理論は、人が使う言語によって世界の認識の仕方が異なると主張する。\n\n例えば、色彩語の豊富な言語を使う人は色の違いをより細かく知覚できるという研究もある。一方で、言語の違いが思考に与える影響は限定的だとする反論も根強い。この問いに対する明確な答えはまだ出ていないが、言語と思考の相互作用は認知科学において重要な研究テーマであり続けている。",
            ],
            [
                'level' => 'N1',
                'title' => '[文法読解-もんだい５] 都市化と伝統文化の保存',
                'content' => "急速な都市化と経済のグローバル化は、世界各地の伝統文化に深刻な影響を与えてきた。地方の過疎化により、伝統工芸や民俗芸能の担い手が減少し、消滅の危機に瀕しているものも少なくない。\n\n一方で、デジタル技術の活用によって、伝統文化を記録・保存し、広く発信する試みも広がっている。動画共有サービスを通じて海外に紹介されたことで注目を集め、観光資源として地域振興につながった事例もある。\n\nしかし、記録することと実際に継承することの間には大きな隔たりがある。文化とは本来、生活の中で実践され、次世代に生きた形で伝えられてこそ意味を持つ。保存と継承のバランスをいかに取るかが、文化政策における核心的な課題と言えよう。",
            ],
            [
                'level' => 'N1',
                'title' => '[文法読解-もんだい６] 国際シンポジウムのプログラム',
                'content' => "【国際シンポジウム：持続可能な社会の構築に向けて】\n\n日時：2024年11月20日（水）・21日（木）各日10:00〜17:30\n会場：国際会議場 第一会議室（定員150名）\n参加費：研究者・実務家 8,000円／大学院生 3,000円／学部生 無料\n\n【プログラム概要（11月20日）】\n10:00 開会挨拶\n10:30 基調講演「気候変動と経済政策の交差点」\n13:00 パネルディスカッション「再生可能エネルギーの社会実装」\n16:00 ポスター発表\n\n【注意事項】\n・事前登録制です。当日参加は受け付けておりません\n・発表要旨集は参加登録後にウェブサイトからダウンロードできます\n・通訳（日英）は基調講演のみ提供されます",
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
