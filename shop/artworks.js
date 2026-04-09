const artworks = [
  {
    title: "Rabbitflower Doll#94 [water color]",
    image: "./images/094.jpg",
    link: "https://www.paypal.com/ncp/payment/ELVHS843KVW7L",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#93 [water color]",
    image: "./images/093.jpg",
    link: "https://www.paypal.com/ncp/payment/27SLYCT98JDTY",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#92 [water color]",
    image: "./images/092.jpg",
    link: "https://www.paypal.com/ncp/payment/GBNMA3RLLBNLQ",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#91 [water color]",
    image: "./images/091.jpg",
    link: "https://www.paypal.com/ncp/payment/CEBVE2U6N9EV2",
    soldout: false
  }
];

document.addEventListener("DOMContentLoaded", function () {
  const gallery = document.getElementById("gallery");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.querySelector(".close");

  // --- ギャラリー生成 ---
  artworks.forEach(item => {
    const card = document.createElement("div");
    card.className = item.soldout ? "card sold" : "card";

    let buttonHTML = item.soldout
      ? `<div class="soldout">Sold Out</div>`
      : `<a href="${item.link}" class="button" target="_blank">Buy</a>`;

    card.innerHTML = `
      <div class="image-wrap">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="card-content">
        <div class="title">${item.title}</div>
        <div class="price">${item.price || ""}</div>
        ${buttonHTML}
      </div>
    `;

    gallery.appendChild(card);
  });

  // --- モーダル処理 ---
  if (modal && modalImg && closeBtn) {
    // 画像クリックで開く
    document.addEventListener("click", function(e) {
      if (e.target.tagName === "IMG" && e.target.closest('.image-wrap')) {
        modal.style.display = "block";
        modalImg.src = e.target.src;
      }
    });

    // 閉じるボタン
    closeBtn.onclick = function() {
      modal.style.display = "none";
    };

    // 背景クリックで閉じる
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
});