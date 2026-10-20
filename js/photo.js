// ========================================
// ReBorn 写真加工
// 完全版 photo.js
// ========================================


// ========================================
// HTML要素
// ========================================

const photoInput = document.getElementById("photoInput");
const changePhotoInput = document.getElementById("changePhotoInput");
const mainPhoto = document.getElementById("mainPhoto");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const changePhotoButton = document.querySelector(".change-photo-button");

const stickerLayer = document.getElementById("stickerLayer");
const deleteStickerButton = document.getElementById("deleteStickerButton");

const characterList = document.getElementById("characterList");
const faceList = document.getElementById("faceList");
const stampList = document.getElementById("stampList");
const textList = document.getElementById("textList");
const frameList = document.getElementById("frameList");

const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");

const categoryTabs = document.querySelectorAll(".category-tab");
const characterTypeTabs = document.querySelectorAll(".character-type-tab");

const characterTypeArea = document.getElementById("characterTypeArea");

const savePhotoButton = document.getElementById("savePhotoButton");

const textInput = document.getElementById("textInput");
const addTextButton = document.getElementById("addTextButton");

const colorButtons = document.querySelectorAll(".color-button");
const outlineButtons = document.querySelectorAll(".outline-button");


// ========================================
// 選択中のアイテム
// ========================================

let selectedSticker = null;
let selectedText = null;


// ========================================
// 写真読み込み
// ========================================

function loadPhoto(file) {

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {

    mainPhoto.src = event.target.result;

    mainPhoto.style.display = "block";

    if (photoPlaceholder) {
      photoPlaceholder.style.display = "none";
    }

    if (changePhotoButton) {
      changePhotoButton.style.display = "block";
    }

  };

  reader.readAsDataURL(file);
}


// 最初の写真
if (photoInput) {

  photoInput.addEventListener("change", function() {
    loadPhoto(this.files[0]);
  });

}


// 写真変更
if (changePhotoInput) {

  changePhotoInput.addEventListener("change", function() {
    loadPhoto(this.files[0]);
  });

}


// ========================================
// キャラクター・スタンプ追加
// ========================================

function addSticker(imagePath, name) {

  if (!mainPhoto.src) {

    alert("まず写真を選んでね！");

    return;
  }

  const sticker = document.createElement("img");

  sticker.src = imagePath;

  sticker.alt = name;

  sticker.className = "sticker";

  sticker.draggable = false;

  sticker._data = {

    x: 0,
    y: 0,

    scale: 1,

    rotation: 0,

    startX: 0,
    startY: 0,

    startDistance: 0,
    startAngle: 0,

    startScale: 1,
    startRotation: 0,

    dragging: false

  };

  stickerLayer.appendChild(sticker);

  enableStickerTouch(sticker);

  selectSticker(sticker);

}


// ========================================
// ステッカー選択
// ========================================

function selectSticker(sticker) {

  // 以前の選択を解除
  document.querySelectorAll(".sticker.selected").forEach(function(item) {
    item.classList.remove("selected");
  });

  document.querySelectorAll(".photo-text.selected").forEach(function(item) {
    item.classList.remove("selected");
  });

  selectedSticker = sticker;

  selectedText = null;

  sticker.classList.add("selected");

  deleteStickerButton.style.display = "block";

}


// ========================================
// 削除
// ========================================

deleteStickerButton.addEventListener("click", function(event) {

  event.stopPropagation();

  if (!selectedSticker && !selectedText) return;

  if (selectedSticker) {

    selectedSticker.remove();

    selectedSticker = null;

  }

  if (selectedText) {

    selectedText.remove();

    selectedText = null;

  }

  deleteStickerButton.style.display = "none";

});


// ========================================
// ステッカー操作
// ========================================

function enableStickerTouch(sticker) {

  const data = sticker._data;

  const pointers = new Map();


  // タッチ開始
  sticker.addEventListener("pointerdown", function(event) {

    event.preventDefault();

    selectSticker(sticker);

    sticker.setPointerCapture(event.pointerId);

    pointers.set(event.pointerId, {

      x: event.clientX,
      y: event.clientY

    });


    // 1本指 → 移動
    if (pointers.size === 1) {

      data.dragging = true;

      data.startX = event.clientX;

      data.startY = event.clientY;

    }


    // 2本指 → 拡大縮小・回転
    if (pointers.size === 2) {

      const points = [...pointers.values()];

      data.startDistance =
        getDistance(points[0], points[1]);

      data.startAngle =
        getAngle(points[0], points[1]);

      data.startScale =
        data.scale;

      data.startRotation =
        data.rotation;

    }

  });


  // 移動中
  sticker.addEventListener("pointermove", function(event) {

    if (!pointers.has(event.pointerId)) return;

    event.preventDefault();

    pointers.set(event.pointerId, {

      x: event.clientX,
      y: event.clientY

    });


    // 1本指
    if (
      pointers.size === 1 &&
      data.dragging
    ) {

      const dx =
        event.clientX - data.startX;

      const dy =
        event.clientY - data.startY;

      data.x += dx;

      data.y += dy;

      data.startX =
        event.clientX;

      data.startY =
        event.clientY;

      updateSticker(sticker);

    }


    // 2本指
    if (pointers.size === 2) {

      const points = [...pointers.values()];

      const distance =
        getDistance(points[0], points[1]);

      const angle =
        getAngle(points[0], points[1]);


      if (data.startDistance > 0) {

        const scaleRatio =
          distance / data.startDistance;

        data.scale =
          data.startScale * scaleRatio;

        // 最小・最大サイズ
        data.scale =
          Math.max(
            0.3,
            Math.min(3, data.scale)
          );


        data.rotation =
          data.startRotation +
          (angle - data.startAngle);

        updateSticker(sticker);

      }

    }

  });


  // 指を離す
  sticker.addEventListener("pointerup", function(event) {

    pointers.delete(event.pointerId);

    if (pointers.size === 0) {

      data.dragging = false;

    }

  });


  sticker.addEventListener("pointercancel", function(event) {

    pointers.delete(event.pointerId);

    if (pointers.size === 0) {

      data.dragging = false;

    }

  });

}


// ========================================
// ステッカー表示更新
// ========================================

function updateSticker(sticker) {

  const data = sticker._data;

  sticker.style.transform = `
    translate(-50%, -50%)
    translate(${data.x}px, ${data.y}px)
    scale(${data.scale})
    rotate(${data.rotation}deg)
  `;

}


// ========================================
// キャラクター
// ========================================

const characterItems =
  document.querySelectorAll(
    "#characterList .character-item"
  );


characterItems.forEach(function(item) {

  item.addEventListener("click", function() {

    addSticker(
      item.dataset.image,
      item.dataset.name
    );

  });

});


// ========================================
// 顔だけキャラクター
// ========================================

const faceItems =
  document.querySelectorAll(
    "#faceList .character-item"
  );


faceItems.forEach(function(item) {

  item.addEventListener("click", function() {

    addSticker(
      item.dataset.image,
      item.dataset.name
    );

  });

});


// ========================================
// スタンプ
// ========================================

const stampItems =
  document.querySelectorAll(
    "#stampList .stamp-item"
  );


stampItems.forEach(function(item) {

  item.addEventListener("click", function() {

    addSticker(
      item.dataset.image,
      item.dataset.name
    );

  });

});


// ========================================
// カテゴリー切り替え
// ========================================

categoryTabs.forEach(function(tab) {

  tab.addEventListener("click", function() {

    const category =
      tab.dataset.category;


    // CHARACTER
    if (category === "character") {

      characterTypeArea.style.display = "flex";

      characterList.style.display = "grid";

      faceList.style.display = "none";

      stampList.style.display = "none";

      textList.style.display = "none";

      frameList.style.display = "none";

      panelTitle.textContent =
        "CHARACTER";

      panelDescription.textContent =
        "好きなキャラクターを選んでね！";

    }


    // STAMP
    if (category === "stamp") {

        characterTypeArea.style.display = "none";

        characterList.style.display = "none";
        faceList.style.display = "none";
        stampList.style.display = "grid";
        textList.style.display = "none";
        frameList.style.display = "none";

        panelTitle.textContent = "STAMP";

        panelDescription.textContent = "好きなスタンプを選んでね！";
    }


    // TEXT
    if (category === "text") {

        characterTypeArea.style.display = "none";

        characterList.style.display = "none";
        faceList.style.display = "none";
        stampList.style.display = "none";
        textList.style.display = "block";
        frameList.style.display = "none";

        panelTitle.textContent = "TEXT";

        panelDescription.textContent = "好きな文字を入れてね！";
    }

    if (category === "frame") {

        characterTypeArea.style.display = "none";

        characterList.style.display = "none";
        faceList.style.display = "none";
        stampList.style.display = "none";
        textList.style.display = "none";
        frameList.style.display = "grid";

        panelTitle.textContent = "FRAME";

        panelDescription.textContent = "写真をかわいく飾ってね！";
    }


    // タブ表示
    categoryTabs.forEach(function(otherTab) {

      otherTab.classList.remove("active");

    });

    tab.classList.add("active");

  });

});


// ========================================
// キャラクター
// 全身 / 顔
// ========================================

characterTypeTabs.forEach(function(tab) {

  tab.addEventListener("click", function() {

    const type =
      tab.dataset.type;


    if (type === "body") {

      characterList.style.display = "grid";

      faceList.style.display = "none";

    }


    if (type === "face") {

      characterList.style.display = "none";

      faceList.style.display = "grid";

    }


    characterTypeTabs.forEach(function(other) {

      other.classList.remove("active");

    });

    tab.classList.add("active");

  });

});


// ========================================
// 距離
// ========================================

function getDistance(point1, point2) {

  const dx =
    point2.x - point1.x;

  const dy =
    point2.y - point1.y;

  return Math.sqrt(
    dx * dx + dy * dy
  );

}


// ========================================
// 角度
// ========================================

function getAngle(point1, point2) {

  return Math.atan2(
    point2.y - point1.y,
    point2.x - point1.x
  ) * 180 / Math.PI;

}


// ========================================
// TEXT
// ========================================

let selectedTextColor = "#ffffff";

let selectedOutlineColor = "none";


// 色
colorButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    colorButtons.forEach(function(other) {

      other.classList.remove("active");

    });

    button.classList.add("active");

    selectedTextColor =
      button.dataset.color;

  });

});


// 縁取り
outlineButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    outlineButtons.forEach(function(other) {

      other.classList.remove("active");

    });

    button.classList.add("active");

    selectedOutlineColor =
      button.dataset.outline;

  });

});


// ========================================
// 文字追加
// ========================================

function addText(text) {

  if (!mainPhoto.src) {

    alert("まず写真を選んでね！");

    return;

  }


  if (!text.trim()) return;


  const textSticker =
    document.createElement("div");

  textSticker.className =
    "photo-text";

  textSticker.style.zIndex = "1000";

  textSticker.textContent =
    text;


  textSticker.style.color =
    selectedTextColor;


  if (selectedOutlineColor === "none") {

    textSticker.style.webkitTextStroke =
      "0px transparent";

  } else {

    textSticker.style.webkitTextStroke =
      `2px ${selectedOutlineColor}`;

  }


  textSticker._data = {

    x: 0,
    y: 0,

    scale: 1,

    rotation: 0,

    startX: 0,
    startY: 0,

    startDistance: 0,
    startAngle: 0,

    startScale: 1,
    startRotation: 0,

    dragging: false

  };


  stickerLayer.appendChild(textSticker);

  enableTextTouch(textSticker);

  selectText(textSticker);

}


// ========================================
// 文字選択
// ========================================

function selectText(textSticker) {

  document.querySelectorAll(
    ".sticker.selected"
  ).forEach(function(item) {

    item.classList.remove("selected");

  });


  document.querySelectorAll(
    ".photo-text.selected"
  ).forEach(function(item) {

    item.classList.remove("selected");

  });


  selectedSticker = null;

  selectedText =
    textSticker;


  textSticker.classList.add("selected");


  deleteStickerButton.style.display =
    "block";

}


// ========================================
// 文字操作
// ========================================

function enableTextTouch(textSticker) {

  const data =
    textSticker._data;

  const pointers =
    new Map();


  textSticker.addEventListener(
    "pointerdown",
    function(event) {

      event.preventDefault();

      event.stopPropagation();

      selectText(textSticker);

      textSticker.setPointerCapture(
        event.pointerId
      );


      pointers.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY
        }
      );


      // 1本指
      if (pointers.size === 1) {

        data.dragging = true;

        data.startX =
          event.clientX;

        data.startY =
          event.clientY;

      }


      // 2本指
      if (pointers.size === 2) {

        const points =
          [...pointers.values()];

        data.startDistance =
          getDistance(
            points[0],
            points[1]
          );

        data.startAngle =
          getAngle(
            points[0],
            points[1]
          );

        data.startScale =
          data.scale;

        data.startRotation =
          data.rotation;

      }

    }
  );


  textSticker.addEventListener(
    "pointermove",
    function(event) {

      if (!pointers.has(event.pointerId)) {
        return;
      }

      event.preventDefault();


      pointers.set(
        event.pointerId,
        {
          x: event.clientX,
          y: event.clientY
        }
      );


      // 移動
      if (
        pointers.size === 1 &&
        data.dragging
      ) {

        const dx =
          event.clientX -
          data.startX;

        const dy =
          event.clientY -
          data.startY;


        data.x += dx;

        data.y += dy;


        data.startX =
          event.clientX;

        data.startY =
          event.clientY;


        updateText(textSticker);

      }


      // 拡大・回転
      if (pointers.size === 2) {

        const points =
          [...pointers.values()];


        const distance =
          getDistance(
            points[0],
            points[1]
          );

        const angle =
          getAngle(
            points[0],
            points[1]
          );


        if (data.startDistance > 0) {

          const scaleRatio =
            distance /
            data.startDistance;


          data.scale =
            data.startScale *
            scaleRatio;


          data.scale =
            Math.max(
              0.4,
              Math.min(4, data.scale)
            );


          data.rotation =
            data.startRotation +
            (angle -
             data.startAngle);


          updateText(textSticker);

        }

      }

    }
  );


  textSticker.addEventListener(
    "pointerup",
    function(event) {

      pointers.delete(
        event.pointerId
      );

      if (pointers.size === 0) {

        data.dragging = false;

      }

    }
  );


  textSticker.addEventListener(
    "pointercancel",
    function(event) {

      pointers.delete(
        event.pointerId
      );

      if (pointers.size === 0) {

        data.dragging = false;

      }

    }
  );

}


// ========================================
// 文字表示更新
// ========================================

function updateText(textSticker) {

  const data =
    textSticker._data;


  textSticker.style.transform = `
    translate(-50%, -50%)
    translate(${data.x}px, ${data.y}px)
    scale(${data.scale})
    rotate(${data.rotation}deg)
  `;

}


// ========================================
// 文字追加ボタン
// ========================================

if (addTextButton) {

  addTextButton.addEventListener(
    "click",
    function() {

      addText(textInput.value);

      textInput.value = "";

    }
  );

}


// ========================================
// FRAME
// ========================================

const frameItems =
  document.querySelectorAll(
    ".frame-item"
  );


frameItems.forEach(function(item) {

  item.addEventListener(
    "click",
    function() {

      addFrame(
        item.dataset.image
      );

    }
  );

});


// ========================================
// フレーム追加
// ========================================

function addFrame(imagePath) {

  let frame =
    document.getElementById(
      "photoFrame"
    );


  if (!frame) {

    frame =
      document.createElement("img");

    frame.id =
      "photoFrame";

    frame.className =
      "photo-frame";

    stickerLayer.appendChild(frame);

  }


  frame.src =
    imagePath;

}


// ========================================
// 保存処理
// ========================================

async function savePhoto() {

  if (!mainPhoto.src) {

    alert("まず写真を選んでね！");

    return;

  }


  // 保存用キャンバス
  const canvas =
    document.createElement("canvas");


  const width = 1080;

  const height = 1920;


  canvas.width = width;

  canvas.height = height;


  const ctx =
    canvas.getContext("2d");


  // 背景
  ctx.fillStyle =
    "#ffffff";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // 元写真
  const mainImage = await loadImage(mainPhoto.src);

  const imageRatio = mainImage.width / mainImage.height;

  const canvasRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = mainImage.width;
  let sh = mainImage.height;

  // 横長画像
  if (imageRatio > canvasRatio) {

    sw = mainImage.height * canvasRatio;

    sx = (mainImage.width - sw) / 2;
  }

  // 縦長画像
  else {

    sh = mainImage.width / canvasRatio;

    sy = (mainImage.height - sh) / 2;
  }

  ctx.drawImage(
    mainImage,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    width,
    height
  );


  // キャラクター・スタンプ・文字
  const items =
    stickerLayer.querySelectorAll(
      ".sticker, .photo-text"
    );


  for (const item of items) {

    await drawElementToCanvas(
      ctx,
      item,
      width,
      height
    );

  }


  // フレーム
  const frame =
    document.getElementById(
      "photoFrame"
    );


  if (
    frame &&
    frame.src
  ) {

    const frameImage =
      await loadImage(
        frame.src
      );


    ctx.drawImage(
      frameImage,
      0,
      0,
      width,
      height
    );

  }


  // スマホ向け表示・共有
  await showSavedImage(canvas);

}


// ========================================
// 画像読み込み
// ========================================

function loadImage(src) {

  return new Promise(
    function(resolve, reject) {

      const image =
        new Image();


      image.onload =
        function() {

          resolve(image);

        };


      image.onerror =
        function() {

          reject(
            new Error(
              "画像を読み込めません"
            )
          );

        };


      image.src =
        src;

    }
  );

}


// ========================================
// Canvasへアイテム描画
// ========================================

async function drawElementToCanvas(
  ctx,
  element,
  canvasWidth,
  canvasHeight
) {

  const data =
    element._data;


  const canvasRect =
    stickerLayer.getBoundingClientRect();


  const scaleX =
    canvasWidth /
    canvasRect.width;


  const scaleY =
    canvasHeight /
    canvasRect.height;


  const centerX =
    canvasWidth / 2 +
    data.x * scaleX;


  const centerY =
    canvasHeight / 2 +
    data.y * scaleY;


  ctx.save();


  ctx.translate(
    centerX,
    centerY
  );


  ctx.rotate(
    data.rotation *
    Math.PI / 180
  );


  ctx.scale(
    data.scale,
    data.scale
  );


  // ====================================
  // 文字
  // ====================================

  if (
    element.classList.contains(
      "photo-text"
    )
  ) {

    const style =
      window.getComputedStyle(
        element
      );


    const fontSize =
      parseFloat(
        style.fontSize
      ) * scaleX;


    ctx.font =
      `${style.fontWeight} ${fontSize}px "Kiwi Maru"`;


    ctx.textAlign =
      "center";


    ctx.textBaseline =
      "middle";


    const strokeWidth =
      parseFloat(
        style.webkitTextStrokeWidth ||
        "0"
      );


    if (strokeWidth > 0) {

      ctx.lineWidth =
        strokeWidth * scaleX;


      ctx.strokeStyle =
        style.webkitTextStrokeColor;


      ctx.strokeText(
        element.textContent,
        0,
        0
      );

    }


    ctx.fillStyle =
      style.color;


    ctx.fillText(
      element.textContent,
      0,
      0
    );


    ctx.restore();

    return;

  }


  // ====================================
  // 画像
  // ====================================

  const image =
    await loadImage(
      element.src
    );


  const w = element.offsetWidth * scaleX;


  const h = element.offsetHeight * scaleY;


  ctx.drawImage(
    image,
    -w / 2,
    -h / 2,
    w,
    h
  );


  ctx.restore();

}


// ========================================
// スマホ向け保存画面
// ========================================

async function showSavedImage(canvas) {

  // PNGデータ
  const blob =
    await new Promise(function(resolve) {

      canvas.toBlob(
        resolve,
        "image/png"
      );

    });


  if (!blob) {

    alert(
      "画像の保存に失敗しました😭"
    );

    return;

  }


  const imageURL =
    URL.createObjectURL(blob);


  // ====================================
  // 保存画面を作る
  // ====================================

  const savePage =
    document.createElement("div");


  savePage.id =
    "rebornSavePage";


  savePage.innerHTML = `

    <div style="
      position:fixed;
      inset:0;
      z-index:99999;
      background:#fff;
      overflow:auto;
      padding:20px;
      text-align:center;
      font-family:inherit;
    ">

      <h2 style="
        color:#df5a7d;
        margin:10px 0;
      ">
        🎀 完成！
      </h2>

      <p style="
        color:#555;
        font-size:14px;
        margin-bottom:15px;
      ">
        写真を長押しして保存できるよ📱
      </p>

      <img
        id="rebornSavedImage"
        src="${imageURL}"
        style="
          width:min(90vw,390px);
          height:auto;
          display:block;
          margin:0 auto 20px;
          border-radius:12px;
        "
      >

      <div style="
        display:flex;
        flex-direction:column;
        gap:10px;
        max-width:390px;
        margin:auto;
      ">

        <button
          id="rebornShareButton"
          style="
            border:none;
            border-radius:999px;
            padding:14px;
            background:#df5a7d;
            color:white;
            font-size:16px;
            font-weight:bold;
          "
        >
          📤 共有する
        </button>

        <button
          id="rebornCloseButton"
          style="
            border:2px solid #df5a7d;
            border-radius:999px;
            padding:12px;
            background:white;
            color:#df5a7d;
            font-size:15px;
          "
        >
          ← 写真加工に戻る
        </button>

      </div>

      <p style="
        color:#888;
        font-size:12px;
        line-height:1.7;
        margin-top:18px;
      ">
        ※ iPhoneの場合は画像を長押しして<br>
        「写真に保存」を選んでね！
      </p>

    </div>

  `;


  document.body.appendChild(
    savePage
  );


  // ====================================
  // 共有ボタン
  // ====================================

  const shareButton =
    document.getElementById(
      "rebornShareButton"
    );


  shareButton.addEventListener(
    "click",
    async function() {

      try {

        const file =
          new File(
            [blob],
            `ReBorn_${Date.now()}.png`,
            {
              type:"image/png"
            }
          );


        // ファイル共有に対応している場合
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files:[file]
          })
        ) {

          await navigator.share({

            files:[file],

            title:"ReBorn",

            text:"ReBornで作った写真だよ！"

          });

          return;

        }


        // 通常の共有
        if (
          navigator.share
        ) {

          await navigator.share({

            title:"ReBorn",

            text:"ReBornで作った写真だよ！"

          });

          return;

        }


        // 非対応
        alert(
          "この端末では直接共有できないみたい😭\n画像を長押しして保存してね！"
        );

      } catch (error) {

        // ユーザーが共有をキャンセルした場合
        if (
          error.name !==
          "AbortError"
        ) {

          console.error(error);

          alert(
            "共有できなかったみたい😭\n画像を長押しして保存してね！"
          );

        }

      }

    }
  );


  // ====================================
  // 戻るボタン
  // ====================================

  const closeButton =
    document.getElementById(
      "rebornCloseButton"
    );


  closeButton.addEventListener(
    "click",
    function() {

      URL.revokeObjectURL(
        imageURL
      );

      savePage.remove();

    }
  );

}


// ========================================
// 保存ボタン
// ========================================

if (savePhotoButton) {

  savePhotoButton.addEventListener(
    "click",
    async function() {

      // 二重クリック防止
      savePhotoButton.disabled =
        true;

      const originalText =
        savePhotoButton.textContent;

      savePhotoButton.textContent =
        "画像を作成中…✨";


      try {

        await savePhoto();

      } catch (error) {

        console.error(error);

        alert(
          "保存中にエラーが発生しました😭\nもう一度試してみてね！"
        );

      } finally {

        savePhotoButton.disabled =
          false;

        savePhotoButton.textContent =
          originalText;

      }

    }
  );

}

if (characterTypeArea) {
  characterTypeArea.style.display = "flex";
}