<?php

namespace Database\Seeders;

use App\Models\Flashcard;
use Illuminate\Database\Seeder;

class FlashcardSeeder extends Seeder
{
    public function run(): void
    {
        Flashcard::truncate();

        $cards = [

            // ─── N5 KANJI ───────────────────────────────────────────────────
            ['type'=>'kanji','level'=>'N5','front'=>'日','reading'=>'にち・ひ','meaning'=>'day, sun','example_sentence'=>'{今日|きょう}はいい{日|ひ}ですね。','example_translation'=>'Today is a nice day, isn\'t it?'],
            ['type'=>'kanji','level'=>'N5','front'=>'本','reading'=>'ほん','meaning'=>'book, origin','example_sentence'=>'この{本|ほん}はおもしろいです。','example_translation'=>'This book is interesting.'],
            ['type'=>'kanji','level'=>'N5','front'=>'人','reading'=>'ひと・じん','meaning'=>'person, people','example_sentence'=>'あの{人|ひと}はだれですか。','example_translation'=>'Who is that person?'],
            ['type'=>'kanji','level'=>'N5','front'=>'山','reading'=>'やま','meaning'=>'mountain','example_sentence'=>'{富士山|ふじさん}はきれいです。','example_translation'=>'Mt. Fuji is beautiful.'],
            ['type'=>'kanji','level'=>'N5','front'=>'水','reading'=>'みず','meaning'=>'water','example_sentence'=>'{水|みず}を{一杯|いっぱい}ください。','example_translation'=>'Please give me a glass of water.'],
            ['type'=>'kanji','level'=>'N5','front'=>'火','reading'=>'ひ','meaning'=>'fire','example_sentence'=>'{火|ひ}に{気|き}をつけてください。','example_translation'=>'Please be careful with fire.'],
            ['type'=>'kanji','level'=>'N5','front'=>'木','reading'=>'き','meaning'=>'tree, wood','example_sentence'=>'{公園|こうえん}に{木|き}がたくさんあります。','example_translation'=>'There are many trees in the park.'],
            ['type'=>'kanji','level'=>'N5','front'=>'金','reading'=>'きん・かね','meaning'=>'gold, money','example_sentence'=>'お{金|かね}がありません。','example_translation'=>'I have no money.'],
            ['type'=>'kanji','level'=>'N5','front'=>'月','reading'=>'つき・がつ','meaning'=>'moon, month','example_sentence'=>'{今夜|こんや}の{月|つき}は{明|あか}るいです。','example_translation'=>'The moon tonight is bright.'],
            ['type'=>'kanji','level'=>'N5','front'=>'年','reading'=>'とし・ねん','meaning'=>'year','example_sentence'=>'{今年|ことし}は{何年|なんねん}ですか。','example_translation'=>'What year is this year?'],
            ['type'=>'kanji','level'=>'N5','front'=>'大','reading'=>'おお・だい','meaning'=>'big, large','example_sentence'=>'{大|おお}きい{犬|いぬ}ですね。','example_translation'=>'That is a big dog.'],
            ['type'=>'kanji','level'=>'N5','front'=>'小','reading'=>'ちい・しょう','meaning'=>'small, little','example_sentence'=>'{小|ちい}さい{子|こ}どもが{遊|あそ}んでいます。','example_translation'=>'A small child is playing.'],
            ['type'=>'kanji','level'=>'N5','front'=>'上','reading'=>'うえ・じょう','meaning'=>'above, up','example_sentence'=>'{机|つくえ}の{上|うえ}に{本|ほん}があります。','example_translation'=>'There is a book on the desk.'],
            ['type'=>'kanji','level'=>'N5','front'=>'下','reading'=>'した・か','meaning'=>'below, down','example_sentence'=>'{椅子|いす}の{下|した}に{猫|ねこ}がいます。','example_translation'=>'There is a cat under the chair.'],
            ['type'=>'kanji','level'=>'N5','front'=>'口','reading'=>'くち','meaning'=>'mouth','example_sentence'=>'{口|くち}を{開|あ}けてください。','example_translation'=>'Please open your mouth.'],

            // ─── N5 VOCAB ───────────────────────────────────────────────────
            ['type'=>'vocab','level'=>'N5','front'=>'食べる','reading'=>'たべる','meaning'=>'to eat','example_sentence'=>'{毎朝|まいあさ}ご{飯|はん}を{食|た}べます。','example_translation'=>'I eat rice every morning.'],
            ['type'=>'vocab','level'=>'N5','front'=>'飲む','reading'=>'のむ','meaning'=>'to drink','example_sentence'=>'{水|みず}をたくさん{飲|の}んでください。','example_translation'=>'Please drink a lot of water.'],
            ['type'=>'vocab','level'=>'N5','front'=>'行く','reading'=>'いく','meaning'=>'to go','example_sentence'=>'{学校|がっこう}に{行|い}きます。','example_translation'=>'I go to school.'],
            ['type'=>'vocab','level'=>'N5','front'=>'来る','reading'=>'くる','meaning'=>'to come','example_sentence'=>'{友達|ともだち}が{来|き}ました。','example_translation'=>'My friend came.'],
            ['type'=>'vocab','level'=>'N5','front'=>'見る','reading'=>'みる','meaning'=>'to see, to watch','example_sentence'=>'テレビを{見|み}ます。','example_translation'=>'I watch TV.'],
            ['type'=>'vocab','level'=>'N5','front'=>'聞く','reading'=>'きく','meaning'=>'to listen, to ask','example_sentence'=>'{音楽|おんがく}を{聞|き}きます。','example_translation'=>'I listen to music.'],
            ['type'=>'vocab','level'=>'N5','front'=>'話す','reading'=>'はなす','meaning'=>'to speak, to talk','example_sentence'=>'{日本語|にほんご}で{話|はな}してください。','example_translation'=>'Please speak in Japanese.'],
            ['type'=>'vocab','level'=>'N5','front'=>'書く','reading'=>'かく','meaning'=>'to write','example_sentence'=>'{名前|なまえ}を{書|か}いてください。','example_translation'=>'Please write your name.'],
            ['type'=>'vocab','level'=>'N5','front'=>'読む','reading'=>'よむ','meaning'=>'to read','example_sentence'=>'{毎日|まいにち}{本|ほん}を{読|よ}みます。','example_translation'=>'I read books every day.'],
            ['type'=>'vocab','level'=>'N5','front'=>'買う','reading'=>'かう','meaning'=>'to buy','example_sentence'=>'スーパーで{野菜|やさい}を{買|か}います。','example_translation'=>'I buy vegetables at the supermarket.'],
            ['type'=>'vocab','level'=>'N5','front'=>'大きい','reading'=>'おおきい','meaning'=>'big, large','example_sentence'=>'{大|おお}きいりんごを{食|た}べました。','example_translation'=>'I ate a big apple.'],
            ['type'=>'vocab','level'=>'N5','front'=>'小さい','reading'=>'ちいさい','meaning'=>'small, little','example_sentence'=>'{小|ちい}さい{箱|はこ}に{入|い}れてください。','example_translation'=>'Please put it in the small box.'],
            ['type'=>'vocab','level'=>'N5','front'=>'新しい','reading'=>'あたらしい','meaning'=>'new','example_sentence'=>'{新|あたら}しい{車|くるま}を{買|か}いました。','example_translation'=>'I bought a new car.'],
            ['type'=>'vocab','level'=>'N5','front'=>'古い','reading'=>'ふるい','meaning'=>'old (things)','example_sentence'=>'{古|ふる}い{建物|たてもの}が{好|す}きです。','example_translation'=>'I like old buildings.'],
            ['type'=>'vocab','level'=>'N5','front'=>'高い','reading'=>'たかい','meaning'=>'high, expensive','example_sentence'=>'このレストランは{高|たか}いです。','example_translation'=>'This restaurant is expensive.'],

            // ─── N5 GRAMMAR ─────────────────────────────────────────────────
            ['type'=>'grammar','level'=>'N5','front'=>'～は～です','reading'=>null,'meaning'=>'[Topic] is [X] — basic copula','example_sentence'=>'{私|わたし}は{学生|がくせい}です。','example_translation'=>'I am a student.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～が好きです','reading'=>null,'meaning'=>'to like [something]','example_sentence'=>'{音楽|おんがく}が{好|す}きです。','example_translation'=>'I like music.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～てください','reading'=>null,'meaning'=>'Please do ~ (polite request)','example_sentence'=>'ゆっくり{話|はな}してください。','example_translation'=>'Please speak slowly.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～ています','reading'=>null,'meaning'=>'is doing ~ / ongoing state','example_sentence'=>'{今|いま}、{雨|あめ}が{降|ふ}っています。','example_translation'=>'It is raining now.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～たいです','reading'=>null,'meaning'=>'I want to do ~','example_sentence'=>'{日本|にほん}に{行|い}きたいです。','example_translation'=>'I want to go to Japan.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～ませんか','reading'=>null,'meaning'=>'Shall we ~? (invitation)','example_sentence'=>'{一緒|いっしょ}に{映画|えいが}を{見|み}ませんか。','example_translation'=>'Shall we watch a movie together?'],
            ['type'=>'grammar','level'=>'N5','front'=>'～も','reading'=>null,'meaning'=>'also, too (addition)','example_sentence'=>'{私|わたし}も{日本語|にほんご}を{勉強|べんきょう}しています。','example_translation'=>'I am also studying Japanese.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～より','reading'=>null,'meaning'=>'than ~ (comparison)','example_sentence'=>'バスより{電車|でんしゃ}の{方|ほう}が{速|はや}いです。','example_translation'=>'The train is faster than the bus.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～に行きます','reading'=>null,'meaning'=>'to go to [place] / to go in order to do ~','example_sentence'=>'{買|か}い{物|もの}に{行|い}きます。','example_translation'=>'I am going shopping.'],
            ['type'=>'grammar','level'=>'N5','front'=>'～から','reading'=>null,'meaning'=>'because ~ / from ~ (reason or starting point)','example_sentence'=>'{忙|いそが}しいから、{行|い}けません。','example_translation'=>'I cannot go because I am busy.'],

            // ─── N4 KANJI ───────────────────────────────────────────────────
            ['type'=>'kanji','level'=>'N4','front'=>'駅','reading'=>'えき','meaning'=>'station','example_sentence'=>'{駅|えき}まで{歩|ある}きましょう。','example_translation'=>'Let\'s walk to the station.'],
            ['type'=>'kanji','level'=>'N4','front'=>'電','reading'=>'でん','meaning'=>'electricity, telegram','example_sentence'=>'{電車|でんしゃ}で{通勤|つうきん}しています。','example_translation'=>'I commute by train.'],
            ['type'=>'kanji','level'=>'N4','front'=>'車','reading'=>'くるま・しゃ','meaning'=>'car, vehicle','example_sentence'=>'{車|くるま}で{行|い}きましょう。','example_translation'=>'Let\'s go by car.'],
            ['type'=>'kanji','level'=>'N4','front'=>'道','reading'=>'みち・どう','meaning'=>'road, way, path','example_sentence'=>'この{道|みち}をまっすぐ{行|い}ってください。','example_translation'=>'Please go straight along this road.'],
            ['type'=>'kanji','level'=>'N4','front'=>'週','reading'=>'しゅう','meaning'=>'week','example_sentence'=>'{来週|らいしゅう}、{試験|しけん}があります。','example_translation'=>'There is an exam next week.'],
            ['type'=>'kanji','level'=>'N4','front'=>'間','reading'=>'あいだ・かん','meaning'=>'between, interval, time','example_sentence'=>'{二時間|にじかん}{待|ま}ちました。','example_translation'=>'I waited for two hours.'],
            ['type'=>'kanji','level'=>'N4','front'=>'国','reading'=>'くに・こく','meaning'=>'country, nation','example_sentence'=>'あなたの{国|くに}はどこですか。','example_translation'=>'What country are you from?'],
            ['type'=>'kanji','level'=>'N4','front'=>'開','reading'=>'ひら・かい','meaning'=>'open','example_sentence'=>'ドアを{開|あ}けてください。','example_translation'=>'Please open the door.'],
            ['type'=>'kanji','level'=>'N4','front'=>'閉','reading'=>'し・へい','meaning'=>'close, shut','example_sentence'=>'{窓|まど}を{閉|し}めてください。','example_translation'=>'Please close the window.'],
            ['type'=>'kanji','level'=>'N4','front'=>'急','reading'=>'いそ・きゅう','meaning'=>'hurry, sudden','example_sentence'=>'{急|いそ}いで{来|き}てください。','example_translation'=>'Please come quickly.'],
            ['type'=>'kanji','level'=>'N4','front'=>'重','reading'=>'おも・じゅう','meaning'=>'heavy, important','example_sentence'=>'この{荷物|にもつ}は{重|おも}いです。','example_translation'=>'This luggage is heavy.'],
            ['type'=>'kanji','level'=>'N4','front'=>'度','reading'=>'ど','meaning'=>'degree, time (occurrences)','example_sentence'=>'もう{一度|いちど}{言|い}ってください。','example_translation'=>'Please say it one more time.'],
            ['type'=>'kanji','level'=>'N4','front'=>'図','reading'=>'ず・と','meaning'=>'figure, diagram, map','example_sentence'=>'{地図|ちず}を{見|み}てください。','example_translation'=>'Please look at the map.'],
            ['type'=>'kanji','level'=>'N4','front'=>'地','reading'=>'ち','meaning'=>'ground, earth','example_sentence'=>'この{地域|ちいき}は{自然|しぜん}が{豊|ゆた}かです。','example_translation'=>'This area is rich in nature.'],
            ['type'=>'kanji','level'=>'N4','front'=>'初','reading'=>'はじ・しょ','meaning'=>'first, beginning','example_sentence'=>'{初|はじ}めて{日本|にほん}を{訪|おとず}れました。','example_translation'=>'I visited Japan for the first time.'],

            // ─── N4 VOCAB ───────────────────────────────────────────────────
            ['type'=>'vocab','level'=>'N4','front'=>'残念','reading'=>'ざんねん','meaning'=>'unfortunate, regrettable','example_sentence'=>'{行|い}けなくて{残念|ざんねん}です。','example_translation'=>'It is unfortunate that I cannot go.'],
            ['type'=>'vocab','level'=>'N4','front'=>'丁寧','reading'=>'ていねい','meaning'=>'polite, careful','example_sentence'=>'{丁寧|ていねい}に{話|はな}してください。','example_translation'=>'Please speak politely.'],
            ['type'=>'vocab','level'=>'N4','front'=>'便利','reading'=>'べんり','meaning'=>'convenient, handy','example_sentence'=>'スマホはとても{便利|べんり}です。','example_translation'=>'Smartphones are very convenient.'],
            ['type'=>'vocab','level'=>'N4','front'=>'特別','reading'=>'とくべつ','meaning'=>'special, particular','example_sentence'=>'{今日|きょう}は{特別|とくべつ}な{日|ひ}です。','example_translation'=>'Today is a special day.'],
            ['type'=>'vocab','level'=>'N4','front'=>'普通','reading'=>'ふつう','meaning'=>'ordinary, normal','example_sentence'=>'{普通|ふつう}の{生活|せいかつ}を{送|おく}っています。','example_translation'=>'I lead a normal life.'],
            ['type'=>'vocab','level'=>'N4','front'=>'意見','reading'=>'いけん','meaning'=>'opinion, view','example_sentence'=>'あなたの{意見|いけん}を{聞|き}かせてください。','example_translation'=>'Please let me hear your opinion.'],
            ['type'=>'vocab','level'=>'N4','front'=>'経験','reading'=>'けいけん','meaning'=>'experience','example_sentence'=>'{仕事|しごと}の{経験|けいけん}がありますか。','example_translation'=>'Do you have work experience?'],
            ['type'=>'vocab','level'=>'N4','front'=>'連絡','reading'=>'れんらく','meaning'=>'contact, communication','example_sentence'=>'{後|あと}で{連絡|れんらく}します。','example_translation'=>'I will contact you later.'],
            ['type'=>'vocab','level'=>'N4','front'=>'準備','reading'=>'じゅんび','meaning'=>'preparation, getting ready','example_sentence'=>'{旅行|りょこう}の{準備|じゅんび}をしています。','example_translation'=>'I am preparing for the trip.'],
            ['type'=>'vocab','level'=>'N4','front'=>'集める','reading'=>'あつめる','meaning'=>'to collect, to gather','example_sentence'=>'{切手|きって}を{集|あつ}めています。','example_translation'=>'I am collecting stamps.'],
            ['type'=>'vocab','level'=>'N4','front'=>'疲れる','reading'=>'つかれる','meaning'=>'to get tired','example_sentence'=>'{今日|きょう}はとても{疲|つか}れました。','example_translation'=>'I am very tired today.'],
            ['type'=>'vocab','level'=>'N4','front'=>'困る','reading'=>'こまる','meaning'=>'to be troubled, to be in trouble','example_sentence'=>'{道|みち}に{迷|まよ}って{困|こま}っています。','example_translation'=>'I am in trouble because I am lost.'],
            ['type'=>'vocab','level'=>'N4','front'=>'直す','reading'=>'なおす','meaning'=>'to fix, to correct','example_sentence'=>'{壊|こわ}れた{時計|とけい}を{直|なお}しました。','example_translation'=>'I fixed the broken watch.'],
            ['type'=>'vocab','level'=>'N4','front'=>'決める','reading'=>'きめる','meaning'=>'to decide','example_sentence'=>'{場所|ばしょ}を{決|き}めましょう。','example_translation'=>'Let\'s decide on a place.'],
            ['type'=>'vocab','level'=>'N4','front'=>'続ける','reading'=>'つづける','meaning'=>'to continue','example_sentence'=>'{毎日|まいにち}{練習|れんしゅう}を{続|つづ}けています。','example_translation'=>'I continue practicing every day.'],

            // ─── N4 GRAMMAR ─────────────────────────────────────────────────
            ['type'=>'grammar','level'=>'N4','front'=>'～てから','reading'=>null,'meaning'=>'after doing ~','example_sentence'=>'{宿題|しゅくだい}をしてから、テレビを{見|み}ます。','example_translation'=>'I watch TV after doing my homework.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～ために','reading'=>null,'meaning'=>'in order to ~, for the purpose of ~','example_sentence'=>'{健康|けんこう}のために{毎日|まいにち}{運動|うんどう}します。','example_translation'=>'I exercise every day for my health.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～ながら','reading'=>null,'meaning'=>'while doing ~ (simultaneous actions)','example_sentence'=>'{音楽|おんがく}を{聴|き}きながら{勉強|べんきょう}します。','example_translation'=>'I study while listening to music.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～かもしれない','reading'=>null,'meaning'=>'might be ~, perhaps ~','example_sentence'=>'{明日|あした}、{雨|あめ}が{降|ふ}るかもしれません。','example_translation'=>'It might rain tomorrow.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～てしまう','reading'=>null,'meaning'=>'completely did ~ / unfortunately did ~','example_sentence'=>'{財布|さいふ}を{忘|わす}れてしまいました。','example_translation'=>'I unfortunately left my wallet behind.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～ばよかった','reading'=>null,'meaning'=>'should have done ~ (regret)','example_sentence'=>'もっと{勉強|べんきょう}すればよかった。','example_translation'=>'I should have studied more.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～そうです','reading'=>null,'meaning'=>'looks like ~, seems like ~ (appearance)','example_sentence'=>'この{料理|りょうり}はおいしそうです。','example_translation'=>'This dish looks delicious.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～ようにする','reading'=>null,'meaning'=>'to try to do ~, to make sure to do ~','example_sentence'=>'{毎日|まいにち}{早起|はやお}きするようにしています。','example_translation'=>'I make sure to wake up early every day.'],
            ['type'=>'grammar','level'=>'N4','front'=>'～てもいいです','reading'=>null,'meaning'=>'it is okay to do ~ (permission)','example_sentence'=>'ここに{座|すわ}ってもいいですか。','example_translation'=>'May I sit here?'],
            ['type'=>'grammar','level'=>'N4','front'=>'～なければならない','reading'=>null,'meaning'=>'must do ~, have to do ~','example_sentence'=>'{明日|あした}までに{報告書|ほうこくしょ}を{書|か}かなければならない。','example_translation'=>'I must write the report by tomorrow.'],

            // ─── N3 KANJI ───────────────────────────────────────────────────
            ['type'=>'kanji','level'=>'N3','front'=>'族','reading'=>'ぞく','meaning'=>'tribe, family, group','example_sentence'=>'{家族|かぞく}と{旅行|りょこう}に{行|い}きました。','example_translation'=>'I traveled with my family.'],
            ['type'=>'kanji','level'=>'N3','front'=>'化','reading'=>'か・け','meaning'=>'change, transformation','example_sentence'=>'{社会|しゃかい}は{急速|きゅうそく}に{変化|へんか}しています。','example_translation'=>'Society is changing rapidly.'],
            ['type'=>'kanji','level'=>'N3','front'=>'職','reading'=>'しょく','meaning'=>'occupation, post','example_sentence'=>'{新|あたら}しい{職場|しょくば}に{慣|な}れました。','example_translation'=>'I got used to my new workplace.'],
            ['type'=>'kanji','level'=>'N3','front'=>'予','reading'=>'よ','meaning'=>'beforehand, in advance','example_sentence'=>'{予約|よやく}をしてください。','example_translation'=>'Please make a reservation.'],
            ['type'=>'kanji','level'=>'N3','front'=>'定','reading'=>'てい・さだ','meaning'=>'determine, fix, decide','example_sentence'=>'{日程|にってい}を{定|さだ}めました。','example_translation'=>'I set the schedule.'],
            ['type'=>'kanji','level'=>'N3','front'=>'関','reading'=>'かん','meaning'=>'connection, barrier','example_sentence'=>'それは{私|わたし}とは{関係|かんけい}ありません。','example_translation'=>'That has nothing to do with me.'],
            ['type'=>'kanji','level'=>'N3','front'=>'以','reading'=>'い','meaning'=>'by means of, from','example_sentence'=>'18{歳|さい}{以上|いじょう}が{対象|たいしょう}です。','example_translation'=>'This is for those 18 and older.'],
            ['type'=>'kanji','level'=>'N3','front'=>'共','reading'=>'とも・きょう','meaning'=>'together, both','example_sentence'=>'{共|とも}に{頑張|がんば}りましょう。','example_translation'=>'Let\'s work hard together.'],
            ['type'=>'kanji','level'=>'N3','front'=>'末','reading'=>'すえ・まつ','meaning'=>'end, tip','example_sentence'=>'{週末|しゅうまつ}に{何|なに}をしますか。','example_translation'=>'What do you do on weekends?'],
            ['type'=>'kanji','level'=>'N3','front'=>'働','reading'=>'はたら','meaning'=>'work, labor','example_sentence'=>'{週|しゅう}{五日|いつか}{働|はたら}いています。','example_translation'=>'I work five days a week.'],
            ['type'=>'kanji','level'=>'N3','front'=>'受','reading'=>'う','meaning'=>'receive, accept','example_sentence'=>'{試験|しけん}を{受|う}けました。','example_translation'=>'I took the exam.'],
            ['type'=>'kanji','level'=>'N3','front'=>'選','reading'=>'えら・せん','meaning'=>'select, choose','example_sentence'=>'どちらを{選|えら}びますか。','example_translation'=>'Which will you choose?'],
            ['type'=>'kanji','level'=>'N3','front'=>'産','reading'=>'うむ・さん','meaning'=>'produce, birth','example_sentence'=>'この{地域|ちいき}は{果物|くだもの}の{産地|さんち}です。','example_translation'=>'This region is a fruit-producing area.'],
            ['type'=>'kanji','level'=>'N3','front'=>'際','reading'=>'さい・きわ','meaning'=>'occasion, time, edge','example_sentence'=>'{緊急|きんきゅう}の{際|さい}は119{番|ばん}に{電話|でんわ}してください。','example_translation'=>'In an emergency, please call 119.'],
            ['type'=>'kanji','level'=>'N3','front'=>'比','reading'=>'くら・ひ','meaning'=>'compare, ratio','example_sentence'=>'{去年|きょねん}と{比|くら}べて{暖|あたた}かいです。','example_translation'=>'It is warmer compared to last year.'],

            // ─── N3 VOCAB ───────────────────────────────────────────────────
            ['type'=>'vocab','level'=>'N3','front'=>'必要','reading'=>'ひつよう','meaning'=>'necessary, needed','example_sentence'=>'パスポートが{必要|ひつよう}です。','example_translation'=>'A passport is necessary.'],
            ['type'=>'vocab','level'=>'N3','front'=>'重要','reading'=>'じゅうよう','meaning'=>'important, significant','example_sentence'=>'{健康|けんこう}は{最|もっと}も{重要|じゅうよう}です。','example_translation'=>'Health is the most important.'],
            ['type'=>'vocab','level'=>'N3','front'=>'安全','reading'=>'あんぜん','meaning'=>'safety, security','example_sentence'=>'{安全|あんぜん}に{運転|うんてん}してください。','example_translation'=>'Please drive safely.'],
            ['type'=>'vocab','level'=>'N3','front'=>'自由','reading'=>'じゆう','meaning'=>'freedom, liberty','example_sentence'=>'{言論|げんろん}の{自由|じゆう}は{大切|たいせつ}です。','example_translation'=>'Freedom of speech is important.'],
            ['type'=>'vocab','level'=>'N3','front'=>'複雑','reading'=>'ふくざつ','meaning'=>'complicated, complex','example_sentence'=>'この{問題|もんだい}は{複雑|ふくざつ}です。','example_translation'=>'This problem is complicated.'],
            ['type'=>'vocab','level'=>'N3','front'=>'確認','reading'=>'かくにん','meaning'=>'confirmation, verification','example_sentence'=>'{予約|よやく}を{確認|かくにん}しました。','example_translation'=>'I confirmed the reservation.'],
            ['type'=>'vocab','level'=>'N3','front'=>'影響','reading'=>'えいきょう','meaning'=>'influence, effect','example_sentence'=>'{天気|てんき}は{気分|きぶん}に{影響|えいきょう}します。','example_translation'=>'The weather affects your mood.'],
            ['type'=>'vocab','level'=>'N3','front'=>'状況','reading'=>'じょうきょう','meaning'=>'situation, circumstances','example_sentence'=>'{状況|じょうきょう}を{説明|せつめい}してください。','example_translation'=>'Please explain the situation.'],
            ['type'=>'vocab','level'=>'N3','front'=>'努力','reading'=>'どりょく','meaning'=>'effort, endeavor','example_sentence'=>'{毎日|まいにち}{努力|どりょく}することが{大切|たいせつ}です。','example_translation'=>'It is important to make effort every day.'],
            ['type'=>'vocab','level'=>'N3','front'=>'判断','reading'=>'はんだん','meaning'=>'judgment, decision','example_sentence'=>'{自分|じぶん}で{判断|はんだん}してください。','example_translation'=>'Please make your own judgment.'],
            ['type'=>'vocab','level'=>'N3','front'=>'比べる','reading'=>'くらべる','meaning'=>'to compare','example_sentence'=>'{二|ふた}つの{商品|しょうひん}を{比|くら}べました。','example_translation'=>'I compared two products.'],
            ['type'=>'vocab','level'=>'N3','front'=>'断る','reading'=>'ことわる','meaning'=>'to refuse, to decline','example_sentence'=>'その{依頼|いらい}を{断|ことわ}りました。','example_translation'=>'I refused that request.'],
            ['type'=>'vocab','level'=>'N3','front'=>'増える','reading'=>'ふえる','meaning'=>'to increase','example_sentence'=>'{外国人|がいこくじん}{旅行者|りょこうしゃ}が{増|ふ}えています。','example_translation'=>'The number of foreign tourists is increasing.'],
            ['type'=>'vocab','level'=>'N3','front'=>'減る','reading'=>'へる','meaning'=>'to decrease','example_sentence'=>'{人口|じんこう}が{減|へ}っています。','example_translation'=>'The population is decreasing.'],
            ['type'=>'vocab','level'=>'N3','front'=>'想像','reading'=>'そうぞう','meaning'=>'imagination','example_sentence'=>'{将来|しょうらい}を{想像|そうぞう}してみてください。','example_translation'=>'Try to imagine the future.'],

            // ─── N3 GRAMMAR ─────────────────────────────────────────────────
            ['type'=>'grammar','level'=>'N3','front'=>'～によって','reading'=>null,'meaning'=>'depending on ~, by means of ~, due to ~','example_sentence'=>'{人|ひと}によって{意見|いけん}が{違|ちが}います。','example_translation'=>'Opinions differ depending on the person.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～に対して','reading'=>null,'meaning'=>'towards ~, regarding ~, in contrast to ~','example_sentence'=>'{先生|せんせい}に{対|たい}して{失礼|しつれい}なことを{言|い}いました。','example_translation'=>'I said something rude to the teacher.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～わけだ','reading'=>null,'meaning'=>'that is why ~, it means that ~','example_sentence'=>'{彼|かれ}は{留学|りゅうがく}していたから、{英語|えいご}が{上手|じょうず}なわけだ。','example_translation'=>'He studied abroad, so that is why his English is good.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～ことになっている','reading'=>null,'meaning'=>'it has been decided that ~, supposed to ~','example_sentence'=>'{来週|らいしゅう}、{会議|かいぎ}があることになっています。','example_translation'=>'It has been decided that there will be a meeting next week.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～さえ～ば','reading'=>null,'meaning'=>'if only ~, as long as ~','example_sentence'=>'お{金|かね}さえあれば、{問題|もんだい}ありません。','example_translation'=>'If only I had money, there would be no problem.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～ものの','reading'=>null,'meaning'=>'although ~, even though ~ (different result)','example_sentence'=>'{勉強|べんきょう}したものの、{試験|しけん}に{落|お}ちました。','example_translation'=>'Although I studied, I failed the exam.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～に関して','reading'=>null,'meaning'=>'regarding ~, concerning ~','example_sentence'=>'この{件|けん}に{関|かん}してご{意見|いけん}をください。','example_translation'=>'Please give me your opinion regarding this matter.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～ほど','reading'=>null,'meaning'=>'to the extent that ~, the more ~ the more ~','example_sentence'=>'{日本語|にほんご}は{勉強|べんきょう}すればするほど{難|むずか}しくなります。','example_translation'=>'The more you study Japanese, the more difficult it becomes.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～たびに','reading'=>null,'meaning'=>'every time ~, whenever ~','example_sentence'=>'{日本|にほん}に{来|く}るたびに、この{店|みせ}に{寄|よ}ります。','example_translation'=>'Every time I come to Japan, I stop by this shop.'],
            ['type'=>'grammar','level'=>'N3','front'=>'～として','reading'=>null,'meaning'=>'as ~, in the capacity of ~','example_sentence'=>'{彼|かれ}はガイドとして{働|はたら}いています。','example_translation'=>'He works as a guide.'],

            // ─── N2 KANJI ───────────────────────────────────────────────────
            ['type'=>'kanji','level'=>'N2','front'=>'環','reading'=>'かん','meaning'=>'ring, surround, environment','example_sentence'=>'{環境|かんきょう}{保護|ほご}が{重要|じゅうよう}です。','example_translation'=>'Environmental protection is important.'],
            ['type'=>'kanji','level'=>'N2','front'=>'境','reading'=>'きょう・さかい','meaning'=>'boundary, border','example_sentence'=>'{国境|こっきょう}を{越|こ}えました。','example_translation'=>'I crossed the national border.'],
            ['type'=>'kanji','level'=>'N2','front'=>'就','reading'=>'しゅう・つ','meaning'=>'take up, engage in, employment','example_sentence'=>'{就職|しゅうしょく}{活動|かつどう}が{大変|たいへん}です。','example_translation'=>'Job hunting is tough.'],
            ['type'=>'kanji','level'=>'N2','front'=>'著','reading'=>'いちじる・ちょ','meaning'=>'remarkable, author, write','example_sentence'=>'{著|いちじる}しく{成長|せいちょう}しました。','example_translation'=>'It grew remarkably.'],
            ['type'=>'kanji','level'=>'N2','front'=>'触','reading'=>'ふ・しょく','meaning'=>'touch, contact','example_sentence'=>'{自然|しぜん}に{触|ふ}れることが{好|す}きです。','example_translation'=>'I like to be in contact with nature.'],
            ['type'=>'kanji','level'=>'N2','front'=>'拡','reading'=>'ひろ・かく','meaning'=>'spread, expand','example_sentence'=>'{事業|じぎょう}を{拡大|かくだい}しました。','example_translation'=>'We expanded the business.'],
            ['type'=>'kanji','level'=>'N2','front'=>'縮','reading'=>'ちぢ・しゅく','meaning'=>'shrink, contract','example_sentence'=>'{服|ふく}が{洗濯|せんたく}で{縮|ちぢ}みました。','example_translation'=>'The clothes shrank in the wash.'],
            ['type'=>'kanji','level'=>'N2','front'=>'承','reading'=>'しょう','meaning'=>'consent, inherit, receive','example_sentence'=>'ご{要望|ようぼう}を{承|うけたまわ}りました。','example_translation'=>'I have received your request.'],
            ['type'=>'kanji','level'=>'N2','front'=>'促','reading'=>'うなが・そく','meaning'=>'urge, promote, hasten','example_sentence'=>'{改革|かいかく}を{促|うなが}す{必要|ひつよう}があります。','example_translation'=>'It is necessary to urge reform.'],
            ['type'=>'kanji','level'=>'N2','front'=>'派','reading'=>'は','meaning'=>'faction, sect, dispatch','example_sentence'=>'{海外|かいがい}に{社員|しゃいん}を{派遣|はけん}しました。','example_translation'=>'We dispatched an employee overseas.'],
            ['type'=>'kanji','level'=>'N2','front'=>'獲','reading'=>'え・かく','meaning'=>'acquire, get, reap','example_sentence'=>'{金|きん}メダルを{獲得|かくとく}しました。','example_translation'=>'I won a gold medal.'],
            ['type'=>'kanji','level'=>'N2','front'=>'維','reading'=>'い','meaning'=>'maintain, fiber','example_sentence'=>'{現状|げんじょう}を{維持|いじ}することが{難|むずか}しい。','example_translation'=>'It is difficult to maintain the current situation.'],
            ['type'=>'kanji','level'=>'N2','front'=>'担','reading'=>'にな・たん','meaning'=>'shoulder, bear, carry','example_sentence'=>'{責任|せきにん}を{担|にな}っています。','example_translation'=>'I am bearing responsibility.'],
            ['type'=>'kanji','level'=>'N2','front'=>'批','reading'=>'ひ','meaning'=>'criticism, judgment','example_sentence'=>'{批判|ひはん}的に{考|かんが}えることが{大切|たいせつ}です。','example_translation'=>'It is important to think critically.'],
            ['type'=>'kanji','level'=>'N2','front'=>'供','reading'=>'とも・きょう','meaning'=>'companion, supply, offer','example_sentence'=>'サービスを{提供|ていきょう}しています。','example_translation'=>'We are providing the service.'],

            // ─── N2 VOCAB ───────────────────────────────────────────────────
            ['type'=>'vocab','level'=>'N2','front'=>'把握','reading'=>'はあく','meaning'=>'grasp, comprehend, understand','example_sentence'=>'{状況|じょうきょう}を{把握|はあく}してください。','example_translation'=>'Please grasp the situation.'],
            ['type'=>'vocab','level'=>'N2','front'=>'懸念','reading'=>'けねん','meaning'=>'concern, anxiety, worry','example_sentence'=>'{安全|あんぜん}への{懸念|けねん}が{高|たか}まっています。','example_translation'=>'Concerns about safety are growing.'],
            ['type'=>'vocab','level'=>'N2','front'=>'緩和','reading'=>'かんわ','meaning'=>'relaxation, alleviation, easing','example_sentence'=>'{規制|きせい}が{緩和|かんわ}されました。','example_translation'=>'The regulations have been eased.'],
            ['type'=>'vocab','level'=>'N2','front'=>'促進','reading'=>'そくしん','meaning'=>'promotion, acceleration, facilitation','example_sentence'=>'{経済|けいざい}の{促進|そくしん}が{必要|ひつよう}です。','example_translation'=>'Economic promotion is necessary.'],
            ['type'=>'vocab','level'=>'N2','front'=>'概念','reading'=>'がいねん','meaning'=>'concept, notion, general idea','example_sentence'=>'その{概念|がいねん}を{理解|りかい}するのは{難|むずか}しい。','example_translation'=>'It is difficult to understand that concept.'],
            ['type'=>'vocab','level'=>'N2','front'=>'姿勢','reading'=>'しせい','meaning'=>'posture, attitude, stance','example_sentence'=>'{正|ただ}しい{姿勢|しせい}で{座|すわ}ってください。','example_translation'=>'Please sit with proper posture.'],
            ['type'=>'vocab','level'=>'N2','front'=>'配慮','reading'=>'はいりょ','meaning'=>'consideration, thoughtfulness','example_sentence'=>'{環境|かんきょう}への{配慮|はいりょ}が{大切|たいせつ}です。','example_translation'=>'Consideration for the environment is important.'],
            ['type'=>'vocab','level'=>'N2','front'=>'妥当','reading'=>'だとう','meaning'=>'appropriate, valid, reasonable','example_sentence'=>'その{判断|はんだん}は{妥当|だとう}だと{思|おも}います。','example_translation'=>'I think that judgment is appropriate.'],
            ['type'=>'vocab','level'=>'N2','front'=>'顕著','reading'=>'けんちょ','meaning'=>'remarkable, notable, conspicuous','example_sentence'=>'{顕著|けんちょ}な{改善|かいぜん}が{見|み}られます。','example_translation'=>'A remarkable improvement can be seen.'],
            ['type'=>'vocab','level'=>'N2','front'=>'喪失','reading'=>'そうしつ','meaning'=>'loss, forfeit','example_sentence'=>'{記憶|きおく}を{喪失|そうしつ}しました。','example_translation'=>'I lost my memory.'],
            ['type'=>'vocab','level'=>'N2','front'=>'一貫','reading'=>'いっかん','meaning'=>'consistent, coherent','example_sentence'=>'{一貫|いっかん}した{方針|ほうしん}を{持|も}っています。','example_translation'=>'We have a consistent policy.'],
            ['type'=>'vocab','level'=>'N2','front'=>'補完','reading'=>'ほかん','meaning'=>'complement, supplement','example_sentence'=>'{二|ふた}つの{計画|けいかく}が{互|たが}いを{補完|ほかん}しています。','example_translation'=>'The two plans complement each other.'],
            ['type'=>'vocab','level'=>'N2','front'=>'相互','reading'=>'そうご','meaning'=>'mutual, reciprocal','example_sentence'=>'{相互|そうご}{理解|りかい}が{大切|たいせつ}です。','example_translation'=>'Mutual understanding is important.'],
            ['type'=>'vocab','level'=>'N2','front'=>'暫定','reading'=>'ざんてい','meaning'=>'provisional, temporary','example_sentence'=>'{暫定|ざんてい}{措置|そち}として{実施|じっし}します。','example_translation'=>'It will be implemented as a provisional measure.'],
            ['type'=>'vocab','level'=>'N2','front'=>'模索','reading'=>'もさく','meaning'=>'groping, searching, exploring','example_sentence'=>'{解決策|かいけつさく}を{模索|もさく}しています。','example_translation'=>'We are searching for a solution.'],

            // ─── N2 GRAMMAR ─────────────────────────────────────────────────
            ['type'=>'grammar','level'=>'N2','front'=>'～にもかかわらず','reading'=>null,'meaning'=>'despite ~, in spite of ~','example_sentence'=>'{努力|どりょく}したにもかかわらず、{失敗|しっぱい}しました。','example_translation'=>'Despite my efforts, I failed.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～に従って','reading'=>null,'meaning'=>'following ~, in accordance with ~, as ~ progresses','example_sentence'=>'{時代|じだい}の{変化|へんか}に{従|したが}って、{法律|ほうりつ}も{変|か}わります。','example_translation'=>'As times change, laws also change.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～に基づいて','reading'=>null,'meaning'=>'based on ~, founded on ~','example_sentence'=>'データに{基|もと}づいて{判断|はんだん}しました。','example_translation'=>'I made a decision based on the data.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～を通じて','reading'=>null,'meaning'=>'through ~, via ~, throughout ~','example_sentence'=>'{友人|ゆうじん}を{通|つう}じて{仕事|しごと}を{見|み}つけました。','example_translation'=>'I found work through a friend.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～に加えて','reading'=>null,'meaning'=>'in addition to ~, on top of ~','example_sentence'=>'{英語|えいご}に{加|くわ}えて、{日本語|にほんご}も{話|はな}せます。','example_translation'=>'In addition to English, I can also speak Japanese.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～をはじめ','reading'=>null,'meaning'=>'starting with ~, ~ and others','example_sentence'=>'{東京|とうきょう}をはじめ、{多|おお}くの{都市|とし}で{開催|かいさい}されます。','example_translation'=>'It will be held in many cities, starting with Tokyo.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～かねない','reading'=>null,'meaning'=>'might possibly ~, there is a risk of ~ (negative)','example_sentence'=>'このままでは{失敗|しっぱい}しかねない。','example_translation'=>'At this rate, there is a risk of failure.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～ざるを得ない','reading'=>null,'meaning'=>'cannot help but ~, have no choice but to ~','example_sentence'=>'{状況|じょうきょう}から{判断|はんだん}して、{行|い}かざるを{得|え}ない。','example_translation'=>'Judging from the situation, I have no choice but to go.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～に反して','reading'=>null,'meaning'=>'contrary to ~, against ~','example_sentence'=>'{予想|よそう}に{反|はん}して、{試験|しけん}は{簡単|かんたん}でした。','example_translation'=>'Contrary to expectations, the exam was easy.'],
            ['type'=>'grammar','level'=>'N2','front'=>'～にしたがって','reading'=>null,'meaning'=>'as ~ progresses / according to ~','example_sentence'=>'{年齢|ねんれい}が{上|あ}がるにしたがって、{責任|せきにん}も{増|ふ}えます。','example_translation'=>'As age increases, responsibilities also increase.'],

            // ─── N1 KANJI ───────────────────────────────────────────────────
            ['type'=>'kanji','level'=>'N1','front'=>'憂','reading'=>'うれ・ゆう','meaning'=>'grief, gloom, melancholy','example_sentence'=>'{将来|しょうらい}を{憂|うれ}えています。','example_translation'=>'I am worried about the future.'],
            ['type'=>'kanji','level'=>'N1','front'=>'錯','reading'=>'さく','meaning'=>'confused, mix up, be wrong','example_sentence'=>'{錯覚|さっかく}を{起|お}こしました。','example_translation'=>'I experienced an illusion.'],
            ['type'=>'kanji','level'=>'N1','front'=>'徴','reading'=>'ちょう','meaning'=>'sign, indication, collect','example_sentence'=>'その{徴候|ちょうこう}が{見|み}られます。','example_translation'=>'Those symptoms can be seen.'],
            ['type'=>'kanji','level'=>'N1','front'=>'懸','reading'=>'か・けん','meaning'=>'hang, suspend, depend','example_sentence'=>'{命懸|いのちが}けで{挑|いど}みました。','example_translation'=>'I challenged with my life on the line.'],
            ['type'=>'kanji','level'=>'N1','front'=>'遵','reading'=>'じゅん','meaning'=>'obey, follow, abide by','example_sentence'=>'{法律|ほうりつ}を{遵守|じゅんしゅ}してください。','example_translation'=>'Please abide by the law.'],
            ['type'=>'kanji','level'=>'N1','front'=>'醸','reading'=>'かも・じょう','meaning'=>'brew, create (atmosphere)','example_sentence'=>'{良|よ}い{雰囲気|ふんいき}を{醸|かも}し{出|だ}しています。','example_translation'=>'It creates a good atmosphere.'],
            ['type'=>'kanji','level'=>'N1','front'=>'凌','reading'=>'しの','meaning'=>'endure, surpass','example_sentence'=>'{困難|こんなん}を{凌|しの}いできました。','example_translation'=>'I have endured difficulties.'],
            ['type'=>'kanji','level'=>'N1','front'=>'抑','reading'=>'おさ・よく','meaning'=>'suppress, control, restrain','example_sentence'=>'{感情|かんじょう}を{抑|おさ}えてください。','example_translation'=>'Please suppress your emotions.'],
            ['type'=>'kanji','level'=>'N1','front'=>'陥','reading'=>'おちい・かん','meaning'=>'fall into, collapse, cave in','example_sentence'=>'{危機|きき}に{陥|おちい}っています。','example_translation'=>'We have fallen into a crisis.'],
            ['type'=>'kanji','level'=>'N1','front'=>'贈','reading'=>'おく・ぞう','meaning'=>'give, present, bestow','example_sentence'=>'{友人|ゆうじん}に{花束|はなたば}を{贈|おく}りました。','example_translation'=>'I gave a bouquet to my friend.'],
            ['type'=>'kanji','level'=>'N1','front'=>'漠','reading'=>'ばく','meaning'=>'vague, obscure, vast desert','example_sentence'=>'{漠然|ばくぜん}とした{不安|ふあん}があります。','example_translation'=>'I have a vague sense of anxiety.'],
            ['type'=>'kanji','level'=>'N1','front'=>'賄','reading'=>'まかな','meaning'=>'bribe, supply, manage','example_sentence'=>'{賄賂|わいろ}を{受|う}け{取|と}ることは{違法|いほう}です。','example_translation'=>'Receiving a bribe is illegal.'],
            ['type'=>'kanji','level'=>'N1','front'=>'紡','reading'=>'つむ・ぼう','meaning'=>'spin, yarn, weave','example_sentence'=>'{言葉|ことば}を{紡|つむ}いで{詩|し}を{作|つく}りました。','example_translation'=>'I wove words to create a poem.'],
            ['type'=>'kanji','level'=>'N1','front'=>'隷','reading'=>'れい','meaning'=>'slave, servant, follower','example_sentence'=>'{隷属|れいぞく}{状態|じょうたい}から{解放|かいほう}されました。','example_translation'=>'They were liberated from a state of servitude.'],
            ['type'=>'kanji','level'=>'N1','front'=>'凄','reading'=>'すご・せい','meaning'=>'tremendous, awful, eerie','example_sentence'=>'{凄|すご}まじい{速|はや}さで{走|はし}りました。','example_translation'=>'He ran at tremendous speed.'],

            // ─── N1 VOCAB ───────────────────────────────────────────────────
            ['type'=>'vocab','level'=>'N1','front'=>'克服','reading'=>'こくふく','meaning'=>'overcome, conquest','example_sentence'=>'{困難|こんなん}を{克服|こくふく}しました。','example_translation'=>'I overcame the difficulty.'],
            ['type'=>'vocab','level'=>'N1','front'=>'漠然','reading'=>'ばくぜん','meaning'=>'vague, obscure, hazy','example_sentence'=>'{漠然|ばくぜん}とした{計画|けいかく}しかありません。','example_translation'=>'I only have a vague plan.'],
            ['type'=>'vocab','level'=>'N1','front'=>'貢献','reading'=>'こうけん','meaning'=>'contribution, service','example_sentence'=>'{社会|しゃかい}に{貢献|こうけん}したいです。','example_translation'=>'I want to contribute to society.'],
            ['type'=>'vocab','level'=>'N1','front'=>'逡巡','reading'=>'しゅんじゅん','meaning'=>'hesitation, wavering, indecision','example_sentence'=>'{逡巡|しゅんじゅん}することなく{決断|けつだん}しました。','example_translation'=>'I made the decision without hesitation.'],
            ['type'=>'vocab','level'=>'N1','front'=>'齟齬','reading'=>'そご','meaning'=>'discrepancy, inconsistency, mismatch','example_sentence'=>'{意見|いけん}に{齟齬|そご}が{生|しょう}じました。','example_translation'=>'A discrepancy arose in our opinions.'],
            ['type'=>'vocab','level'=>'N1','front'=>'瑕疵','reading'=>'かし','meaning'=>'defect, flaw, blemish','example_sentence'=>'{製品|せいひん}に{瑕疵|かし}が{見|み}つかりました。','example_translation'=>'A defect was found in the product.'],
            ['type'=>'vocab','level'=>'N1','front'=>'凌駕','reading'=>'りょうが','meaning'=>'surpass, outstrip, transcend','example_sentence'=>'{予想|よそう}を{凌駕|りょうが}する{成果|せいか}でした。','example_translation'=>'It was a result that surpassed expectations.'],
            ['type'=>'vocab','level'=>'N1','front'=>'形骸化','reading'=>'けいがいか','meaning'=>'becoming a mere formality, hollowing out','example_sentence'=>'その{制度|せいど}は{形骸化|けいがいか}しています。','example_translation'=>'That system has become a mere formality.'],
            ['type'=>'vocab','level'=>'N1','front'=>'憂慮','reading'=>'ゆうりょ','meaning'=>'concern, apprehension, anxiety','example_sentence'=>'{事態|じたい}を{憂慮|ゆうりょ}しています。','example_translation'=>'I am concerned about the situation.'],
            ['type'=>'vocab','level'=>'N1','front'=>'拮抗','reading'=>'きっこう','meaning'=>'rivalry, antagonism, neck and neck','example_sentence'=>'{二|に}チームが{拮抗|きっこう}しています。','example_translation'=>'The two teams are neck and neck.'],
            ['type'=>'vocab','level'=>'N1','front'=>'措置','reading'=>'そち','meaning'=>'measure, step, action','example_sentence'=>'{緊急|きんきゅう}{措置|そち}を{取|と}りました。','example_translation'=>'We took emergency measures.'],
            ['type'=>'vocab','level'=>'N1','front'=>'是正','reading'=>'ぜせい','meaning'=>'correction, rectification, remedy','example_sentence'=>'{問題|もんだい}を{是正|ぜせい}する{必要|ひつよう}があります。','example_translation'=>'It is necessary to correct the problem.'],
            ['type'=>'vocab','level'=>'N1','front'=>'様相','reading'=>'ようそう','meaning'=>'aspect, appearance, phase','example_sentence'=>'{状況|じょうきょう}は{新|あたら}しい{様相|ようそう}を{呈|てい}しています。','example_translation'=>'The situation is taking on a new aspect.'],
            ['type'=>'vocab','level'=>'N1','front'=>'蔑視','reading'=>'べっし','meaning'=>'contempt, disdain, scorn','example_sentence'=>'{人|ひと}を{蔑視|べっし}することは{許|ゆる}されない。','example_translation'=>'Showing contempt for people is not permitted.'],
            ['type'=>'vocab','level'=>'N1','front'=>'潤滑','reading'=>'じゅんかつ','meaning'=>'lubrication, smooth operation','example_sentence'=>'{人間関係|にんげんかんけい}を{潤滑|じゅんかつ}にする{努力|どりょく}が{必要|ひつよう}です。','example_translation'=>'Efforts to smooth human relations are necessary.'],

            // ─── N1 GRAMMAR ─────────────────────────────────────────────────
            ['type'=>'grammar','level'=>'N1','front'=>'～をもって','reading'=>null,'meaning'=>'with ~, by means of ~, as of (time)','example_sentence'=>'{本日|ほんじつ}をもって{退職|たいしょく}いたします。','example_translation'=>'I will retire as of today.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～いかんによらず','reading'=>null,'meaning'=>'regardless of ~, irrespective of ~','example_sentence'=>'{理由|りゆう}のいかんによらず、{遅刻|ちこく}は{許|ゆる}されない。','example_translation'=>'Regardless of the reason, being late is not permitted.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～に至っては','reading'=>null,'meaning'=>'when it comes to ~, even ~ (extreme case)','example_sentence'=>'{彼|かれ}に{至|いた}っては、{全|まった}く{練習|れんしゅう}していなかった。','example_translation'=>'When it comes to him, he had not practiced at all.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～ないまでも','reading'=>null,'meaning'=>'even if not ~, if not quite ~, at least','example_sentence'=>'{完璧|かんぺき}でないまでも、{十分|じゅうぶん}な{仕事|しごと}をしました。','example_translation'=>'Even if not perfect, he did sufficient work.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～とあれば','reading'=>null,'meaning'=>'if it is the case that ~, given that ~','example_sentence'=>'お{役|やく}に{立|た}てるとあれば、{喜|よろこ}んで{参|まい}ります。','example_translation'=>'If I can be of help, I will gladly attend.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～んばかりに','reading'=>null,'meaning'=>'as if about to ~, to the point of ~ (extreme degree)','example_sentence'=>'{泣|な}き{出|だ}さんばかりの{表情|ひょうじょう}をしていました。','example_translation'=>'She had an expression as if she were about to cry.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～ごとき','reading'=>null,'meaning'=>'like ~, such as ~ (often self-deprecating)','example_sentence'=>'{私|わたし}ごとき{者|もの}にはわかりません。','example_translation'=>'Someone like me would not understand.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～に足る','reading'=>null,'meaning'=>'worthy of ~, worth doing ~','example_sentence'=>'{信頼|しんらい}するに{足|た}る{人物|じんぶつ}です。','example_translation'=>'He is a person worthy of trust.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～であれ','reading'=>null,'meaning'=>'even if it is ~, no matter what ~','example_sentence'=>'たとえ{困難|こんなん}であれ、{諦|あきら}めません。','example_translation'=>'Even if it is difficult, I will not give up.'],
            ['type'=>'grammar','level'=>'N1','front'=>'～を皮切りに','reading'=>null,'meaning'=>'starting with ~, beginning with ~ (as a trigger)','example_sentence'=>'{東京|とうきょう}を{皮切|かわき}りに{全国|ぜんこく}ツアーを{行|おこな}います。','example_translation'=>'We will conduct a nationwide tour starting with Tokyo.'],
        ];

        foreach ($cards as $card) {
            Flashcard::create($card);
        }

        $this->command->info('Flashcard seeder complete: ' . count($cards) . ' cards inserted.');
    }
}
