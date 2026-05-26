const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyze-btn');
const resultBox = document.getElementById('result-box');
const detectedEmotionSpn = document.getElementById('detected-emotion');
const auraScoreSpn = document.getElementById('aura-score');
const vibeCommentP = document.getElementById('vibe-comment');

const vibeComments = {
    happy: [
        { comment: "Kardeşim bu gülümseme neden? Yoksa birileri seni stalklamaya mı başladı?", score: "+8500 Aura" },
        { comment: "Bu enerjiyle yanına gelsem bana da bulaşır mı? Şarj olmaya ihtiyacım var.", score: "+9999 Aura" },
        { comment: "Yüzün adeta 'hayat güzel, sorunlar sahte' diyor. Bilgelik bu.", score: "+7500 Aura" }
    ],
    sad: [
        { comment: "Abi ne oldu, Wi-Fi mi kesildi? Bu yüz o yüz.", score: "-1500 Aura" },
        { comment: "Yüzün 'Haftanın her günü Pazartesi olsaydı' diyor. Geçer, söz.", score: "-2500 Aura" },
        { comment: "Modun dibe vurmuş ama yine de buraya geldin, bu bile cesaret ister. Saygı.", score: "-1000 Aura" }
    ],
    angry: [
        { comment: "UYARI: Bu yüz 5 yıl önce ayrıldığı eski sevgilinin mutlu olduğunu gören yüzdür.", score: "-5000 Aura" },
        { comment: "Biri sana 'ne var ne yok' deyip telefonu kapatmış, kesin.", score: "-6500 Aura" },
        { comment: "Bu sinir enerjisini spor salonuna ver, yılın vücuduna kavuşursun.", score: "-4000 Aura" }
    ],
    surprised: [
        { comment: "Bu şaşkınlık enerjisi... Biri nihayet sana 'tamam' mı dedi?", score: "+4500 Aura" },
        { comment: "Yüzün 'şaka mısın' diyor ama gözlerin 'hayır ciddi' diyor. İkisi de haklı.", score: "+3000 Aura" },
        { comment: "Ay bu ifade tam olarak fatura tutarını görünce yapılan yüzdür.", score: "+3500 Aura" }
    ],
    neutral: [
        { comment: "Ne mutlu ne mutsuz. Tam ortada. Varoluşsal bir denge bu, saygı duyulası.", score: "0 Aura" },
        { comment: "İçinden 'ne olacak şimdi' diye düşünüyorsun, biliyorum. Ben de bilmiyorum.", score: "+50 Aura" },
        { comment: "Bu yüz 'hayatla barışık ama hayat henüz haberdar değil' enerjisi.", score: "+150 Aura" }
    ]
};

const emotionTranslations = {
    happy: "Aşırı Neşeli / Pozitif",
    sad: "Hüzünlü / Melankolik",
    angry: "Barut Gibi / Sinirli",
    surprised: "Şoke Olmuş / Şaşkın",
    neutral: "Dümdüz / NPC Modu"
};

async function startApp() {
    try {
        // Doğrudan ana sunucudan modelleri el sıkışarak çekiyoruz
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        analyzeBtn.innerText = "Auranı Test Et!";
        analyzeBtn.disabled = false;
        
        startVideo();
    } catch (error) {
        console.error("Modeller yüklenirken hata oluştu:", error);
        analyzeBtn.innerText = "Yükleme Başarısız :(";
    }
}

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Kamera erişim hatası:", err);
            alert("Modelin çalışması için kamera izni vermen şart!");
        });
}

analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.innerText = "Yapay Zeka Tarıyor...";
    analyzeBtn.disabled = true;

    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

        if (detection) {
            const expressions = detection.expressions;
            const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            if (vibeComments[dominantEmotion]) {
                const randomChoices = vibeComments[dominantEmotion];
                const randomResult = randomChoices[Math.floor(Math.random() * randomChoices.length)];

                detectedEmotionSpn.innerText = emotionTranslations[dominantEmotion] || dominantEmotion;
                auraScoreSpn.innerText = randomResult.score;
                vibeCommentP.innerText = `"${randomResult.comment}"`;

                resultBox.classList.remove('hidden');

                try {
                    window.speechSynthesis.cancel();
                    const konuşma = new SpeechSynthesisUtterance(randomResult.comment);
                    konuşma.lang = 'tr-TR';
                    konuşma.rate = 1.0;     
                    window.speechSynthesis.speak(konuşma);
                } catch (speechErr) {
                    console.log("Ses pasif:", speechErr);
                }

            } else {
                vibeCommentP.innerText = '"Yüzünden garip hisler okunuyor, yapay zeka çözemedi!"';
                resultBox.classList.remove('hidden');
            }
        } else {
            alert("Yüzün tam görünmüyor. Kameraya biraz daha yaklaş ya da ışığı ayarla!");
        }
    } catch (err) {
        console.error(err);
    }

    analyzeBtn.innerText = "Tekrar Test Et!";
    analyzeBtn.disabled = false;
});

startApp();