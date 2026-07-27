const artworks = [
  {
    title: "Rabbitflower Doll#99 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/385264884025-4fb8-8b4f-6210c3a386bd949b8d158d76-48d1-8baa-8e3ecccd1871c5be35c6160a-4edb-846e-f09711906988_t9n2io.webp",
    link: "https://www.paypal.com/ncp/payment/G47WB7HNFAW2J",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#95 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/b9e73da2db58-4f9d-b2d3-0f957faf8510f982cfbfe3de-4b20-87f7-410eec745d02c2c958b28b82-40e9-9ef8-38974be1b33a_nptqo2.webp",
    link: "https://www.paypal.com/ncp/payment/7RBVGGHN4SCJQ",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#94 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/3f7d2fde4847-4acf-8f18-ec1f2e925b1c80002b674768-4419-8354-ada64e5f88d93b6f3e4648ca-4a30-b0e6-fbd9ec5ee97b_mr8xy7.webp",
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