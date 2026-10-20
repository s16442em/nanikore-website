// ========================================
// ReBorn 診断
// ========================================


// HTMLの部品を取得
const birthdayInput = document.getElementById("birthday");
const rebornButton = document.getElementById("rebornButton");

const inputSection = document.getElementById("inputSection");
const loadingSection = document.getElementById("loadingSection");
const resultSection = document.getElementById("resultSection");

const jobName = document.getElementById("jobName");
const characterImage = document.getElementById("characterImage");

const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");


// ========================================
// 18種類の転生先
//
// 「数字」＋「偶数/奇数」で決定
// ========================================

const characters = {

  "1-even": {
    name: "王様",
    image: "images/characters1/king.png"
  },

  "1-odd": {
    name: "踊り子",
    image: "images/characters1/dancer.png"
  },


  "2-even": {
    name: "アーチャー",
    image: "images/characters1/archer.png"
  },

  "2-odd": {
    name: "巫女",
    image: "images/characters1/miko.png"
  },


  "3-even": {
    name: "格闘家",
    image: "images/characters1/fighter.png"
  },

  "3-odd": {
    name: "商人",
    image: "images/characters1/merchant.png"
  },


  "4-even": {
    name: "軍師",
    image: "images/characters1/strategist.png"
  },

  "4-odd": {
    name: "忍者",
    image: "images/characters1/ninja.png"
  },


  "5-even": {
    name: "治癒師",
    image: "images/characters1/healer.png"
  },

  "5-odd": {
    name: "僧侶",
    image: "images/characters1/priest.png"
  },


  "6-even": {
    name: "妖精",
    image: "images/characters1/fairy.png"
  },

  "6-odd": {
    name: "魔女",
    image: "images/characters1/witch.png"
  },


  "7-even": {
    name: "大道芸人",
    image: "images/characters1/performer.png"
  },

  "7-odd": {
    name: "占い師",
    image: "images/characters1/fortune.png"
  },


  "8-even": {
    name: "勇者",
    image: "images/characters1/hero.png"
  },

  "8-odd": {
    name: "魔王",
    image: "images/characters1/demon_king.png"
  },


  "9-even": {
    name: "学者",
    image: "images/characters1/scholar.png"
  },

  "9-odd": {
    name: "賢者",
    image: "images/characters1/sage.png"
  }

};


// ========================================
// 生年月日の数字を全部足す
// ========================================

function calculateSoulNumber(dateString) {

  // 例：
  // 2009-04-30
  //
  // ↓
  // 2+0+0+9+0+4+3+0
  // ↓
  // 18

  let total = 0;

  for (const number of dateString.replace(/-/g, "")) {
    total += Number(number);
  }


  // 10以上なら、もう一度数字を足す
  //
  // 18 → 1+8 → 9

  while (total >= 10) {

    total = String(total)
      .split("")
      .reduce((sum, number) => {
        return sum + Number(number);
      }, 0);

  }

  return total;
}


// ========================================
// 「転生する！」を押したとき
// ========================================

rebornButton.addEventListener("click", () => {

  // 生年月日が入力されているか確認

  if (!birthdayInput.value) {

    errorMessage.textContent =
      "生年月日を入力してください！";

    return;
  }


  errorMessage.textContent = "";

  // ボタンを押せないようにする
  rebornButton.disabled = true;


  // ------------------------------------
  // 生年月日を取得
  // ------------------------------------

  const dateString = birthdayInput.value;

  const [year, month, day] =
    dateString.split("-").map(Number);


  // ------------------------------------
  // ソウルナンバーを計算
  // ※利用者には表示しない
  // ------------------------------------

  const soulNumber =
    calculateSoulNumber(dateString);


  // ------------------------------------
  // 誕生日が偶数か奇数か
  // ------------------------------------

  const parity =
    day % 2 === 0
      ? "even"
      : "odd";


  // ------------------------------------
  // 18種類から転生先を決定
  // ------------------------------------

  const result =
    characters[`${soulNumber}-${parity}`];


  // ------------------------------------
  // 入力画面を隠す
  // ------------------------------------

  inputSection.style.display = "none";

  loadingSection.style.display = "flex";


  // ------------------------------------
  // 少し「転生中……」を見せる
  // ------------------------------------

  setTimeout(() => {

    loadingSection.style.display = "none";

    resultSection.style.display = "flex";


    // 結果を表示

    jobName.textContent =
      result.name + "！！";


    // キャラクター画像

    characterImage.src =
      result.image;

    characterImage.alt =
      result.name;


  }, 1500);

});


// ========================================
// もう一度転生する
// ========================================

retryButton.addEventListener("click", () => {

  // 結果を隠す
  resultSection.style.display = "none";

  // 入力画面を表示
  inputSection.style.display = "flex";

  // ボタンを再び押せるようにする
  rebornButton.disabled = false;

  // 入力を空にする
  birthdayInput.value = "";

});